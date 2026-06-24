# SEO + GEO Uygulama Planı

Hazırlanma tarihi: 24 Haziran 2026  
Kapsam: `AUDIT-SEO-GEO.md` tekrar kontrol edildi. Bu plan yalnızca kritik/yüksek öncelikli ve kodda doğrudan kanıtlanan sorunları içerir. Şimdilik kod değişikliği yapılmadı.

## Plan Dışı Bırakılan Denetim Maddeleri

Aşağıdaki maddeler bu uygulama planına alınmadı; çünkü kritik/yüksek öncelikli doğrudan hata değil, canlı ortamdan doğrulama istiyor veya faydalı ama opsiyonel seviyede:

- `llms.txt` ekleme.
- Genel E-E-A-T, içerik kalitesi, kaynakça ve blog içerik üretim önerileri.
- `meta keywords` kaldırma. Kanıtlı ama kritik/yüksek etki değil.
- Genel `next/image` geçişleri. Faydalı performans işi ama doğrudan kanıtlanmış kritik SEO/GEO hatası değil.
- Canlı domain redirectleri, Search Console kapsam raporları, Core Web Vitals saha verisi. Repodan doğrulanamıyor.
- DB'deki yayınlanmış Supabase blog/proje kayıtları. Yerel koddan varlığı doğrulanamıyor.

## 1. Locale Canonical / Hreflang Hatası

**Öncelik:** Kritik  
**Kanıt:** `src/lib/site.ts:33-42` içindeki `alternatesFor()` canonical'ı her zaman `localizedUrl(cleanPath, "tr")` yapıyor. Bu helper `src/app/[locale]/hizmetler/[slug]/page.tsx:35` ve legal sayfalarda kullanılıyor: `src/app/[locale]/cerez-politikasi/page.tsx:14`, `src/app/[locale]/gizlilik-politikasi/page.tsx:14`, `src/app/[locale]/kullanim-kosullari/page.tsx:14`.

| Başlık | Plan |
|---|---|
| Değişecek dosyalar | `src/lib/site.ts`, `src/app/[locale]/hizmetler/[slug]/page.tsx`, `src/app/[locale]/cerez-politikasi/page.tsx`, `src/app/[locale]/gizlilik-politikasi/page.tsx`, `src/app/[locale]/kullanim-kosullari/page.tsx` |
| Yapılacak değişiklik | `alternatesFor(path, locale)` imzasına geçilecek. Canonical current locale URL olacak; `tr-TR`, `en-US`, `x-default` hreflang değerleri korunacak. Çağıran sayfalar `locale` parametresini helper'a verecek. |
| Gerekçe | İngilizce hizmet/legal sayfalarının TR URL'yi canonical göstermesi indeksleme ve hreflang sinyallerini çelişkili hale getirir. |
| Olası yan etkiler | Helper imzası değişeceği için tüm kullanımlar güncellenmezse TypeScript/build hatası oluşur. Mevcut indexlenmiş URL'lerde canonical değişimi Search Console'da kısa süreli yeniden değerlendirme yaratabilir. |
| Test yöntemi | `pnpm build`; yerelde `/en/hizmetler/meta-reklamlari` ve `/en/gizlilik-politikasi` HTML çıktısında canonical'ın `/en/...` olduğunu kontrol et; TR sayfalarda canonical'ın prefixsiz kaldığını kontrol et. |
| Geri alma yöntemi | `alternatesFor()` imzasını ve çağrıları önceki haline döndür; sadece bu dosyalardaki patch geri alınır. |
| Manuel kontroller | Search Console URL Inspection ile bir TR ve bir EN hizmet sayfasında “User-declared canonical” ve “Google-selected canonical” kontrol edilmeli. International targeting/hreflang uyarıları takip edilmeli. |

## 2. Sitemap İçinde Noindex Sayfa ve Oynak `lastModified`

