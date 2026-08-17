"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { InfluencerItem } from "@/lib/influencers";
import { Container } from "@/components/ui/Container";
import { InfluencerCard } from "./InfluencerCard";
import { InfluencerVideoModal } from "./InfluencerVideoModal";
import { cn } from "@/lib/utils";

interface InfluencersHubProps {
  initialInfluencers: InfluencerItem[];
}

export function InfluencersHub({ initialInfluencers }: InfluencersHubProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeVideoInfluencer, setActiveVideoInfluencer] =
    useState<InfluencerItem | null>(null);

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    initialInfluencers.forEach((item) => {
      if (item.category) set.add(item.category);
    });
    return ["all", ...Array.from(set)];
  }, [initialInfluencers]);

  // Filter influencers
  const filteredInfluencers = useMemo(() => {
    return initialInfluencers.filter((item) => {
      // Category check
      const matchesCategory =
        selectedCategory === "all" || item.category === selectedCategory;

      // Search query check
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        item.name.toLowerCase().includes(query) ||
        item.handle.toLowerCase().includes(query) ||
        (item.bio && item.bio.toLowerCase().includes(query)) ||
        (item.category && item.category.toLowerCase().includes(query));

      return matchesCategory && matchesSearch;
    });
  }, [initialInfluencers, selectedCategory, searchQuery]);

  return (
    <section className="pb-24 pt-4">
      <Container>
        {/* ── Filter & Search Toolbar ── */}
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-2 overflow-x-auto pb-2 scrollbar-none md:pb-0">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat;
              const label = cat === "all" ? "Tümü" : cat;

              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={cn(
                    "relative rounded-full px-4 py-2 text-xs font-semibold tracking-wide transition-colors duration-200",
                    isSelected
                      ? "text-white"
                      : "bg-mute-100 text-mute-600 hover:bg-mute-200 hover:text-ink dark:bg-mute-850 dark:text-mute-300 dark:hover:bg-mute-800 dark:hover:text-white"
                  )}
                >
                  {isSelected && (
                    <motion.div
                      layoutId="activeCategoryBadge"
                      className="absolute inset-0 rounded-full bg-accent"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{label}</span>
                </button>
              );
            })}
          </div>

          {/* Search Input & Count */}
          <div className="flex items-center gap-3">
            <div className="relative min-w-[220px] flex-1 sm:w-64">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Influencer veya sektör ara..."
                className="w-full rounded-full border border-mute-200 bg-paper py-2 pl-9 pr-4 text-xs text-ink placeholder:text-mute-400 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent dark:border-mute-800 dark:bg-mute-900 dark:text-white"
              />
              <svg
                className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-mute-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-2.5 text-xs text-mute-400 hover:text-ink dark:hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>

            <span className="hidden whitespace-nowrap text-xs font-medium text-mute-400 sm:inline-block">
              {filteredInfluencers.length} İçerik Üreticisi
            </span>
          </div>
        </div>

        {/* ── Influencer Grid ── */}
        <div className="mt-10">
          <AnimatePresence mode="popLayout">
            {filteredInfluencers.length > 0 ? (
              <motion.div
                layout
                className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
              >
                {filteredInfluencers.map((influencer) => (
                  <InfluencerCard
                    key={influencer.id}
                    influencer={influencer}
                    onWatchVideo={(item) => setActiveVideoInfluencer(item)}
                  />
                ))}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-mute-200 py-16 text-center dark:border-mute-800"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-mute-100 text-mute-400 dark:bg-mute-800">
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                    />
                  </svg>
                </div>
                <h3 className="mt-4 font-display text-lg font-bold text-ink dark:text-white">
                  Aradığınız kriterlere uygun influencer bulunamadı.
                </h3>
                <p className="mt-1 text-xs text-mute-500">
                  Farklı bir arama terimi deneyebilir veya kategorileri
                  sıfırlayabilirsiniz.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory("all");
                    setSearchQuery("");
                  }}
                  className="mt-4 rounded-full bg-accent px-4 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90"
                >
                  Filtreleri Temizle
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Video Player Modal ── */}
        <InfluencerVideoModal
          influencer={activeVideoInfluencer}
          isOpen={Boolean(activeVideoInfluencer)}
          onClose={() => setActiveVideoInfluencer(null)}
        />
      </Container>
    </section>
  );
}
