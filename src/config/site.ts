/**
 * ╔══════════════════════════════════════════════════════╗
 * ║           PROJE ŞABLON YAPILANDIRMASI               ║
 * ║  Yeni bir projede sadece bu dosyayı düzenle.        ║
 * ╚══════════════════════════════════════════════════════╝
 *
 * LOGO DEĞİŞTİRME:
 *   public/brand/ klasörüne yükle:
 *   - dou-logo.png       → koyu logo (beyaz zemin için)
 *   - dou-logo-light.png → açık/beyaz logo (siyah zemin için)
 *
 * RENK DEĞİŞTİRME:
 *   src/app/globals.css → @theme bloğu içinde:
 *   --color-accent:       ana marka rengi (şu an koyu kırmızı #800000)
 *   --color-accent-hover: hover tonu
 *   --color-ink:          ana metin rengi
 *   --color-paper:        sayfa arkaplan rengi
 *
 * FONT DEĞİŞTİRME:
 *   src/app/[locale]/layout.tsx → inter ve plusJakartaSans tanımları
 *   src/app/globals.css         → --font-sans ve --font-display
 *
 * ÇEVRE DEĞİŞKENLERİ (.env.local):
 *   NEXT_PUBLIC_SITE_URL        → canlı domain (örn: https://www.sirketadi.com)
 *   NEXT_PUBLIC_RECAPTCHA_SITE_KEY
 *   SUPABASE_URL / SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY
 */

export const siteConfig = {

  // ── Marka kimliği ────────────────────────────────────────────────────
  brand: {
    name: "DOU Social",
    alternateName: "Digital Outreach Utility",
    tagline: "Dijital dönüşümünüzü birlikte tasarlıyoruz.",
    /** public/brand/ klasöründe olmalı */
    logo: {
      dark:  "/brand/dou-logo.png",        // koyu logo (beyaz zemin)
      light: "/brand/dou-logo-light.png",  // açık logo (siyah zemin)
      width:  160,
      height:  48,
    },
  },

  // ── İletişim bilgileri ───────────────────────────────────────────────
  contact: {
    phone:        "0 (530) 084 54 68",
    phoneTel:     "+905300845468",          // tel: linki için
    email:        "info@dousocial.com",
    invoiceEmail: "info@yapimedyagroup.com",
    website:      "www.dousocial.com",
    location:     "Denizli · Türkiye",
    address: {
      street:   "Zafer Mah. Zafer Cd. No: 60/1",
      district: "Merkezefendi",
      city:     "Denizli",
      country:  "TR",
    },
  },

  // ── Sosyal medya ─────────────────────────────────────────────────────
  social: {
    instagram: "https://www.instagram.com/dou.social",
    linkedin:  "https://www.linkedin.com/company/dou-dijital-marketing/",
    youtube:   "https://www.youtube.com/@DouSocial",
    facebook:  "https://www.facebook.com/profile.php?id=61587124940165",
    whatsapp:  "https://wa.me/905300845468",
  },

  // ── Analitik ─────────────────────────────────────────────────────────
  analytics: {
    ga4Id: "G-K6YE41E5EC",
  },

  // ── SEO & meta ───────────────────────────────────────────────────────
  seo: {
    description: {
      tr: "Meta Ads, sosyal medya yönetimi, içerik üretimi, web tasarımı ve marka stratejisini tek elden yöneten Denizli merkezli dijital ajans.",
      en: "Denizli-based digital agency delivering Meta Ads, social media management, content creation, web design, and brand strategy.",
    },
  },

  // ── PDF teklif şablonu ───────────────────────────────────────────────
  pdf: {
    sidebarColor:  "#111111",               // sol sidebar arkaplan rengi
    sidebarText:   "Sosyal Medya HİZMETLERİ", // dikey yazı
    parentCompany: "YAPIMEDYA",             // footer'da görünen üst şirket adı
    copyright:     "© DOU Social — Tüm hakları saklıdır.",
  },

} as const;

export type SiteConfig = typeof siteConfig;
