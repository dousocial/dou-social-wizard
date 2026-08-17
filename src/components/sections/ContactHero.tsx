"use client";

import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";

// ─── Platform SVG logos ───────────────────────────────────────────────────────

function FacebookLogo() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-full w-full" aria-hidden>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function InstagramLogo() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-full w-full" aria-hidden>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  );
}

function LinkedInLogo() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-full w-full" aria-hidden>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function WhatsAppLogo() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-full w-full" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  );
}

function GoogleLogo() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-full w-full" aria-hidden>
      <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
    </svg>
  );
}

// ─── Platform links ───────────────────────────────────────────────────────────

const PLATFORMS = [
  {
    name: "Facebook",
    Logo: FacebookLogo,
    color: "#1877F2",
    href: "https://www.facebook.com/profile.php?id=61587124940165",
  },
  {
    name: "Instagram",
    Logo: InstagramLogo,
    color: "#E4405F",
    href: "https://www.instagram.com/dou.social",
  },
  {
    name: "LinkedIn",
    Logo: LinkedInLogo,
    color: "#0A66C2",
    href: "https://www.linkedin.com/company/dou-dijital-marketing/",
  },
  {
    name: "WhatsApp",
    Logo: WhatsAppLogo,
    color: "#25D366",
    href: "https://wa.me/905300845468",
  },
  {
    name: "Google",
    Logo: GoogleLogo,
    color: "#4285F4",
    href: "https://maps.app.goo.gl/TJxDnehJCVooSquR7",
  },
] as const;

// ─── Component ────────────────────────────────────────────────────────────────

export function ContactHero() {
  const t = useTranslations("Contact");

  return (
    <Section spacing="hero" className="relative overflow-hidden">
      {/* Subtle accent glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 55% 50% at 0% 60%, rgb(128 0 0 / 0.08), transparent)",
        }}
      />

      <Container className="relative">
        <Reveal className="max-w-5xl">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-accent">
            {t("eyebrow")}
          </p>

          {/* Main heading — extra large */}
          <h1
            className="mt-5 font-display font-bold leading-[1.0] tracking-tight text-ink"
            style={{ fontSize: "clamp(4rem, 11vw, 10rem)" }}
          >
            {t("heroTitle")}
          </h1>

          <p className="mt-7 max-w-xl text-lg text-mute-500">
            {t("heroLead")}
          </p>

          {/* Platform links */}
          <div className="mt-12">
            <p className="mb-5 text-sm font-semibold uppercase tracking-[0.18em] text-mute-400">
              Bizi takip edin
            </p>
            <div className="flex flex-wrap items-center gap-4">
              {PLATFORMS.map(({ name, Logo, color, href }) => (
                <a
                  key={name}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={name}
                  className="group flex h-12 w-12 items-center justify-center rounded-xl border border-mute-200 bg-paper text-mute-400 transition-all duration-200 hover:border-transparent hover:text-paper hover:shadow-md"
                  style={
                    {
                      "--brand": color,
                      "--tw-shadow-color": color,
                    } as React.CSSProperties
                  }
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background = color;
                    (e.currentTarget as HTMLElement).style.borderColor = color;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "";
                    (e.currentTarget as HTMLElement).style.borderColor = "";
                  }}
                >
                  <span className="h-5 w-5">
                    <Logo />
                  </span>
                </a>
              ))}
            </div>
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}
