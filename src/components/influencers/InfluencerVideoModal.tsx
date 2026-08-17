"use client";

import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { InfluencerItem } from "@/lib/influencers";
import { getLenis } from "@/components/layout/SmoothScrollProvider";

const EASE = [0.16, 1, 0.3, 1] as const;

interface InfluencerVideoModalProps {
  influencer: InfluencerItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export function InfluencerVideoModal({
  influencer,
  isOpen,
  onClose,
}: InfluencerVideoModalProps) {
  const [mounted, setMounted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lenis scroll lock
  useEffect(() => {
    const lenis = getLenis();
    if (isOpen) {
      lenis?.stop();
      document.body.style.overflow = "hidden";
    } else {
      lenis?.start();
      document.body.style.overflow = "";
    }
    return () => {
      lenis?.start();
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Escape key handler
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!mounted) return null;

  const isDirectVideo =
    influencer?.videoUrl &&
    (influencer.videoUrl.endsWith(".mp4") ||
      influencer.videoUrl.endsWith(".webm") ||
      influencer.videoUrl.includes("commondatastorage.googleapis.com") ||
      influencer.videoUrl.includes("supabase.co/storage"));

  return createPortal(
    <AnimatePresence>
      {isOpen && influencer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-6 lg:p-10">
          {/* Backdrop blur */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/90 backdrop-blur-xl"
            aria-hidden="true"
          />

          {/* ═════════════════════════════════════════════════════════════════════
              MODAL PANEL
              - Mobilde: Dikey, alt panel ayrılmış, kristal netliğinde modern düzen
              - Masaüstünde: Yan yana video ve detay kartı
             ═════════════════════════════════════════════════════════════════════ */}
          <motion.div
            key="modal-panel"
            initial={{ opacity: 0, scale: 0.98, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 16 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="relative z-10 flex h-full w-full max-w-4xl flex-col overflow-hidden bg-ink text-paper shadow-2xl md:h-[82vh] md:max-h-[760px] md:flex-row md:rounded-3xl md:border md:border-mute-200 md:bg-paper md:text-ink"
            role="dialog"
            aria-modal="true"
            aria-label={`${influencer.name} İçerik İnceleme`}
          >
            {/* ── Mobil Üst Bar (Kategori, İsim ve Kapat Butonu) ── */}
            <div className="absolute left-0 right-0 top-0 z-30 flex items-center justify-between border-b border-white/10 bg-black/60 px-4 py-3 backdrop-blur-md md:hidden">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-accent px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                  {influencer.category}
                </span>
                <span className="font-display text-xs font-bold text-white">
                  {influencer.name}
                </span>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm transition-all active:scale-95"
                aria-label="Kapat"
              >
                <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M3 3l10 10M13 3L3 13" />
                </svg>
              </button>
            </div>

            {/* ── Masaüstü Kapat Butonu (MD ve üstü) ── */}
            <button
              type="button"
              onClick={onClose}
              className="absolute right-4 top-4 z-30 hidden h-9 w-9 items-center justify-center rounded-full border border-mute-200 bg-paper/90 text-mute-500 backdrop-blur-sm transition-all hover:border-ink hover:bg-ink hover:text-paper md:flex"
              aria-label="Kapat"
            >
              <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d="M3 3l10 10M13 3L3 13" />
              </svg>
            </button>

            {/* ── Video Alanı ── */}
            <div className="relative flex flex-1 items-center justify-center bg-black pt-14 pb-2 md:h-auto md:w-[48%] md:flex-none md:p-0">
              {isDirectVideo ? (
                <div className="relative flex h-full w-full items-center justify-center">
                  <video
                    ref={videoRef}
                    src={influencer.videoUrl}
                    poster={influencer.videoCover || influencer.profileImage}
                    autoPlay
                    loop
                    muted={isMuted}
                    playsInline
                    className="max-h-full w-full object-contain md:h-full md:object-cover"
                    onClick={() => {
                      if (videoRef.current) {
                        if (videoRef.current.paused) {
                          videoRef.current.play();
                          setIsPlaying(true);
                        } else {
                          videoRef.current.pause();
                          setIsPlaying(false);
                        }
                      }
                    }}
                  />

                  {/* Video İçi Hızlı Duraklat / Ses Kontrolleri */}
                  <div className="absolute right-3 top-16 z-20 flex flex-col gap-2 md:bottom-4 md:left-4 md:right-4 md:top-auto md:flex-row md:items-center md:justify-between md:rounded-full md:border md:border-white/15 md:bg-black/60 md:px-4 md:py-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (videoRef.current) {
                          if (isPlaying) {
                            videoRef.current.pause();
                            setIsPlaying(false);
                          } else {
                            videoRef.current.play();
                            setIsPlaying(true);
                          }
                        }
                      }}
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-black/70 text-white backdrop-blur-md md:h-auto md:w-auto md:bg-transparent md:text-xs md:font-medium md:hover:text-accent"
                      aria-label={isPlaying ? "Duraklat" : "Oynat"}
                    >
                      {isPlaying ? (
                        <>
                          <svg className="h-4 w-4 fill-current md:h-3.5 md:w-3.5" viewBox="0 0 24 24">
                            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                          </svg>
                          <span className="hidden md:inline md:ml-2">Duraklat</span>
                        </>
                      ) : (
                        <>
                          <svg className="h-4 w-4 fill-current md:h-3.5 md:w-3.5" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                          <span className="hidden md:inline md:ml-2">Oynat</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (videoRef.current) {
                          videoRef.current.muted = !isMuted;
                          setIsMuted(!isMuted);
                        }
                      }}
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-black/70 text-white backdrop-blur-md md:h-auto md:w-auto md:bg-transparent md:text-xs md:font-medium md:text-white/80 md:hover:text-white"
                      aria-label={isMuted ? "Sesi Aç" : "Sesi Kapat"}
                    >
                      {isMuted ? (
                        <>
                          <svg className="h-4 w-4 fill-current md:h-3.5 md:w-3.5" viewBox="0 0 24 24">
                            <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                          </svg>
                          <span className="hidden md:inline md:ml-1.5">Sesi Aç</span>
                        </>
                      ) : (
                        <>
                          <svg className="h-4 w-4 fill-current md:h-3.5 md:w-3.5" viewBox="0 0 24 24">
                            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                          </svg>
                          <span className="hidden md:inline md:ml-1.5">Sesi Kapat</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center p-8 text-center text-white">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white">
                    <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                  </div>
                  <h4 className="mt-4 font-display text-lg font-bold text-white">
                    Öne Çıkan Instagram İçeriği
                  </h4>
                  <p className="mt-1 max-w-xs text-xs text-white/70">
                    Orijinal video içeriğini doğrudan Instagram profilinde inceleyebilirsiniz.
                  </p>
                </div>
              )}
            </div>

            {/* ── Mobil Alt Bölüm (Kristal Netliğinde Ayrı Kart) ── */}
            <div className="relative z-20 border-t border-white/10 bg-black/95 px-5 py-4 backdrop-blur-xl md:hidden">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display text-lg font-bold text-white">{influencer.name}</h3>
                  <p className="text-xs font-semibold text-accent">{influencer.handle}</p>
                </div>
                {influencer.followers && (
                  <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 font-mono text-xs font-bold text-white">
                    {influencer.followers} Kitle
                  </span>
                )}
              </div>

              {/* Instagram Butonu (Yüksek Kontrast, Tam Okunabilir) */}
              <a
                href={influencer.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-white py-3.5 text-center text-xs font-bold uppercase tracking-wider text-black shadow-xl transition-transform active:scale-95"
              >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
                <span>Instagram Profiline Git</span>
              </a>
            </div>

            {/* ── Masaüstü Sağ Kolon: Detaylı Profil Künyesi (MD ve üstü) ── */}
            <div className="hidden flex-1 flex-col justify-between overflow-y-auto p-6 md:flex md:p-8">
              <div className="space-y-6">
                {/* Category & Followers */}
                <div className="flex items-center justify-between border-b border-mute-100 pb-4">
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                    {influencer.category}
                  </span>
                  {influencer.followers && (
                    <span className="rounded-full bg-mute-100 px-3 py-1 font-mono text-xs font-semibold text-ink">
                      {influencer.followers} Kitle
                    </span>
                  )}
                </div>

                {/* Creator Title & Handle */}
                <div>
                  <h3 className="font-display font-bold leading-tight tracking-tight text-ink" style={{ fontSize: "var(--text-3xl)" }}>
                    {influencer.name}
                  </h3>
                  <p className="mt-1 text-sm font-semibold text-accent">
                    {influencer.handle}
                  </p>
                </div>

                {/* Bio */}
                {influencer.bio && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-mute-400">
                      Hakkında
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-mute-600">
                      {influencer.bio}
                    </p>
                  </div>
                )}

                {/* Sektörler */}
                {influencer.sectors && influencer.sectors.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-mute-400">
                      Çalışma Alanları
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {influencer.sectors.map((sec) => (
                        <span
                          key={sec}
                          className="rounded-full border border-mute-200 bg-mute-50 px-3 py-1 text-xs font-medium text-mute-700"
                        >
                          #{sec}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Masaüstü Instagram Butonu */}
              <div className="mt-8 border-t border-mute-100 pt-6">
                <a
                  href={influencer.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2.5 rounded-full bg-ink py-3.5 text-center text-xs font-semibold uppercase tracking-wider text-paper transition-all duration-200 hover:bg-mute-800"
                >
                  <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                  <span>Instagram Profiline Git</span>
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
