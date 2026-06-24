# DOU Social SEO + GEO Denetim Raporu

Denetim tarihi: 24 Haziran 2026  
Kapsam: Next.js App Router yapısı, metadata, robots, sitemap, structured data, içerik, dahili linkleme, performans ve GEO/AI arama görünürlüğü.  
Not: Bu raporda kod düzeltilmedi. Sadece mevcut durum incelendi. Canlı domain davranışları, Search Console verisi, Analytics verisi, indeks durumu ve Core Web Vitals saha verisi repodan doğrulanamadı.

## 1. Genel Değerlendirme

### SEO olgunluğu

Orta seviye. Projede Next.js metadata API, locale bazlı rota yapısı, sitemap/robots üretimi, sayfa bazlı title/description, JSON-LD, blog MDX yapısı ve yerel landing sayfaları var. Bu iyi bir temel. Ancak canonical/hreflang sinyallerinde çelişkiler, sitemap içinde noindex sayfa, tüm sayfalara yüklenen üçüncü parti scriptler, bazı schema uyumsuzlukları ve içerik/rota eşleşme eksikleri kritik seviyede.

### GEO olgunluğu

Başlangıç-orta seviye. Sayfalarda açık hizmet anlatımı, FAQ blokları, yerel hizmet sinyalleri, Organization/LocalBusiness/Service schema ve blog içerikleri mevcut. Fakat AI motorları için güvenilirlik sinyali zayıflatan alanlar var: görünmeyen FAQ schema, örnek vaka sayfaları ile "çok yakında" proje hub'ı arasındaki tutarsızlık, İngilizce içerik boşluğu, kaynak/kanıt/ölçüm formatının sınırlı olması, yazar/güncelleme bilgisi eksikleri ve canonical hataları.

### Kritik ilk 5 problem

1. `alternatesFor()` her sayfada canonical'ı TR URL'ye sabitliyor. İngilizce hizmet ve legal sayfalarda canonical/hreflang çelişkisi oluşuyor. Kaynak: `src/lib/site.ts:33-42`, kullanım örneği `src/app/[locale]/hizmetler/[slug]/page.tsx:35`.
2. Sitemap, noindex olan `/strateji-gorusmesi` sayfasını listeliyor. Kaynak: `src/lib/site.ts:13`, `src/app/sitemap.ts:28-38`, `src/app/[locale]/strateji-gorusmesi/page.tsx:18`.
3. Sitemap tüm URL'ler için `lastModified: new Date()` kullanıyor. Bu her deploy/istekte bütün site yeniymiş gibi sinyal verir. Kaynak: `src/app/sitemap.ts:24`, `src/app/sitemap.ts:33`, `src/app/sitemap.ts:47`, `src/app/sitemap.ts:61`, `src/app/sitemap.ts:75`.
4. Homepage JSON-LD içinde FAQ schema var ama sorular sayfada görünür içerik olarak render edilmiyor. Kaynak: `src/components/seo/HomePageSchema.tsx:15-28`, `src/components/seo/HomePageSchema.tsx:103-114`, render `src/app/[locale]/page.tsx:103`.
5. GA4 consent dışı da yükleniyor; `ConsentManager` ayrıca izin sonrası `Analytics` yükleyebiliyor. Bu hem KVKK/GDPR hem de çift ölçüm riski yaratıyor. Kaynak: `src/app/[locale]/layout.tsx:129-142`, `src/components/analytics/ConsentManager.tsx:34`, `src/components/analytics/Analytics.tsx:37-45`.

### En güçlü ilk 5 uygulama

