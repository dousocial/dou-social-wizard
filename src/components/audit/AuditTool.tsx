"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { getLenis } from "@/components/layout/SmoothScrollProvider";

declare global {
  interface Window {
    grecaptcha: {
      ready: (cb: () => void) => void;
      execute: (siteKey: string, opts: { action: string }) => Promise<string>;
    };
  }
}

const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? "";

async function getRecaptchaToken(action: string): Promise<string> {
  if (!RECAPTCHA_SITE_KEY || typeof window === "undefined" || !window.grecaptcha) return "";
  return new Promise((resolve) => {
    window.grecaptcha.ready(async () => {
      try {
        const token = await window.grecaptcha.execute(RECAPTCHA_SITE_KEY, { action });
        resolve(token);
      } catch {
        resolve("");
      }
    });
  });
}

// ─── Types ────────────────────────────────────────────────────────────────────

type Platform = "instagram" | "linkedin" | "youtube" | "google";
type Tab = "manual" | "screenshot";

interface LeadInfo {
  businessName: string;
  sector: string;
  phone: string;
  email: string;
}

interface Metrics {
  instagram: { followers: string; avgLikes: string; avgComments: string; weeklyPosts: string; weeklyStories: string };
  linkedin:  { followers: string; avgLikes: string; avgComments: string; weeklyPosts: string; connections: string };
  youtube:   { subscribers: string; avgViews: string; avgLikes: string; monthlyVideos: string; avgComments: string };
  google:    { rating: string; reviewCount: string; monthlyViews: string; photoCount: string };
}

interface Scores { overall: number; instagram: number; linkedin: number; youtube: number; google: number }

// ─── Sectors ──────────────────────────────────────────────────────────────────

const SECTORS = [
  "Restoran & Kafe",
  "E-ticaret & Online Satış",
  "Güzellik & Estetik Klinik",
  "Sağlık & Tıp Merkezi",
  "Diş Kliniği & Ağız Sağlığı",
  "Psikoloji & Terapi",
  "Eğitim & Kurs Merkezi",
  "Hukuk & Danışmanlık",
  "İnşaat & Müteahhitlik",
  "Gayrimenkul & Emlak",
  "Turizm & Otelcilik",
  "Otomotiv & Servis",
  "Teknoloji & Yazılım",
  "Moda & Tekstil",
  "Spor & Fitness",
  "Finans & Muhasebe",
  "Mimarlık & İç Tasarım",
  "Medya & Reklam",
  "Perakende & Mağaza",
  "Üretim & Sanayi",
  "Tarım & Gıda",
  "Hızlı Tüketim & FMCG",
  "Kuyumculuk & Mücevher",
  "Eczane & İlaç",
  "Fotoğrafçılık & Video",
  "Sigorta",
  "Etkinlik & Organizasyon",
  "Lojistik & Kargo",
  "Temizlik & Bakım Hizmetleri",
  "Çocuk & Ebeveyn Ürünleri",
  "Veteriner & Evcil Hayvan",
  "Kozmetik & Kişisel Bakım",
  "Mobilya & Dekorasyon",
  "Elektrik & Elektronik",
  "Yapı Malzemeleri & Depo",
  "Diğer",
];

// ─── Phone formatting ─────────────────────────────────────────────────────────