**Öncelik:** Kritik  
**Kanıt:** `/strateji-gorusmesi`, `src/lib/site.ts:13` içinde `STATIC_PATHS` listesinde. Sitemap statik yolları doğrudan yayıyor: `src/app/sitemap.ts:28-38`. Aynı sayfa `robots: { index: false, follow: false }` kullanıyor: `src/app/[locale]/strateji-gorusmesi/page.tsx:18`. Sitemap ayrıca tüm URL'lerde `const now = new Date()` değerini kullanıyor: `src/app/sitemap.ts:24`, `src/app/sitemap.ts:33`, `src/app/sitemap.ts:47`, `src/app/sitemap.ts:61`, `src/app/sitemap.ts:75`.

| Başlık | Plan |
|---|---|
| Değişecek dosyalar | `src/lib/site.ts`, `src/app/sitemap.ts` |
| Yapılacak değişiklik | Noindex statik yollar sitemap üretiminden çıkarılacak. `lastModified` için tek `new Date()` yerine kontrollü tarih kaynağı kullanılacak: statik rotalar için sabit/haritalanmış tarih, blog MDX için frontmatter tarihi, servis/vaka statikleri için belirlenmiş sabit tarih. |
| Gerekçe | Sitemap indexlenebilir URL listesi olmalı. Noindex URL göndermek ve bütün siteyi her üretimde yeni göstermek crawler güvenini ve Search Console kapsamını bozar. |
| Olası yan etkiler | Sitemap URL sayısı azalır. `lastModified` tarihleri daha eski görüneceği için Google bazı sayfaları daha az sıklıkta tarayabilir; bu beklenen ve daha doğru davranıştır. |
| Test yöntemi | `pnpm build`; `/sitemap.xml` çıktısında `/strateji-gorusmesi` ve `/en/strateji-gorusmesi` olmadığını kontrol et; `lastmod` değerlerinin her URL için anlık timestamp olmadığını doğrula. |
| Geri alma yöntemi | `STATIC_PATHS` ve sitemap tarih üretimi önceki haline alınır. |
| Manuel kontroller | Search Console > Sitemaps bölümünde yeni sitemap gönderilmeli; Coverage/Page indexing tarafında “Submitted URL marked noindex” uyarısının temizlenmesi izlenmeli. |

## 3. Homepage Görünmeyen FAQ Schema

**Öncelik:** Kritik  
**Kanıt:** FAQ soru-cevapları yalnızca `src/components/seo/HomePageSchema.tsx:15-28` içinde tanımlı. `rg` ile aynı soruların görünür içerikte başka yerde olmadığı doğrulandı. Schema `FAQPage` olarak `src/components/seo/HomePageSchema.tsx:103-114` içinde üretiliyor ve homepage'de render ediliyor: `src/app/[locale]/page.tsx:103`.

| Başlık | Plan |
|---|---|
| Değişecek dosyalar | `src/components/seo/HomePageSchema.tsx`; gerekiyorsa `src/app/[locale]/page.tsx` |
| Yapılacak değişiklik | En güvenli minimal değişiklik: homepage JSON-LD graph içinden `FAQPage` bölümü kaldırılacak. Alternatif olarak aynı sorular görünür bir FAQ bölümünde render edilecekse schema korunabilir; fakat ilk uygulama için kaldırma tercih edilecek. |
| Gerekçe | Structured data, görünür sayfa içeriğiyle eşleşmeli. Görünmeyen FAQ, rich result ve GEO güven sinyalini riske atar. |
| Olası yan etkiler | Homepage FAQ rich result alma ihtimali azalır; ancak görünür olmayan schema riskinden çıkılır. |
| Test yöntemi | `pnpm build`; homepage HTML içinde `FAQPage` schema kalmadığını, `WebPage` ve `ProfessionalService` graph parçalarının bozulmadığını kontrol et. |
| Geri alma yöntemi | `FAQ` sabiti ve `FAQPage` graph objesi eski haline eklenir veya görünür FAQ bölümüyle birlikte geri getirilir. |
| Manuel kontroller | Rich Results Test ile homepage test edilmeli; “FAQPage” çıkmamalı, Organization/WebPage tarafında hata olmamalı. |