1. App Router'da sayfa bazlı metadata kullanımı yaygın. Örnekler: `src/app/[locale]/hizmetler/page.tsx:11-19`, `src/app/[locale]/iletisim/page.tsx:11-19`, `src/app/[locale]/blog/[slug]/page.tsx:34-44`.
2. Çok dilli rota yapısı ve sitemap alternates fikri kurulmuş. Kaynak: `src/i18n/routing.ts`, `src/app/sitemap.ts:14-20`, `src/app/sitemap.ts:36`.
3. Hizmet, FAQ, Organization, LocalBusiness, Article, Breadcrumb gibi structured data bileşenleri mevcut. Örnekler: `src/components/seo/ServiceSchema.tsx:9-30`, `src/components/seo/FAQPageSchema.tsx:10-30`, `src/components/seo/OrganizationSchema.tsx:16-89`.
4. Yerel SEO için Denizli odaklı landing sayfaları var. Kaynak: `src/lib/seo-landings.ts:1-6`, örnek sayfa `src/app/[locale]/denizli-sosyal-medya-ajansi/page.tsx:31-35`.
5. Performansta bazı iyi korumalar var: particle canvas mobilde/düşük cihazda kapanıyor, reduced motion dikkate alınıyor, Lenis düşük cihazlarda devre dışı kalıyor. Kaynak: `src/components/sections/HeroParticles.tsx:50-59`, `src/components/layout/SmoothScrollProvider.tsx:37-48`.

## 2. Kritik Hatalar

| Öncelik | Sorun | Neden yanlış | SEO/GEO etkisi | Kanıt | Önerilen çözüm |
|---|---|---|---|---|---|
| P0 | Locale canonical TR'ye sabit | `alternatesFor()` current locale almıyor ve canonical'ı her zaman TR yapıyor. | EN sayfalar kendi URL'lerini canonical göstermez; Google TR sayfayı tercih edebilir, AI arama İngilizce içeriği güvenilir eşdeğer sayfa olarak algılamayabilir. | `src/lib/site.ts:33-42`, `src/app/[locale]/hizmetler/[slug]/page.tsx:35`, legal sayfalar `rg` sonucu | `alternatesFor(path, locale)` imzasına geç; canonical current locale URL olmalı, hreflang tüm dilleri göstermeli. |
| P0 | Noindex sayfa sitemap'te | `/strateji-gorusmesi` sitemap'e giriyor ama sayfa `robots: { index: false, follow: false }`. | Crawl bütçesi ve indeksleme sinyali çelişir; "gönderildi ama noindex" hatası oluşur. | `src/lib/site.ts:13`, `src/app/sitemap.ts:28-38`, `src/app/[locale]/strateji-gorusmesi/page.tsx:18` | Noindex sayfayı sitemap'ten çıkar veya indexlenmesini istiyorsan robots kararını değiştir. |
| P0 | Sahte/oynak `lastModified` | Sitemap tüm URL'lere anlık tarih basıyor. | Arama motorlarının tazelik sinyaline güveni azalır; gereksiz yeniden tarama tetiklenir. | `src/app/sitemap.ts:24`, `src/app/sitemap.ts:33`, `src/app/sitemap.ts:47`, `src/app/sitemap.ts:61`, `src/app/sitemap.ts:75` | Statik sayfalara sabit güncelleme tarihi, bloglara frontmatter `date/updatedAt`, DB içeriklerine `updated_at` kullan. |
| P0 | Görünmeyen FAQ schema | Homepage FAQ JSON-LD'deki soru-cevaplar görünür homepage içeriğinde yok. | Rich result policy ve GEO güvenilirliği riski; AI motorları görünür içerikle schema'yı eşleştiremez. | `src/components/seo/HomePageSchema.tsx:15-28`, `src/components/seo/HomePageSchema.tsx:103-114`, `src/app/[locale]/page.tsx:103` | FAQ schema yalnızca aynı sorular görünür biçimde sayfadaysa kullanılmalı; aksi halde kaldırılmalı. |
| P1 | Consent dışı GA4 yüklenmesi ve çift ölçüm | Layout doğrudan GA4 scriptini yüklerken `ConsentManager` izin sonrası `Analytics` bileşenini de render ediyor. | KVKK/GDPR riski, dataLayer/gtag çift page_view, performans yükü. | `src/app/[locale]/layout.tsx:132-142`, `src/components/analytics/ConsentManager.tsx:34`, `src/components/analytics/Analytics.tsx:37-45` | Tek analytics yolu seç; GA4/GTM yalnızca consent granted sonrası yüklenmeli, default denied consent mode kurulmalı. |
| P1 | robots admin ve auth alanlarını disallow etmiyor | robots sadece `/api/` ve `/_next/` disallow ediyor. | `/yonetim/giris`, `/admin` redirectleri ve panel URL'leri crawl denenebilir; gereksiz/noise URL'ler çıkabilir. | `src/app/robots.ts:8-10`, proxy admin redirectleri `src/proxy.ts` | `/yonetim/`, `/admin/`, auth/setup/preview/internal yollarını robots'ta disallow et; indexlenebilir route listesi net olsun. |
| P1 | WebSite SearchAction gerçek arama işleviyle kanıtlanmıyor | `SearchAction` `/blog?q=...` gösteriyor ama blog sayfasında query okuma/arama yok. | Yanlış structured data; arama motorları ve AI araçları olmayan bir site içi arama varsayar. | `src/components/seo/OrganizationSchema.tsx:51-57`, `src/app/[locale]/blog/page.tsx:22-139` | Blog arama gerçekten yapılacaksa query destekle; yoksa `SearchAction` kaldır. |
| P1 | Service schema EN sayfada TR URL veriyor | `ServiceSchema` URL'yi `SITE_URL/hizmetler/${slug}` olarak sabitliyor. | EN hizmet sayfalarında JSON-LD URL, görünen URL ile uyuşmuyor. | `src/components/seo/ServiceSchema.tsx:20`, çağrı `src/app/[locale]/hizmetler/[slug]/page.tsx:61-65` | `locale` prop'u ekleyip `localizedUrl()` ile doğru URL üret. |
| P1 | Blog yazıları metadata'da canonical/hreflang eksik | Blog detay metadata yalnızca title/description/OG image döndürüyor. | Blog URL'lerinde canonical layout'tan kök URL olarak miras kalabilir veya eksik kalabilir; çok dilli sinyal zayıflar. | `src/app/[locale]/blog/[slug]/page.tsx:34-44`, layout alternates `src/app/[locale]/layout.tsx:65-71` | Blog detayda canonical, OG url, hreflang ve mümkünse alternates mapping üret. |
| P1 | Projeler hub "çok yakında" iken sitemap vaka detaylarını listeliyor | `/projeler` sayfası hazır değil mesajı veriyor, ama sitemap 5 vaka detay URL'si üretiyor. | Kullanıcı ve crawler sinyali tutarsız; AI motorları vaka kanıtlarını zayıf algılar. | `src/app/[locale]/projeler/page.tsx:53-72`, `src/lib/cases.ts:1-7`, `src/app/sitemap.ts:55-66` | Ya vaka hub gerçek listeyi göstermeli ya da hazır olmayan vaka URL'leri sitemap'ten çıkarılmalı. |

