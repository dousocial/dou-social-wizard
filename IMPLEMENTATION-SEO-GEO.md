# SEO + GEO Uygulama Raporu

Tarih: 24 Haziran 2026  
Kapsam: `PLAN-SEO-GEO.md` içindeki doğrulanmış maddelerden, kullanıcının verdiği 1-9 uygulama sırası uygulandı. Kod commit/push yapılmadı.

## Uygulanan Plan Maddeleri

1. Locale canonical ve hreflang düzeltmesi.
2. Sitemap noindex URL ve `lastModified` düzeltmesi.
3. Görünmeyen homepage FAQ schema kaldırılması.
4. Analytics ve consent yüklemesinin tekilleştirilmesi.
5. `robots.txt` düzenlemesi ve `/_next/` disallow kontrolü.
6. Geçersiz `SearchAction` kaldırılması.
7. Service schema locale URL düzeltmesi.
8. Blog metadata ve canonical düzenlemesi.
9. Homepage OG/Twitter görsel yolu düzeltmesi.

## Değiştirilen Dosyalar

| Dosya | Yapılan değişiklik |
|---|---|
| `src/lib/site.ts` | `NOINDEX_PATHS` eklendi. `alternatesFor(path, locale)` current locale canonical üretecek şekilde güncellendi. |
| `src/app/[locale]/hizmetler/[slug]/page.tsx` | `alternatesFor()` çağrısına locale eklendi. `ServiceSchema` bileşenine locale gönderildi. |
| `src/app/[locale]/cerez-politikasi/page.tsx` | Legal sayfa canonical/hreflang helper çağrısına locale eklendi. |
| `src/app/[locale]/gizlilik-politikasi/page.tsx` | Legal sayfa canonical/hreflang helper çağrısına locale eklendi. |
| `src/app/[locale]/kullanim-kosullari/page.tsx` | Legal sayfa canonical/hreflang helper çağrısına locale eklendi. |
| `src/app/sitemap.ts` | Noindex path filtrelendi. Statik/service/case URL'lerinde yapay `new Date()` kaldırıldı. Blog URL'leri `getAllPosts()` üzerinden mevcut yayın tarihleriyle üretildi. |
| `src/components/seo/HomePageSchema.tsx` | Görünür olmayan homepage `FAQPage` JSON-LD bloğu kaldırıldı. |
| `src/app/[locale]/layout.tsx` | Consent dışı doğrudan GA4 scriptleri kaldırıldı. reCAPTCHA mevcut davranışı korunarak bırakıldı. |
| `src/components/analytics/Analytics.tsx` | GA ID kaynağı `NEXT_PUBLIC_GA_ID` yoksa `siteConfig.analytics.ga4Id` olacak şekilde tekilleştirildi. GTM varsa ayrıca GA4 gtag scripti yüklenmeyecek şekilde mükerrer page_view riski azaltıldı. |
| `src/app/robots.ts` | `/api/`, `/yonetim/`, `/admin/` disallow edildi. `/_next/` disallow kaldırıldı. |
| `src/components/seo/OrganizationSchema.tsx` | Gerçek blog araması olmadığı için `SearchAction` kaldırıldı. |
| `src/components/seo/ServiceSchema.tsx` | Service JSON-LD URL'si locale-aware `localizedUrl()` ile üretilir hale getirildi. |
| `src/app/[locale]/blog/[slug]/page.tsx` | Blog detay metadata'sına current-locale canonical ve OG `url` eklendi. Doğrulanmamış blog hreflang eşlemesi eklenmedi. |
| `src/app/[locale]/page.tsx` | Kırık `/brand/dou-logo.png` OG/Twitter görsel yolu, gerçekten mevcut `/brand/dou-logo-dark.png` ile değiştirildi ve boyut 1000x1000 olarak güncellendi. |

## Çalıştırılan Komutlar

| Komut | Sonuç |
|---|---|
| `pnpm exec tsc --noEmit` | Başarılı. |
| `pnpm lint` | Başarısız. 101 error / 14 warning. Hatalar mevcut plan dışı dosyalarda: admin linkleri, React lint kuralları, eski script `require()` kullanımı vb. |
| `pnpm build` | Başarılı. Next.js production build tamamlandı. |
| `pnpm exec next start -p 3100` | Geçici doğrulama server'ı açıldı, HTTP çıktıları kontrol edildi, sonra kapatıldı. |
| Node fetch doğrulama scriptleri | robots, sitemap, canonical, hreflang, JSON-LD ve analytics script varlığı kontrol edildi. |

