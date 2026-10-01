# DOU Social web sitesi ve pazarlama analizi

1 Ekim 2026 tarihinde dousocial.com ve dousocial/dou-social-wizard reposu incelendi. Amaç, verilen 17 başlıklı checklist doğrultusunda teklif üreten bir site kurmak, gereksiz indekslenen sayfaları temizlemek ve reklam yönetimi ile Denizli çekim hizmetlerini genişletmek. Teknik temel mevcut; öncelik yeni blog sayısından önce güvenlik, doğru indeksleme ve gerçek başvuru kaydıdır.

Bu rapor ilk incelemenin bulgularını ve sonraki uygulamaları birlikte tutar. Önceki bölümlerdeki ilk durum ifadeleri tarihsel bulgulardır; güncel Search Console, görsel ve checklist durumu son bölümde açıklanır. Kod değişiklikleri Vercel üzerinden canlıya alınır. GA4 dönüşüm teslimi, Supabase yönetimi ve gerçek müşteri satışları bu çalışmada doğrulanmadı. Haziran tarihli AUDIT-SEO-GEO.md tarihsel bir rapordur.

## Doğrulanan mevcut durum

- Next.js 16.2.4, React 19.2.4, next-intl ile Türkçe ve İngilizce sayfalar, Supabase ve yönetim paneli mevcut.
- Blog sıfırdan kurulmayacak. Repoda 4 Türkçe MDX yazısı, DB üzerinden yayınlanmış yazıları birleştiren okuyucu ve yönetim panelinde blog oluşturma/düzenleme mevcut. Canlı sitemap 6 Türkçe blog yazısı içeriyor; 2 ek yazının DB'den gelmesi olasıdır, kayıtların kendisi incelenmedi.
- Canlı sitemap'teki 60 adresin tamamı 200 döndü ve HTML içinde birer H1 bulundu. Bu, görsel kalite veya içerik yeterliliğini tek başına kanıtlamaz. Site içinden keşfedilen 14 ek adres ve kök adresin sondaki slash varyasyonu da 200 döndü.
- /projeler ve /en/projeler içerik yerine “Çok Yakında” gösteriyor. /en/blog yazısız. Bunların HTTP 200 olması aramada yer almalarını uygun kılmaz.
- Sitemap'teki 22 URL'nin canonical etiketi kendi URL'si yerine dilin ana sayfasına gidiyor. Ek kontrol edilen /sss ve /audit adreslerinde de aynı miras sorunu var.
- Rastgele olmayan sayfa, blog, hizmet ve onay tokenı için denenen adresler 404 döndü. Bulunmayan tüm adreslerin eksiksiz envanteri çıkarılmış değildir; Search Console'daki geçmiş URL listesi ayrıca gerekir.
- HTTP bağlantısı HTTPS'e 308 ile, HTTPS non-www adresi www'ye 307 ile yönleniyor. Alan adı birleştirme için kalıcı 308 tercih edilmeli; bu Vercel/domain ayarıdır.
- /yonetim/giris canlı HTML'inde noindex yoktu. robots.txt engeli tek başına arama sonuçlarından kaldırma garantisi vermez.

Kanıt dosyaları docs/audit-evidence altında saklandı. Kontroller tek zamanlı HTTP ölçümüdür; tüm cihazlarda tarayıcı testi yapılmış sayılmaz.

## İlk incelemede bulunan sorunlar

Aşağıdaki tablo ilk incelemenin bulgularını korur. Son uygulama durumu belgenin son bölümündedir.

| Öncelik | Bulgu ve kanıt | Yapılacak iş |
|---|---|---|
| P0 | pnpm audit --prod çıktısında 3 kritik, 27 yüksek, 18 orta ve 4 düşük bulgu var | Next.js ve etkilenen doğrudan/dolaylı paketlerin güvenli sürümlerini incele; ayrı güncelleme ve regresyon kontrolü yap. Sayılar bağımlılık taramasına aittir, kanıtlanmış istismar sayısı değildir. |
| P0 | src/lib/actions/forms.ts içinde teklif ve görüşme işlemleri console.log sonrası success dönüyor | Teklif akışını DB/CRM kaydı ve hata durumuyla tamamla. Kişisel veriyi loglamayı bırak. Görüşme formu bu çalışmada kullanıcı isteğiyle kaldırıldı. |
| P1 | Boş projeler ve İngilizce blog sitemap'te/indexlenebilir | Bu çalışmada noindex ve sitemap temizliği uygulandı. İçerik yayınlanınca proje sayfası için karar yeniden değerlendirilmeli. |
| P1 | Sayfa canonical'ları ana sayfayı işaret ediyor | Ana hizmet, iletişim, blog, açılış ve diğer incelenen sayfalara kendi canonical'ları eklendi. /audit için sonraki ücretsiz analiz çalışmasında dil ve metadata düzenlemesi gerekir. |
| P1 | Blog DB listesi ile detayının yayın şartları tam aynı değil | Başlıksız veya içeriği boş kayıtlar artık listeye alınmıyor ve boş detay bulunamıyor. DB detay sorgusuna published_at tutarlılığı ayrıca eklenmeli. |
| P1 | Bellek içi rate limiter çoklu production instance arasında paylaşılmıyor | Sunucu tarafında ortak rate limit deposu; login ve API limitlerinin ayrıca doğrulanması. |
| P2 | İngilizce blog hero ve boş durum yazıları Türkçe; kapaklar img kullanıyor | Gerçek İngilizce içerik, çeviri anahtarları, boyutlandırılmış next/image görselleri. |
| P2 | Blog ilgili yazılar yalnızca listeden ilk üç farklı yazı | Konu/hizmet etiketlerine göre alakalı yazı ve hizmet bağlantısı. |

