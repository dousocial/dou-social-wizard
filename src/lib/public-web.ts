import { lookup } from "node:dns/promises";
import { request as httpRequest } from "node:http";
import { request as httpsRequest } from "node:https";
import { isIP } from "node:net";
import ipaddr from "ipaddr.js";

export function isPublicAddress(address: string): boolean {
  try {
    return ipaddr.process(address).range() === "unicast";
  } catch {
    return false;
  }
}

export function normalizeWebsite(input: string): URL {
  if (!input.trim() || input.length > 2048)
    throw new Error("Geçerli bir web sitesi adresi girin.");
  if (
    /^[a-z][a-z0-9+.-]*:/i.test(input.trim()) &&
    !/^https?:\/\//i.test(input.trim())
  )
    throw new Error("HTTP veya HTTPS adresi girin.");
  const url = new URL(
    /^https?:\/\//i.test(input.trim())
      ? input.trim()
      : `https://${input.trim()}`
  );
  const hostname = url.hostname.replace(/^\[|\]$/g, "");
  if (
    !["https:", "http:"].includes(url.protocol) ||
    url.username ||
    url.password ||
    (url.port && !["80", "443"].includes(url.port)) ||
    hostname === "localhost" ||
    hostname.endsWith(".localhost") ||
    hostname.endsWith(".local") ||
    (isIP(hostname) && !isPublicAddress(hostname))
  ) {
    throw new Error(
      "Yalnızca herkese açık HTTP veya HTTPS web siteleri analiz edilebilir."
    );
  }
  url.hash = "";
  return url;
}

export function normalizeInstagram(input: string): string {
  let value = input.trim();
  if (/^https?:\/\//i.test(value)) {
    const url = new URL(value);
    if (
      !["instagram.com", "www.instagram.com"].includes(url.hostname) ||
      url.username ||
      url.password ||
      url.port
    ) {
      throw new Error("Instagram kullanıcı adı veya profil bağlantısı girin.");
    }
    value = url.pathname.replace(/^\/|\/$/g, "");
  }
  value = value.replace(/^@/, "");
  if (
    !/^[a-zA-Z0-9_](?:[a-zA-Z0-9_.]{0,28}[a-zA-Z0-9_])?$/.test(value) ||
    value.includes("..") ||
    ["p", "reel", "explore", "accounts", "stories"].includes(
      value.toLowerCase()
    )
  ) {
    throw new Error(
      "Geçerli bir Instagram kullanıcı adı girin (en fazla 30 karakter)."
    );
  }
  return value.toLowerCase();
}

export async function fetchPublicHTML(
  input: string,
  signal = AbortSignal.timeout(20_000)
): Promise<{ html: string; url: string; status: number }> {
  let url = normalizeWebsite(input);
  for (let hop = 0; hop <= 3; hop++) {
    const hostname = url.hostname.replace(/^\[|\]$/g, "");
    const addresses = isIP(hostname)
      ? [{ address: hostname, family: isIP(hostname) }]
      : await Promise.race([
          lookup(hostname, { all: true, verbatim: true }),
          new Promise<never>((_, reject) => {
            signal.addEventListener(
              "abort",
              () => reject(new Error("Analiz zaman aşımına uğradı.")),
              { once: true }
            );
          }),
        ]);
    if (
      signal.aborted ||
      !addresses.length ||
      addresses.some(({ address }) => !isPublicAddress(address))
    ) {
      throw new Error("Bu adresin ağ erişimi güvenlik nedeniyle engellendi.");
    }
    const pinned = addresses[0];
    const result = await new Promise<{
      html: string;
      status: number;
      redirect?: string;
    }>((resolve, reject) => {
      const req = (url.protocol === "https:" ? httpsRequest : httpRequest)(
        url,
        {
          signal,
          // Pin the validated DNS result; a second lookup cannot rebind to a private IP.
          lookup: (_host, options, callback) => {
            if (options.all) callback(null, [pinned]);
            else callback(null, pinned.address, pinned.family);
          },
          headers: {
            "User-Agent":
              "DOUSocialAudit/1.0 (+https://www.dousocial.com/dijital-checkup)",
            Accept: "text/html",
            "Accept-Encoding": "identity",
          },
        },
        (res) => {
          const status = res.statusCode ?? 502;
          if (
            [301, 302, 303, 307, 308].includes(status) &&
            res.headers.location
          ) {
            res.resume();
            resolve({ html: "", status, redirect: res.headers.location });
            return;
          }
          if (
            !String(res.headers["content-type"] ?? "").includes("text/html")
          ) {
            res.destroy();
            reject(
              new Error("Bu adres okunabilir bir HTML sayfası döndürmedi.")
            );
            return;
          }
          const chunks: Buffer[] = [];
          let size = 0;
          res.on("data", (chunk: Buffer) => {
            size += chunk.length;
            if (size > 2_000_000) {
              res.destroy();
              reject(new Error("Sayfa analiz sınırından büyük."));
            } else chunks.push(chunk);
          });
          res.on("end", () =>
            resolve({ html: Buffer.concat(chunks).toString("utf8"), status })
          );
          res.on("error", reject);
        }
      );
      req.setTimeout(10_000, () =>
        req.destroy(new Error("Web sitesi zamanında yanıt vermedi."))
      );
      req.on("error", reject);
      req.end();
    });
    if (!result.redirect) return { ...result, url: url.href };
    url = normalizeWebsite(new URL(result.redirect, url).href);
  }
  throw new Error("Web sitesinde çok fazla yönlendirme var.");
}