## Test ve Build Sonuçları

### TypeScript

Başarılı. `pnpm exec tsc --noEmit` hata vermedi.

### Lint

Başarısız. Kalan hatalar uygulanan SEO/GEO değişikliklerinden kaynaklanmıyor ve plan dışında:

- `scripts/gen-kvkk.js`: `require()` import kuralı.
- `src/app/yonetim/**`: `<a>` yerine `Link` beklentileri ve React hook lint hataları.
- `src/components/layout/**`, `src/components/sections/**`, `src/hooks/**`: mevcut React lint/hook ve unescaped entity uyarıları.
- `src/app/[locale]/projeler/page.tsx`: `CasesHubGrid` kullanılmayan import uyarısı. Bu planın 1-9 sırasına dahil edilmediği için değiştirilmedi.

### Production Build

Başarılı. `pnpm build` derleme, TypeScript, page data collection ve static generation adımlarını tamamladı.

## Otomatik Doğrulamalar

| Kontrol | Sonuç |
|---|---|
| `/robots.txt` | `Disallow: /api/`, `/yonetim/`, `/admin/` var. `/_next/` disallow yok. |
| `/sitemap.xml` noindex kontrolü | `/strateji-gorusmesi` ve `/en/strateji-gorusmesi` yok. |
| `/sitemap.xml` `lastmod` kontrolü | Sadece blog kayıtlarında mevcut yayın tarihleri var. Build gününün tarihi otomatik basılmadı. |
| Homepage canonical | `/` canonical `https://www.dousocial.com`; `/en` canonical `https://www.dousocial.com/en`. |
| Hizmet canonical | `/hizmetler/meta-reklamlari` canonical TR URL; `/en/hizmetler/meta-reklamlari` canonical EN URL. |
| Hizmet hreflang | TR/EN/x-default alternates çıktı. |
| Service JSON-LD URL | TR sayfada TR URL, EN sayfada `/en/...` URL çıktı. |
| Homepage JSON-LD | `SearchAction` yok, görünmeyen `FAQPage` yok. |
| Blog detay canonical | Örnek TR blog yazısında kendi `/blog/[slug]` canonical'ı çıktı. |
| Blog hreflang | Doğrulanmamış karşılık olmadığı için eklenmedi. |
| OG/Twitter görsel | Homepage `og:image` ve `twitter:image` `/brand/dou-logo-dark.png` olarak çıktı; asset HTTP 200 döndü. |
| Consent öncesi analytics | Server HTML içinde `googletagmanager.com/gtag/js` çıkmadı. |

## Manuel Kontroller

Otomatik olarak doğrulanamayan ve canlı ortamda yapılması gereken kontroller:

- Search Console URL Inspection ile TR/EN hizmet sayfalarında user-declared canonical ve Google-selected canonical kontrolü.
- Search Console Sitemaps bölümünde yeni sitemap gönderimi ve “Submitted URL marked noindex” durumunun izlenmesi.
- Rich Results Test ile homepage, hizmet detay ve blog detay JSON-LD doğrulaması.
- Tag Assistant / GA4 DebugView ile consent kabulünden sonra tek page_view oluştuğunun canlı doğrulaması.
- GTM container kullanılıyorsa GTM içinde ayrıca GA4 page_view tetiklenip tetiklenmediğinin kontrolü.
- Facebook Sharing Debugger, X Card Validator ve LinkedIn Post Inspector ile homepage preview görseli kontrolü.

## Atlanan veya Uygulanmayan Maddeler

| Madde | Durum | Gerekçe |
|---|---|---|
| Projeler hub ve vaka sitemap tutarsızlığı | Atlandı | Kullanıcının verdiği uygulama sırası 1-9 içinde yoktu. Ayrıca `/projeler` görünür sayfa içeriğini değiştirmek mevcut tasarım/sayfa içeriğini değiştirmeme kuralıyla çakışabilir. |
| Global reCAPTCHA script yükü | Atlandı | Kullanıcının verdiği uygulama sırası 1-9 içinde yoktu. reCAPTCHA davranışı bozulmasın diye mevcut global yükleme korunmuştur. |
| Blog hreflang eşlemesi | Atlandı | Blog yazılarının karşı locale slug eşleşmesi doğrulanamadı. Kullanıcı talimatı gereği tahminle hreflang bağlanmadı. |
| Statik/service/case `lastModified` tarihleri | Atlandı | Doğrulanmış güncelleme tarihi yok. Yapay veya build sırasında değişen tarih yazmamak için bu URL'lerde `lastModified` alanı kullanılmadı. |

