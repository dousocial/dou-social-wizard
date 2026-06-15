# PROJECT_CONTEXT.md — DOU Social Web

> **Read this file before making any change.**
> Update it whenever new components, pages, or design decisions are added.

---

## 1. Overview

**DOU Social** is a Turkish digital marketing agency based in Denizli. This is their marketing website.

- **Framework:** Next.js 16.2.4 (Turbopack) — has breaking API changes vs older versions. Always read `node_modules/next/dist/docs/` before writing Next.js-specific code.
- **React:** 19.2.4 — uses `use(params)` for async params in server components, `useActionState` for Server Actions.
- **Language:** TypeScript 5 (strict)
- **Styling:** Tailwind CSS v4 — **no tailwind.config.ts**. All config lives in `src/app/globals.css` inside `@theme {}`.
- **Package manager:** pnpm
- **Node:** via pnpm workspace

---

## 2. Tech Stack & Dependencies

| Package | Version | Purpose |
|---|---|---|
| next | 16.2.4 | Framework |
| react | 19.2.4 | UI library |
| next-intl | 4.11 | i18n (TR/EN) |
| framer-motion | ^12.38.0 | UI animations |
| gsap | ^3.15.0 | ScrollTrigger, scroll-linked animations |
| lenis | ^1.3.23 | Smooth scrolling |
| next-mdx-remote | — | Blog MDX rendering |
| gray-matter | — | MDX frontmatter parsing |
| clsx + tailwind-merge | — | `cn()` utility |

---

## 3. Folder Structure

```
src/
├── app/
│   ├── globals.css              ← Tailwind @theme, design tokens, custom utilities
│   └── [locale]/
│       ├── layout.tsx           ← Root layout: fonts, Header, Footer, FABs, providers
│       ├── page.tsx             ← Homepage
│       ├── hizmetler/[slug]/    ← Service detail pages
│       ├── projeler/[slug]/     ← Case study detail pages
│       ├── blog/[slug]/         ← Blog post pages
│       ├── hakkimizda/          ← About page
│       ├── iletisim/            ← Contact page
│       ├── teklif-al/           ← Quote form page
│       ├── dijital-checkup/     ← Checkup form page
│       └── strateji-gorusmesi/  ← Meeting form page
├── components/
│   ├── analytics/               ← GTM, GA4, Meta Pixel, ConsentManager
│   ├── blog/                    ← MDX components, ArticleSchema
│   ├── brand/Logo.tsx           ← CSS mask-based SVG logo
│   ├── forms/                   ← Field, Honeypot, ContactForm, QuoteForm (multi-step), etc.
│   ├── layout/
│   │   ├── Header.tsx           ← Sticky scroll-aware header, active nav underline
│   │   ├── Footer.tsx           ← 4-col grid footer
│   │   ├── MobileMenu.tsx       ← Portal drawer with Lenis scroll-lock, stagger animations
│   │   ├── LangSwitcher.tsx     ← TR / EN toggle
│   │   ├── SmoothScrollProvider.tsx ← Lenis + GSAP ticker; exports getLenis(), scrollToTop()
│   │   ├── CallFab.tsx          ← Mobile-only call FAB
│   │   └── WhatsAppFab.tsx      ← Fixed WhatsApp FAB with pulse ring
│   ├── sections/                ← Page section components (see §7)
│   ├── seo/                     ← Schema.org components, SEOLandingTemplate
│   └── ui/
│       ├── Button.tsx           ← Button + ButtonLink (primary/secondary/ghost, sm/md/lg, shimmer)
│       ├── Container.tsx        ← Max-width wrapper (tight=1120px, wide=1280px)
│       ├── Section.tsx          ← Semantic section with spacing variants (sm/md/lg)
│       ├── Reveal.tsx           ← Framer Motion scroll-reveal (8 variants + stagger)
│       ├── Accordion.tsx        ← Animated FAQ accordion
│       ├── Marquee.tsx          ← Infinite horizontal marquee (CSS animation, pause-on-hover)
│       ├── Noise.tsx            ← SVG fractal noise texture overlay
│       ├── Tilt.tsx             ← 3D perspective tilt on hover (Framer Motion springs)
│       └── WordReveal.tsx       ← Masked word-by-word scroll reveal animation
├── hooks/
│   ├── useCountUp.ts            ← IntersectionObserver + rAF count-up hook
│   └── useGsapReveal.ts         ← GSAP ScrollTrigger reveal hook
├── i18n/
│   ├── routing.ts               ← Locales: tr (default, no prefix), en (/en prefix)
│   ├── navigation.ts            ← createNavigation: Link, usePathname, useRouter, redirect
│   └── request.ts               ← getRequestConfig → loads messages/${locale}.json
├── lib/
│   ├── utils.ts                 ← cn() = clsx + tailwind-merge
│   ├── site.ts                  ← SITE_URL, localizedUrl(), alternatesFor()
│   ├── services.ts              ← SERVICE_SLUGS tuple
│   ├── cases.ts                 ← CASE_SLUGS tuple
│   ├── blog.ts                  ← getAllPosts, getPostBySlug (MDX from content/blog/{locale}/)
│   ├── rate-limit.ts            ← In-memory rate limiter (5 req / 10 min per IP)
│   └── actions/forms.ts         ← Server Actions: submitContactForm, submitQuoteRequest, etc.
└── messages/
    ├── tr.json                  ← Turkish strings (default locale)
    └── en.json                  ← English strings
```

