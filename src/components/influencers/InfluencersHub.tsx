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
      const matchesCategory =
        selectedCategory === "all" || item.category === selectedCategory;

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
    <section className="border-t border-mute-100 py-16 dark:border-mute-800">
      <Container>
        {/* ── Filter Bar & Search ── */}
        <div className="flex flex-col gap-6 border-b border-mute-100 pb-8 md:flex-row md:items-center md:justify-between dark:border-mute-800">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none md:pb-0">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat;
              const label = cat === "all" ? "Tüm Kategoriler" : cat;

              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={cn(
                    "relative rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-all duration-200",
                    isSelected
                      ? "bg-ink text-paper dark:bg-white dark:text-ink"
                      : "text-mute-500 hover:bg-mute-100 hover:text-ink dark:text-mute-400 dark:hover:bg-mute-900 dark:hover:text-white"
                  )}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Search Box & Metric */}
          <div className="flex items-center gap-4">
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="İsim veya sektör ara..."
                className="w-full rounded-full border border-mute-200 bg-paper py-2.5 pl-9 pr-4 text-xs text-ink placeholder:text-mute-400 focus:border-ink focus:outline-none dark:border-mute-800 dark:bg-mute-900 dark:text-white dark:focus:border-white"
              />
              <svg
                className="pointer-events-none absolute left-3 top-3 h-3.5 w-3.5 text-mute-400"
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
                  className="absolute right-3 top-3 text-xs text-mute-400 hover:text-ink dark:hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>

            <span className="hidden whitespace-nowrap font-mono text-xs text-mute-400 sm:inline-block">
              {filteredInfluencers.length} / {initialInfluencers.length}
            </span>
          </div>
        </div>

        {/* ── Grid List ── */}
        <div className="mt-12">
          <AnimatePresence mode="popLayout">
            {filteredInfluencers.length > 0 ? (
              <motion.div
                layout
                className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
              >
                {filteredInfluencers.map((influencer, i) => (
                  <InfluencerCard
                    key={influencer.id}
                    influencer={influencer}
                    index={i}
                    onWatchVideo={(item) => setActiveVideoInfluencer(item)}
                  />
                ))}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-mute-200 py-20 text-center dark:border-mute-800"
              >
                <p className="font-display text-xl font-semibold text-ink dark:text-white">
                  Eşleşen içerik üreticisi bulunamadı.
                </p>
                <p className="mt-2 text-xs text-mute-400">
                  Farklı bir arama terimi deneyebilir veya kategorileri sıfırlayabilirsiniz.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory("all");
                    setSearchQuery("");
                  }}
                  className="mt-6 rounded-full border border-mute-300 bg-paper px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-ink transition-colors hover:border-ink hover:bg-ink hover:text-paper dark:border-mute-700 dark:text-white dark:hover:bg-white dark:hover:text-ink"
                >
                  Filtreleri Sıfırla
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Video Modal ── */}
        <InfluencerVideoModal
          influencer={activeVideoInfluencer}
          isOpen={Boolean(activeVideoInfluencer)}
          onClose={() => setActiveVideoInfluencer(null)}
        />
      </Container>
    </section>
  );
}
