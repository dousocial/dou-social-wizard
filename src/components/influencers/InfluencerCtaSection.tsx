"use client";

import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { Noise } from "@/components/ui/Noise";

export function InfluencerCtaSection() {
  return (
    <Section spacing="md" className="relative overflow-hidden bg-ink text-paper">
      {/* Noise texture overlay */}
      <Noise opacity={0.05} />

      {/* Maroon atmospheric glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% 0%, rgb(128 0 0 / 0.22) 0%, transparent 70%)",
        }}
      />

      <Container className="relative z-10">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-7">
            <Reveal variant="fadeUp">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                DOU Creator Network
              </p>
              <h2
                className="mt-4 font-display font-bold leading-[1.08] tracking-tight text-paper"
                style={{ fontSize: "var(--text-4xl)" }}
              >
                Markanız veya içeriğiniz için doğru iş birliği.
              </h2>
              <p
                className="mt-5 max-w-xl text-mute-300 leading-relaxed"
                style={{ fontSize: "var(--text-base)" }}
              >
                DOU Social ekibi olarak, markaları kitleleriyle en doğal şekilde
                buluşturan doğru içerik üreticilerini seçiyor, kampanya kurgusundan
                prodüksiyona kadar tüm süreci uçtan uca yönetiyoruz.
              </p>
            </Reveal>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row lg:col-span-5 lg:flex-col lg:items-end">
            <Reveal variant="fadeUp" delay={0.15} className="w-full sm:w-auto lg:w-full lg:max-w-xs">
              <Link
                href="/influencer"
                className="flex w-full items-center justify-center gap-2 rounded-full bg-paper px-8 py-4 text-center font-display text-sm font-semibold tracking-wide text-ink transition-all hover:bg-mute-100"
              >
                <span>Influencer Başvurusu Yap</span>
                <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" aria-hidden>
                  <path
                    d="M3 8h10M9 4l4 4-4 4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
            </Reveal>

            <Reveal variant="fadeUp" delay={0.25} className="w-full sm:w-auto lg:w-full lg:max-w-xs">
              <Link
                href="/iletisim"
                className="flex w-full items-center justify-center rounded-full border border-white/20 bg-transparent px-8 py-4 text-center font-display text-sm font-semibold tracking-wide text-paper transition-all hover:border-white hover:bg-white/10"
              >
                Marka İçin Teklif Al
              </Link>
            </Reveal>
          </div>
        </div>
      </Container>
    </Section>
  );
}