---

## 4. Design System

### 4.1 Colors (`globals.css @theme`)

| Token | Value | Usage |
|---|---|---|
| `ink` | `#000000` | Primary text, dark elements |
| `paper` | `#ffffff` | Background, light elements |
| `accent` | `#800000` | Brand color (dark maroon) |
| `accent-hover` | `#5c0000` | Hover state for accent |
| `mute-50` | `#fafafa` | Lightest neutral bg |
| `mute-100` | `#f5f5f5` | Subtle borders, dividers |
| `mute-200` | `#e5e5e5` | Borders |
| `mute-300` | `#d4d4d4` | Disabled states |
| `mute-400` | `#a3a3a3` | Placeholder text |
| `mute-500` | `#737373` | Secondary text |
| `mute-600` | `#525252` | Body text on light bg |
| `mute-700` | `#404040` | Text on dark bg (subtle) |
| `mute-800` | `#262626` | Dark section borders |
| `mute-900` | `#171717` | Near-black |

### 4.2 Typography

| Token | Role | Font |
|---|---|---|
| `--font-sans` | Body / UI text | Plus Jakarta Sans (variable) |
| `--font-display` | Headings / brand | Fraunces (optical-size serif) |

**Fluid type scale** (all via CSS custom properties, set with `clamp()`):
- `--text-xs` through `--text-7xl`
- Referenced as inline `style={{ fontSize: "var(--text-3xl)" }}` in components
- Or via `.text-fluid-*` utility classes

**Typography hierarchy:**
- Hero title: `font-display`, `--text-6xl`, `tracking-tight`, `leading-[1.02]`
- Section title (h2): `font-display`, `--text-4xl`, `tracking-tight`, `leading-[1.1]`
- Card title (h3): `font-display`, `--text-2xl` or `--text-3xl`, `tracking-tight`
- Body: `--text-base`, `text-mute-600`, `leading-relaxed`
- Eyebrow label: `text-xs`, `font-semibold`, `uppercase`, `tracking-[0.2em]`, `text-accent`
- Caption / meta: `text-xs`, `text-mute-400`, `uppercase`, `tracking-wide`

### 4.3 Easing Curves

```
--ease-out-expo:   cubic-bezier(0.16, 1, 0.3, 1)     ← Primary UI animations
--ease-out-quart:  cubic-bezier(0.25, 1, 0.5, 1)     ← Subtle reveals
--ease-in-out-sine: cubic-bezier(0.37, 0, 0.63, 1)   ← Symmetric transitions
--ease-spring:     cubic-bezier(0.34, 1.56, 0.64, 1)  ← Bounce/pop effects
```

In Framer Motion: `ease: [0.16, 1, 0.3, 1] as const`

### 4.4 Shadows

```
--shadow-sm:  subtle card border-like
--shadow-md:  card hover
--shadow-lg:  elevated panels
--shadow-xl:  modals/drawers
--shadow-glow: 0 0 40px 0 rgb(128 0 0 / 0.15)  ← accent glow
```

### 4.5 Spacing

| Token | Value |
|---|---|
| `--space-section-sm` | `clamp(3rem, 2rem + 4vw, 5rem)` |
| `--space-section-md` | `clamp(5rem, 3.5rem + 6vw, 8rem)` |
| `--space-section-lg` | `clamp(7rem, 4rem + 10vw, 12rem)` |

