"use client";

import { useState, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { InfluencerItem } from "@/lib/influencers";
import { Container } from "@/components/ui/Container";
import { Link } from "@/i18n/navigation";
import { InfluencerCard } from "./InfluencerCard";
import { InfluencerVideoModal } from "./InfluencerVideoModal";
import { cn } from "@/lib/utils";

interface InfluencersHubProps {
  initialInfluencers: InfluencerItem[];
}

const SECTOR_LIST = [
  { value: "all", label: "Tüm Sektörler" },
  { value: "Moda & Yaşam", label: "Moda & Yaşam" },
  { value: "Spor & Fitness", label: "Spor & Fitness" },
  { value: "Gastronomi & Mekan", label: "Gastronomi & Mekan" },
  { value: "Güzellik & Bakım", label: "Güzellik & Bakım" },
  { value: "Teknoloji & Tasarım", label: "Teknoloji & Tasarım" },
  { value: "Seyahat & Keşif", label: "Seyahat & Keşif" },
];

export function InfluencersHub({ initialInfluencers }: InfluencersHubProps) {
  const [selectedSector, setSelectedSector] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeVideoInfluencer, setActiveVideoInfluencer] =
    useState<InfluencerItem | null>(null);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Extract all available sector categories from data
  const sectors = useMemo(() => {
    const map = new Map<string, string>();
    SECTOR_LIST.forEach((opt) => map.set(opt.value, opt.label));
    initialInfluencers.forEach((item) => {
      if (item.category && !map.has(item.category)) {
        map.set(item.category, item.category);
      }
    });
    return Array.from(map.entries()).map(([value, label]) => ({
      value,
      label,
    }));
  }, [initialInfluencers]);

  // Filter influencers
  const filteredInfluencers = useMemo(() => {
    return initialInfluencers.filter((item) => {
      const matchesSector =
        selectedSector === "all" ||
        item.category.toLowerCase() === selectedSector.toLowerCase() ||
        (item.sectors &&
          item.sectors.some(
            (sec) =>
              selectedSector.toLowerCase().includes(sec.toLowerCase()) ||
              sec.toLowerCase().includes(selectedSector.toLowerCase())
          ));

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

  const handleScroll = (direction: "left" | "right") => {
    if (!scrollContainerRef.current) return;
    const scrollAmount = direction === "left" ? -340 : 340;
    scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

  return (
    <section className="border-t border-mute-100 py-12 md:py-16">
      <Container>
        {/* ── Filter Bar: Sektör Seçici & Arama ── */}
        <div className="flex flex-col gap-6 border-b border-mute-100 pb-8 md:flex-row md:items-center md:justify-between">
          {/* Sektör Tabları */}
          <div className="flex flex-wrap items-center gap-2 overflow-x-auto pb-2 scrollbar-none md:pb-0">
            {sectors.map((sec) => {
              const isSelected = selectedSector === sec.value;
              return (
                <button
                  key={sec.value}
                  type="button"
                  onClick={() => setSelectedSector(sec.value)}
                  className={cn(
                    "relative rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition-colors duration-200",
                    isSelected
                      ? "bg-ink text-paper"
                      : "bg-mute-100 text-mute-500 hover:bg-mute-200 hover:text-ink"
                  )}
                >
                  {sec.label}
                </button>
              );
            })}
          </div>

          {/* Arama Kutusu, Kaydırma Okları & Sayaç */}
          <div className="flex items-center justify-between gap-4">
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="İsim veya kullanıcı adı ara..."
                className="w-full rounded-full border border-mute-200 bg-paper py-2 pl-9 pr-4 text-xs text-ink placeholder:text-mute-400 focus:border-accent focus:outline-none"
              />
              <svg
                className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-mute-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
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
                  className="absolute right-3 top-2 text-xs text-mute-400 hover:text-ink"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Yatay Kaydırma Navigasyon Okları (Mobilde & Masaüstünde) */}
            {filteredInfluencers.length > 0 && (
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => handleScroll("left")}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-mute-200 bg-paper text-ink transition-colors hover:border-ink hover:bg-ink hover:text-paper"
                  aria-label="Sola Kaydır"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => handleScroll("right")}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-mute-200 bg-paper text-ink transition-colors hover:border-ink hover:bg-ink hover:text-paper"
                  aria-label="Sağa Kaydır"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── Influencer Kayar Vitrin (Horizontal Scroll Carousel with Grid Snap) ── */}
        <div className="mt-10">
          <AnimatePresence mode="popLayout">
            {filteredInfluencers.length > 0 ? (
              <div className="relative -mx-4 px-4 sm:mx-0 sm:px-0">
                <div
                  ref={scrollContainerRef}
                  className="flex gap-6 overflow-x-auto pb-6 pt-2 scrollbar-none snap-x snap-mandatory"
                  style={{ WebkitOverflowScrolling: "touch" }}
                >
                  {filteredInfluencers.map((influencer, i) => (
                    <div
                      key={influencer.id}
                      className="w-[82vw] shrink-0 snap-start sm:w-[320px] md:w-[340px] lg:w-[360px]"
                    >
                      <InfluencerCard
                        influencer={influencer}
                        index={i}
                        onWatchVideo={(item) => setActiveVideoInfluencer(item)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : initialInfluencers.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-mute-200 py-20 text-center"
              >
                <p className="font-display text-2xl font-bold tracking-tight text-ink">
                  Henüz yayında içerik üreticisi bulunmuyor.
                </p>
                <p className="mt-2 max-w-md text-sm text-mute-500">
                  CRM panelinden onaylanıp web sitesinde yayına alınan
                  influencer&apos;lar doğrudan burada listelenecektir.
                </p>
                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                  <Link
                    href="/influencer"
                    className="rounded-full bg-ink px-6 py-3 text-xs font-semibold uppercase tracking-wider text-paper transition-colors hover:bg-mute-800"
                  >
                    Başvuru Formunu Aç
                  </Link>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-mute-200 py-20 text-center"
              >
                <p className="font-display text-xl font-semibold text-ink">
                  Seçilen kriterlere uygun influencer bulunamadı.
                </p>
                <p className="mt-2 text-xs text-mute-500">
                  Farklı bir sektör seçebilir veya arama filtresini sıfırlayabilirsiniz.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedSector("all");
                    setSearchQuery("");
                  }}
                  className="mt-6 rounded-full border border-mute-300 bg-paper px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-ink transition-colors hover:border-ink hover:bg-ink hover:text-paper"
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
