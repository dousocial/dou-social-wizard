import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppFab } from "@/components/layout/WhatsAppFab";
import { CallFab } from "@/components/layout/CallFab";
import { SmoothScrollProvider } from "@/components/layout/SmoothScrollProvider";
import { ConsentManager } from "@/components/analytics/ConsentManager";
import { OrganizationSchema } from "@/components/seo/OrganizationSchema";
import "../globals.css";

// Body text — Inter: neutral, highly legible, industry-standard for premium UIs
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600"],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
  display: "swap",
  weight: ["500", "600", "700"],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.dousocial.com";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)",  color: "#111111" },
  ],
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Meta" });

  const localeUrl = locale === "tr" ? SITE_URL : `${SITE_URL}/en`;

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: t("siteTitle"),
      template: "%s · DOU Social",
    },
    description: t("siteDescription"),
    alternates: {
      canonical: localeUrl,
      languages: {
        "tr-TR": SITE_URL,
        "en-US": `${SITE_URL}/en`,
        "x-default": SITE_URL,
      },
    },
    openGraph: {
      type: "website",
      locale: locale === "tr" ? "tr_TR" : "en_US",
      alternateLocale: locale === "tr" ? "en_US" : "tr_TR",
      url: localeUrl,
      siteName: "DOU Social",
    },
    robots: { index: true, follow: true },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: LayoutProps<"/[locale]">) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  // Read theme cookie so the server renders the correct class on every navigation.
  // This prevents React reconciliation from stripping "dark" on locale switches.
  const cookieStore = await cookies();
  const isDarkMode = cookieStore.get("theme")?.value !== "light";

  return (
    <html
      lang={locale}
      className={`${inter.variable} ${plusJakartaSans.variable} h-full antialiased${isDarkMode ? " dark" : ""}`}
      suppressHydrationWarning
    >
      {/* Inline script runs before first paint — prevents dark-mode FOUC */}
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var s=localStorage.getItem('theme');var dark=s!=='light';document.documentElement.classList.toggle('dark',dark);document.cookie='theme='+(dark?'dark':'light')+';path=/;max-age=31536000;SameSite=Lax'}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <OrganizationSchema />
        <NextIntlClientProvider>
          <SmoothScrollProvider>
            <a href="#main-content" className="skip-to-content">
              {locale === "tr" ? "Ana içeriğe atla" : "Skip to content"}
            </a>
            <Header />
            <main id="main-content" className="flex-1">
              {children}
            </main>
            <Footer />
            <CallFab />
            <WhatsAppFab />
            <ConsentManager />
          </SmoothScrollProvider>
        </NextIntlClientProvider>
        {/* Google Analytics 4 — afterInteractive: yüklenmesi sayfa etkileşimine kadar ertelenir */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-K6YE41E5EC"
          strategy="afterInteractive"
        />
        <Script id="ga4-config" strategy="afterInteractive">{`
          window.dataLayer=window.dataLayer||[];
          function gtag(){dataLayer.push(arguments);}
          gtag('js',new Date());
          gtag('config','G-K6YE41E5EC',{send_page_view:true});
        `}</Script>
        {/* Google reCAPTCHA v3 */}
        <Script
          src={`https://www.google.com/recaptcha/api.js?render=${process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}`}
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}