## Checklist değerlendirmesi

“Var” bir dosyanın veya kod yolunun bulunduğunu ifade eder; dış servis ayarları ve üretim etkinliği ayrıca doğrulanmalıdır.

| Checklist alanı | Doğrulanan temel | Eksik veya ayrıca doğrulanacak |
|---|---|---|
| 1 Teknik altyapı | HTTPS, sitemap, robots, not-found, dil ayarı, Git, env ignore | Non-www kalıcı redirect; tüm 500 durumları; staging/prod ayrımı; secret geçmiş taraması |
| 2 Frontend | Responsive sınıflar, mobil menü, form bekleme/hata/başarı durumları | 320px, tablet ve farklı cihazlar üzerinde gerçek kullanım testi |
| 3 Performans | Next image AVIF/WebP ayarı, next/font, lazy blog görselleri, hero video yaklaşık 1.5 MB | Lighthouse ve LCP/CLS/INP ölçümü; 75. yüzdelik saha verisi; animasyon ve üçüncü parti maliyeti |
| 4 SEO | Sayfa metadata'ları, Service/Article/Breadcrumb/Organization/FAQ bileşenleri | Canonical düzeltmelerinin canlı doğrulaması, DB projelerin index stratejisi, kaynaklı başlık ve içerik |
| 5 GEO ve AI search | Denizli merkezli marka ve hizmet tanımları, iletişim bilgileri, yapılandırılmış veri | Kanıtlı uzmanlık, gerçek vaka ve sonuçlar, yazar/güncelleme bilgisi, içerik-schema tutarlılığı |
| 6 Analytics | GA4 ID; GTM/Meta Pixel opsiyonları; trackEvent yardımcısı | Gerçek event teslimi, Search Console doğrulaması, formdan nitelikli lead'e kadar ölçüm |
| 7 Güvenlik | HSTS, nosniff, referrer policy, oturum imzası, izin kontrolleri | Audit bulguları; CSP uygulaması; API/auth kapsamı; log hijyeni; paylaşımlı rate limit |
| 8 Backend | Server Actions, Supabase ve API uçları | Tüm formlarda kalıcı kayıt, zaman aşımı, tutarlı kullanıcı hatası, operasyon logları |
| 9 Database | SQL ve migration dosyaları mevcut | Production RLS, indeks, yedekleme/geri yükleme, saklama süreleri; canlı DB denetlenmedi |
| 10 UX | Hizmet ve iletişim sayfaları, WhatsApp/telefon, teklifler | Boş menü hedefleri, net hizmet başlıkları, mobil form sürtünmesi, gerçek kullanıcı testi |
| 11 Accessibility | Semantik bölümler, atlama bağlantısı, reduced-motion korumaları | Klavye ve ekran okuyucu, kontrast, tüm form label/ARIA denetimi; AA uygunluğu onaylanmadı |
| 12 Cookie ve KVKK | Politikalar, izin kutuları, izin sonrası Analytics render | İzni sonradan değiştirme/geri çekme akışı; kategori tercihi; gerçek veri işleme ve hukuki içerik incelemesi |
| 13 Testing | Build ve lint scriptleri | Repo ağacında ayrı test suite/CI workflow bulunmadı; önemli form ve auth akışları için test |
| 14 Deployment | Vercel config ve env desteği | Canlı bağlı branch, otomatik dağıtım politikası, staging, rollback, uptime, yedekleme |
| 15 Conversion | Telefon, WhatsApp, teklif ve ücretsiz analiz girişleri | Başarılı DB kaydı, gerçek referans/vaka, bütçe ve kapsam ayrımı, nitelikli lead ölçümü |
| 16 İçerik yönetimi | MDX + DB blog, yönetim paneli, publish alanları | Editör doğrulaması, güncelleme tarihi, görsel optimizasyonu, redirect yönetimi, yayın akışı testi |
| 17 AI hazırlığı | Organization, LocalBusiness, hizmet ve Article schema | Kaynaklı içerik ve güncel uzman bilgisi; görünür içerikle tutarlı makine okunabilir bilgi |

Mevcut Next.js sunucu render yapısını korumak mantıklı. SEO için tüm siteyi başka bir framework'e taşımaya gerek görülmedi. Google, sunucu veya statik render'ın kullanıcılar ve tarayıcılar için faydalı olduğunu açıklar: [JavaScript SEO](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics).

## İstenen hizmetler için sayfa haritası