## 3. Yanlış Bilinen veya Gereksiz Uygulamalar

| Uygulama | Değerlendirme | Kanıt | Öneri |
|---|---|---|---|
| `meta keywords` | Modern Google SEO'da pratik katkısı yok; spam görünümü yaratabilir. | `src/app/[locale]/page.tsx:54-71` | Kaldırmak veya sadece iç yönetim dokümanında anahtar kelime map'i tutmak daha temiz. |
| Her sayfaya reCAPTCHA scripti | Form olmayan sayfalarda üçüncü parti JS yükü yaratıyor. | `src/app/[locale]/layout.tsx:143-147` | Sadece form kullanılan sayfalarda veya form bileşeni mount olduğunda yükle. |
| Her sayfaya global Organization + WebSite + SiteNavigation schema | Organization/WebSite global olabilir; fakat SearchAction yanlışsa site genelinde yayılır. | `src/app/[locale]/layout.tsx:116`, `src/components/seo/OrganizationSchema.tsx:43-58` | Global schema sade ve doğrulanabilir tutulmalı. |
| FAQ schema'yı görünür içerikten bağımsız üretmek | GEO için kısa vadede cazip görünür ama güven sinyalini bozar. | Homepage `src/components/seo/HomePageSchema.tsx:103-114` | Sadece görünür FAQ bölümlerinde kullan. |
| "Çok yakında" sayfaları indeksletmek | Boş/hazırlanıyor sayfalar düşük kalite sinyali verir. | `/projeler` `src/app/[locale]/projeler/page.tsx:53-72`, blog boş EN olasılığı `content/blog/tr` dışında içerik yok | Hazır olmayan hub'ları noindex veya gerçek içerik ile yayına al. |

## 4. Eksikler