function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 4) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 4)} ${digits.slice(4)}`;
  return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
}

// ─── Platform config ──────────────────────────────────────────────────────────

const PLATFORMS: { id: Platform; label: string; color: string; description: string; screenshotHint: string; guideImage: string; Icon: () => React.ReactElement }[] = [
  {
    id: "instagram", label: "Instagram", color: "#E4405F",
    description: "Takipçi sayısı, beğeni ve yorum oranları ile hikaye etkileşimlerini analiz ederiz.",
    screenshotHint: "Instagram profilinizin ana sayfasının ve son gönderilerinizin ekran görüntüsünü alın.",
    guideImage: "/examples/instagram-guide.png",
    Icon: () => (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-full w-full">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
      </svg>
    ),
  },
  {
    id: "linkedin", label: "LinkedIn", color: "#0A66C2",
    description: "Şirket sayfanızın büyüme hızını, gönderi etkileşimini ve bağlantı kalitesini değerlendiririz.",
    screenshotHint: "LinkedIn şirket sayfanızın profilini ve son gönderilerinizin görüntülenme istatistiklerini ekran görüntüsü alın.",
    guideImage: "/examples/linkedin-guide.png",
    Icon: () => (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-full w-full">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  {
    id: "youtube", label: "YouTube", color: "#FF0000",
    description: "Abone büyümesi, video izlenme oranları ve izleyici etkileşim kalitesini ölçeriz.",
    screenshotHint: "YouTube kanalınızın ana sayfası ile YouTube Studio'dan kanal analitikleri sayfasının ekran görüntüsünü alın.",
    guideImage: "/examples/youtube-guide.png",
    Icon: () => (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-full w-full">
        <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
  {
    id: "google", label: "Google Business", color: "#4285F4",
    description: "Google haritalar puanınızı, yorum sayısını ve profil görünürlüğünüzü analiz ederiz.",
    screenshotHint: "Google haritalar üzerindeki işletme profilinizin ve yorum sayfanızın ekran görüntüsünü alın.",
    guideImage: "/examples/google-guide.png",
    Icon: () => (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-full w-full">
        <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
      </svg>
    ),
  },
];

const METRIC_FIELDS: Record<Platform, { key: string; label: string; placeholder: string; type?: string }[]> = {
  instagram: [
    { key: "followers",     label: "Takipçi Sayısı",             placeholder: "örn. 12500" },
    { key: "avgLikes",      label: "Ort. Beğeni (son 10 post)",   placeholder: "örn. 340" },
    { key: "avgComments",   label: "Ort. Yorum (son 10 post)",    placeholder: "örn. 18" },
    { key: "weeklyPosts",   label: "Haftalık Post Sayısı",        placeholder: "örn. 4" },
    { key: "weeklyStories", label: "Haftalık Story Sayısı",       placeholder: "örn. 10" },
  ],
  linkedin: [
    { key: "followers",   label: "Takipçi Sayısı",               placeholder: "örn. 3200" },
    { key: "avgLikes",    label: "Ort. Beğeni (son 10 gönderi)", placeholder: "örn. 45" },
    { key: "avgComments", label: "Ort. Yorum",                   placeholder: "örn. 8" },
    { key: "weeklyPosts", label: "Haftalık Gönderi Sayısı",      placeholder: "örn. 2" },
    { key: "connections", label: "Bağlantı Sayısı",              placeholder: "örn. 500" },
  ],
  youtube: [
    { key: "subscribers",   label: "Abone Sayısı",                   placeholder: "örn. 8500" },
    { key: "avgViews",      label: "Ort. Görüntüleme (son 10 video)", placeholder: "örn. 1200" },
    { key: "avgLikes",      label: "Ort. Like",                       placeholder: "örn. 65" },
    { key: "monthlyVideos", label: "Aylık Video Sayısı",              placeholder: "örn. 3" },
    { key: "avgComments",   label: "Ort. Yorum",                      placeholder: "örn. 12" },
  ],
  google: [
    { key: "rating",       label: "Değerlendirme Puanı (1-5)", placeholder: "örn. 4.7", type: "number" },
    { key: "reviewCount",  label: "Değerlendirme Sayısı",      placeholder: "örn. 124" },
    { key: "monthlyViews", label: "Aylık Profil Görüntülenme", placeholder: "örn. 3400" },
    { key: "photoCount",   label: "Fotoğraf Sayısı",           placeholder: "örn. 22" },
  ],
};

const EMPTY_METRICS: Metrics = {
  instagram: { followers: "", avgLikes: "", avgComments: "", weeklyPosts: "", weeklyStories: "" },
  linkedin:  { followers: "", avgLikes: "", avgComments: "", weeklyPosts: "", connections: "" },
  youtube:   { subscribers: "", avgViews: "", avgLikes: "", monthlyVideos: "", avgComments: "" },
  google:    { rating: "", reviewCount: "", monthlyViews: "", photoCount: "" },
};

// ─── Score helpers ────────────────────────────────────────────────────────────

function scoreColor(score: number): string {
  if (score === 0)  return "text-mute-300";
  if (score < 40)   return "text-red-500";
  if (score < 60)   return "text-orange-500";
  if (score < 80)   return "text-yellow-600";
  return "text-green-600";
}
function scoreRingColor(score: number): string {
  if (score === 0)  return "border-mute-200";
  if (score < 40)   return "border-red-400";
  if (score < 60)   return "border-orange-400";
  if (score < 80)   return "border-yellow-500";
  return "border-green-500";
}
function scoreLabel(score: number): string {
  if (score === 0)  return "—";
  if (score < 40)   return "Kritik Eksik";
  if (score < 60)   return "Yetersiz";
  if (score < 80)   return "Geliştirilmeli";
  return "İyi";
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function RequiredLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-1.5 block text-sm font-semibold text-ink">
      {children} <span className="text-accent">*</span>
    </label>
  );
}

function TextInput({
  label, placeholder, value, onChange, type = "text", error,
}: {
  label: React.ReactNode; placeholder: string; value: string;
  onChange: (v: string) => void; type?: string; error?: boolean;
}) {
  return (
    <div>
      {label}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          "w-full rounded-xl border bg-paper px-4 py-3 text-sm text-ink placeholder:text-mute-300 transition-colors duration-150 focus:outline-none",
          error ? "border-red-400 focus:border-red-500" : "border-mute-200 focus:border-accent"
        )}
      />
    </div>
  );
}

function SectorField({
  value, onChange, error,
}: {
  value: string; onChange: (v: string) => void; error?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => { setQuery(value); }, [value]);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = query
    ? SECTORS.filter((s) => s.toLowerCase().includes(query.toLowerCase()))
    : SECTORS;

  function select(s: string) {
    onChange(s);
    setQuery(s);
    setOpen(false);
  }

  return (
    <div ref={ref} className="relative">
      <RequiredLabel>Sektör</RequiredLabel>
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); onChange(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder="Sektörünüzü yazın veya seçin..."
          className={cn(
            "w-full rounded-xl border bg-paper py-3 pl-4 pr-10 text-sm text-ink placeholder:text-mute-300 transition-colors duration-150 focus:outline-none",
            error ? "border-red-400 focus:border-red-500" : "border-mute-200 focus:border-accent"
          )}
        />
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-mute-400"
        >
          <svg viewBox="0 0 16 16" fill="none" className={cn("h-4 w-4 transition-transform duration-200", open && "rotate-180")}>
            <path d="M3 6l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      <AnimatePresence>
        {open && filtered.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 mt-1 max-h-56 w-full overflow-y-scroll rounded-xl border border-mute-200 bg-paper shadow-lg"
            onWheel={(e) => e.stopPropagation()}
            style={{ overscrollBehavior: "contain" }}
          >
            {filtered.map((s) => (
              <button
                key={s}
                type="button"
                onMouseDown={() => select(s)}
                className={cn(
                  "flex w-full items-center px-4 py-2.5 text-left text-sm transition-colors duration-100 hover:bg-mute-50",
                  value === s ? "font-semibold text-accent" : "text-ink"
                )}
              >
                {value === s && (
                  <svg viewBox="0 0 12 12" fill="none" className="mr-2 h-3 w-3 shrink-0 text-accent">
                    <path d="M1.5 6l3 3 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
                {s}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      {error && <p className="mt-1 text-xs text-red-500">Bu alan zorunludur.</p>}
    </div>
  );
}

function ScoreRing({ score, label }: { score: number; label: string }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className={cn("flex h-20 w-20 items-center justify-center rounded-full border-4", scoreRingColor(score))}>
        <span className={cn("font-display text-2xl font-bold", scoreColor(score))}>
          {score === 0 ? "—" : score}
        </span>
      </div>
      <span className="text-center text-xs font-medium text-mute-500">{label}</span>
      <span className={cn("text-xs font-semibold", scoreColor(score))}>{scoreLabel(score)}</span>
    </div>
  );
}

function MetricInput({ label, placeholder, value, onChange, type = "text" }: {
  label: string; placeholder: string; value: string; onChange: (v: string) => void; type?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-mute-600">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-mute-200 bg-paper px-3 py-2.5 text-sm text-ink placeholder:text-mute-300 transition-colors duration-150 focus:border-accent focus:outline-none"
      />
    </div>
  );
}

function PlatformCard({ platform, metrics, open, onToggle, onMetricChange }: {
  platform: typeof PLATFORMS[number]; metrics: Record<string, string>;
  open: boolean; onToggle: () => void; onMetricChange: (key: string, value: string) => void;
}) {
  return (
    <div className={cn("rounded-xl border transition-colors duration-200", open ? "border-mute-300 bg-mute-50" : "border-mute-100 bg-paper hover:border-mute-200")}>
      <button type="button" onClick={onToggle} className="flex w-full items-center justify-between px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg p-1.5" style={{ backgroundColor: `${platform.color}18`, color: platform.color }}>
            <platform.Icon />
          </div>
          <div className="text-left">
            <span className="font-display text-sm font-semibold text-ink">{platform.label}</span>
            <p className="text-[11px] text-mute-400 mt-0.5 max-w-xs">{platform.description}</p>
          </div>
        </div>
        <div className={cn("flex h-6 w-11 items-center rounded-full transition-colors duration-200", open ? "bg-accent" : "bg-mute-200")}>
          <div className={cn("h-5 w-5 rounded-full bg-paper shadow transition-transform duration-200", open ? "translate-x-[22px]" : "translate-x-0.5")} />
        </div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="grid gap-3 px-5 pb-5 sm:grid-cols-2 lg:grid-cols-3">
              {METRIC_FIELDS[platform.id].map((f) => (
                <MetricInput
                  key={f.key}
                  label={f.label}
                  placeholder={f.placeholder}
                  value={metrics[f.key] ?? ""}
                  onChange={(v) => onMetricChange(f.key, v)}
                  type={f.type}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ScreenshotUploadCard({ platform, file, onChange }: {
  platform: typeof PLATFORMS[number]; file: File | null; onChange: (f: File | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f && f.type.startsWith("image/")) onChange(f);
  }, [onChange]);

  return (
    <div className="flex flex-col gap-2">
      {/* Platform bilgisi */}
      <div className="rounded-xl border border-mute-100 bg-mute-50 px-4 py-3">
        <div className="flex items-center gap-2 mb-1.5">
          <div className="h-5 w-5 rounded-md p-0.5" style={{ backgroundColor: `${platform.color}18`, color: platform.color }}>
            <platform.Icon />
          </div>
          <span className="text-xs font-semibold text-ink">{platform.label}</span>
          <button
            type="button"
            onClick={() => setShowGuide((v) => !v)}
            className="ml-auto text-[10px] font-medium text-accent underline underline-offset-2"
          >
            {showGuide ? "Gizle" : "Örnek gör"}
          </button>
        </div>
        <p className="text-[11px] leading-relaxed text-mute-500">{platform.screenshotHint}</p>
        {showGuide && (
          <div className="mt-2 overflow-hidden rounded-lg border border-mute-200">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={platform.guideImage} alt={`${platform.label} örnek`} className="w-full object-cover" />
          </div>
        )}
      </div>

      {/* Upload alanı */}
      <div
        className={cn(
          "relative rounded-xl border-2 border-dashed cursor-pointer transition-colors duration-200",
          dragging ? "border-accent bg-accent/5" : file ? "border-green-400 bg-green-50" : "border-mute-200 bg-paper hover:border-mute-300"
        )}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
      >
        <input ref={inputRef} type="file" accept="image/*" className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) onChange(f); }} />
        <div className="flex flex-col items-center gap-2 p-5">
          {file ? (
            <>
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-7 w-7 text-green-500">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-xs font-semibold text-green-600">Görüntü yüklendi</span>
              <span className="max-w-[160px] truncate text-[10px] text-mute-400">{file.name}</span>
              <button type="button" onClick={(e) => { e.stopPropagation(); onChange(null); }}
                className="mt-0.5 text-[10px] text-mute-400 underline hover:text-red-500">Kaldır</button>
            </>
          ) : (
            <>
              <svg viewBox="0 0 20 20" fill="none" className="h-7 w-7 text-mute-300">
                <path d="M10 3v10M6 7l4-4 4 4M3 14v1a2 2 0 002 2h10a2 2 0 002-2v-1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <p className="text-center text-xs text-mute-400">
                Sürükle & bırak<br />veya <span className="text-accent font-medium underline">dosya seç</span>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function AuditTool() {
  const [tab, setTab] = useState<Tab>("manual");
  const [openPlatforms, setOpenPlatforms] = useState<Set<Platform>>(new Set(["instagram"]));
  const [metrics, setMetrics] = useState<Metrics>(EMPTY_METRICS);
  const [screenshots, setScreenshots] = useState<Record<Platform, File | null>>({
    instagram: null, linkedin: null, youtube: null, google: null,
  });
  const [lead, setLead] = useState<LeadInfo>({ businessName: "", sector: "", phone: "", email: "" });
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof LeadInfo, boolean>>>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [result, setResult] = useState<{ text: string; scores: Scores } | null>(null);
  const [displayedText, setDisplayedText] = useState("");
  const [reportOpen, setReportOpen] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  // Typing animation
  useEffect(() => {
    if (!result?.text) return;
    setDisplayedText("");
    let i = 0;
    const speed = Math.max(6, Math.floor(result.text.length / 500));
    const iv = setInterval(() => {
      i += speed;
      if (i >= result.text.length) { setDisplayedText(result.text); clearInterval(iv); return; }
      setDisplayedText(result.text.slice(0, i));
    }, 16);
    return () => clearInterval(iv);
  }, [result?.text]);

  function openReport() {
    setReportOpen(true);
    dialogRef.current?.showModal();
    getLenis()?.stop();
  }

  function closeReport() {
    dialogRef.current?.close();
    setReportOpen(false);
    getLenis()?.start();
  }

  function scrollToResults() {
    const el = resultsRef.current;
    if (!el) return;
    const lenis = getLenis();
    if (lenis) {
      lenis.resize();
      requestAnimationFrame(() => {
        lenis.scrollTo(el, { offset: -32, duration: 0.9 });
      });
    } else {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function updateLead(key: keyof LeadInfo, value: string) {
    setLead((p) => ({ ...p, [key]: value }));
    if (value.trim()) setFieldErrors((p) => ({ ...p, [key]: false }));
  }

  function togglePlatform(id: Platform) {
    setOpenPlatforms((p) => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }

  function updateMetric(platform: Platform, key: string, value: string) {
    setMetrics((p) => ({ ...p, [platform]: { ...p[platform], [key]: value } }));
  }

  function validate(): boolean {
    const errors: Partial<Record<keyof LeadInfo, boolean>> = {};
    if (!lead.businessName.trim()) errors.businessName = true;
    if (!lead.sector.trim())       errors.sector = true;
    const phoneDigits = lead.phone.replace(/\D/g, "");
    if (phoneDigits.length < 10)   errors.phone = true;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRegex.test(lead.email.trim())) errors.email = true;
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleAnalyze() {
    if (!validate()) return;
    setApiError(null);
    setResult(null);
    setDisplayedText("");
    setLoading(true);

    try {
      let body: Record<string, unknown>;
      if (tab === "manual") {
        const activePlatforms = [...openPlatforms];
        if (activePlatforms.length === 0) { setApiError("En az bir platform seç."); setLoading(false); return; }
        body = { mode: "manual", ...lead, metrics, activePlatforms };
      } else {
        const screenshotData: Record<string, string> = {};
        for (const [platform, file] of Object.entries(screenshots)) {
          if (file) screenshotData[platform] = await fileToBase64(file);
        }
        if (Object.keys(screenshotData).length === 0) { setApiError("En az bir ekran görüntüsü yükle."); setLoading(false); return; }
        body = { mode: "screenshot", ...lead, screenshots: screenshotData };
      }

      const recaptchaToken = await getRecaptchaToken("audit");
      body.recaptchaToken = recaptchaToken;

      const res = await fetch("/api/audit", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok || data.error) { setApiError(data.error ?? "Beklenmedik bir hata oluştu."); return; }
      setResult({ text: data.text, scores: data.scores });
    } catch {
      setApiError("Bağlantı hatası. İnternet bağlantını kontrol et.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDownloadPDF() {
    if (!result) return;
    const [{ default: html2canvas }, { jsPDF }, { buildAuditReportHTML }] = await Promise.all([
      import("html2canvas"),
      import("jspdf"),
      import("@/lib/buildAuditReportHTML"),
    ]);

    const container = document.createElement("div");
    container.style.cssText = "position:absolute;left:-9999px;top:0;z-index:-1;";
    container.innerHTML = buildAuditReportHTML({
      businessName: lead.businessName,
      sector:       lead.sector,
      phone:        lead.phone,
      email:        lead.email,
      scores:       result.scores,
      reportText:   result.text,
    });
    document.body.appendChild(container);

    try {
      const canvas = await html2canvas(container.firstElementChild as HTMLElement, {
        scale: 3, useCORS: true, backgroundColor: "#ffffff", logging: false, windowWidth: 794,
        allowTaint: true, imageTimeout: 0,
      });

      const ctx = canvas.getContext("2d")!;
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageWmm = doc.internal.pageSize.getWidth();
      const pageHmm = doc.internal.pageSize.getHeight();
      const pageHpx = Math.round((pageHmm / pageWmm) * canvas.width);

      // Pages 2+ get a top margin so content doesn't sit flush against the edge
      const topMarginMm = 10;
      const topMarginPx = Math.round(topMarginMm * (canvas.width / pageWmm));

      let currentY = 0; let page = 0;
      while (currentY < canvas.height) {
        if (page > 0) doc.addPage();
        const isFirst = page === 0;
        const contentHpx = isFirst ? pageHpx : pageHpx - topMarginPx;

        let cutY: number;
        if (currentY + contentHpx >= canvas.height) {
          cutY = canvas.height;
        } else {
          // Search backward from cut point for the lightest (whitespace) row
          cutY = currentY + contentHpx;
          const searchRange = Math.round(contentHpx * 0.25);
          let bestCut = cutY;
          let bestLightness = 0;
          for (let y = cutY; y > cutY - searchRange && y > currentY + Math.round(contentHpx * 0.4); y--) {
            const d = ctx.getImageData(0, y, canvas.width, 1).data;
            let lightPixels = 0;
            for (let x = 0; x < canvas.width; x++) {
              const r = d[x * 4], g = d[x * 4 + 1], b = d[x * 4 + 2];
              if (r >= 220 && g >= 220 && b >= 220) lightPixels++;
            }
            const lightness = lightPixels / canvas.width;
            if (lightness > bestLightness) { bestLightness = lightness; bestCut = y; }
            if (lightness > 0.98) break;
          }
          cutY = bestCut;
        }

        const sliceH = cutY - currentY;
        const sliceCanvas = document.createElement("canvas");
        sliceCanvas.width = canvas.width; sliceCanvas.height = sliceH;
        sliceCanvas.getContext("2d")!.drawImage(canvas, 0, currentY, canvas.width, sliceH, 0, 0, canvas.width, sliceH);
        const sliceHmm = sliceH * (pageWmm / canvas.width);
        const yOffsetMm = isFirst ? 0 : topMarginMm;
        doc.addImage(sliceCanvas.toDataURL("image/jpeg", 0.93), "JPEG", 0, yOffsetMm, pageWmm, sliceHmm);
        currentY = cutY; page++;
      }

      doc.save(`DOU-AI-Audit-${lead.businessName.replace(/\s+/g, "-")}.pdf`);
    } finally {
      document.body.removeChild(container);
    }
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-paper">

      {/* ── Hero ── */}
      <div className="border-b border-mute-100 px-6 py-16 md:px-10 md:py-20">
        <div className="mx-auto max-w-[1120px]">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">Ücretsiz · Anında Sonuç</p>
          <h1 className="mt-4 max-w-3xl font-display font-bold leading-tight tracking-tight text-ink" style={{ fontSize: "var(--text-4xl)" }}>
            DouAI ile Sosyal Medyanı Analiz Et
          </h1>
          <p className="mt-4 max-w-xl text-mute-500" style={{ fontSize: "var(--text-base)" }}>
            Rakiplerinizden geri mi kalıyorsunuz? Sayılarınızı girin ya da ekran görüntüsü yükleyin —
            yapay zekâmız dijital varlığınızdaki eksiklikleri saniyeler içinde tespit etsin ve size özel bir rapor hazırlasın.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            {["Ücretsiz analiz", "2 dakikada sonuç", "PDF rapor indir"].map((tag) => (
              <span key={tag} className="inline-flex items-center gap-1.5 rounded-full border border-mute-200 bg-mute-50 px-3 py-1 text-xs font-medium text-mute-600">
                <svg viewBox="0 0 12 12" fill="none" className="h-3 w-3 text-accent">
                  <path d="M1.5 6l3 3 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="mx-auto max-w-[1120px] px-6 py-12 md:px-10">

        {/* Lead bilgileri */}
        <div className="mb-8 rounded-2xl border border-mute-100 bg-mute-50 p-6 md:p-8">
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.2em] text-accent">İletişim Bilgileri</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <RequiredLabel>İşletme / Marka Adı</RequiredLabel>
              <input
                type="text"
                value={lead.businessName}
                onChange={(e) => updateLead("businessName", e.target.value)}
                placeholder="örn. Kafe Luna"
                className={cn(
                  "w-full rounded-xl border bg-paper px-4 py-3 text-sm text-ink placeholder:text-mute-300 transition-colors duration-150 focus:outline-none",
                  fieldErrors.businessName ? "border-red-400 focus:border-red-500" : "border-mute-200 focus:border-accent"
                )}
              />
              {fieldErrors.businessName && <p className="mt-1 text-xs text-red-500">Bu alan zorunludur.</p>}
            </div>

            <SectorField value={lead.sector} onChange={(v) => updateLead("sector", v)} error={fieldErrors.sector} />

            <div>
              <RequiredLabel>Telefon Numarası</RequiredLabel>
              <input
                type="tel"
                value={lead.phone}
                onChange={(e) => updateLead("phone", formatPhone(e.target.value))}
                placeholder="örn. 0555 555 5555"
                maxLength={13}
                className={cn(
                  "w-full rounded-xl border bg-paper px-4 py-3 text-sm text-ink placeholder:text-mute-300 transition-colors duration-150 focus:outline-none",
                  fieldErrors.phone ? "border-red-400 focus:border-red-500" : "border-mute-200 focus:border-accent"
                )}
              />
              {fieldErrors.phone && <p className="mt-1 text-xs text-red-500">Geçerli bir telefon numarası girin (ör. 0555 555 5555).</p>}
            </div>

            <div>
              <RequiredLabel>E-posta Adresi</RequiredLabel>
              <input
                type="email"
                value={lead.email}
                onChange={(e) => updateLead("email", e.target.value)}
                placeholder="örn. info@isletme.com"
                className={cn(
                  "w-full rounded-xl border bg-paper px-4 py-3 text-sm text-ink placeholder:text-mute-300 transition-colors duration-150 focus:outline-none",
                  fieldErrors.email ? "border-red-400 focus:border-red-500" : "border-mute-200 focus:border-accent"
                )}
              />
              {fieldErrors.email && <p className="mt-1 text-xs text-red-500">Geçerli bir e-posta girin.</p>}
            </div>
          </div>
        </div>

        {/* Tab */}
        <div className="mb-6 inline-flex rounded-xl border border-mute-200 bg-mute-50 p-1">
          {(["manual", "screenshot"] as Tab[]).map((t) => (
            <button key={t} type="button" onClick={() => setTab(t)}
              className={cn("rounded-lg px-5 py-2.5 text-sm font-semibold transition-all duration-200",
                tab === t ? "bg-ink text-paper shadow-sm" : "text-mute-500 hover:text-ink")}>
              {t === "manual" ? "Manuel Giriş" : "Ekran Görüntüsü Yükle"}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          {tab === "manual" ? (
            <motion.div key="manual" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }} className="space-y-3">
              {PLATFORMS.map((p) => (
                <PlatformCard key={p.id} platform={p}
                  metrics={metrics[p.id] as unknown as Record<string, string>}
                  open={openPlatforms.has(p.id)} onToggle={() => togglePlatform(p.id)}
                  onMetricChange={(k, v) => updateMetric(p.id, k, v)} />
              ))}
            </motion.div>
          ) : (
            <motion.div key="screenshot" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
              <div className="mb-5 rounded-xl border border-accent/20 bg-accent/5 px-5 py-4">
                <p className="text-sm font-semibold text-accent mb-1">Nasıl kullanılır?</p>
                <p className="text-xs leading-relaxed text-mute-600">
                  Analiz etmek istediğiniz platformun profilini telefonunuzdan veya bilgisayarınızdan açın ve ekran görüntüsü alın.
                  Her platform için aşağıdaki kartlardaki <strong>"Örnek gör"</strong> butonuna tıklayarak tam olarak hangi sayfanın görüntüsünü almanız gerektiğini görebilirsiniz.
                  En az bir platform yüklemeniz yeterlidir.
                </p>
              </div>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {PLATFORMS.map((p) => (
                  <ScreenshotUploadCard key={p.id} platform={p} file={screenshots[p.id]}
                    onChange={(f) => setScreenshots((prev) => ({ ...prev, [p.id]: f }))} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error */}
        {apiError && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
            {apiError}
          </div>
        )}

        {/* CTA */}
        <div className="mt-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <button type="button" onClick={handleAnalyze} disabled={loading}
              className={cn("inline-flex h-14 items-center gap-3 rounded-full px-10 font-semibold text-paper transition-all duration-200 bg-accent hover:bg-accent-hover active:scale-[0.98]", loading && "cursor-not-allowed opacity-70")}>
              {loading ? (
                <><svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>DouAI analiz yapıyor…</>
              ) : (
                <><svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" /></svg>DouAI Raporumu Hazırla</>
              )}
            </button>
            <span className="text-xs text-mute-400 sm:ml-2">Ücretsiz · Kayıt gerekmez</span>
          </div>
        </div>

        {/* Results */}
        <AnimatePresence>
          {result && (
            <motion.div ref={resultsRef} key="results" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} onAnimationComplete={scrollToResults} className="mt-12 space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-px flex-1 bg-mute-100" />
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Analiz Sonucu</span>
                <div className="h-px flex-1 bg-mute-100" />
              </div>

              {/* Scores */}
              <div className="rounded-2xl border border-mute-100 bg-mute-50 p-6 md:p-8">
                <h2 className="mb-6 font-display text-sm font-semibold uppercase tracking-[0.18em] text-mute-500">Platform Skorları</h2>
                <div className="flex flex-wrap justify-center gap-8 sm:justify-start">
                  <ScoreRing score={result.scores.overall} label="Genel" />
                  {PLATFORMS.map((p) => result.scores[p.id] > 0 && <ScoreRing key={p.id} score={result.scores[p.id]} label={p.label} />)}
                </div>
              </div>

              {/* Butonlar */}
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={openReport}
                  className="inline-flex h-12 items-center gap-2.5 rounded-full border border-mute-200 bg-paper px-6 text-sm font-semibold text-ink transition-all duration-200 hover:border-ink hover:bg-ink hover:text-paper"
                >
                  <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4">
                    <path d="M8 3a5 5 0 100 10A5 5 0 008 3z" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M8 6v2l1.5 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  Dosyayı Görüntüle
                </button>
                <button
                  type="button"
                  onClick={handleDownloadPDF}
                  className="inline-flex h-12 items-center gap-2.5 rounded-full bg-accent px-6 text-sm font-semibold text-paper transition-all duration-200 hover:bg-accent-hover"
                >
                  <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4">
                    <path d="M8 2v9M4 8l4 4 4-4M2 13h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  PDF İndir
                </button>
              </div>

              {/* Rapor Modalı */}
              <dialog
                ref={dialogRef}
                onClick={(e) => e.target === e.currentTarget && closeReport()}
                onWheel={(e) => { if (dialogRef.current) dialogRef.current.scrollTop += e.deltaY; }}
                className="m-auto w-full max-w-2xl rounded-2xl bg-paper p-0 shadow-2xl backdrop:bg-black/50 backdrop:backdrop-blur-sm"
                style={{ maxHeight: "85dvh", overflowY: "auto", overscrollBehavior: "contain" }}
              >
                {/* Header */}
                <div className="sticky top-0 z-10 flex items-start justify-between border-b border-mute-100 bg-paper px-8 py-5">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">DouAI · Analiz Raporu</p>
                    <h2 className="mt-1 font-display text-xl font-bold leading-tight tracking-tight text-ink">
                      Detaylı Rapor
                    </h2>
                    <p className="mt-0.5 text-xs text-mute-400">{result.scores.overall > 0 ? `Genel Skor: ${result.scores.overall}` : ""}</p>
                  </div>
                  <button
                    type="button"
                    onClick={closeReport}
                    aria-label="Kapat"
                    className="ml-4 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-mute-400 transition-colors hover:bg-mute-100 hover:text-ink"
                  >
                    <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" aria-hidden>
                      <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                    </svg>
                  </button>
                </div>

                {/* Body */}
                <div className="px-8 py-6 text-sm leading-relaxed text-mute-700">
                  <div className="space-y-1">
                    {(reportOpen ? result.text : displayedText).split("\n").map((line, i) => (
                      <p key={i} className={cn(line.match(/^\d+\)|^[A-ZÇŞĞÜÖİ].*:$/) ? "mt-4 font-display font-bold text-ink" : "")}>
                        {line || <span className="block h-2" />}
                      </p>
                    ))}
                  </div>
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 flex items-center justify-between border-t border-mute-100 bg-paper px-8 py-4">
                  <button
                    type="button"
                    onClick={handleDownloadPDF}
                    className="inline-flex items-center gap-2 text-xs font-semibold text-accent underline underline-offset-2 hover:text-accent/70"
                  >
                    PDF İndir
                  </button>
                  <button
                    type="button"
                    onClick={closeReport}
                    className="rounded-xl bg-ink px-5 py-2.5 text-sm font-semibold text-paper transition-colors hover:bg-mute-800"
                  >
                    Kapat
                  </button>
                </div>
              </dialog>

              {/* Bottom CTA */}
              <div className="rounded-2xl border border-mute-100 bg-ink p-6 text-center md:p-8">
                <p className="font-display text-lg font-bold text-paper">Raporunuzu gördünüz, şimdi ne yapacaksınız?</p>
                <p className="mt-2 text-sm text-mute-400">DOU Social ekibi, bu eksiklikleri birlikte kapatmak için ücretsiz bir strateji görüşmesi yapmaya hazır. Hiçbir taahhüt gerekmez.</p>
                <a href="/iletisim"
                  className="mt-5 inline-flex h-12 items-center gap-2 rounded-full bg-accent px-8 text-sm font-semibold text-paper transition-colors duration-200 hover:bg-accent-hover">
                  Ücretsiz görüşme talep et →
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}