## 4. Consent Dışı / Çift Analytics Yüklenmesi

**Öncelik:** Yüksek  
**Kanıt:** Layout doğrudan GA4 scriptini yüklüyor: `src/app/[locale]/layout.tsx:132-142`. Aynı ağaçta `ConsentManager` var: `src/app/[locale]/layout.tsx:129`. Consent granted olduğunda `Analytics` render ediliyor: `src/components/analytics/ConsentManager.tsx:34`. `Analytics` ayrıca GA4/GTM/Meta Pixel yükleyebiliyor: `src/components/analytics/Analytics.tsx:14-71`.

| Başlık | Plan |
|---|---|
| Değişecek dosyalar | `src/app/[locale]/layout.tsx`, `src/components/analytics/ConsentManager.tsx`, `src/components/analytics/Analytics.tsx`, gerekirse `src/config/site.ts` |
| Yapılacak değişiklik | Layout'taki doğrudan GA4 `<Script>` blokları kaldırılacak. Analytics yüklemesi tek yol olarak `ConsentManager` üzerinden yapılacak. GA ID kaynağı tekilleştirilecek: `siteConfig.analytics.ga4Id` veya `NEXT_PUBLIC_GA_ID` seçeneklerinden biri kullanılacak. |
| Gerekçe | Kullanıcı izin vermeden analytics script yüklenmemeli. Ayrıca iki farklı GA4 yükleme yolu page_view ve dataLayer tarafında çift ölçüm riski yaratıyor. |
| Olası yan etkiler | Ortam değişkeni/config uyumsuzsa analytics hiç yüklenmeyebilir. Eski doğrudan GA4 akışı kaldırıldığı için mevcut raporlama kısa süreli düşüş gösterebilir; bu doğru consent davranışının sonucudur. |
| Test yöntemi | `pnpm build`; tarayıcıda consent reddedildiğinde Google/Meta scriptlerinin yüklenmediğini Network sekmesinden kontrol et; consent kabul edildiğinde tek GA/GTM yüklemesi olduğunu kontrol et. |
| Geri alma yöntemi | Layout'taki eski GA4 script blokları geri eklenir ve ConsentManager içindeki analytics render davranışı önceki haline alınır. |
| Manuel kontroller | GA4 Realtime'da tek page_view görülmeli. Consent reddi senaryosunda GA4 DebugView'a event düşmemeli. Tag Assistant ile duplicate tag/page_view kontrol edilmeli. |

## 5. robots.txt Admin/Auth Alanlarını Engellemiyor

**Öncelik:** Yüksek  
**Kanıt:** `src/app/robots.ts:8-10` yalnızca `/api/` ve `/_next/` yollarını disallow ediyor. Admin/yonetim alanı ayrı route ve proxy ile korunuyor; ancak robots sinyali yok.

| Başlık | Plan |
|---|---|
| Değişecek dosyalar | `src/app/robots.ts` |
| Yapılacak değişiklik | `disallow` listesine `/yonetim/`, `/admin/` ve gerekiyorsa auth/setup/panel alt yolları eklenecek. |
| Gerekçe | Admin ve auth URL'leri SEO intent taşımaz; crawl noise ve gereksiz URL keşfini azaltmak gerekir. Proxy koruması robots sinyalinin yerine geçmez. |
| Olası yan etkiler | Admin sayfalarının arama motoru tarafından taranması engellenir; zaten istenen davranıştır. `/api/` mevcut disallow korunur. |
| Test yöntemi | `pnpm build`; `/robots.txt` çıktısında yeni disallow satırlarını kontrol et. |
| Geri alma yöntemi | `disallow` listesi önceki `["/api/", "/_next/"]` haline döndürülür. |
| Manuel kontroller | Search Console robots.txt Tester veya URL Inspection canlı test ile `/yonetim/giris` ve `/admin` yollarının robots tarafından engellendiği doğrulanmalı. |

## 6. Geçersiz WebSite `SearchAction`

