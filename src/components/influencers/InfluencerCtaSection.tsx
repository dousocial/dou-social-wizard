"use client";

import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";

export function InfluencerCtaSection() {
  return (
    <Section spacing="md" className="relative overflow-hidden bg-paper dark:bg-ink">
      <Container>
        <div className="grid gap-6 lg:grid-cols-2">
          {/* ── Card 1: Influencer Başvurusu (Renkli & Canlı) ── */}
          <Reveal variant="fadeUp">
            <div className="relative flex h-full flex-col justify-between overflow-hidden rounded-3xl border border-mute-200 bg-gradient-to-br from-mute-50 via-paper to-mute-100 p-8 shadow-sm transition-all duration-300 hover:shadow-xl sm:p-10 dark:border-mute-800 dark:from-mute-900/90 dark:via-mute-900/60 dark:to-mute-850">
              {/* Vibrant Instagram-tone accent blob in corner */}
              <div
                aria-hidden
                className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gradient-to-br from-[#fd1d1d]/20 via-[#833ab4]/20 to-[#fcb045]/20 blur-2xl"
              />

              <div className="relative z-10">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-accent dark:bg-accent/20">
                  ✨ İçerik Üreticileri İçin
                </span>
                <h3 className="mt-4 font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl dark:text-white">
                  DOU Creator Network&apos;e Katıl.
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-mute-600 dark:text-mute-300">
                  Kendi tarzınla markalarla buluş, özgün projelerde yer al. 2
                  dakikada başvuru formunu doldur, profiline uygun yeni
                  kampanyalarda ekibimiz seninle iletişime geçsin.
                </p>
              </div>

              <div className="relative z-10 mt-8">
                <Link
                  href="/influencer"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] px-7 py-3.5 text-xs font-bold text-white shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span>Influencer Başvurusu Yap</span>
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
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </Link>
              </div>
            </div>
          </Reveal>

          {/* ── Card 2: Markalar İçin Kampanya Yönetimi ── */}
          <Reveal variant="fadeUp" delay={0.1}>
            <div className="relative flex h-full flex-col justify-between overflow-hidden rounded-3xl border border-mute-200 bg-ink p-8 text-paper shadow-sm transition-all duration-300 hover:shadow-xl sm:p-10 dark:border-mute-800">
              {/* Deep Bordeaux Ambient Glow */}
              <div
                aria-hidden
                className="pointer-events-none absolute -left-16 -top-16 h-48 w-48 rounded-full bg-accent/30 blur-2xl"
              />

              <div className="relative z-10">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-white">
                  🎯 Markalar & İşletmeler İçin
                </span>
                <h3 className="mt-4 font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  Markanız İçin Influencer Stratejisi.
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-mute-300">
                  Doğru kitleye, doğru içerik üreticileriyle ulaşın. Kampanya
                  kurgusundan bütçe optimizasyonuna ve performans raporlamasına
                  kadar süreci profesyonelce yönetiyoruz.
                </p>
              </div>

              <div className="relative z-10 mt-8 flex flex-wrap gap-3">
                <Link
                  href="/audit"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-paper px-7 py-3.5 text-xs font-bold text-ink shadow-md transition-all hover:bg-mute-100 active:scale-[0.98]"
                >
                  <span>Ücretsiz Marka Analizi Al</span>
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
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </Link>

                <Link
                  href="/iletisim"
                  className="inline-flex items-center justify-center rounded-full border border-white/20 bg-transparent px-6 py-3.5 text-xs font-bold text-paper transition-colors hover:border-white hover:bg-white/10"
                >
                  İletişime Geç
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}