Used via `Section` component `spacing="sm|md|lg"` prop.

### 4.6 Utilities

- `.glass` — light glassmorphism (bg-white/72, backdrop-blur-xl)
- `.glass-dark` — dark glassmorphism (bg-black/64)
- `.text-fluid-*` — fluid font-size utility classes
- `.skip-to-content` — a11y skip link
- `.animate-marquee-left` / `.animate-marquee-right` — CSS marquee animation

---

## 5. Animation System

### 5.1 Framer Motion (`Reveal` component)

Primary animation primitive. Wraps `motion[tag]` with `whileInView`.

```tsx
<Reveal variant="fadeUp" delay={0.2}>...</Reveal>
<Reveal stagger>
  <RevealItem variant="scaleUp">...</RevealItem>
</Reveal>
```

**Available variants:** `fadeUp`, `fadeOnly`, `slideRight`, `slideLeft`, `scaleUp`, `clipReveal`, `blurIn`, `popIn`

**IMPORTANT:** Never use `filter: "blur()"` in Framer Motion `initial` variant states — causes SSR hydration mismatch (elements stay invisible). Use `scale`, `opacity`, `x`, `y` only.

**IMPORTANT:** For parallax (`useScroll`/`useTransform`), always gate with `isClient` state:
```tsx
const [isClient, setIsClient] = useState(false);
useEffect(() => { setIsClient(true); }, []);
const style = isClient && !reduceMotion ? { y: transformValue } : {};
```

### 5.2 GSAP

- Ticker synced with Lenis: `gsap.ticker.add((time) => lenis.raf(time * 1000))`
- `useGsapReveal` hook available from `@/hooks/useGsapReveal` (exported via `Reveal.tsx`)
- ScrollTrigger registered globally in `SmoothScrollProvider`

### 5.3 Lenis (Smooth Scroll)

- Instance exposed via `getLenis()` from `SmoothScrollProvider`
- Scroll to top: `scrollToTop()` from `SmoothScrollProvider`
- Scroll lock: `getLenis()?.stop()` / `getLenis()?.start()`
- `body.style.overflow = "hidden"` alone does NOT stop Lenis

### 5.4 New Components

- **`Marquee`** — CSS-animated infinite horizontal strip. Props: `items`, `direction`, `speed`, `pauseOnHover`.
- **`Noise`** — SVG fractal noise overlay. Uses `useId()` for unique filter IDs. Props: `opacity`, `className`.
- **`Tilt`** — 3D perspective tilt on hover using Framer Motion springs. Props: `maxTilt`, `scale`, `disabled`.
- **`WordReveal`** — Masked word-by-word reveal via `whileInView` stagger. Props: `text`, `className`, `as`.

---

## 6. i18n

- **Routing:** `tr` = default (no URL prefix), `en` = `/en` prefix
- **Messages:** `messages/tr.json`, `messages/en.json`
- **Namespaces in use:** `Meta`, `Nav`, `Hero`, `Services`, `HowWeWork`, `Metrics`, `CaseStudies`, `LeadMagnet`, `FinalCTA`, `About`, `Contact`, `ServicesHub`, `ServicesDetail`, `Cases`, `Quote`, `Checkup`, `Meeting`, `SeoLanding`, `Blog`, `Privacy`, `Terms`, `Cookies`, `Consent`, `NotFound`, `Error`, `Footer`, `Status`
- Server components use `getTranslations()` / `setRequestLocale()`
- Client components use `useTranslations()`

---

## 7. Section Components

### Homepage Sections (in order)
1. `Hero` — Full-viewport, parallax bg orbs, stagger entrance, scroll indicator
2. `MarqueeStrip` — Services + stats marquee strip (separates Hero from Services)
3. `Services` — 2×2 grid (gap-px layout), hover fill + accent border
4. `HowWeWork` — 4-step process, watermark numbers, connecting line
5. `Metrics` — Dark bg, animated count-up, SVG noise texture
6. `CaseStudies` — 3-card grid, hover overlay reveal, Tilt 3D effect
7. `LeadMagnet` — 2-col: copy + checklist CTA
8. `FinalCTA` — Full-bleed dark, word-reveal animation heading

