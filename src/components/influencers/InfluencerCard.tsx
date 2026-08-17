"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { InfluencerItem } from "@/lib/influencers";

interface InfluencerCardProps {
  influencer: InfluencerItem;
  index: number;
  onWatchVideo?: (influencer: InfluencerItem) => void;
}

export function InfluencerCard({
  influencer,
  index,
  onWatchVideo,
}: InfluencerCardProps) {
  const hasVideo = Boolean(influencer.videoUrl);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-mute-200 bg-paper transition-all duration-300 hover:border-mute-400 hover:shadow-lg"
    >
      {/* ── Top Header Strip ── */}
      <div className="flex items-center justify-between border-b border-mute-100 px-5 py-3.5">
        <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent">
          {influencer.category}
        </span>
        <span className="font-mono text-xs text-mute-400">
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>

      {/* ── Portrait Frame ── */}
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-mute-100">
        <Image
          src={influencer.profileImage}
          alt={influencer.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
        />

        {/* Ambient Dark Gradient */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/25 to-transparent opacity-90 transition-opacity duration-500 group-hover:opacity-95" />

        {/* Follower Badge */}
        {influencer.followers && (
          <div className="absolute right-4 top-4 rounded-full border border-white/20 bg-ink/70 px-3 py-1 text-[11px] font-medium tracking-wider text-paper backdrop-blur-md">
            {influencer.followers} Kitle
          </div>
        )}

        {/* Play Video Trigger Overlay */}
        {hasVideo && (
          <button
            type="button"
            onClick={() => onWatchVideo?.(influencer)}
            className="group/btn absolute inset-0 flex items-center justify-center bg-black/0 transition-all duration-300 group-hover:bg-black/20"
            aria-label={`${influencer.name} videosunu izle`}
          >
            <div className="flex h-13 w-13 items-center justify-center rounded-full border border-white/30 bg-ink/70 text-white backdrop-blur-md transition-transform duration-300 group-hover/btn:scale-110 group-hover/btn:border-white group-hover/btn:bg-paper group-hover/btn:text-ink">
              <svg
                className="h-5 w-5 translate-x-0.5"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </button>
        )}

        {/* Bottom Floating Identity on Image */}
        <div className="absolute bottom-4 left-5 right-5 text-white">
          <h3 className="font-display text-2xl font-bold tracking-tight text-white">
            {influencer.name}
          </h3>
          <p className="mt-0.5 text-xs text-white/70">
            {influencer.handle}
          </p>
        </div>
      </div>

      {/* ── Bottom Body Info & Action Bar ── */}
      <div className="flex flex-1 flex-col justify-between p-5">
        {influencer.bio && (
          <p className="line-clamp-2 text-xs leading-relaxed text-mute-500">
            {influencer.bio}
          </p>
        )}

        <div className="mt-4 flex items-center gap-2 border-t border-mute-100 pt-4">
          {/* Instagram Button */}
          <a
            href={influencer.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-1 items-center justify-center gap-2 rounded-full border border-mute-200 bg-paper py-2.5 text-xs font-semibold text-ink transition-all hover:border-ink hover:bg-ink hover:text-paper"
          >
            <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
            </svg>
            <span>Instagram</span>
          </a>

          {/* Video Button */}
          {hasVideo && (
            <button
              type="button"
              onClick={() => onWatchVideo?.(influencer)}
              className="flex items-center justify-center gap-1.5 rounded-full bg-accent px-4 py-2.5 text-xs font-semibold text-white transition-all hover:bg-accent-hover"
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