**Öncelik:** Yüksek  
**Kanıt:** `src/components/seo/OrganizationSchema.tsx:51-57` içinde `SearchAction` hedefi `${SITE_URL}/blog?q={search_term_string}`. Kod tabanında blog hub için `searchParams` veya `q` query işleyen bir rota yok; `src/app/[locale]/blog/page.tsx` yalnızca `getAllPosts(locale)` ile liste render ediyor.

| Başlık | Plan |
|---|---|
| Değişecek dosyalar | `src/components/seo/OrganizationSchema.tsx`; arama uygulanacaksa ayrıca `src/app/[locale]/blog/page.tsx` |
| Yapılacak değişiklik | İlk güvenli uygulama: `SearchAction` kaldırılacak. Site içi arama gerçekten istenirse `/blog?q=` destekleyen filtreleme sonradan ayrıca eklenecek ve o zaman schema geri konacak. |
| Gerekçe | Structured data var olmayan bir site içi arama aksiyonunu ilan ediyor. Bu, zengin sonuç ve AI crawler güvenilirliği açısından yanlış sinyaldir. |
| Olası yan etkiler | WebSite schema sadeleşir; sitelinks search box olasılığı azalır. Gerçek arama olmadığı için bu kayıp pratikte beklenen davranıştır. |
| Test yöntemi | `pnpm build`; homepage HTML JSON-LD içinde `SearchAction` kalmadığını ve Organization/WebSite JSON-LD'nin geçerli JSON olduğunu kontrol et. |
| Geri alma yöntemi | `potentialAction` bloğu eski haliyle geri eklenir veya gerçek arama implementasyonu sonrası güncel hedefle eklenir. |
| Manuel kontroller | Rich Results Test ve Schema Markup Validator ile WebSite/Organization schema hatasız doğrulanmalı. |

## 7. Service Schema Locale URL Uyumsuzluğu

**Öncelik:** Yüksek  
**Kanıt:** `src/components/seo/ServiceSchema.tsx:20` URL'yi `${SITE_URL}/hizmetler/${slug}` olarak sabit üretiyor. Bu bileşen `src/app/[locale]/hizmetler/[slug]/page.tsx:61-65` içinde locale bilgisi verilmeden render ediliyor.

| Başlık | Plan |
|---|---|
| Değişecek dosyalar | `src/components/seo/ServiceSchema.tsx`, `src/app/[locale]/hizmetler/[slug]/page.tsx` |
| Yapılacak değişiklik | `ServiceSchema` bileşenine `locale` prop'u eklenecek ve URL `localizedUrl(`/hizmetler/${slug}`, locale)` ile üretilecek. Çağrı tarafı mevcut `locale` parametresini prop olarak geçecek. |
| Gerekçe | EN hizmet sayfasındaki JSON-LD, sayfanın gerçek `/en/...` URL'siyle eşleşmeli. |
| Olası yan etkiler | TypeScript prop imzası değişeceği için çağrı güncellenmezse build hatası verir. |
| Test yöntemi | `pnpm build`; `/en/hizmetler/meta-reklamlari` HTML JSON-LD içinde Service `url` değerinin `/en/hizmetler/meta-reklamlari` olduğunu kontrol et. |
| Geri alma yöntemi | `locale` prop'u kaldırılır ve URL eski sabit `SITE_URL` yapısına döndürülür. |
| Manuel kontroller | Rich Results Test ile TR ve EN hizmet detay sayfaları ayrı ayrı test edilmeli; structured data URL'leri sayfa URL'siyle uyumlu olmalı. |

## 8. Blog Detay Metadata ve Sitemap Alternates Eksikliği

**Öncelik:** Yüksek  
**Kanıt:** Blog detay `generateMetadata()` yalnızca `title`, `description` ve opsiyonel `openGraph.images` döndürüyor: `src/app/[locale]/blog/[slug]/page.tsx:34-44`. Sitemap blog URL'lerini alternates olmadan ekliyor: `src/app/sitemap.ts:69-78`. Blog slugs yorumda locale bazlı farklı kabul edilmiş: `src/app/sitemap.ts:69`.

