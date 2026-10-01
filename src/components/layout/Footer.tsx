import { CookiePreferences } from "@/components/analytics/CookiePreferences";
import { MARKETING_SERVICES } from "@/lib/marketing-services";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Logo } from "@/components/brand/Logo";
import { Container } from "@/components/ui/Container";

const SERVICES = [
  { href: "/hizmetler/sosyal-medya-marka", label: "Sosyal Medya & Marka" },
  { href: "/hizmetler/icerik-video", label: "İçerik & Video Üretimi" },
  { href: "/hizmetler/performans-pazarlama", label: "Performans Pazarlama" },
  { href: "/hizmetler/google-seo", label: "Google & SEO" },
  { href: "/hizmetler/web-yazilim", label: "Web Yazılım" },
  { href: "/hizmetler/kurumsal-kimlik", label: "Kurumsal Kimlik" },
  { href: "/hizmetler/influencer-marketing", label: "Influencer Marketing" },
  { href: "/hizmetler/eticaret-buyume", label: "E-Ticaret Büyüme" },
  { href: "/hizmetler/crm-dijital", label: "CRM & Dijital Otomasyon" },
] as const;

const COMPANY = [
  { href: "/hakkimizda", key: "about" },
  { href: "/projeler", key: "projects" },
  { href: "/blog", key: "blog" },
  { href: "/sss", key: "faq" },
  { href: "/iletisim", key: "contact" },
] as const;

const SOCIAL = [
  { href: "https://www.instagram.com/dou.social", label: "Instagram" },
  {
    href: "https://www.linkedin.com/company/dou-dijital-marketing/",
    label: "LinkedIn",
  },
  { href: "https://www.youtube.com/@DouSocial", label: "YouTube" },
  {
    href: "https://www.facebook.com/profile.php?id=61587124940165",
    label: "Facebook",
  },
];

export function Footer() {
  const t = useTranslations("Footer");
  const en = useLocale() === "en";
  const tNav = useTranslations("Nav");
  const year = new Date().getFullYear();

  return (
    <footer className="border-mute-100 bg-paper border-t">
      <Container size="wide" className="py-16">
        <div className="grid gap-12 sm:grid-cols-2 xl:grid-cols-4">
          <div className="md:col-span-1">
            <Logo className="text-ink h-10 w-24" />
            <p className="text-mute-500 mt-6 max-w-xs text-sm">
              {t("tagline")}
            </p>
          </div>

          <div>
            <h3 className="text-ink text-xs font-semibold tracking-wider uppercase">
              {t("services")}
            </h3>
            <ul className="mt-4 space-y-3">
              {MARKETING_SERVICES.map((service) => (
                <li key={service.slug}>
                  <Link
                    href={`/${service.slug}`}
                    className="text-mute-600 hover:text-ink text-sm transition"
                  >
                    {en ? service.en.title : service.tr.title}
                  </Link>
                </li>
              ))}
              {SERVICES.map((s) => (
                <li key={s.label}>
                  <Link
                    href={s.href as never}
                    className="text-mute-600 hover:text-ink text-sm transition"
                  >
                    {s.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-ink text-xs font-semibold tracking-wider uppercase">
              {t("company")}
            </h3>
            <ul className="mt-4 space-y-3">
              {COMPANY.map((c) => (
                <li key={c.key}>
                  <Link
                    href={c.href as never}
                    className="text-mute-600 hover:text-ink text-sm transition"
                  >
                    {tNav(c.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-ink text-xs font-semibold tracking-wider uppercase">
              {t("contact")}
            </h3>
            <address className="text-mute-600 mt-4 space-y-2 text-sm break-words not-italic">
              <p>Zafer Mah. Zafer Cd. No: 60/1</p>
              <p>Merkezefendi / Denizli</p>
              <p>
                <a
                  href="https://wa.me/905300845468"
                  className="hover:text-ink transition"
                >
                  +90 530 084 54 68
                </a>
              </p>
              <p>
                <a
                  href="mailto:info@dousocial.com"
                  className="hover:text-ink transition"
                >
                  info@dousocial.com
                </a>
              </p>
            </address>
            <ul className="mt-6 flex flex-wrap gap-4">
              {SOCIAL.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-mute-500 hover:text-ink text-xs tracking-wider uppercase transition"
                  >
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-mute-100 text-mute-500 mt-12 flex flex-col items-start justify-between gap-4 border-t pt-8 text-xs md:flex-row md:items-center">
          <p>
            © {year} DOU Social. {t("rights")}
          </p>
          <div className="flex flex-wrap gap-6">
            <CookiePreferences />
            <Link
              href={"/gizlilik-politikasi" as never}
              className="hover:text-ink transition"
            >
              {t("privacy")}
            </Link>
            <Link
              href={"/kullanim-kosullari" as never}
              className="hover:text-ink transition"
            >
              {t("terms")}
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}
