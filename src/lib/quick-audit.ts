import { load } from "cheerio";
import {
  fetchPublicHTML,
  normalizeInstagram,
  normalizeWebsite,
} from "./public-web";
import type {
  AuditSource,
  AuditFinding,
  QuickAuditReport,
} from "./quick-audit-types";

export function inspectWebsite(html: string, url: string): AuditFinding[] {
  const $ = load(html);
  const title = $("title").first().text().trim();
  const description = $("meta[name='description']").attr("content")?.trim();
  const canonical = $("link[rel='canonical']").attr("href");
  const h1 = $("h1").length;
  const images = $("img").toArray();
  const missingAlt = images.filter(
    (image) => $(image).attr("alt") === undefined
  ).length;
  const robots = $("meta[name='robots']").attr("content") ?? "";
  return [
    {
      label: "HTTPS",
      status: url.startsWith("https:") ? "pass" : "warning",
      detail: url.startsWith("https:")
        ? "Sayfa HTTPS üzerinden açıldı."
        : "Son sayfa HTTP kullanıyor; HTTPS yönlendirmesini kontrol edin.",
    },
    {
      label: "Sayfa başlığı",
      status: title ? "pass" : "warning",
      detail: title ? title.slice(0, 200) : "HTML içinde title bulunamadı.",
    },
    {
      label: "Meta açıklama",
      status: description ? "pass" : "warning",
      detail:
        description?.slice(0, 320) ||
        "Arama sonuçları için sayfaya özgü açıklama ekleyin.",
    },
    {
      label: "Ana başlık",
      status: h1 === 1 ? "pass" : "warning",
      detail: `${h1} H1 bulundu. Sayfanın amacını açıkça anlatan bir ana başlık kullanın.`,
    },
    {
      label: "Canonical",
      status: canonical ? "pass" : "warning",
      detail: canonical
        ? `Tanımlı adres: ${canonical.slice(0, 300)}. İçerikle ve gerçek URL ile eşleşmesi ayrıca kontrol edilmeli.`
        : "Tercih edilen sayfa adresi tanımlanmamış.",
    },
    {
      label: "Mobil görünüm ayarı",
      status: $("meta[name='viewport']").length ? "pass" : "warning",
      detail: $("meta[name='viewport']").length
        ? "Viewport tanımı var; mobil düzenin görsel testi ayrıca gerekir."
        : "Viewport tanımı bulunamadı.",
    },
    {
      label: "İçerik dili",
      status: $("html").attr("lang") ? "pass" : "warning",
      detail: $("html").attr("lang") || "HTML dilini belirtin.",
    },
    {
      label: "Görsel alternatifleri",
      status: missingAlt ? "warning" : "pass",
      detail: `${images.length} görselden ${missingAlt} tanesinde alt niteliği eksik. Alt metnin anlamlılığı ayrıca incelenmeli.`,
    },
    {
      label: "Yapılandırılmış veri",
      status: $("script[type='application/ld+json']").length
        ? "pass"
        : "warning",
      detail: $("script[type='application/ld+json']").length
        ? "JSON-LD bulundu; şema doğruluğu Rich Results Test ile kontrol edilmeli."
        : "JSON-LD bulunamadı. İşletme ve hizmet bilgileri için uygun schema değerlendirilebilir.",
    },
    {
      label: "İndeksleme talimatı",
      status: /noindex/i.test(robots) ? "warning" : "pass",
      detail: /noindex/i.test(robots)
        ? "Sayfa noindex işaretli. Bu kararın sayfanın amacıyla uyumlu olduğunu kontrol edin."
        : "HTML robots meta içinde noindex görülmedi. HTTP başlıkları ve robots.txt bu kontrole dahil değildir.",
    },
  ];
}