Evet, bu hizmetler hem ticari hizmet sayfası hem soru cevaplayan blog içerikleriyle işlenmeli. Hizmet sayfası teklif kararını, blog ise araştırma sorusunu cevaplar. Aynı metni iki adreste yayınlamamak gerekir. Aşağıdaki URL'ler öneridir; bu çalışmada yeni hizmetler ve bloglar yayınlanmadı.

| Hizmet | Önerilen ana adres | İçerik farkı |
|---|---|---|
| Reklam yönetimi | /reklam-yonetimi | Google/Meta kanal seçimi, ortak süreç, ölçüm, kapsam ve teklif |
| Google Ads yönetimi | /google-ads-yonetimi | Arama niyeti, anahtar kelime, landing, negatif kelime ve dönüşüm ölçümü |
| Meta reklam yönetimi | Mevcut /meta-ads-ajansi | Facebook/Instagram ortak hesap altyapısı, kreatif test, hedefleme ve ölçüm |
| Facebook reklam yönetimi | /facebook-reklam-yonetimi | Facebook odaklı yerleşimler, lead toplama ve uygun müşteri profilleri |
| Instagram reklam yönetimi | Mevcut /instagram-reklam-yonetimi | Reels/Stories kreatifleri, mesaj/lead hedefi ve üretim süreci |
| Etkinlik çekimi Denizli | /denizli-etkinlik-cekimi | Konferans, lansman, fuar, etkinlik akışı, fotoğraf/video ve teslimler |
| Organizasyon çekimi Denizli | /denizli-organizasyon-cekimi | Organizasyon sahibi/ajans için ekip, takvim, çoklu alan, teslim ve kullanım kapsamı |

Mevcut /hizmetler/meta-reklamlari, /hizmetler/performans-pazarlama ve /hizmetler/icerik-video ile bağlantılar kurulmalı. Meta ve Instagram açılışları zaten var; aynı niyet için yeni kopya URL üretmek yerine bunlar güçlendirilmeli. Facebook ve Instagram sayfaları farklı soruları ve teslimleri cevaplamalı. İki çekim sayfası için gerçek hizmet kapsamı yeterince farklı değilse tek güçlü Denizli çekim sayfası daha uygundur.

Hizmet sayfası standardı: anlamlı hizmet+lokasyon H1, kimler için, problem ve yaklaşım, teslim listesi, çalışma aşamaları, reklam bütçesi/ajans ücretinin ayrımı veya çekim kapsamı, gerçek iş örnekleri, 5–7 SSS, iletişim/teklif CTA, ilgili bloglar, kendi canonical'ı ve görünür içerikle uyumlu Service/Breadcrumb schema. Sahte müşteri, performans yüzdesi, ekipman veya fiyat eklenmemeli.

## Blog yayın planı

Önerilen ilk seri 24 özgün yazıdır. Bunlar hazırlanmış/yayınlanmış yazılar değildir. Önce 7 temel rehber, ardından gerçekten cevaplanabilen alt konular yayınlanmalı. Önerilen haftalık 2 yazı hızı editorial kalite kapasitesine bağlıdır; sıralama garantisi değildir.

| Hizmet kümesi | İlk yazı ve destek konuları |
|---|---|
| Google Ads | Denizli işletmeleri için Google Ads yönetimi nasıl işler; reklam bütçesi ve ajans ücreti farkı; negatif anahtar kelime hataları; tıklama ile gerçek teklif arasındaki fark |
| Meta | Meta reklam yönetimi nedir; Google Ads mi Meta mı; kreatif test planı nasıl kurulur; kampanya raporunda hangi sonuçlara bakılır |
| Facebook | Facebook potansiyel müşteri formu mu web sitesi formu mu; yerel işletmeler için Facebook kampanya hazırlığı; Facebook reklamı için gerekli hesap ve erişimler |
| Instagram | Instagram reklam yönetimi rehberi; Reels ve Stories reklamı için brief; gönderi öne çıkarma ile kampanya kurulumu farkı; Instagram reklamından gelen mesaj nasıl takip edilir |
| Genel reklam | Reklam ajansı seçerken sorulacak sorular; aylık reklam yönetimi raporu nasıl okunur; reklam açılış sayfasının teklif dönüşümüne etkisi |
| Denizli etkinlik | Etkinlik çekimi planlama rehberi; lansman ve konferans için çekim listesi; etkinlik özet videosu brief'i |
| Denizli organizasyon | Organizasyon çekimi teklifini karşılaştırma; çekim teslim formatları ve revizyon kapsamı; etkinlik günü çekim ekibi koordinasyonu |

