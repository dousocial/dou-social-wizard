import { use } from "react";
import { setRequestLocale } from "next-intl/server";
import { Hero } from "@/components/sections/Hero";
import { HeroParticles } from "@/components/sections/HeroParticles";
import { MarqueeStrip } from "@/components/sections/MarqueeStrip";
import { ClientLogos } from "@/components/sections/ClientLogos";
import { Services } from "@/components/sections/Services";
import { HowWeWork } from "@/components/sections/HowWeWork";
// import { CaseStudies } from "@/components/sections/CaseStudies";
import { Team } from "@/components/sections/Team";
// import { ClientsGrid } from "@/components/sections/ClientsGrid";
import { TestimonialsServer } from "@/components/sections/TestimonialsServer";
import { FinalCTA } from "@/components/sections/FinalCTA";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";

export default function Home({ params }: PageProps<"/[locale]">) {
  const { locale } = use(params);
  setRequestLocale(locale);

  return (
    <>
      <HeroParticles />
      <Hero />
      <MarqueeStrip />
      <ClientLogos />
      <Services />
      <HowWeWork />
      <Team />

      {/* <ClientsGrid /> */}
      <Section spacing="md" className="border-t border-mute-100">
        <Container>
          <Reveal className="flex flex-col items-center py-24 text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-accent">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
              Çok Yakında
            </span>
            <h2
              className="mt-8 font-display font-bold tracking-tight text-ink"
              style={{ fontSize: "var(--text-5xl)" }}
            >
              Projelerimiz hazırlanıyor.
            </h2>
            <p className="mt-5 max-w-md text-mute-500" style={{ fontSize: "var(--text-lg)" }}>
              Gerçekleştirdiğimiz çalışmaları en kısa sürede burada paylaşıyor olacağız.
            </p>
          </Reveal>
        </Container>
      </Section>

      <TestimonialsServer />
      <FinalCTA />
    </>
  );
}