| Başlık | Plan |
|---|---|
| Değişecek dosyalar | `src/app/[locale]/blog/[slug]/page.tsx`, `src/app/sitemap.ts`, gerekirse `src/lib/blog.ts` |
| Yapılacak değişiklik | Blog detay metadata'ya current locale canonical ve OG `url` eklenecek. Hreflang sadece eşleşen çeviri slug haritası güvenilir biçimde varsa eklenecek; yoksa yanlış alternates eklenmeyecek. Sitemap blog entries için en azından doğru `lastModified` uygulanacak; çeviri eşleşmesi olmadan hreflang üretilmeyecek. |
| Gerekçe | Blog detay URL'lerinin kendi canonical/OG URL sinyali açık olmalı. Farklı locale slug'lar için yanlış hreflang üretmekten kaçınmak gerekir. |
| Olası yan etkiler | Çeviri slug haritası yoksa blog yazılarında hreflang eksik kalır; bu yanlış hreflang'den daha güvenlidir. |
| Test yöntemi | `pnpm build`; bir TR blog yazısı HTML çıktısında canonical'ın kendi `/blog/[slug]` URL'si olduğunu kontrol et; sitemap blog URL'lerinin geçerli olduğunu kontrol et. |
| Geri alma yöntemi | Blog metadata değişiklikleri eski title/description/OG image yapısına döndürülür. |
| Manuel kontroller | Search Console URL Inspection ile örnek blog yazısında canonical kontrol edilmeli. Rich Results Test ile Article schema ayrıca test edilmeli. |

## 9. Homepage OG/Twitter Görsel Yolu Kırık

**Öncelik:** Yüksek  
**Kanıt:** Homepage metadata OG/Twitter image olarak `/brand/dou-logo.png` kullanıyor: `src/app/[locale]/page.tsx:81`, `src/app/[locale]/page.tsx:92`. `public/brand` klasöründe yalnızca `dou-logo.svg`, `dou-logo-dark.png`, `dou-logo-light.png` var; `dou-logo.png` yok.

| Başlık | Plan |
|---|---|
| Değişecek dosyalar | `src/app/[locale]/page.tsx`; gerekirse `public/brand/` veya `public/og/` altında yeni gerçek OG görsel dosyası |
| Yapılacak değişiklik | Metadata image yolu mevcut bir dosyaya alınacak veya yeni 1200x630 OG görseli eklenecek. Twitter image aynı yolla uyumlu olacak. |
| Gerekçe | Kırık OG/Twitter görseli sosyal paylaşım, link preview ve AI/crawler medya sinyallerini bozar. |
| Olası yan etkiler | Yeni görsel eklenirse repo boyutu artar. Mevcut logo dosyası kullanılırsa 1200x630 oranı sağlanmayabilir; en doğru çözüm özel OG görselidir. |
| Test yöntemi | `pnpm build`; metadata çıktısında image URL'nin var olan asset'e işaret ettiğini kontrol et; tarayıcıda `/brand/...` veya `/og/...` görsel URL'si 200 dönmeli. |
| Geri alma yöntemi | Metadata image alanları önceki `/brand/dou-logo.png` değerine döndürülür veya eklenen görsel kaldırılır. |
| Manuel kontroller | Facebook Sharing Debugger, X Card Validator ve LinkedIn Post Inspector ile preview görseli kontrol edilmeli. |

## 10. Projeler Hub ve Vaka Sitemap Tutarsızlığı

**Öncelik:** Yüksek  
**Kanıt:** `/projeler` sayfası `CasesHubGrid` import ediyor ama render etmiyor: `src/app/[locale]/projeler/page.tsx:8`, `src/app/[locale]/projeler/page.tsx:53-72` içinde "Projelerimiz hazırlanıyor" mesajı var. Buna karşılık `CASE_SLUGS` 5 vaka slug'ı tanımlıyor: `src/lib/cases.ts:1-7` ve sitemap bunları yayıyor: `src/app/sitemap.ts:55-66`.

