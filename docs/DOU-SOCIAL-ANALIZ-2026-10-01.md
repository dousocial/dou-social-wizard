# DOU Social web sitesi ve pazarlama analizi

1 Ekim 2026 tarihinde dousocial.com ve dousocial/dou-social-wizard reposu incelendi. Amaç, verilen 17 başlıklı checklist doğrultusunda teklif üreten bir site kurmak, gereksiz indekslenen sayfaları temizlemek ve reklam yönetimi ile Denizli çekim hizmetlerini genişletmek. Teknik temel mevcut; öncelik yeni blog sayısından önce güvenlik, doğru indeksleme ve gerçek başvuru kaydıdır.

Bu rapor kod incelemesi ve canlı HTTP/HTML kontrollerine dayanır. Search Console, GA4 hesap verileri, Supabase yönetimi, müşteri dönüşümleri ve saha Core Web Vitals verilerine erişilmedi. Sıralama, trafik ve satış artışı vaat edilmez. Yerel değişiklikler canlı yayına alınmadı. Haziran tarihli AUDIT-SEO-GEO.md tarihsel bir rapordur; oradaki bazı sorunlar güncel kodda zaten çözülmüştür.

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
