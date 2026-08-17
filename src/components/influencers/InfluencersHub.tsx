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

const SECTOR_OPTIONS = [
  { value: "all", label: "Tüm Sektörler", icon: "✨" },
  { value: "Moda & Yaşam", label: "Moda & Yaşam", icon: "👗" },
  { value: "Spor & Fitness", label: "Spor & Fitness", icon: "⚡" },
  { value: "Gastronomi & Mekan", label: "Gastronomi & Mekan", icon: "☕" },
  { value: "Güzellik & Bakım", label: "Güzellik & Bakım", icon: "💄" },
  { value: "Teknoloji & Tasarım", label: "Teknoloji & Tasarım", icon: "💻" },
  { value: "Seyahat & Keşif", label: "Seyahat & Keşif", icon: "✈️" },
];

export function InfluencersHub({ initialInfluencers }: InfluencersHubProps) {
  const [selectedSector, setSelectedSector] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeVideoInfluencer, setActiveVideoInfluencer] =
    useState<InfluencerItem | null>(null);

  // Extract all available sector categories from data if any new ones exist
  const allSectors = useMemo(() => {
    const map = new Map<string, string>();
    SECTOR_OPTIONS.forEach((opt) => map.set(opt.value, opt.label));
    initialInfluencers.forEach((item) => {
      if (item.category && !map.has(item.category)) {
        map.set(item.category, item.category);
      }
    });
    return Array.from(map.entries()).map(([value, label]) => {
      const existing = SECTOR_OPTIONS.find((s) => s.value === value);
      return {
        value,
        label,
        icon: existing?.icon || "🎯",
      };
    });
  }, [initialInfluencers]);

  // Filter influencers
  const filteredInfluencers = useMemo(() => {
    return initialInfluencers.filter((item) => {
      // Sector filter
      const matchesSector =
        selectedSector === "all" ||
        item.category.toLowerCase() === selectedSector.toLowerCase() ||
        (item.sectors &&
          item.sectors.some(
            (sec) =>
              selectedSector.toLowerCase().includes(sec.toLowerCase()) ||
              sec.toLowerCase().includes(selectedSector.toLowerCase())
          ));

      // Search query filter
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        item.name.toLowerCase().includes(query) ||
        item.handle.toLowerCase().includes(query) ||
        (item.bio && item.bio.toLowerCase().includes(query)) ||
        (item.category && item.category.toLowerCase().includes(query));

      return matchesSector && matchesSearch;
    });
  }, [initialInfluencers, selectedSector, searchQuery]);

  return (
    <section className="pb-24 pt-6">
      <Container>
        {/* ── Filter Bar with Sektör Seç dropdown & Quick pills ── */}
        <div className="rounded-3xl border border-mute-200 bg-paper p-5 shadow-sm md:p-7 dark:border-mute-800 dark:bg-mute-900/50">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            {/* Sektör Seçici & Dropdown */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/10 text-accent">
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                    />
                  </svg>
                </span>
                <label
                  htmlFor="sector-select"
                  className="font-display text-xs font-bold uppercase tracking-wider text-ink dark:text-white"
                >
                  Sektör Seç:
                </label>
              </div>

              {/* Native sleek select for mobile & quick select */}
              <div className="relative min-w-[200px]">
                <select
                  id="sector-select"
                  value={selectedSector}
                  onChange={(e) => setSelectedSector(e.target.value)}
                  className="w-full appearance-none rounded-full border border-mute-300 bg-white py-2.5 pl-4 pr-10 text-xs font-semibold text-ink shadow-sm transition-colors focus:border-accent focus:outline-none dark:border-mute-700 dark:bg-mute-850 dark:text-white"
                >
                  {allSectors.map((sec) => (
                    <option key={sec.value} value={sec.value}>
                      {sec.icon} {sec.label}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute right-3.5 top-3 text-mute-400">
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Arama Kutusu & Sayaç */}
            <div className="flex items-center gap-3">
              <div className="relative w-full sm:w-64">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="İsim veya kullanıcı adı ara..."
                  className="w-full rounded-full border border-mute-300 bg-white py-2.5 pl-9 pr-4 text-xs font-medium text-ink placeholder:text-mute-400 shadow-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent dark:border-mute-700 dark:bg-mute-850 dark:text-white"
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
                    className="absolute right-3 top-2.5 text-xs text-mute-400 hover:text-ink dark:hover:text-white"
                  >
                    ✕
                  </button>
                )}
              </div>

              <span className="hidden whitespace-nowrap rounded-full bg-accent/10 px-3.5 py-2 text-xs font-semibold text-accent dark:bg-accent/20 sm:inline-block">
                {filteredInfluencers.length} İçerik Üreticisi
              </span>
            </div>
          </div>

          {/* Quick Sector Tags (Desktop Pill Bar) */}
          <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-mute-100 pt-5 dark:border-mute-800">
            {allSectors.map((sec) => {
              const isSelected = selectedSector === sec.value;
              return (
                <button
                  key={sec.value}
                  type="button"
                  onClick={() => setSelectedSector(sec.value)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-200",
                    isSelected
                      ? "bg-accent text-white shadow-sm"
                      : "bg-mute-100 text-mute-600 hover:bg-mute-200 hover:text-ink dark:bg-mute-800 dark:text-mute-300 dark:hover:bg-mute-700 dark:hover:text-white"
                  )}
                >
                  <span>{sec.icon}</span>
                  <span>{sec.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Influencer Cards Grid ── */}
        <div className="mt-10">
          <AnimatePresence mode="popLayout">
            {filteredInfluencers.length > 0 ? (
              <motion.div
                layout
                className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3"
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
                className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-mute-200 py-16 text-center dark:border-mute-800"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/10 text-accent">
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
                  Seçilen sektörde eşleşen influencer bulunamadı.
                </h3>
                <p className="mt-1 text-xs text-mute-500">
                  Farklı bir sektör seçebilir veya aramayı sıfırlayabilirsiniz.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedSector("all");
                    setSearchQuery("");
                  }}
                  className="mt-4 rounded-full bg-accent px-5 py-2.5 text-xs font-semibold text-white shadow-md transition-opacity hover:opacity-90"
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
