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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-6 md:p-10">
          {/* Backdrop blur */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/75 backdrop-blur-md"
            aria-hidden="true"
          />

          {/* Modal Panel */}
          <motion.div
            key="modal-panel"
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ duration: 0.35, ease: EASE }}
            className="relative z-10 flex h-full w-full max-w-4xl flex-col overflow-hidden bg-paper text-ink shadow-2xl sm:h-auto sm:max-h-[90vh] sm:rounded-3xl sm:border sm:border-mute-200 md:flex-row"
            role="dialog"
            aria-modal="true"
            aria-label={`${influencer.name} İçerik Detayı`}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute right-4 top-4 z-30 flex h-9 w-9 items-center justify-center rounded-full border border-mute-200 bg-paper/90 text-mute-500 backdrop-blur-sm transition-all hover:border-ink hover:bg-ink hover:text-paper"
              aria-label="Kapat"
            >
              <svg
                viewBox="0 0 16 16"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              >
                <path d="M3 3l10 10M13 3L3 13" />
              </svg>
            </button>

            {/* ── Left Column: Video Cinema Frame ── */}
            <div className="relative flex aspect-[9/16] w-full max-h-[50vh] shrink-0 items-center justify-center bg-black sm:max-h-none md:w-[48%]">
              {isDirectVideo ? (
                <div className="relative h-full w-full">
                  <video
                    ref={videoRef}
                    src={influencer.videoUrl}
                    poster={influencer.videoCover || influencer.profileImage}
                    autoPlay
                    loop
                    muted={isMuted}
                    playsInline
                    className="h-full w-full object-cover"
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

                  {/* Video In-Overlay Controls */}
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between rounded-full border border-white/15 bg-black/60 px-4 py-2 backdrop-blur-md">
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
                      className="flex items-center gap-2 text-xs font-medium tracking-wide text-white hover:text-accent"
                    >
                      {isPlaying ? (
                        <>
                          <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                          </svg>
                          <span>Duraklat</span>
                        </>
                      ) : (
                        <>
                          <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                          <span>Oynat</span>
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
                      className="text-xs font-medium text-white/80 hover:text-white"
                    >
                      {isMuted ? "Sesi Aç" : "Sesi Kapat"}
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
                    Orijinal video içeriğini doğrudan Instagram profilinde
                    inceleyebilirsiniz.
                  </p>
                  {influencer.videoUrl && (
                    <a
                      href={influencer.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-5 inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-xs font-semibold text-white transition-opacity hover:opacity-90"
                    >
                      İçeriği Aç
                      <svg
                        className="h-3.5 w-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* ── Right Column: Creator Info ── */}
            <div className="flex flex-1 flex-col justify-between overflow-y-auto p-6 md:p-8">
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
                  <h3
                    className="font-display font-bold leading-tight tracking-tight text-ink"
                    style={{ fontSize: "var(--text-3xl)" }}
                  >
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

              {/* ── Single Action Button: Instagram Profiline Git ── */}
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
