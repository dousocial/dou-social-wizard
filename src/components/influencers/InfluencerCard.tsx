"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { InfluencerItem } from "@/lib/influencers";
import { cn } from "@/lib/utils";

interface InfluencerCardProps {
  influencer: InfluencerItem;
  onWatchVideo?: (influencer: InfluencerItem) => void;
}

export function InfluencerCard({
  influencer,
  onWatchVideo,
}: InfluencerCardProps) {
  const hasVideo = Boolean(influencer.videoUrl);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="group relative flex flex-col overflow-hidden rounded-3xl border border-mute-100 bg-paper shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-mute-200 hover:shadow-xl dark:border-mute-800"
    >
      {/* ── Visual Frame (Image & Overlays) ── */}
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-mute-100">
        <Image
          src={influencer.profileImage}
          alt={influencer.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
        />

        {/* Gradient Shadow Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Top Badges */}
        <div className="absolute left-4 right-4 top-4 flex items-center justify-between gap-2">
          <span className="inline-flex items-center rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-ink backdrop-blur-md dark:bg-ink/90 dark:text-white">
            {influencer.category}
          </span>

          {influencer.followers && (
            <span className="inline-flex items-center rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white backdrop-blur-md">
              {influencer.followers}
            </span>
          )}
        </div>

        {/* Video Play Button Overlay (Center) */}
        {hasVideo && (
          <button
            type="button"
            onClick={() => onWatchVideo?.(influencer)}
            className="group/btn absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-300 hover:bg-black/30"
            aria-label={`${influencer.name} videosunu izle`}
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/90 text-white shadow-lg backdrop-blur-md transition-all duration-300 group-hover/btn:scale-110 group-hover/btn:bg-accent">
              <svg
                className="h-6 w-6 translate-x-0.5"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
            <span className="sr-only">Videoyu İzle</span>
          </button>
        )}

        {/* Bottom Info Overlay on Image */}
        <div className="absolute bottom-4 left-4 right-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-xl font-bold tracking-tight md:text-2xl">
                {influencer.name}
              </h3>
              <p className="text-xs font-medium text-accent">
                {influencer.handle}
              </p>
            </div>

            {hasVideo && (
              <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-medium text-white backdrop-blur-sm">
                Video İçerik
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Card Content Body ── */}
      <div className="flex flex-1 flex-col justify-between p-5">
        {influencer.bio && (
          <p className="line-clamp-2 text-xs leading-relaxed text-mute-600 dark:text-mute-300">
            {influencer.bio}
          </p>
        )}

        {/* Action Row */}
        <div className="mt-4 flex items-center gap-2 pt-2 border-t border-mute-100 dark:border-mute-800">
          {/* Direct Instagram Button */}
          <a
            href={influencer.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-1 items-center justify-center gap-2 rounded-full border border-mute-200 bg-mute-50 px-4 py-2.5 text-xs font-semibold text-ink transition-colors hover:border-[#E1306C] hover:bg-[#E1306C]/10 hover:text-[#E1306C] dark:border-mute-700 dark:bg-mute-900 dark:text-white"
          >
            <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
            </svg>
            <span>Instagram</span>
          </a>

          {/* Watch Video CTA Button */}
          {hasVideo && (
            <button
              type="button"
              onClick={() => onWatchVideo?.(influencer)}
              className="flex items-center justify-center gap-1.5 rounded-full bg-accent px-4 py-2.5 text-xs font-semibold text-white transition-opacity hover:opacity-90 active:scale-95"
            >
              <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
              <span>İçerik</span>
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