### Other Notable Sections
- `AboutHero`, `BrandStory`, `Values` — About page
- `ServiceHero`, `ServiceProblem`, `ServiceProcess`, `ServiceDeliverables`, `ServiceFAQ` — Service detail pages
- `ContactHero`, `ContactFormSection`, `ContactMethods`, `ContactMap` — Contact page
- `CaseCover`, `CaseChallenge`, `CaseApproach`, `CaseResults`, `CaseGallery`, `CaseRelated` — Case study detail pages
- `SEOLandingTemplate` — Reusable SEO landing page template

---

## 8. Forms

All forms use React Server Actions (`"use server"`):
- `submitContactForm` — Contact page
- `submitQuoteRequest` — Multi-step quote wizard (4 steps)
- `submitCheckupForm` — Digital checkup
- `submitMeetingRequest` — Strategy meeting

**Pattern:** `useActionState(serverAction, initialState)` + `<form action={formAction}>`
**Anti-spam:** `Honeypot` component (hidden `website_url` field)
**Rate-limiting:** 5 requests per 10 minutes per IP (in-memory, not Redis)
**Email delivery:** Currently `console.log` only — TODO: integrate Resend

---

## 9. Slugs

| Type | Slugs |
|---|---|
| Services | `meta-ads`, `sosyal-medya-yonetimi`, `icerik-uretim`, `web-tasarim`, `marka-stratejisi` |
| Cases | `e-ticaret-3x-donusum`, `b2b-yazilim-lead-jenerasyonu`, `restoran-yerel-buyume`, `online-egitim-lansmani`, `saglik-klinigi-marka-yenileme` |
| SEO Landings | `denizli-sosyal-medya-ajansi`, `meta-ads-ajansi`, `instagram-reklam-yonetimi`, `dijital-pazarlama-ajansi` |

---

## 10. Business Info

| Field | Value |
|---|---|
| Company | DOU Social |
| Location | Zafer Mah. Zafer Cd. No:60/1 Merkezefendi, Denizli, Turkey |
| Phone | +90 530 084 54 68 |
| WhatsApp | `wa.me/905300845468` |
| Email | info@dousocial.com |
| Instagram | @dou.social |
| LinkedIn | linkedin.com/company/dou-dijital-marketing |
| YouTube | @DouSocial |
| Facebook | profile.php?id=61587124940165 |

---

## 11. Key Architectural Decisions

1. **Tailwind v4, no config file** — All design tokens in `globals.css @theme {}`. Do NOT create `tailwind.config.ts`.
2. **No `filter: blur()` in Framer Motion `initial` states** — Causes SSR hydration mismatch. Elements stay invisible. Use only `opacity`, `x`, `y`, `scale`.
3. **`isClient` pattern for parallax** — `useScroll`/`useTransform` must be gated behind a `useEffect` mount check to prevent SSR/CSR style mismatch.
4. **MobileMenu uses `createPortal`** — `position: sticky` on Header creates a stacking context that traps `position: fixed` children. Solution: portal to `document.body`.
5. **Lenis control via module variable** — `getLenis()` exposes the Lenis instance globally (no context needed). Required because Header and MobileMenu are at different tree levels.
6. **Server Actions for forms** — React 19 `useActionState` + `"use server"` functions. No API routes needed for forms.
7. **Font loading** — Google Fonts via `next/font/google`. Current: Plus Jakarta Sans (body) + Fraunces (display). Variables: `--font-plus-jakarta-sans`, `--font-fraunces`.
8. **Blog content** — MDX files at `content/blog/{locale}/{slug}.mdx`. Not CMS-driven.

---

## 12. Naming Conventions

- **Components:** PascalCase (`ServiceCard`, `RevealItem`)
- **Files:** PascalCase for components (`Hero.tsx`), camelCase for hooks/utils (`useCountUp.ts`, `utils.ts`)
- **CSS classes:** kebab-case, Tailwind utilities
- **i18n keys:** camelCase in JSON, dot-notation access (`t("metaAds.title")`)
- **Animation variants:** `hidden` / `show` / `exit` naming pattern
- **Easing constants:** `const EASE = [0.16, 1, 0.3, 1] as const` inside component files

---

## 13. Performance Rules

