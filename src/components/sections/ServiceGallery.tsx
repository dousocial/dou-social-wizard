"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

// ─── Slide data ───────────────────────────────────────────────────────────────
// image: "/gallery/kampanya.jpg"
// video: "/videos/reel-showcase.mp4"  ← video varsa öncelikli gösterilir

const SLIDES = [
  {
    id: "meta",
    label: "Meta Ads",
    title: "Hedef kitleye doğrudan ulaşan kampanyalar",
    sub: "Facebook & Instagram",
    gradient: "from-[#1a0a0a] via-[#3d1010] to-[#1a0505]",
    accent: "#c0392b",
    image: null as string | null,
    video: null as string | null,
  },
  {
    id: "social",
    label: "Sosyal Medya Yönetimi",
    title: "Markanızı her platformda canlı tutan içerikler",
    sub: "Instagram · LinkedIn · TikTok",
    gradient: "from-[#0a0a1a] via-[#101040] to-[#050520]",
    accent: "#5b6cf5",
    image: null as string | null,
    video: null as string | null,
  },
  {
    id: "content",
    label: "İçerik Üretimi",
    title: "Profesyonel fotoğraf ve video prodüksiyonu",
    sub: "Reels · Tanıtım Filmi · Fotoğraf",
    gradient: "from-[#0a1510] via-[#0d2d18] to-[#061008]",
    accent: "#27ae60",
    image: null as string | null,
    video: null as string | null,
  },
  {
    id: "web",
    label: "Web Tasarım",
    title: "Dönüşüm odaklı web siteleri ve landing page'ler",
    sub: "Next.js · Figma · SEO",
    gradient: "from-[#0a0a0a] via-[#1a1a2e] to-[#080810]",
    accent: "#9b59b6",
    image: null as string | null,
    video: null as string | null,
  },
  {
    id: "analytics",
    label: "Performans Analizi",
    title: "Veriyle desteklenen kararlar, ölçülebilir büyüme",
    sub: "Google Analytics · Meta Pixel",
    gradient: "from-[#0a0f1a] via-[#0d1f3c] to-[#050a14]",
    accent: "#2980b9",
    image: null as string | null,
    video: null as string | null,
  },
];

const INTERVAL_MS = 2800;

// ─── Component ────────────────────────────────────────────────────────────────

export function ServiceGallery() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const touchStartX = useRef<number>(0);

  const advance = useCallback(() => {
    setCurrent((c) => (c + 1) % SLIDES.length);
  }, []);

  useEffect(() => {
    if (paused) return;
    timerRef.current = setInterval(advance, INTERVAL_MS);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [paused, advance]);

  // Video: yalnızca hover sırasında sessizce oynat, hover bitince başa sar ve durdur
  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;
    if (paused) {
      vid.play().catch(() => {});
    } else {
      vid.pause();
      vid.currentTime = 0;
    }
  }, [paused, current]);

  const goTo = (i: number) => {
    setCurrent(i);
    if (timerRef.current) clearInterval(timerRef.current);
    if (!paused) timerRef.current = setInterval(advance, INTERVAL_MS);
  };

  const prev = () => goTo((current - 1 + SLIDES.length) % SLIDES.length);
  const next = () => goTo((current + 1) % SLIDES.length);

  // Touch swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const delta = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(delta) > 40) delta > 0 ? next() : prev();
  };

  const slide = SLIDES[current];
  const hasMedia = !!(slide.video || slide.image);

  return (
    <div
      className="relative mt-12 overflow-hidden rounded-2xl aspect-[4/3] sm:aspect-[16/8] md:aspect-[16/6]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
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
          {/* Video (öncelikli) */}
          {slide.video && (
            <video
              ref={videoRef}
              src={slide.video}
              poster={slide.image ?? undefined}
              className="absolute inset-0 h-full w-full object-cover"
              preload="metadata"
              muted
              loop
              playsInline
            />
          )}

          {/* Fotoğraf (video yoksa) */}
          {!slide.video && slide.image && (
            <Image
              src={slide.image}
              alt={slide.title}
              fill
              sizes="(max-width: 1024px) 100vw, 80vw"
              className="object-cover"
            />
          )}

          {/* Noise overlay */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
              backgroundSize: "128px 128px",
            }}
          />

          {/* Gradient vignette — video/resim varsa daha güçlü karart */}
          <div className={`absolute inset-0 bg-gradient-to-t ${hasMedia ? "from-black/70 via-black/20" : "from-black/60 via-transparent"} to-black/10`} />
          <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-transparent" />

          {/* Dekoratif daire */}
          <div
            className="absolute -right-20 -top-20 h-80 w-80 rounded-full opacity-10"
            style={{ background: `radial-gradient(circle, ${slide.accent}, transparent 70%)` }}
          />

          {/* İçerik */}
          <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-7 md:p-10">
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

              {/* Video badge */}
              {slide.video && (
                <span className="ml-2 inline-block rounded-full border border-white/15 bg-white/10 px-2 py-0.5 text-[9px] font-medium uppercase tracking-widest text-white/60 backdrop-blur-sm">
                  Video
                </span>
              )}

              {/* Başlık */}
              <h3
                className="mt-2 max-w-xl font-display font-bold leading-tight tracking-tight text-white"
                style={{ fontSize: "clamp(1rem, 3.5vw, 1.75rem)" }}
              >
                {slide.title}
              </h3>

              {/* Alt yazı */}
              <p className="mt-1.5 text-xs font-medium tracking-wide text-white/50">{slide.sub}</p>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* ── Progress bar ── */}
      <div className="absolute bottom-0 left-0 right-0 flex gap-1 px-5 pb-2 sm:px-7 md:px-10">
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

      {/* ── İleri / Geri butonları — mobilde biraz daha küçük ── */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 sm:right-6 md:right-10 md:gap-2">
        <button
          type="button"
          onClick={prev}
          aria-label="Önceki slayt"
          className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-black/30 text-white/70 backdrop-blur-sm transition-all duration-200 hover:border-white/50 hover:bg-black/50 hover:text-white md:h-9 md:w-9"
        >
          <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 md:h-4 md:w-4" fill="none" aria-hidden>
            <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <button
          type="button"
          onClick={next}
          aria-label="Sonraki slayt"
          className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-black/30 text-white/70 backdrop-blur-sm transition-all duration-200 hover:border-white/50 hover:bg-black/50 hover:text-white md:h-9 md:w-9"
        >
          <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 md:h-4 md:w-4" fill="none" aria-hidden>
            <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* ── Slide counter ── */}
      <div className="absolute left-5 top-4 font-display text-xs tracking-widest text-white/40 sm:left-7 md:left-10">
        {String(current + 1).padStart(2, "0")}
        <span className="text-white/20"> / {String(SLIDES.length).padStart(2, "0")}</span>
      </div>
    </div>
  );
}
