import { Marquee } from "@/components/ui/Marquee";

// ─── Content ─────────────────────────────────────────────────────────────────

const ITEMS = [
  "Meta Reklam",
  "250k+ Reklam Bütçesi",
  "Sosyal Medya",
  "%41 Düşük CPL",
  "İçerik Üretimi",
  "10+ Aktif Marka",
  "Web Tasarım",
  "3 Yıl Deneyim",
  "Marka Stratejisi",
  "Denizli Merkezli",
  "SEO & Büyüme",
  "Ölçülebilir Sonuç",
  "Reklam Yönetimi",
  "Dijital Büyüme",
];

function buildItems() {
  return ITEMS.map((w, i) => (
    <span
      key={i}
      className="font-display text-xs font-medium uppercase tracking-[0.18em] text-paper/55 px-8"
    >
      {w}
    </span>
  ));
}

export function MarqueeStrip() {
  return (
    <div className="bg-mute-800 py-3.5 overflow-hidden select-none">
      <Marquee items={buildItems()} direction="left" speed={30} gapClass="gap-0" />
    </div>
  );
}