- All animations must target 60 FPS
- Use `will-change: transform` sparingly (only on actively animating elements)
- `viewport: { once: true }` on all `whileInView` (no re-trigger on scroll up)
- Lenis + GSAP ticker integration prevents double RAF loops
- `useReducedMotion()` hook respected in all animation components
- Avoid `filter: blur()` at runtime (performance + hydration issues)
- Images: AVIF/WebP via next.config.ts
- FAB animations use CSS `scale` transforms (composited, no layout)

---

## 14. What Was Built (Session History)

### Sprint 1
- Lenis smooth scroll + GSAP ScrollTrigger integration (`SmoothScrollProvider`)
- GSAP ticker synced with Lenis RAF loop
- Fluid typography scale in `globals.css`
- `Reveal` + `RevealItem` animation components (8 variants)
- `useCountUp` and `useGsapReveal` hooks

### Sprint 2
- `Hero` — full-viewport parallax, gradient mesh, stagger, scroll indicator
- `Header` — sticky, scroll-aware glass effect, `layoutId="nav-active"` underline
- `MobileMenu` — portal drawer, Lenis lock, CSS hamburger bars, stagger nav

### Sprint 3
- `Metrics` — dark bg, animated count-up with IntersectionObserver
- `Services` — hover fill + accent border
- `CaseStudies` — hover overlay reveal panel

### Sprint 4
- `Accordion` — animated height collapse, single/multi mode
- `Button` — shimmer overlay on primary variant, `whileTap` scale
- `WhatsAppFab` / `CallFab` — pulse ring animations

### Sprint 5
- `QuoteForm` — multi-step wizard with slide transitions, progress bar
- Blog page — featured post layout
- `Field` components — premium styling

### Bug Fixes
- Removed all `filter: blur()` from Framer Motion `hidden` variant states (SSR hydration fix)
- Added `isClient` state to `Hero` for parallax (SSR mismatch fix)
- `MobileMenu` rewritten with `createPortal` (stacking context fix)
- Lenis scroll lock: `lenis.stop()/start()` instead of `overflow: hidden`

### Sprint 6
- Font: Plus Jakarta Sans (body) — replaces Inter
- `Marquee` UI component — CSS infinite horizontal scroll
- `Noise` UI component — SVG fractal noise overlay
- `Tilt` UI component — 3D perspective tilt on hover
- `WordReveal` UI component — masked word-by-word scroll reveal
- `MarqueeStrip` section — services + stats strip between Hero and Services
- `Hero` enhanced — animated gradient orbs
- `HowWeWork` enhanced — watermark numbers, visual hierarchy
- `Metrics` enhanced — Noise texture overlay
- `FinalCTA` enhanced — word-reveal heading animation
- `CaseStudies` enhanced — Tilt 3D on cards
- Hydration fixes: `suppressHydrationWarning` on Reveal/WordReveal, `isClient` on Tilt

### Sprint 8 (Current)
- **Copy overhaul** — tr.json + en.json: Hero ("Büyüme kaza eseri olmaz."), Services, HowWeWork, CaseStudies, FinalCTA, About, Contact, ServicesHub — daha kurumsal ve keskin dil
- **`ManifestoSection`** — yeni bileşen: tam ekran `bg-ink`, 4 bold statement, her satır clip-path left→right wipe (Framer Motion `whileInView`), `--text-4xl` Fraunces, accent numaralar; Services ile HowWeWork arasına eklendi
- **`Manifesto` i18n namespace** eklendi — tr.json + en.json

### Sprint 7
- `Header` — logo enlarged `h-10 w-[100px]` (was h-8 w-20), header height `h-[70px] md:h-20` (was h-16 md:h-[72px])
- `Services` — **bento grid**: `lg:grid-cols-5` with 3+2 / 2+3 zipper pattern; featured cards (01, 04) get `--text-4xl` title + watermark number; compact cards (02, 03) `--text-3xl`; 2×2 equal grid at md
- `CasesHubGrid` — **cinematic dark cards**: alternating `bg-ink`/`bg-mute-900`/`bg-mute-800` backgrounds; hover CSS scale `group-hover:scale-[1.025]`; metric fades to accent on hover; gradient overlay + "İncele" CTA reveal on hover
- `AboutHero` — **editorial 2-col split**: h1 left (`--text-6xl`), lead text bottom-right; decorative rule below; converted to async server component (`getTranslations`)
- Fixed pre-existing missing translation: `Contact.form.optional` added to en.json + tr.json
