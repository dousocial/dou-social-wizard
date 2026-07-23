// Sosyal medya linkini sayfada oynatılabilir embed'e çevirir (Keşfet akışı)

export type EmbedInfo =
  | { kind: "iframe"; src: string; platform: string }
  | { kind: "link"; platform: string };

export function detectPlatform(url: string): string {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    if (host.includes("instagram.com")) return "instagram";
    if (host.includes("tiktok.com")) return "tiktok";
    if (host.includes("youtube.com") || host.includes("youtu.be")) return "youtube";
    if (host.includes("pinterest.")) return "pinterest";
  } catch { /* geçersiz URL */ }
  return "diger";
}

export function toEmbed(url: string): EmbedInfo {
  const platform = detectPlatform(url);
  try {
    const u = new URL(url);
    if (platform === "youtube") {
      let id = "";
      if (u.hostname.includes("youtu.be")) id = u.pathname.slice(1).split("/")[0];
      else if (u.pathname.startsWith("/shorts/")) id = u.pathname.split("/")[2];
      else if (u.pathname.startsWith("/embed/")) id = u.pathname.split("/")[2];
      else id = u.searchParams.get("v") || "";
      if (id) return { kind: "iframe", src: `https://www.youtube.com/embed/${id}?rel=0&playsinline=1`, platform };
    }
    if (platform === "instagram") {
      // /reel/CODE/, /p/CODE/, /tv/CODE/ → /reel/CODE/embed/
      const m = u.pathname.match(/^\/(reel|reels|p|tv)\/([^/]+)/);
      if (m) return { kind: "iframe", src: `https://www.instagram.com/${m[1] === "reels" ? "reel" : m[1]}/${m[2]}/embed/`, platform };
    }
    if (platform === "tiktok") {
      // /@user/video/1234567890 → embed v2
      const m = u.pathname.match(/\/video\/(\d+)/);
      if (m) return { kind: "iframe", src: `https://www.tiktok.com/embed/v2/${m[1]}`, platform };
    }
  } catch { /* düşmeye devam */ }
  return { kind: "link", platform };
}

export function youtubeThumb(url: string): string {
  try {
    const u = new URL(url);
    let id = "";
    if (u.hostname.includes("youtu.be")) id = u.pathname.slice(1).split("/")[0];
    else if (u.pathname.startsWith("/shorts/")) id = u.pathname.split("/")[2];
    else id = u.searchParams.get("v") || "";
    return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : "";
  } catch { return ""; }
}