| Alan | Eksik | Etki | Öncelik |
|---|---|---|---|
| Canonical sistemi | Locale ve route bazlı tek kaynak yok. | Duplicate/canonical karmaşası | P0 |
| Sitemap | Gerçek `lastModified`, noindex filtreleme, DB blog/proje slug dahil etme doğrulanamadı. `getAllSlugs()` yalnızca MDX dosyalarını döndürüyor. | Eksik veya yanlış tarama | P0/P1 |
| Blog | EN MDX içerik klasörü/yazıları yok. | İngilizce GEO/SEO zayıf | P1 |
| Blog schema | `BlogPosting` yerine genel `Article`, `image` yok, `dateModified` her zaman `date`. | Rich result ve AI kaynak güveni zayıf | P1 |
| Landing canonical | Yerel landing sayfaları title/description veriyor ama canonical/hreflang özel değil. | Locale ve SERP sinyali zayıf | P1 |
| OG görseli | Homepage OG `/brand/dou-logo.png` gösteriyor; bu dosya public root listesinde görünmedi, `public/brand` içinde `dou-logo-dark.png`, `dou-logo-light.png`, `dou-logo.svg` var. | Sosyal paylaşım görseli kırılabilir veya logo oranı yetersiz olabilir | P1 |
| İç linkleme | Homepage hizmet kartları buton/drawer açıyor; hizmet detaylarına direkt link değil. | Hizmet detay crawl ve anchor sinyali zayıf | P2 |
| Analytics ölçüm planı | Search Console, GA4 event planı, dönüşüm eventleri repodan doğrulanamadı. | SEO kararları ölçümsüz kalır | P2 |
| `llms.txt` | Yok. | GEO için zorunlu değil ama AI crawler yönlendirmesi için faydalı olabilir | P3 |
| Canlı domain redirectleri | www/non-www, http/https, trailing slash davranışı repodan doğrulanamadı. | Canonical tutarlılık riski | P1, doğrulanamadı |

## 5. Doğru Uygulanmış Alanlar

| Alan | Neden iyi | Kanıt |
|---|---|---|
| Sayfa bazlı metadata | Ana sayfa, hizmet, iletişim, blog, landing sayfalarında title/description üretimi var. | `src/app/[locale]/page.tsx:35-94`, `src/app/[locale]/hizmetler/page.tsx:11-19`, `src/app/[locale]/blog/[slug]/page.tsx:34-44` |
| Locale prefix yapısı | TR default, EN `/en` prefix modeli temiz. | `src/i18n/routing.ts`, `src/lib/site.ts:27-31` |
| Structured data temeli | Organization, LocalBusiness, Service, FAQ, Breadcrumb, Article bileşenleri var. | `src/components/seo/*`, `src/components/blog/ArticleSchema.tsx:9-39` |
| Yerel işletme sinyalleri | NAP, adres, telefon, sosyal profiller config'te merkezi. | `src/config/site.ts:46-68`, `src/components/seo/OrganizationSchema.tsx:16-41` |
| Görünür FAQ ile schema uyumu bazı sayfalarda iyi | SSS sayfasında schema ve görünür `<details>` içerik aynı kaynaktan geliyor. | `src/components/sections/FAQSection.tsx:17-36`, `src/components/sections/FAQSection.tsx:41-72` |
| Performans korumaları | Particles ve Lenis düşük cihazlarda/devre dışı koşullarda kapanıyor. | `src/components/sections/HeroParticles.tsx:50-59`, `src/components/layout/SmoothScrollProvider.tsx:37-48` |
| Güvenlik header'ları | HSTS, nosniff, frame, referrer policy ve asset cache header'ları var. | `next.config.ts:28-57` |

## 6. Sayfa Bazlı Denetim Tablosu