async function inspectInstagram(handle: string): Promise<AuditSource> {
  const url = `https://www.instagram.com/${handle}/`;
  const token = process.env.INSTAGRAM_GRAPH_ACCESS_TOKEN;
  const account = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;
  const version = process.env.INSTAGRAM_GRAPH_VERSION;
  if (
    token &&
    account &&
    /^\d+$/.test(account) &&
    version &&
    /^v\d+\.\d+$/.test(version)
  ) {
    try {
      const endpoint = new URL(
        `https://graph.facebook.com/${version}/${account}`
      );
      endpoint.searchParams.set(
        "fields",
        `business_discovery.username(${handle}){username,name,biography,website,followers_count,media_count}`
      );
      const response = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
        signal: AbortSignal.timeout(10_000),
        cache: "no-store",
      });
      const data = await response.json();
      const profile = data.business_discovery;
      if (response.ok && profile?.username?.toLowerCase() === handle) {
        return {
          kind: "instagram",
          url,
          available: true,
          summary: `@${handle} için Meta tarafından erişime izin verilen profesyonel profil bilgileri alındı.`,
          findings: [
            {
              label: "Profil açıklaması",
              status: profile.biography ? "pass" : "warning",
              detail: String(
                profile.biography ||
                  "İşletmenin hizmetini ve konumunu açıklayan bir biyografi ekleyin."
              ).slice(0, 500),
            },
            {
              label: "Web sitesi bağlantısı",
              status: profile.website ? "pass" : "warning",
              detail: String(
                profile.website ||
                  "Profilde hizmet veya teklif sayfasına bağlantı görünmüyor."
              ).slice(0, 500),
            },
            {
              label: "Takipçi ve içerik sayısı",
              status: "pass",
              detail: `${profile.followers_count ?? "Bilinmiyor"} takipçi, ${profile.media_count ?? "Bilinmiyor"} içerik. Bu sayılar tek başına etkileşim veya satış performansı göstermez.`,
            },
            {
              label: "Etkileşim ve reklam performansı",
              status: "unknown",
              detail:
                "Erişim, gösterim, DM, reklam harcaması ve satış sonuçları bu veri erişimine dahil değildir.",
            },
          ],
        };
      }
    } catch {
      /* Continue with the public profile when Meta is unavailable. */
    }
  }
  // No login bypass or private endpoint: only the public profile HTML is read.
  try {
    const page = await fetchPublicHTML(url);
    const $ = load(page.html);
    const description = $("meta[property='og:description']")
      .attr("content")
      ?.trim();
    const canonical = $("link[rel='canonical']").attr("href") ?? "";
    const profilePath = new URL(url).pathname.toLowerCase();
    const sameProfile =
      canonical &&
      new URL(canonical, url).pathname.toLowerCase() === profilePath;
    if (
      page.status === 200 &&
      description &&
      sameProfile &&
      !/log in|sign up|login|giriş yap/i.test(description)
    ) {
      return {
        kind: "instagram",
        url,
        available: true,
        summary: `@${handle} profilinin herkese açık özeti okundu.`,
        findings: [
          {
            label: "Herkese açık profil özeti",
            status: "pass",
            detail: description.slice(0, 600),
          },
          {
            label: "Özel istatistikler",
            status: "unknown",
            detail:
              "Gösterim, erişim, etkileşim oranı ve reklam sonuçları herkese açık özette bulunmaz. Detaylı inceleme için hesap istatistikleri gerekir.",
          },
        ],
      };
    }
  } catch {
    /* Public access can be unavailable; never invent metrics. */
  }
  return {
    kind: "instagram",
    url,
    available: false,
    summary: `@${handle} için Instagram herkese açık veriyi okumaya izin vermedi veya profil bulunamadı. Hesabın varlığı doğrulanamadı.`,
    findings: [
      {
        label: "Profil erişimi",
        status: "unknown",
        detail:
          "Gizli hesap, giriş zorunluluğu veya erişim sınırı olabilir. Kullanıcı adıyla özel istatistiklere erişilemez.",
      },
      {
        label: "Detaylı analiz için sonraki adım",
        status: "unknown",
        detail:
          "Hesap sahibi olarak ekran görüntüsü veya metrik paylaşabilir ya da profesyonel hesap erişiminizi görüşme sırasında sağlayabilirsiniz.",
      },
    ],
  };
}

export async function runQuickAudit(input: {
  website?: string;
  instagram?: string;
}): Promise<QuickAuditReport> {
  const website = input.website?.trim()
    ? normalizeWebsite(input.website).href
    : undefined;
  const instagram = input.instagram?.trim()
    ? normalizeInstagram(input.instagram)
    : undefined;
  if (!website && !instagram)
    throw new Error("Web sitesi adresi veya Instagram kullanıcı adı girin.");
  const sources: AuditSource[] = [];
  if (website) {
    try {
      const page = await fetchPublicHTML(website);
      sources.push({
        kind: "website",
        url: page.url,
        available: page.status >= 200 && page.status < 300,
        summary: `Web sitesi HTTP ${page.status} yanıtı verdi. İlk HTML içindeki teknik görünürlük sinyalleri incelendi.`,
        findings:
          page.status >= 200 && page.status < 300
            ? inspectWebsite(page.html, page.url)
            : [
                {
                  label: "Sayfa erişimi",
                  status: "warning",
                  detail: `Sayfa HTTP ${page.status} döndürüyor. Adresi ve sunucuyu kontrol edin.`,
                },
              ],
      });
    } catch {
      sources.push({
        kind: "website",
        url: website,
        available: false,
        summary:
          "Web sitesi güvenli erişim kontrolünde okunamadı. Site geçici olarak kapalı, erişimi engelli veya yanıt sınırını aşmış olabilir.",
        findings: [],
      });
    }
  }
  if (instagram) sources.push(await inspectInstagram(instagram));
  return {
    checkedAt: new Date().toISOString(),
    sources,
    limitations: [
      "Bu ön inceleme sıralama veya satış garantisi değildir; yalnızca erişilebilen verilere dayanır.",
      "Core Web Vitals, tüm site bağlantıları, görsel mobil kullanım ve özel hesap istatistikleri bu kontrolün kapsamı dışındadır.",
    ],
  };
}