Her yazıda tek ana soru, kısa cevap, somut örnek veya checklist, yalnızca doğrulanabilen bilgi, kaynaklar, yazar ve güncelleme tarihi, ilgili hizmet bağlantısı ve tek ana CTA bulunmalı. Birbirine benzer şehir/anahtar kelime sayfaları seri üretilmemeli. Google, değer eklemeden çok sayıda AI sayfası üretmenin spam politikasını ihlal edebileceğini açıklar: [AI içerik rehberi](https://developers.google.com/search/docs/fundamentals/using-gen-ai-content).

## Pazarlama ve ölçüm

Reklam yatırımı öncesi teklif formunun kalıcı kayıt ürettiği doğrulanmalı. Kanal → hizmet sayfası → telefon/WhatsApp/form → nitelikli lead → teklif → kazanılan müşteri akışı kurulmalı. WhatsApp veya telefon tıklaması tek başına satış değildir. Ana KPI'lar nitelikli lead maliyeti, teklif oranı, satışa dönüşüm ve müşteri edinme maliyeti olmalı; trafik ve takipçi sayısı yardımcı göstergedir.

Önerilen event'ler: form_submit_success yalnızca kayıt başarıyla oluşunca, click_whatsapp, click_phone, click_email, click_quote ve audit_completed. Form içindeki kişisel veri analytics parametrelerine gönderilmemeli. UTM alanları ve lead kaydı birlikte tutulmalı; Google/Meta dönüşüm kurulumu mülkte doğrulanmalı. Google Ads web veya telefon gibi farklı dönüşümleri ölçebilir: [Dönüşüm türleri](https://support.google.com/google-ads/answer/1722054?hl=en).

Yerel pazarlama için Google Business Profile hizmet açıklamaları ve NAP siteyle tutarlı olmalı. Denizli odaklı gerçek işler, çekim örnekleri ve müşteri onaylı vaka anlatımları öncelikli. Reklam bütçesi hesap verisi ve hedef lead kapasitesi görülmeden rakamlandırılmamalı.

## Bu çalışmada yapılan temizlik

- Strateji görüşmesi sayfası, kullanılmayan MeetingForm ve submitMeetingRequest kaldırıldı. TR, açık /tr ve EN eski adresleri ilgili iletişim sayfasına 308 yönleniyor. İç bağlantı iletişime değiştirildi. CRM içindeki toplantı yönetimi ayrı bir işlevdir ve korunmuştur.
- Hazır olmayan proje ana sayfası iki dilde noindex/follow; sitemap dışında.
- Yazısı olmayan blog dili noindex/follow; sitemap ve blog hreflang alternatiflerinden çıkarılıyor. O dilde geçerli içerik yayınlanınca koşul otomatik kalkar.
- Başlıksız/içeriksiz blog kayıtları hem liste/sitemap hem detay okuyucusunda eleniyor. İçeriği olan eski yazılar silinmedi.
- Yönetim, eski admin ve onay yollarına X-Robots-Tag noindex/nofollow eklendi; yönetim layout'una robots metadata eklendi. Login sayfasının noindex'ini Google'ın görebilmesi için robots.txt'teki admin tarama engeli kaldırıldı; authentication korunuyor.
- Ana public sayfalar, dört SEO açılışı, blog listesi, SSS ve proje detaylarında kendi canonical'ları tamamlandı. SSS sitemap'e eklendi. Sitemap CMS yayın durumunu istek anında kontrol ediyor.
- Olmayan sayfaların mevcut 404 davranışı korundu. Ana sayfaya toplu ve alakasız yönlendirme yapılmadı.

Google'ın noindex'i okuyabilmesi için sayfayı tarayabilmesi gerekir: [noindex rehberi](https://developers.google.com/search/docs/crawling-indexing/block-indexing). Değişiklikler yayınlandıktan ve tekrar tarandıktan sonra sonuçlara yansır. Search Console Removals hızlı, geçici kaldırma sağlayabilir; kalıcı teknik işleme ek olarak kullanılır: [Kaldırma rehberi](https://developers.google.com/search/docs/crawling-indexing/remove-information). Bu hesapta kaldırma talebi gönderilmedi.

## Uygulama sırası

1. Mevcut temizlik değişikliklerini gözden geçir ve canlıya yayınla; live sitemap/canonical/noindex/redirect kontrolünü tekrarla.
2. Kritik bağımlılık güncellemesi, teklif formu DB/CRM kaydı ve server log hijyenini tamamla.
3. Google Ads ve Denizli çekim sayfalarını, mevcut Meta/Instagram sayfalarının iyileştirmelerini ve hizmet menüsü bağlantılarını hazırla.
4. İlk 7 blog rehberini gerçek DOU Social süreç ve kanıtlarıyla yaz; hizmet-blog bağlantılarıyla yayınla.
5. Search Console ve GA4 üzerinden indeksleme, nitelikli lead ve satış dönüşümünü izle. Yeni içerik kararlarını sorgu/lead verisiyle ver.

## Tamamlanan ücretsiz analiz akışı

Kullanıcı bu işi sonraki aşama olarak istedi: /dijital-checkup alanı yalnızca web sitesi URL'siyle veya yalnızca Instagram kullanıcı adıyla başlatılabilsin. Her iki alanı doldurmak zorunlu olmamalı; en az biri gerekir. Birlikte verilirse iki kaynak değerlendirilebilir. Web URL'sinde sunucu tarafı SSRF koruması, özel IP/localhost engeli, redirect/timeout/boyut sınırı gerekir. Instagram kullanıcı adı için normalize/validasyon ve gerçekten erişilebilen veri yolu belirlenmeli. Kullanıcı adı tek başına özel hesap veya erişilemeyen metrikleri sağlamaz; erişilemeyen veri için uydurma analiz yapılmamalı. Bu akış uygulandı: /dijital-checkup üzerinde web sitesi veya Instagram tek başına gönderilebilir. /audit kalıcı olarak yeni akışa yönlenir. Detaylı metrik/ekran görüntüsü aracı isteğe bağlı açılır. Instagram erişimi engellenirse veri uydurulmaz; erişilemeyen alanlar açıkça belirtilir. Resmî Meta Business Discovery desteği için sunucuda token, işletme hesabı ve güncel API sürümü yapılandırılabilir.

## Doğrulama sonucu

Production build ve TypeScript kontrolü başarılı. Değişen dosyalardaki ESLint kontrolünde hata yok; yönetim layout'unda önceden bulunan font kullanımına ilişkin tek uyarı kaldı. HTTP kontrolünde 24 doğrulama geçti: üç eski adresin 308 ve UTM koruması, noindex, özel yol başlıkları, canonical, sitemap dışlamaları, 404, boş yazı ve İngilizce blogun yayınla yeniden etkinleşmesi. Yönetim girişinin HTML'i yerelde Supabase ortam bilgileri olmadığı için doğrulanamadı; başlığı doğrulandı. DB kesintisi artık boş blog kabul edilerek noindex üretilmesine yol açmaz; yapılandırılmış DB hatası isteğe hata olarak yansır. Mobil görsel test, gerçek form gönderimi, gerçek DB kayıtları ve production hesap ayarları bu doğrulamaya dahil değildir.


## 1 Ekim uygulama güncellemesi

- İstenen yedi hizmet için Türkçe ve İngilizce sayfalar hazırlandı: genel reklam, Google Ads, Meta, Facebook, Instagram, Denizli etkinlik ve organizasyon çekimi. Mevcut Meta/Instagram adresleri korundu. Ana sayfa, hizmetler ve footer bağlantıları güncellendi.
- 24 yeni Türkçe blog rehberi yazıldı. Eski 4 dosya korunarak yerel Türkçe blog 28 yazıya ulaştı. Her yeni yazı ilgili hizmete ve teklif akışına bağlandı. Hizmet sayfaları ilgili rehberleri gösterir; blog detaylarında konu etiketlerine göre ilgili yazı seçilir. Fiyat, müşteri örneği ve başarı oranı uydurulmadı.
- /strateji-gorusmesi ve bileşeni kaldırıldı; üç dil/adres varyantı 308 ile iletişime gider. Boş proje hub'ı ve boş İngilizce blog noindex; sitemap dışında. Gerçek proje detayları korunur. Yönetim, eski admin ve onay yolları noindex başlığı taşır. Bulunmayan adresler 404 verir.
- Canonical ve sitemap düzeltmeleri tamamlandı. Blog CMS boş içerikle yayınlamayı engeller; içerik yazma yetkisi gerekir. DB detay/liste yayın tarihi koşulları eşitlendi; gelecekteki DB yayınları zamanı gelmeden listelenmez.
- Ücretsiz analiz için ad, telefon veya e-posta gerekmez. Web kontrolü gerçek HTML'e dayanır; özel IP, localhost, yönlendirme ve DNS yeniden bağlama koruması, zaman/boyut sınırları vardır. Instagram yalnızca izin verilen herkese açık veya resmî erişim verisiyle değerlendirilir. Herhangi bir sıralama, etkileşim veya satış puanı uydurulmaz.
- Eski ayrıntılı AI analizindeki kaynaksız benchmark ve başarı garantisi talimatları kaldırıldı; kullanıcı verisi ile gözlenemeyen bilgi ayrılır. İstek boyutu ve sunucu tarafı temel hız limitleri eklendi.
- Teklif formu artık contacts tablosuna kayıt yapar; kayıt hatasında başarı göstermez. Form verisi console.log'a gönderilmez ve kullanıcıya ham DB hatası sızmaz. Ücretsiz bağlantı analizi talep kaydı oluşturmaz.
- Çerez tercihleri footer üzerinden yeniden açılabilir. Rıza geri alındığında Google/Meta consent güncellenir ve bilinen analitik çerezler temizlenir. Özel analytics olayları rıza olmadan gönderilmez. GTM içindeki üçüncü taraf etiketlerin kendi rıza davranışı panelde ayrıca doğrulanmalıdır.
- Next.js 16.3.8 ve React 19.3.0'a güncellendi; güvenlik yamaları kilit dosyasına eklendi. Son production bağımlılık taramasında açık raporlanmadı. Bu sonuç bütün uygulamanın güvenlik denetimini geçtiği anlamına gelmez.
- PR ve main için birim test, production build ve yüksek riskli bağımlılık kontrolü çalıştıran GitHub Actions eklendi.

## Canlı hesaplarda ayrıca doğrulanması gerekenler

Search Console'da geçmiş URL listesi, hızlı kaldırma başvurusu ve yeni sitemap gönderimi için hesap erişimi gerekir. Google sonuçları dağıtımdan sonra yeniden tarama ile değişir; anında kaldırma iddiası yoktur. GA4/Meta dönüşümlerinin gerçek mülkte doğrulanması, reklam hesabı kurulumu, bütçe harcanması, Google Business Profile düzenlemesi, Supabase RLS/backup kontrolü bu kod değişikliğinde yapılmış sayılmaz. Bellek içi hız sınırı bütün sunucu instance'ları arasında paylaşılmaz; ortak limiter kurulumu ayrı production yapılandırmasıdır. Canlı DB'ye test müşteri kaydı gönderilmedi. Form kalıcılığı birim testte DB başarı/hata simülasyonuyla kontrol edilir; production gönderimi ayrıca doğrulanmalıdır.

## Son yerel kontrol

37 birim test geçti. Production build başarılı. Sitemap’teki 91 adres yerelde HTTP 200, tek H1 ve beklenen canonical ile açıldı. 24 temel SEO/redirect kontrolü geçti; yönetim HTML testi ortam eksikliğinden kapsam dışında. Web adresi tek başına gerçek HTML üzerinden, Instagram adı tek başına herkese açık profil özeti üzerinden sonuç döndürdü. Boş/özel ağ girişleri reddedildi; aynı istemcinin fazla isteği 429 ile sınırlandı. 320px tarayıcı kontrolünde footer sosyal bağlantılarındaki taşma bulundu ve satır kaydırma eklendi. Canlı yayın doğrulaması aşağıda ayrıca kaydedilecek.

Vercel önizleme ilk sürüm için READY durumuna ulaştı. GitHub Actions temiz kurulumunda esbuild script izni eksikliği bulundu; yalnızca esbuild için açık izin eklenerek tekrar doğrulamaya gönderildi. Önizleme URL’si Vercel Authentication ile korunuyor; connector üzerinden HTML erişimi reddedildi. Yerel tarayıcıda ücretsiz analiz, hizmet ve blog örnekleri 320px genişlikte taşma ve hata overlay’i olmadan doğrulandı.


## Telefon, CRM ve görsel takip güncellemesi

Kullanıcının yeni isteğiyle ücretsiz analizde telefon ve talebe yanıt vermek için kayıt onayı zorunlu hale getirildi; e-posta istenmez. Web sitesi ya da Instagram alanlarından biri yeterlidir. Telefon normalize edilir, analiz raporu mevcut audits tablosunda saklanır. Yönetim analiz listesinde CRM’e aktar bağlantısı telefon ve raporla aday formunu açar; aday oluşturma mevcut yetkili CRM işleminden yapılır. Kayıt hatasında başvuru başarılı gösterilmez. Yeni hizmetler mevcut hizmet gridine entegre edildi; yinelenen Meta kartı ve ayrı reklam/çekim bölümünün kopyası kaldırıldı. Blog kapakları ve hizmet görselleri tematik konsept görsellerdir; gerçek müşteri işi veya Denizli’de çekilmiş bir etkinlik kanıtı olarak sunulmaz.

## Search Console ve hız çalışmasının güncel sonucu

1 Ekim 2026 tarihinde info hesabıyla Chrome üzerinden dousocial.com alan adı mülkü açıldı. Checklistin 17 başlığındaki 277 madde ayrı ayrı durum dosyasına aktarıldı: `docs/audit-evidence/checklist-status.json`. Bu dosya kontrol edilen, kodda bulunan, açık eksik olan ve ayrıca doğrulanması gereken maddeleri ayırır. Checklistin tamamı bitmiş değildir; dosyanın varlığı 277 maddenin canlıda test edildiği anlamına gelmez.

### Arama trafiği ve öncelikler

| Metrik | 4–31 Ağustos | 1–28 Eylül | Yorum |
|---|---:|---:|---|
| Tıklama | 35 | 30 | %14 düşüş; küçük örneklem |
| Gösterim | Yaklaşık 1.780 | Yaklaşık 2.100 | Yuvarlanmış göstergeyle yaklaşık %18 artış |
| Tıklama oranı | %2 | %1,4 | Görünürlük artışı tıklamaya aynı oranda dönüşmüyor |
| Ortalama konum | 13 | 10,9 | Ortalama konum iyileşiyor; sorgu karışımı sonucu etkiler |

Üç aylık görünümde 29 Haziran–28 Eylül için 98 tıklama, yaklaşık 4.800 gösterim, %2 tıklama oranı ve 11,6 ortalama konum var. Veriler bugünkü yeni hizmet ve blog yayınlarının etkisini içermez. Son 28 günlük görünür sorgularda “dou social” 7 tıklamadan 1 tıklamaya düşmüş; bu sorgunun 6 tıklama kaybı toplam 5 tıklama düşüşünden büyük. Bu, görünen verilerde marka aramasındaki değişimin önemli payı olduğunu gösterir; bütün kaybın teknik SEO'dan veya hızdan geldiği sonucuna varılamaz. Search Console bazı sorguları gizlediği için sorgu tablosu toplamının rapor toplamına eşit olması beklenmez.

Son 28 günde ana sayfanın www adresi 12 tıklama / 346 gösterim / %3,5 TO / 10,2 konum, non-www adresi 3 tıklama / 382 gösterim / %0,8 TO / 3,0 konum gösteriyor. Bu dağılım eski canonical/redirect etkisi veya farklı sorgu karışımıyla ilişkili olabilir; tek başına kanıt değildir. Ana sayfanın title ve açıklaması yerel reklam ve sosyal medya hizmetlerini daha açık anlatacak şekilde güncellendi. Non-www için kalıcı yönlendirme Vercel domain ayarında ayrıca tamamlanmalıdır.

Öncelikli sorgular: “denizli reklam ajansı” 2 tıklama / 67 gösterim; “denizli sosyal medya ajansı” 1 / 85; “denizli sosyal medya yönetimi” 1 / 18. Google Ads, Meta ve Denizli çekim sayfaları bu hizmet talebini karşılamak için birbirinden farklı kapsamlarla hazırlandı. Yeni metinlerin etkisini aynı sorgu ve sayfa üzerinden takip etmek gerekir.

### İndeksleme ve yapılan işlem

21 Eylül güncellemeli indeksleme raporu 102 indekslenen, 29 indekslenmeyen URL gösteriyor. Dışlanma nedenleri: 16 adet 404, 3 yönlendirme, 2 doğru canonical alternatifi, 1 noindex, 5 keşfedilmiş ama indekslenmemiş ve 2 taranmış ama indekslenmemiş URL. Bu tarih yeni dağıtımdan öncedir. 404 örneklerinin çoğu olmayan İngilizce blog/proje adresleri ve eski içeriklerdir. Bunları ilgisiz ana sayfaya yönlendirmek doğru değildir. Gerçekten kaldırılmış ve eşdeğeri olmayan sayfalarda 404 beklenen sonuçtur; [Google 404 rehberi](https://support.google.com/webmasters/answer/2445990?hl=en).

Search Console'daki sitemap son olarak 28 Eylül'de okunmuş ve 60 sayfa göstermişti. Güncel `https://www.dousocial.com/sitemap.xml` 1 Ekim'de yeniden gönderildi; arayüz “Site haritası başarıyla gönderildi” sonucunu verdi. Gönderim indeksleme veya sıralama garantisi değildir; [Google sitemap açıklaması](https://developers.google.com/search/help/crawling-index-faq?hl=en).

Mobil ve masaüstü Core Web Vitals raporları son 90 gün için yeterli kullanım verisi olmadığını söylüyor. Bu nedenle “INP iyi” veya “saha Core Web Vitals geçti” denemez. Lighthouse laboratuvar ölçümü bu boşluğu tek başına kapatmaz; [PageSpeed veri ayrımı](https://developers.google.com/speed/docs/insights/v5/about).

### Görseller ve marka alanı

- 46 yerel görsel WebP olarak hazırlandı. Toplam kaynak boyutu 17.961.741 bayttan 1.985.304 bayta indi; yaklaşık %89 küçülme. Eski kaynak adresleri uyumluluk için korunur, public bileşenler WebP'yi kullanır.
- Yedi reklam/çekim kapağı tek başına 14.143.954 bayttan 386.346 bayta indi; yaklaşık %97 küçülme. Blog kapağı, hizmet kartı ve hizmet hero'su aynı tematik görseli kullanır. Eski blog içi görselleri, ekip fotoğrafları, logolar, analiz rehberi görselleri ve hero posteri de dönüştürüldü.
- Logolardaki geniş boşluklar kırpıldı; marka şekli ve rengi korunuyor. Logolar tam opaklıkla gösteriliyor, hover'da beyaza dönmüyor. Yapıgranit ve EN20 beyaz logoları #253238 koyu zeminde, diğerleri #f5f2ed açık zeminde gösteriliyor. Şirket adları her zaman görünür. Aynı kart sistemi açık ve koyu temada korunur.
- Mobilde CSS ile gizlenen video yine de yaklaşık 1,58 MB indiriyordu. Video artık yalnızca uygun masaüstü görünümünde, azaltılmış hareket ve veri tasarrufu istenmediğinde sonradan yükleniyor; mobilde video elementi yok. WebP poster 85.762 bayttan 10.230 bayta indi.
- Ana başlık ilk HTML'de görünür; açılış animasyonunun başlığı saklaması kaldırıldı. Mobilde kullanılmayan Lenis kodu artık koşullu import edilir. Görsel/video cache başlıkları genişletildi.
- Kaynak servisi gerçek Google yorumu döndürmezse varsayılan kişi adları ve performans iddialarından oluşan yorum kartları artık gösterilmiyor. Gerçek yorum akışı korunur.

Vercel görsel optimizasyon servisi modern görsel isteyen canlı isteklerde 402 döndürdüğü için kaynak WebP dosyaları doğrudan sunuluyor. Next Image boyut rezervasyonu ve lazy loading korunur. Görselleri yalnızca ayarda WebP yazdığı için optimize olmuş saymak doğru değildi; canlı tarayıcı hatası giderildi.

### Hız doğrulaması

İlk canlı mobil Lighthouse ölçümü performans 55, erişilebilirlik 93, SEO 100; LCP 4,6 saniye, TBT 1.070 ms, CLS 0 ve toplam aktarım yaklaşık 2.710 KiB. İlk yerel production ölçümünde performans 84, erişilebilirlik 96, TBT 30 ms, CLS 0 ve yaklaşık 616 KiB aktarım görüldü. Yerel ve canlı sunucular farklı olduğundan bunlar doğrudan aynı koşuldaki önce/sonra sonucu değildir. Son canlı ölçüm dağıtım sonrasında ayrıca eklenecek. Lighthouse tek laboratuvar denemesidir; sonuçlar değişebilir. Hız düzeltmesi tek başına trafik artışını garanti etmez; [Google Core Web Vitals rehberi](https://developers.google.com/search/docs/appearance/core-web-vitals).

### Checklistte kalan işler

| Alan | Tamamlanan veya mevcut | Açık kalan doğrulama |
|---|---|---|
| Teknik altyapı | HTTPS, robots, sitemap, canonical düzeltmeleri, 404/error bileşenleri, env ignore | Kalıcı non-www redirect, tüm hata senaryoları ve geçmiş secret taraması |
| Frontend | 320px ana sayfa/hizmetler, menü, görünür logo kartları | Her sayfada tüm cihaz/tema ve gerçek dokunma testleri |
| Performans | WebP, mobil video indirme engeli, koşullu JS, cache, Lighthouse | Saha INP/LCP, tüm API/DB sorguları, uzun dönem ölçüm |
| SEO | Hizmetler, bloglar, bağlantılar, metadata, sitemap temizliği | Eski Google URL listesiyle eşleştirme, yeniden tarama, kalıcı domain redirect |
| GEO | Yerel hizmet tanımları ve schema bileşenleri | Gerçek vaka kanıtı, tüm içerikte uzman/author ve entity tutarlılığı |
| Analytics | Consent sonrası kurulum ve başvuru olay kodları; Search Console erişimi | GA4 debug/gerçek event teslimi, telefon/WhatsApp satış ilişkilendirmesi, UTM ve 404/scroll kapsamı |
| Güvenlik | Session imzası, izin kontrolleri, HTTPS başlıkları, yamalanmış paketler | CSP, login brute-force sınırı, paylaşımlı rate limit, kapsamlı auth/CSRF/XSS denetimi |
| Backend | Analiz ve teklif kaydı, hata durumu, validasyon | Tüm uçların yetki/timeout/logging incelemesi ve canlı kalıcılık testi |
| Database | Şema/migration kodu ve parola hash kodu | Canlı RLS, indeksler, pooling, backup, restore denemesi ve saklama süreleri |
| UX | Açık CTA, iletişim, telefon, analiz; kaybolan kartlar düzeltildi | Gerçek kullanıcı araştırması ve tüm akışlar |
| Accessibility | Label, alt, semantik bileşenler; kontrast/altı çizili link düzeltmesi | Ekran okuyucu, tam klavye denetimi, WCAG AA uygunluğu |
| Cookie ve KVKK | İzin geri alma, politikalar ve talep onayı | Hukuki metin/retention incelemesi ve GTM içindeki etiketlerin canlı rıza davranışı |
| Testing | 54 birim test, API başarı/hata, mock kayıt ve build | Safari, Firefox, Edge, fiziksel iPhone/Android, tam E2E/auth ve Lighthouse CI |
| Deployment | PR/main CI ve otomatik Vercel dağıtımı | Uptime/error monitoring, DB yedekleme ve gerçek rollback tatbikatı |
| Conversion | Telefon, WhatsApp, teklif, analizin telefonla kaydı ve CRM aktarımı | Kazanılan müşteri ölçümü, gerçek vaka/yorum kanıtı |
| CMS | MDX/DB blog, yayın durumu, editör izinleri, sitemap yenileme | Yönetim UI üzerinden bütün yayın/draft/görsel/redirect akışı |
| AI hazırlığı | Service/Article/Organization verileri ve kaynaklı rehberler | Tüm içerikte güncelleme/yazar denetimi ve crawler stratejisi |

### Sonraki içerik ve ölçüm planı

1. Yeni sitemap'in okunmasını ve yedi ticari hizmet URL'sinin indeks durumunu kontrol et. Eski 404'leri yalnızca gerçekten eşdeğer içerik varsa yönlendir.
2. Her hafta aynı 28 günlük pencereyle marka ve marka dışı sorguları ayrı incele. Öncelik yerel reklam, sosyal medya, Google Ads ve çekim sorgularında doğru sayfanın görünmesidir.
3. “Denizli reklam ajansı” ve “Denizli sosyal medya ajansı” için mevcut sayfaları gerçek iş örnekleri, kapsam ve teklif CTA'sıyla güçlendir. Yeni içerik üretimini sorgu ve müşteri sorularına göre yap; aynı konuda kopya sayfalar ekleme.
4. Sağlık/estetik yazısında 273 gösterim, 2 tıklama ve 18,7 konum var. Arama niyetini, başlık/açıklamayı ve içeriği güncel mevzuat kaynaklarıyla ayrıca kontrol et; sırf gösterim var diye hacim artırma.
5. GA4'te başvuru, telefon ve WhatsApp olaylarını doğrula; CRM'de nitelikli aday, teklif ve kazanılan müşteri sonucuyla birleştir. Trafik hedefinden önce hangi hizmetin gerçek görüşme getirdiğini öğren.