| URL/route | Search intent | Title | Description | H1 | Canonical | Index | Schema | İç linkler | GEO uygunluğu | Sorunlar |
|---|---|---|---|---|---|---|---|---|---|---|
| `/` / `/en` | Marka + Denizli dijital ajans + hizmet keşfi | Özel metadata var | Özel metadata var | Hero i18n | Doğru görünüyor: `localizedUrl("/", locale)` | index | HomePageSchema + global Organization | Header/Footer, CTA, hizmetler | Orta | Görünmeyen FAQ schema; OG image yolu sorunlu; hero JS/video yükü |
| `/hakkimizda` | Ajans güveni, ekip, yaklaşım | Var | Var | Var | Layout'tan kök canonical miras riski | index | Global schema | Header/Footer/CTA | Orta | Sayfa özel canonical/hreflang yok |
| `/hizmetler` | Hizmet hub | Var | Var | Var | Layout'tan kök canonical miras riski | index | Global schema | ServicesHubGrid | İyi | Hub sayfa özel canonical/hreflang yok |
| `/hizmetler/[slug]` | Spesifik hizmet araması | Var | Var | Var | EN'de TR canonical hatası | index | Service + FAQ + Breadcrumb | İç bölümler, CTA | İyi | `alternatesFor()` TR canonical; ServiceSchema URL locale'siz |
| `/projeler` | Vaka çalışması keşfi | Var | Var | Var | Layout'tan kök canonical miras riski | index | Global schema | CTA | Zayıf | Sayfa "çok yakında"; sitemap vaka detaylarıyla çelişiyor |
| `/projeler/[slug]` | Vaka kanıtı/sonuç | Var | Var | Var | Layout'tan kök canonical miras riski | index | CaseStudy + Breadcrumb | Related/CTA | Orta-iyi | Hub hazır değil; DB projeleri sitemap'e giriyor mu doğrulanamadı |
| `/blog` | Blog hub | Var | Var | Var | Layout'tan kök canonical miras riski | index | Global schema | Blog kartları | Orta | EN içerik boş olabilir; SearchAction var ama arama yok |
| `/blog/[slug]` | Bilgilendirici içerik | Var | Var | Var | Eksik/yanlış miras riski | index | Article + Breadcrumb + opsiyonel FAQ | Related posts | Orta | Canonical/hreflang yok; sitemap alternates yok; `Article` daha zayıf |
| `/iletisim` | İletişim/yerel işletme | Var | Var | Var | Layout'tan kök canonical miras riski | index | LocalBusiness + global | Form, map, contact | İyi | Sayfa özel canonical/hreflang yok |
| `/sss` | FAQ / itiraz giderme | Var | Var | Var | Layout'tan kök canonical miras riski | index | FAQPage + global | CTA | İyi | Schema görünür içerikle uyumlu; canonical eksik |
| `/teklif-al` | Lead form / teklif | Var | Var | Var | Layout'tan kök canonical miras riski | index | Global schema | Form | Orta | Form sayfası indexlenmeli mi stratejik karar; reCAPTCHA global yükleniyor |
| `/dijital-checkup` | Lead magnet / analiz | Var | Var | Var | Layout'tan kök canonical miras riski | index | Global schema | Form | Orta | reCAPTCHA global; sayfa schema yok |
| `/audit` | AI sosyal medya analizi | Statik metadata | Statik description | AuditTool içinde doğrulanamadı | Layout'tan kök canonical miras riski | index | Global schema | Tool içi doğrulanamadı | Orta | Locale metadata yok; canonical eksik; ağır tool olasılığı |
| `/strateji-gorusmesi` | Randevu formu | Var | Var | Var | Sitemap'te var | noindex, nofollow | Global schema | Form | Düşük | noindex olduğu halde sitemap'te |
| `/denizli-sosyal-medya-ajansi` | Yerel SEO landing | Var | Var | Var | Layout'tan kök canonical miras riski | index | FAQ + LocalBusiness + global | CTA, vakalar | İyi | `SITE_URL` fallback `https://dousocial.com`, ana config `https://www.dousocial.com`; canonical yok |
| `/meta-ads-ajansi` | Hizmet landing | Var | Var | Var | Layout'tan kök canonical miras riski | index | FAQ + global | CTA, vakalar | İyi | canonical/hreflang yok |
| `/instagram-reklam-yonetimi` | Hizmet landing | Var | Var | Var | Layout'tan kök canonical miras riski | index | FAQ + global | CTA, vakalar | İyi | canonical/hreflang yok |
| `/dijital-pazarlama-ajansi` | Hizmet landing | Var | Var | Var | Layout'tan kök canonical miras riski | index | FAQ + global | CTA, vakalar | İyi | canonical/hreflang yok |
| `/gizlilik-politikasi`, `/kullanim-kosullari`, `/cerez-politikasi` | Legal trust | Var | Var | Var | EN'de TR canonical hatası | index | Global schema | Footer | Orta | `alternatesFor()` TR canonical; legal sayfaların indeks stratejisi net değil |
| `/yonetim/*`, `/admin/*` | Admin/auth | SEO intent yok | doğrulanamadı | doğrulanamadı | doğrulanamadı | robots disallow yok | Yok | Yok | Uygun değil | robots'ta engellenmeli; proxy koruması crawler sinyalinin yerine geçmez |

