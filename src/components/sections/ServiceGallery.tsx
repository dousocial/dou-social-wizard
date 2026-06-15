"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Slide data ───────────────────────────────────────────────────────────────
// Her objenin `image` alanına gerçek fotoğraf yolu eklenebilir.
// Örnek: image: "/gallery/meta-kampanya.jpg"

const SLIDES = [
  {
    id: "meta",
    label: "Meta Ads",
    title: "Hedef kitleye doğrudan ulaşan kampanyalar",
    sub: "Facebook & Instagram",
    gradient: "from-[#1a0a0a] via-[#3d1010] to-[#1a0505]",
    accent: "#c0392b",
    image: null as string | null,
  },
  {
    id: "social",
    label: "Sosyal Medya Yönetimi",
    title: "Markanızı her platformda canlı tutan içerikler",
    sub: "Instagram · LinkedIn · TikTok",
    gradient: "from-[#0a0a1a] via-[#101040] to-[#050520]",
    accent: "#5b6cf5",
    image: null as string | null,
  },
  {
    id: "content",
    label: "İçerik Üretimi",
    title: "Profesyonel fotoğraf ve video prodüksiyonu",
    sub: "Reels · Tanıtım Filmi · Fotoğraf",
    gradient: "from-[#0a1510] via-[#0d2d18] to-[#061008]",
    accent: "#27ae60",
    image: null as string | null,
  },
  {
    id: "web",
    label: "Web Tasarım",
    title: "Dönüşüm odaklı web siteleri ve landing page'ler",
    sub: "Next.js · Figma · SEO",
    gradient: "from-[#0a0a0a] via-[#1a1a2e] to-[#080810]",
    accent: "#9b59b6",
    image: null as string | null,
  },
  {
    id: "analytics",
    label: "Performans Analizi",
    title: "Veriyle desteklenen kararlar, ölçülebilir büyüme",
    sub: "Google Analytics · Meta Pixel",
    gradient: "from-[#0a0f1a] via-[#0d1f3c] to-[#050a14]",
    accent: "#2980b9",
    image: null as string | null,
  },
] as const;

const INTERVAL_MS = 2800;

// ─── Component ────────────────────────────────────────────────────────────────

export function ServiceGallery() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const advance = useCallback(() => {
    setCurrent((c) => (c + 1) % SLIDES.length);
  }, []);

  useEffect(() => {
    if (paused) return;
    timerRef.current = setInterval(advance, INTERVAL_MS);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [paused, advance]);

  const goTo = (i: number) => {
    setCurrent(i);
    if (timerRef.current) clearInterval(timerRef.current);
    if (!paused) {
      timerRef.current = setInterval(advance, INTERVAL_MS);
    }
  };

  const prev = () => goTo((current - 1 + SLIDES.length) % SLIDES.length);
  const next = () => goTo((current + 1) % SLIDES.length);

  const slide = SLIDES[current];

  return (
    <div
      className="relative mt-12 overflow-hidden rounded-2xl"
      style={{ aspectRatio: "16 / 6" }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* ── Slides ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.id}
          initial={{ opacity: 0, scale: 1.03 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          className={`absolute inset-0 bg-gradient-to-br ${slide.gradient}`}
        >
          {/* Fotoğraf varsa göster */}
          {slide.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={slide.image}
              alt={slide.title}
              className="absolute inset-0 h-full w-full object-cover"
            />
          )}

          {/* Dekoratif noise overlay */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
              backgroundSize: "128px 128px",
            }}
          />

          {/* Gradient vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-transparent" />

          {/* Dekoratif daire */}
          <div
            className="absolute -right-20 -top-20 h-80 w-80 rounded-full opacity-10"
            style={{ background: `radial-gradient(circle, ${slide.accent}, transparent 70%)` }}
          />

          {/* İçerik */}
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
            <motion.div
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Label */}
              <span
                className="inline-block rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em]"
                style={{ background: `${slide.accent}25`, color: slide.accent, border: `1px solid ${slide.accent}40` }}
              >
                {slide.label}
              </span>

              {/* Başlık */}
              <h3 className="mt-3 max-w-xl font-display font-bold leading-tight tracking-tight text-white"
                style={{ fontSize: "clamp(1.1rem, 2.5vw, 1.75rem)" }}>
                {slide.title}
              </h3>

              {/* Alt yazı */}
              <p className="mt-1.5 text-xs font-medium tracking-wide text-white/50">{slide.sub}</p>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* ── Progress bar ── */}
      <div className="absolute bottom-0 left-0 right-0 flex gap-1 px-6 pb-2 md:px-10">
        {SLIDES.map((s, i) => (
          <button
            key={s.id}
            type="button"
            aria-label={`Slide ${i + 1}`}
            onClick={() => goTo(i)}
            className="relative h-[3px] flex-1 overflow-hidden rounded-full bg-white/20"
          >
            {i === current && (
              <motion.div
                key={`${s.id}-bar`}
                className="absolute inset-y-0 left-0 rounded-full bg-white"
                initial={{ width: "0%" }}
                animate={{ width: paused ? undefined : "100%" }}
                transition={{ duration: INTERVAL_MS / 1000, ease: "linear" }}
              />
            )}
            {i < current && (
              <div className="absolute inset-0 rounded-full bg-white/60" />
            )}
          </button>
        ))}
      </div>

      {/* ── İleri / Geri butonları ── */}
      <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-2 md:right-10">
        <button
          type="button"
          onClick={prev}
          aria-label="Önceki slayt"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/30 text-white/70 backdrop-blur-sm transition-all duration-200 hover:border-white/50 hover:bg-black/50 hover:text-white"
        >
          <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" aria-hidden>
            <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <button
          type="button"
          onClick={next}
          aria-label="Sonraki slayt"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/30 text-white/70 backdrop-blur-sm transition-all duration-200 hover:border-white/50 hover:bg-black/50 hover:text-white"
        >
          <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" aria-hidden>
            <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* ── Slide counter ── */}
      <div className="absolute left-6 top-5 font-display text-xs tracking-widest text-white/40 md:left-10">
        {String(current + 1).padStart(2, "0")}
        <span className="text-white/20"> / {String(SLIDES.length).padStart(2, "0")}</span>
      </div>
    </div>
  );
}