| Başlık | Plan |
|---|---|
| Değişecek dosyalar | `src/app/[locale]/projeler/page.tsx`; gerekirse `src/app/sitemap.ts` |
| Yapılacak değişiklik | Öncelikli çözüm: `/projeler` hub'da `CasesHubGrid` render edilerek vaka listesi görünür hale getirilecek. Eğer vaka içerikleri yayına hazır değilse alternatif olarak `CASE_SLUGS` sitemap üretiminden çıkarılacak ve hub noindex stratejisi değerlendirilecek. |
| Gerekçe | Sitemap detay vaka URL'lerini ilan ederken hub sayfanın "çok yakında" demesi kullanıcı, crawler ve GEO güven sinyalini zayıflatır. |
| Olası yan etkiler | `CasesHubGrid` render edildiğinde i18n mesajları veya görsel/veri bağımlılıkları eksikse runtime/build hatası çıkabilir; bu nedenle önce component bağımlılıkları kontrol edilmeli. |
| Test yöntemi | `pnpm build`; `/projeler` ve `/en/projeler` sayfalarında vaka kartlarının göründüğünü veya sitemap'ten vaka URL'lerinin çıkarıldığını kontrol et. |
| Geri alma yöntemi | Hub sayfası önceki "çok yakında" bloğuna döndürülür veya sitemap vaka üretimi eski haline alınır. |
| Manuel kontroller | Search Console URL Inspection ile `/projeler` ve örnek `/projeler/[slug]` sayfalarının indexlenebilirliği kontrol edilmeli. Rich Results Test ile vaka detayındaki CaseStudy/Article schema doğrulanmalı. |

## 11. Global reCAPTCHA Script Yükü

**Öncelik:** Yüksek  
**Kanıt:** reCAPTCHA scripti tüm locale layout'ta yükleniyor: `src/app/[locale]/layout.tsx:143-147`. reCAPTCHA yalnızca bazı formlar ve audit akışı tarafından kullanılıyor; örnekler `src/components/forms/ContactForm.tsx`, `src/components/audit/AuditTool.tsx`, `src/lib/actions/forms.ts`, `src/app/api/audit/route.ts`.

| Başlık | Plan |
|---|---|
| Değişecek dosyalar | `src/app/[locale]/layout.tsx`, reCAPTCHA kullanan form/tool bileşenleri: `src/components/forms/ContactForm.tsx`, `src/components/audit/AuditTool.tsx`; gerekirse diğer form bileşenleri |
| Yapılacak değişiklik | Global reCAPTCHA `<Script>` layout'tan kaldırılacak. Script yalnızca reCAPTCHA token isteyen form/tool bileşenlerinde lazy olarak yüklenecek veya ilgili sayfa/layout seviyesine taşınacak. |
| Gerekçe | Form olmayan sayfalarda Google reCAPTCHA script yükü performans ve gizlilik maliyeti yaratıyor. Kullanıcı daha önce donma problemleri bildirdiği için doğrudan kanıtlı yüksek öncelikli performans işidir. |
| Olası yan etkiler | Form submit öncesi `window.grecaptcha` hazır olmazsa token üretimi boş dönebilir. Script yükleme durumu form UX'inde ele alınmalı. |
| Test yöntemi | `pnpm build`; form olmayan homepage'de Network sekmesinde reCAPTCHA yüklenmediğini kontrol et; iletişim/audit form submit akışında token üretildiğini ve API'nin recaptcha doğrulamasını geçtiğini kontrol et. |
| Geri alma yöntemi | Layout'taki eski reCAPTCHA `<Script>` bloğu geri eklenir; component-level script yükleme geri alınır. |
| Manuel kontroller | PageSpeed Insights/Lighthouse ile ana sayfada üçüncü parti JS azalması kontrol edilmeli. Form submit sonrası canlı loglarda recaptcha başarısızlığı olup olmadığı izlenmeli. |