## 7. Uygulama Planı

### 1. Indexing / Canonical

1. `alternatesFor(path, locale)` yapısına geç.
2. Tüm indexlenebilir sayfalarda current-locale canonical üret.
3. Layout'taki root canonical'ın child page metadata'ya yanlış miras bırakmadığını test et.
4. Noindex sayfaları sitemap'ten çıkar.
5. Hazır olmayan sayfalar için index/noindex kararı ver: özellikle `/projeler`, form sayfaları ve admin/auth rotaları.

### 2. robots / sitemap

1. `robots.ts` içine `/yonetim/`, `/admin/`, gerekiyorsa `/api/`, preview/internal yolları ekle.
2. Sitemap'te noindex filtrelemesi yap.
3. `lastModified` için gerçek veri kaynağı kullan.
4. DB'den gelen yayınlanmış blog/proje slug'larının sitemap'e girip girmediğini netleştir. Şu an `getAllSlugs()` yalnızca MDX dosyalarını okuyor: `src/lib/blog.ts:160-162`.
5. Blog post alternates stratejisini netleştir: farklı slug varsa hreflang mapping tablosu gerekir; yoksa alternates eklenebilir.

### 3. Metadata

1. Tüm ana sayfa dışı route'lara canonical/hreflang ekle.
2. Blog ve proje detaylarında OG `url`, canonical, twitter image ve image alt bilgilerini tamamla.
3. Homepage OG görsel dosyasını gerçek 1200x630 marka/preview görseliyle değiştir. Mevcut `public/brand` içinde `dou-logo.png` görünmedi; kullanılan yol `src/app/[locale]/page.tsx:81`.
4. `keywords` metadata'sını kaldır veya etkisiz olduğunu kabul edip bakım yükünü azalt.
5. Landing sayfalarında `SITE_URL` fallback tutarlılığını düzelt: `www` ve non-www aynı olmamalı.

### 4. Structured Data

1. Homepage görünmeyen FAQPage schema'yı kaldır veya görünür FAQ bölümü ekle.
2. `SearchAction` yalnızca gerçek site içi arama varsa kalsın.
3. `ServiceSchema` locale-aware URL üretmeli.
4. Blog schema `BlogPosting` tipine taşınmalı; `image`, `dateModified`, `author`, `publisher`, `mainEntityOfPage` tam olmalı.
5. Schema graph ID'leri locale ve sayfa URL'siyle tutarlı hale getirilmeli.

### 5. Content / Search Intent

1. `/projeler` hub gerçek vaka listesine bağlanmalı veya noindex olmalı.
2. EN blog içerikleri eklenmeli ya da EN blog hub için strateji belirlenmeli.
3. Hizmet detay sayfaları için karar-verici odaklı özet, süreç, çıktı, fiyat/teklif beklentisi, SSS ve kanıt blokları korunmalı.
4. Yerel landing sayfalarında NAP, hizmet alanı, örnek sektörler, süreç ve ölçülebilir sonuçlar daha görünür hale getirilmeli.
5. Blog içeriklerine güncelleme tarihi ve kaynak/kanıt blokları eklenmeli.

### 6. Internal Linking

1. Homepage hizmet kartları yalnızca drawer açmak yerine ilgili `/hizmetler/[slug]` sayfalarına da link vermeli.
2. Landing sayfalarından ilgili hizmet detaylarına ve blog yazılarına bağlamlı anchor linkler eklenmeli.
3. Blog yazılarında hizmet sayfalarına doğal iç linkler artırılmalı.
4. Proje/vaka sayfaları hizmet sayfalarına ve teklif sayfasına bağlanmalı.
5. Footer ve header linkleri index stratejisiyle uyumlu tutulmalı.

### 7. Performance

