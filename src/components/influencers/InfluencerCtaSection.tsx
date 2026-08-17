"use client";

import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";

export function InfluencerCtaSection() {
  return (
    <section className="py-20">
      <Container>
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl border border-mute-200/80 bg-gradient-to-br from-mute-50 via-paper to-mute-100/60 p-8 shadow-sm md:p-14 dark:border-mute-800 dark:from-mute-900/60 dark:via-paper dark:to-mute-900/80">
            {/* Background blur blob */}
            <div
              className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-accent/15 blur-3xl"
              aria-hidden="true"
            />

            <div className="relative z-10 grid gap-8 lg:grid-cols-12 lg:items-center">
              <div className="lg:col-span-8">
                <span className="inline-flex items-center rounded-full bg-accent/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-accent">
                  İş Birliği & Büyüme
                </span>
                <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-ink md:text-5xl">
                  DOU Social Influencer Ağına Katılın.
                </h2>
                <p className="mt-4 max-w-2xl text-base text-mute-600 dark:text-mute-300 md:text-lg">
                  Kendi tarzınızla markalarla buluşun, yaratıcı projelerde yer
                  alın. 2 dakikada form doldurun, profilinize uygun kampanyalar
                  geldiğinde ekibimiz sizinle iletişime geçsin.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row lg:col-span-4 lg:flex-col xl:flex-row xl:justify-end">
                <Link
                  href="/influencer"
                  className="inline-flex items-center justify-center rounded-full bg-accent px-7 py-4 text-center font-display text-sm font-semibold text-white shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  Influencer Başvurusu Yap
                </Link>
                <Link
                  href="/iletisim"
                  className="inline-flex items-center justify-center rounded-full border border-mute-300 bg-paper px-7 py-4 text-center font-display text-sm font-semibold text-ink transition-colors hover:bg-mute-100 dark:border-mute-700 dark:hover:bg-mute-800"
                >
                  Marka İletişimi
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
