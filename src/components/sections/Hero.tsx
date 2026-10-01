"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Noise } from "@/components/ui/Noise";
import { siteConfig } from "@/config/site";
import { HeroParticles } from "./HeroParticles";

// Render the first screen without scroll observers or entrance animations.
export function Hero() {
  const t = useTranslations("Hero");
  const [videoEnabled, setVideoEnabled] = useState(false);
  useEffect(() => {
    const desktop = window.matchMedia(
      "(min-width: 768px) and (prefers-reduced-motion: no-preference)"
    );
    const connection = (
      navigator as Navigator & { connection?: { saveData?: boolean } }
    ).connection;
    if (!desktop.matches || connection?.saveData) return;
    const timer = window.setTimeout(() => setVideoEnabled(true), 2500);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <section
      className="relative flex min-h-[100svh] items-center overflow-hidden"
      aria-label="Hero"
    >
      {/* ── Video background ───────────────────────────────────────── */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 select-none"
      >
        {/* Fallback — her zaman siyah, tema değişiminden etkilenmiyor */}
        <div className="absolute inset-0 bg-black" />
        {/* Mobile: still frame from the video — no video element = no native play/pause overlay */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/videos/hero-bg-poster.webp"
          alt=""
          aria-hidden
          decoding="async"
          fetchPriority="high"
          className="absolute inset-0 h-full w-full object-cover"
        />
        {/* Desktop: actual video — poster shows immediately while video downloads */}
        {videoEnabled && (
          <video
            autoPlay
            muted
            loop
            playsInline
            disablePictureInPicture
            tabIndex={-1}
            preload="metadata"
            poster="/videos/hero-bg-poster.webp"
            className="absolute inset-0 hidden h-full w-full object-cover md:block"
            src="/videos/hero-bg.mp4"
            style={{
              pointerEvents: "none",
            }}
          />
        )}

        {/* Karartma + marka rengi geçişi — her iki temada da güçlü kontrast */}
        <div className="absolute inset-0 bg-black/50 md:bg-black/60" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,_rgb(128_0_0_/_0.25)_0%,_transparent_65%)]" />
        {videoEnabled && <HeroParticles />}

        {/* Noise texture */}
        <Noise opacity={0.03} />
      </div>

      {/* ── Touch shield — z-[1], sits between video bg and z-10 content.
           iOS Safari shows its native play/pause overlay whenever a touch
           lands "on" a video element. This invisible div intercepts every
           tap in the hero area so the video element never receives touch
           attribution from the WebKit media layer. ─────────────────────── */}
      <div aria-hidden className="pointer-events-auto absolute inset-0 z-[1]" />

      {/* ── Content ────────────────────────────────────────────────── */}
      <Container className="relative z-10 w-full">
        <div className="flex flex-col items-center py-20 text-center md:py-40 lg:py-48">
          {/* Eyebrow badge */}
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-medium tracking-widest text-white/70 uppercase backdrop-blur-sm">
              <span
                aria-hidden
                className="bg-accent h-1.5 w-1.5 animate-pulse rounded-full"
              />
              {siteConfig.contact.location}
            </span>
          </div>

          {/* Main heading */}
          <h1
            className="font-display mt-8 max-w-4xl leading-[1.02] font-bold tracking-tight text-white"
            style={{ fontSize: "clamp(2.5rem, 2rem + 5vw, 6rem)" }}
          >
            {t("titleBefore")}{" "}
            <span className="bg-gradient-to-r from-red-400 via-red-500 to-red-700 bg-clip-text font-bold text-transparent">
              {t("titleHighlight")}
            </span>{" "}
            {t("titleAfter")}
          </h1>

          {/* Subtitle */}
          <p
            data-geo-summary
            className="mt-7 max-w-2xl leading-relaxed text-white/65"
            style={{ fontSize: "var(--text-lg)" }}
          >
            {t("subtitle")}
          </p>

          {/* CTA buttons */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:gap-4 md:mt-12">
            <ButtonLink href="/dijital-checkup" variant="primary" size="lg">
              {t("ctaPrimary")}
            </ButtonLink>
            <ButtonLink
              href="/projeler"
              variant="secondary"
              size="lg"
              className="border-white/60 text-white hover:bg-white/15 hover:text-white focus-visible:outline-white"
            >
              {t("ctaSecondary")}
            </ButtonLink>
          </div>

          {/* Social proof stats */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 md:mt-16">
            {[
              { value: "10+", label: "Marka" },
              { value: "250k+", label: "Reklam Bütçesi" },
              { value: "3 yıl", label: "Deneyim" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="flex flex-col items-center gap-1"
              >
                <span
                  className="font-display font-semibold text-white"
                  style={{ fontSize: "var(--text-2xl)" }}
                >
                  {stat.value}
                </span>
                <span className="text-xs tracking-wide text-white/50 uppercase">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </Container>

      {/* ── Scroll indicator ──────────────────────────────────────── */}
      <div
        aria-hidden
        className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2"
      >
        <span className="text-[10px] tracking-[0.2em] text-white/40 uppercase">
          Scroll
        </span>
        <div className="relative h-10 w-px overflow-hidden bg-white/20">
          <div className="bg-accent absolute top-0 left-0 h-full w-full" />
        </div>
      </div>

      {/* ── Bottom fade to paper ───────────────────────────────────── */}
      <div
        aria-hidden
        className="from-paper pointer-events-none absolute right-0 bottom-0 left-0 h-32 bg-gradient-to-t to-transparent"
      />
    </section>
  );
}