1. reCAPTCHA global layout'tan çıkarılıp sadece form/tool sayfalarında yüklenmeli.
2. GA4/GTM tek consent kontrollü yoldan yüklenmeli.
3. Hero video için dosya boyutu, poster boyutu, preload ve mobile davranışı Lighthouse ile ölçülmeli.
4. Client-only hero, Framer Motion, Lenis ve particle canvas etkisi Web Vitals ile ölçülmeli.
5. `<img>` kullanılan görünür görsellerde uygun yerlerde `next/image` kullanılmalı; özellikle blog cover ve service gallery.

### 8. GEO İyileştirmeleri

1. Her önemli hizmet sayfasına kısa "AI summary" veya net cevap bölümü eklenebilir; görünür olmalı.
2. FAQ'lar görünür içerikle birebir eşleşmeli.
3. E-E-A-T için ekip, uzmanlık, metodoloji, ölçüm yaklaşımı, örnek sonuç, tarih ve yazar bilgileri güçlendirilmeli.
4. `llms.txt` opsiyonel olarak eklenebilir: önemli sayfalar, hizmetler, marka açıklaması ve iletişim bilgileri sade formatta sunulur.
5. İçeriklerde "kim için, hangi problem, hangi çıktı, hangi lokasyon, nasıl ölçülür" soruları açık cevaplanmalı.

### 9. Analytics / Measurement

1. Search Console doğrulaması repodan doğrulanamadı; canlı mülkte kontrol edilmeli.
2. GA4 event planı çıkarılmalı: form submit, WhatsApp click, call click, audit submit, quote submit, service drawer/detail click.
3. Consent sonrası page_view tekilleştirilmeli.
4. Core Web Vitals için Vercel Speed Insights veya GA4 web vitals eventleri kurulabilir.
5. Sitemap gönderimi, index coverage, canonical seçimi ve rich results periyodik izlenmeli.

## 8. A) Mutlaka Düzeltilmeli

1. Locale-aware canonical/hreflang sistemi.
2. `/strateji-gorusmesi` noindex/sitemap çelişkisi.
3. Sitemap `lastModified` gerçek veriyle üretimi.
4. Homepage görünmeyen FAQ schema.
5. Consent dışı/çift GA4 yüklemesi.
6. robots içinde admin/auth alanları.
7. `SearchAction` gerçek arama yoksa kaldırılması.
8. Service schema ve blog detay metadata URL tutarlılığı.
9. Projeler hub ile vaka detay/sitemap tutarsızlığı.
10. OG image yolunun ve 1200x630 paylaşım görselinin düzeltilmesi.

## 9. B) Faydalı Ama Opsiyonel

1. `llms.txt` eklemek.
2. Blog schema'yı `BlogPosting` seviyesinde zenginleştirmek.
3. EN blog içerik üretim planı.
4. Homepage hizmet kartlarını hem drawer hem detay sayfa linkiyle hibrit yapmak.
5. Landing sayfalarına görünür "kısa cevap" ve "kimler için" blokları.
6. Blog/proje içeriklerinde `updatedAt`, kaynakça ve uzman imzası.
7. Web Vitals ölçüm altyapısı.
8. Görsel optimizasyon için `next/image` geçişleri.
9. README ve `PROJECT_CONTEXT.md` güncellemesi; mevcut README varsayılan Next.js scaffold gibi duruyor, `PROJECT_CONTEXT.md` de bazı teknoloji/slug bilgilerinde güncel kodla çelişiyor.
10. Domain redirectleri, canlı robots/sitemap çıktısı ve Search Console indeks durumu canlı ortamda ayrıca doğrulanmalı.

## 10. Doğrulanamayanlar

| Konu | Durum |
|---|---|
| Canlı domain www/non-www yönlendirmesi | doğrulanamadı |
| HTTP -> HTTPS redirect | doğrulanamadı |
| Search Console mülk doğrulaması ve index coverage | doğrulanamadı |
| GA4 gerçek event/traffic verisi | doğrulanamadı |
| Core Web Vitals saha verisi | doğrulanamadı |
| Supabase yayınlanmış blog/proje kayıtları | doğrulanamadı |
| Canlı sitemap'in Google tarafından son okunma tarihi | doğrulanamadı |
| Rich Results Test çıktıları | doğrulanamadı |
| 404/410 canlı HTTP davranışı | doğrulanamadı |

