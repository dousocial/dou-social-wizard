"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { InfluencerItem } from "@/lib/influencers";
import { cn } from "@/lib/utils";

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
  const videoRef = useRef<HTMLVideoElement>(null);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Handle direct MP4 vs external URL (Instagram / Youtube)
  const isDirectVideo =
    influencer?.videoUrl &&
    (influencer.videoUrl.endsWith(".mp4") ||
      influencer.videoUrl.endsWith(".webm") ||
      influencer.videoUrl.includes("commondatastorage.googleapis.com") ||
      influencer.videoUrl.includes("supabase.co/storage"));

  const isInstagram =
    influencer?.videoUrl &&
    (influencer.videoUrl.includes("instagram.com/reel/") ||
      influencer.videoUrl.includes("instagram.com/p/"));

  return (
    <AnimatePresence>
      {isOpen && influencer && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-10">
          {/* Backdrop blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-ink/80 backdrop-blur-md"
            aria-hidden="true"
          />

          {/* Modal content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-mute-200/40 bg-paper shadow-2xl md:flex-row"
            role="dialog"
            aria-modal="true"
            aria-label={`${influencer.name} İçeriği`}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-ink/70 text-white backdrop-blur-md transition-transform hover:scale-105 active:scale-95"
              aria-label="Kapat"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* Video container */}
            <div className="relative flex aspect-[9/16] w-full max-h-[60vh] items-center justify-center bg-black md:max-h-none md:w-[420px] md:shrink-0">
              {isDirectVideo ? (
                <video
                  ref={videoRef}
                  src={influencer.videoUrl}
                  poster={influencer.videoCover || influencer.profileImage}
                  controls
                  autoPlay
                  playsInline
                  className="h-full w-full object-cover"
                />
              ) : isInstagram ? (
                <div className="flex h-full w-full flex-col items-center justify-center p-6 text-center text-white">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/20 text-accent mb-4">
                    <svg
                      className="h-8 w-8"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                  </div>
                  <p className="font-semibold text-lg">Instagram Reel İçeriği</p>
                  <p className="mt-1 text-xs text-white/70">
                    Orijinal içeriği doğrudan Instagram üzerinde izleyin.
                  </p>
                  <a
                    href={influencer.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
                  >
                    Instagram'da Aç
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </a>
                </div>
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center p-6 text-center text-white">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/20 text-accent mb-4">
                    <svg
                      className="h-8 w-8"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <p className="font-semibold text-lg">Öne Çıkan İçerik</p>
                  {influencer.videoUrl && (
                    <a
                      href={influencer.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
                    >
                      İçeriğe Git
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Creator details panel */}
            <div className="flex flex-1 flex-col justify-between p-6 md:p-8">
              <div className="space-y-6">
                {/* Header info */}
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
                      {influencer.category}
                    </span>
                    {influencer.followers && (
                      <span className="inline-flex items-center rounded-full bg-mute-100 px-3 py-1 text-xs font-medium text-mute-600">
                        {influencer.followers} Takipçi
                      </span>
                    )}
                  </div>

                  <h3 className="mt-3 font-display text-2xl font-bold tracking-tight text-ink md:text-3xl">
                    {influencer.name}
                  </h3>
                  <p className="text-sm font-medium text-accent">
                    {influencer.handle}
                  </p>
                </div>

                {/* Bio & Details */}
                {influencer.bio && (
                  <p className="text-sm leading-relaxed text-mute-600">
                    {influencer.bio}
                  </p>
                )}

                {/* Tags */}
                {influencer.sectors && influencer.sectors.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-mute-400">
                      Çalışma Alanları
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {influencer.sectors.map((sec) => (
                        <span
                          key={sec}
                          className="rounded-md border border-mute-200 bg-mute-50 px-2.5 py-1 text-xs text-mute-600"
                        >
                          #{sec}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a
                  href={influencer.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-1 items-center justify-center gap-2.5 rounded-full bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] px-6 py-3 text-sm font-semibold text-white shadow-md transition-transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                  Instagram Profiline Git
                </a>

                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-full border border-mute-200 bg-mute-50 px-5 py-3 text-sm font-medium text-ink transition-colors hover:bg-mute-100"
                >
                  Kapat
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
