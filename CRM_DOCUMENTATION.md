# DOU Social - CRM & Lead Yönetimi Modülü Dokümantasyonu

Bu dokümantasyon, DOU Social dijital pazarlama ajansının müşteri kazanım süreçlerini, teklif takibini ve operasyon yönetimini kolaylaştırmak amacıyla eklenen CRM modülünü ve geliştirme notlarını içermektedir.

---

## 1. Veritabanı Modelleri & Tablo Yapıları

CRM sisteminin verileri Supabase (PostgreSQL) üzerinde, birbiriyle ilişkili aşağıdaki tablolarla yönetilir:

### A. `crm_companies` (Firmalar)
Firma bazlı potansiyel veya mevcut kurumsal müşterilerin bilgilerini tutar.
* `id` (uuid, PRIMARY KEY): Benzersiz firma kimliği.
* `name` (text, NOT NULL): Firma adı.
* `website` (text): Firmanın web adresi.
* `sector` (text): Firmanın faaliyet gösterdiği sektör.
* `phone` / `email` / `instagram` (text): İletişim kanalları.
* `notes` (text): Firma hakkında genel notlar.
* `assigned_user` (text): Firmadan sorumlu olan admin panel kullanıcısı.

### B. `crm_contacts` (İletişim Kişileri)
Firmalara bağlı çalışan yetkili kişilerin bilgilerini tutar (1 firmaya birden fazla yetkili bağlanabilir).
* `id` (uuid, PRIMARY KEY): Yetkili kimliği.
* `company_id` (uuid, REFERENCES crm_companies): Yetkilinin bağlı olduğu firma (Cascade silme etkindir).
* `name` (text, NOT NULL): Yetkilinin ad soyadı.
* `role` (text): Firmanın unvanı/rolü (Örn: Pazarlama Müdürü).
* `phone` / `email` / `instagram` (text): Yetkiliye özel iletişim bilgileri.
* `notes` (text): Yetkili hakkında özel notlar.

### C. `crm_leads` (Fırsatlar / Leads)
Müşteri kazanım hunisindeki potansiyel satış fırsatlarını temsil eder. İster bir firmaya ve yetkiliye bağlanabilir, ister bağımsız (bireysel) olarak serbest alanlarla tutulabilir.
* `id` (uuid, PRIMARY KEY): Fırsat kimliği.
* `title` (text, NOT NULL): Fırsat tanımı/başlığı.
* `company_id` (uuid, REFERENCES crm_companies): Bağlı firma (boş bırakılabilir).
* `contact_id` (uuid, REFERENCES crm_contacts): Bağlı yetkili kişi (boş bırakılabilir).
* `company_name` / `contact_name` (text): Firma veya yetkili seçilmediğinde serbest yazım için alanlar.
* `phone` / `email` / `instagram` / `website` / `sector` (text): İletişim ve sektör verileri.
* `source` (text): Fırsat kaynağı (`referans`, `instagram`, `google_maps`, `inbound`, `manuel`, `diger`).
* `status` (text): Hunideki durumu (`yeni`, `gorusuldu`, `teklif_istendi`, `teklif_gonderildi`, `takipte`, `kazanildi`, `kaybedildi`).
* `score` (int): 0-100 arası fırsat puanı/sıcaklığı.
* `next_follow_up_date` (date): Bir sonraki takip/arama tarihi.
* `assigned_user` (text): Fırsattan sorumlu admin kullanıcı.
* `converted_client_id` (uuid, REFERENCES musteriler): Kazanıldığında dönüştürülen sözleşmeli müşteri referansı.

### D. `crm_follow_ups` (Takip Sistemi)
Her fırsat için planlanan veya yapılan geçmiş/gelecek takip aktivitelerini tutar.
* `id` (uuid, PRIMARY KEY): Takip kimliği.
* `lead_id` (uuid, REFERENCES crm_leads): İlgili satış fırsatı.
* `follow_up_date` (date, NOT NULL): Aktivite tarihi.
* `type` (text): İletişim kanalı (`arama`, `whatsapp`, `eposta`, `toplanti`, `instagram_dm`).
* `note` (text): Aktivite esnasında konuşulanlar veya yapılacaklar.
* `completed` (boolean): Görevin tamamlanıp tamamlanmadığı.

### E. `crm_content_tasks` (İçerik & Operasyon Takibi)
Sözleşmeli aktif müşteriler (`musteriler`) için sosyal medya içerik üretim ve planlama süreçlerini takip eder.
* `id` (uuid, PRIMARY KEY): İçerik kimliği.
* `client_id` (uuid, REFERENCES musteriler): Bağlı olduğu müşteri (sözleşmeli müşteri).
* `title` (text, NOT NULL): İçerik başlığı/açıklaması (Örn: "Haftalık Sektör İpuçları Videosu").
* `type` (text): İçerik türü (`reels`, `post`, `story`, `blog`, `reklam`, `cekim`).
* `status` (text): Durum (`fikir`, `cekilecek`, `cekildi`, `editte`, `onayda`, `yayinta`).
* `assigned_person` (text): İçerikten sorumlu ekip üyesi (Metin olarak girilir).
* `due_date` (date): Teslim/yayın tarihi.

---

## 2. Arayüz Kullanımı & Panel Entegrasyonları

Yeni modüller DOU Social admin paneline (`/yonetim`) tamamen uyumlu, koyu mod ve glassmorphism estetiğine sahip bento yapıda entegre edilmiştir.

### 1. Dashboard (Genel Bakış)
* **Hatırlatıcı Widget'ı:** Dashboard'un en üstünde, bugün tarihiyle planlanmış ama tamamlanmamış (bekleyen) tüm Takipler listelenir.
* Kullanıcılar tek tıkla checkbox'ı işaretleyerek takibi dashboard'dan çıkmadan tamamlayabilir. Görevi kalmadığında widget otomatik olarak gizlenir.

### 2. Fırsatlar (Leads) Ekranı
* Fırsatların tümünü listeler. Durum, Kaynak, Sektör ve Sorumluya göre filtreleme sunar.
* Arama çubuğu üzerinden anlık arama yapılabilir.
* Lead Skoru 70+ olanlar yeşil, 40+ olanlar sarı ve altındakiler kırmızı etiketle "sıcaklık" durumunu gösterir.

### 3. Fırsat Detay Ekranı
* Sol tarafta fırsatın tüm iletişim bilgileri, skoru ve notları yer alır.
* Sağ tarafta iki sekme bulunur:
  1. **Takip Aktivitesi:** Fırsat için yeni takip planlama, takip notu ekleme ve tamamlanan takipleri arşivleme.
  2. **Teklifler:** Fırsat için çoklu hizmet kalemleri ekleyerek teklif oluşturma, PDF çıktısı indirme (ajans antetli kağıdında off-screen canvas ile üretilir) ve durumunu yönetme.
* **Müşteriye Dönüştür:** Fırsat kazanıldığında (Won) bu butona tıklanarak sözleşme aylık ücreti, başlangıç tarihi ve yönetilecek platformlar seçilir. Fırsat otomatik olarak `musteriler` tablosuna aktarılır. Önceki tüm teklif geçmişi ve notlar yeni müşteri profiliyle otomatik olarak ilişkilendirilir (veri kaybı sıfırdır).

### 4. Firmalar & Rehber
* Çift sütunlu bento yapıda rehber mantığında çalışır.
* Solda firmalar aranıp seçilebilir.
* Sağda seçilen firmanın detayları, notları ve o firmaya bağlı çalışan tüm iletişim kişileri (isim, rol, telefon, e-posta, instagram) tek bir ekrandan yönetilebilir.

### 5. Müşteri Detayında "İçerik Takibi"
* Aktif müşteri profilinde (`/yonetim/musteriler/[id]`) 5. bir sekme olarak **İçerik Takibi** eklenmiştir.
* Müşteriye özel Reels, Post, Story veya çekim planları durum bazlı (Fikir, Çekilecek, Editte, Yayında vb.) takip edilebilir.

---

## 3. Geliştirilen ve Değiştirilen Dosyalar

CRM modülünün eklenmesiyle projede yapılan değişikliklerin özeti:

### Veritabanı (Supabase)
* `[NEW]` [crm-lead-management.sql](file:///C:/Users/Efe/.gemini/antigravity/worktrees/dou-social-web-main/add-crm-lead-management/supabase/crm-lead-management.sql) - Tüm yeni tabloları oluşturan ve mevcut teklif tablosunu esnekleştiren SQL göç betiği.

### Sunucu Eylemleri (Server Actions)
* `[NEW]` [crmLeads.ts](file:///C:/Users/Efe/.gemini/antigravity/worktrees/dou-social-web-main/add-crm-lead-management/src/lib/actions/crmLeads.ts) - Leads tablosu CRUD ve Müşteriye dönüştürme mantığı.
* `[NEW]` [crmCompanies.ts](file:///C:/Users/Efe/.gemini/antigravity/worktrees/dou-social-web-main/add-crm-lead-management/src/lib/actions/crmCompanies.ts) - Firmalar tablosu CRUD işlemleri.
* `[NEW]` [crmContacts.ts](file:///C:/Users/Efe/.gemini/antigravity/worktrees/dou-social-web-main/add-crm-lead-management/src/lib/actions/crmContacts.ts) - İletişim rehberi kişileri CRUD işlemleri.
* `[NEW]` [crmFollowUps.ts](file:///C:/Users/Efe/.gemini/antigravity/worktrees/dou-social-web-main/add-crm-lead-management/src/lib/actions/crmFollowUps.ts) - Fırsat takip ve hatırlatma logları yönetimi.
* `[NEW]` [crmContentTasks.ts](file:///C:/Users/Efe/.gemini/antigravity/worktrees/dou-social-web-main/add-crm-lead-management/src/lib/actions/crmContentTasks.ts) - Müşteri içerik planlama takvimi CRUD işlemleri.
* `[MODIFY]` [teklifler.ts](file:///C:/Users/Efe/.gemini/antigravity/worktrees/dou-social-web-main/add-crm-lead-management/src/lib/actions/teklifler.ts) - Tekliflerin lead ve company ile ilişkilenmesini sağlayacak esneklik.

### Sayfalar ve Arayüz Bileşenleri
* `[MODIFY]` [AdminNav.tsx](file:///C:/Users/Efe/.gemini/antigravity/worktrees/dou-social-web-main/add-crm-lead-management/src/app/yonetim/%28panel%29/_components/AdminNav.tsx) - Menüye "Fırsatlar" ve "Firmalar & Rehber" linklerinin eklenmesi.
* `[MODIFY]` [page.tsx](file:///C:/Users/Efe/.gemini/antigravity/worktrees/dou-social-web-main/add-crm-lead-management/src/app/yonetim/%28panel%29/page.tsx) - Dashboard'a "Bugün Takip Edilecekler" sorgusunun eklenmesi.
* `[NEW]` [DashboardFollowUps.tsx](file:///C:/Users/Efe/.gemini/antigravity/worktrees/dou-social-web-main/add-crm-lead-management/src/app/yonetim/%28panel%29/_components/DashboardFollowUps.tsx) - Dashboard hatırlatma ve takip tamamlama bileşeni.
* `[NEW]` [crm-leads/page.tsx](file:///C:/Users/Efe/.gemini/antigravity/worktrees/dou-social-web-main/add-crm-lead-management/src/app/yonetim/%28panel%29/crm-leads/page.tsx) / [CrmLeadsClient.tsx](file:///C:/Users/Efe/.gemini/antigravity/worktrees/dou-social-web-main/add-crm-lead-management/src/app/yonetim/%28panel%29/crm-leads/_components/CrmLeadsClient.tsx) - Satış fırsatı (Lead) listeleme, filtreleme ve ekleme ekranları.
* `[NEW]` [crm-leads/[id]/page.tsx](file:///C:/Users/Efe/.gemini/antigravity/worktrees/dou-social-web-main/add-crm-lead-management/src/app/yonetim/%28panel%29/crm-leads/%5Bid%5D/page.tsx) / [CrmLeadDetailClient.tsx](file:///C:/Users/Efe/.gemini/antigravity/worktrees/dou-social-web-main/add-crm-lead-management/src/app/yonetim/%28panel%29/crm-leads/%5Bid%5D/_components/CrmLeadDetailClient.tsx) - Teklif oluşturma, takip loglama ve Müşteriye dönüştürme içeren detay ekranı.
* `[NEW]` [firmalar/page.tsx](file:///C:/Users/Efe/.gemini/antigravity/worktrees/dou-social-web-main/add-crm-lead-management/src/app/yonetim/%28panel%29/firmalar/page.tsx) / [CompaniesClient.tsx](file:///C:/Users/Efe/.gemini/antigravity/worktrees/dou-social-web-main/add-crm-lead-management/src/app/yonetim/%28panel%29/firmalar/_components/CompaniesClient.tsx) - B2B firmaları ve yetkili rehberi yönetim ekranı.
* `[MODIFY]` [page.tsx](file:///C:/Users/Efe/.gemini/antigravity/worktrees/dou-social-web-main/add-crm-lead-management/src/app/yonetim/%28panel%29/musteriler/%5Bid%5D/page.tsx) / [MusteriDetailClient.tsx](file:///C:/Users/Efe/.gemini/antigravity/worktrees/dou-social-web-main/add-crm-lead-management/src/app/yonetim/%28panel%29/musteriler/%5Bid%5D/_components/MusteriDetailClient.tsx) - Müşteri detay sayfasında "İçerik Takibi" sekmesi entegrasyonu.


# DOU CRM VE İŞ TAKİP SİSTEMİ

## 1. Sistemin Genel Amacı

Dou CRM yalnızca müşteri bilgilerinin tutulduğu bir sistem olmayacaktır. Sistem, işletmenin Dou’ya ilk ulaşmasından başlayarak şu sürecin tamamını yönetecektir:

**Potansiyel müşteri → Ön görüşme → Teklif → Sözleşme → Hesap kurulumu → İçerik planlama → Çekim → Tasarım ve kurgu → Kontrol → Revize → Yayın → Reklam → Raporlama**

Sistemin temel hedefleri:

* Hiçbir müşteri talebinin unutulmaması
* Verilen tekliflerin takip edilmesi
* Müşteriyle anlaşılan içerik adetlerinin eksiksiz hazırlanması
* Çekim günlerinin doğru planlanması
* Editör ve tasarımcı iş sıralarının netleştirilmesi
* Uzun süredir bekleyen işlerin otomatik hatırlatılması
* İçeriklerin kontrol ve revize süreçlerinin kayıt altına alınması
* Yayınlanmayan veya reklama çıkarılmayan içeriklerin fark edilmesi
* Ekip iş yükünün dengeli şekilde dağıtılması

---

# 2. POTANSİYEL MÜŞTERİ YÖNETİMİ

Bir işletme reklam, referans, sosyal medya, telefon veya farklı bir kanal üzerinden Dou’ya ulaştığında sistemde potansiyel müşteri kaydı oluşturulur.

## Zorunlu müşteri bilgileri

* Ad
* Soyad
* Telefon numarası
* Firma adı
* Sektör
* Müşterinin Dou’ya ulaştığı kanal
* İlk iletişim tarihi
* İlgilendiği hizmet
* Müşteriyle ilgilenen ekip üyesi

İsteğe bağlı bilgiler:

* E-posta adresi
* Şehir
* İlçe
* Instagram hesabı
* Web sitesi
* Referans olan kişi veya firma
* Yaklaşık bütçe
* İşletme büyüklüğü
* Müşteriyle ilgili özel notlar

Sektör ve firma bilgilerinin kaydedilmesi, ilerleyen dönemlerde benzer işletmelere ulaşmak, hedef müşteri listeleri oluşturmak ve sektörel analiz yapmak için kullanılacaktır.

## Potansiyel müşteri durumları

* Yeni müşteri adayı
* İlk arama yapılacak
* Ön görüşme yapıldı
* Bilgi bekleniyor
* Yüz yüze görüşme planlanacak
* Teklif hazırlanacak
* Teklif gönderildi
* Müşteri dönüşü bekleniyor
* Teklif kabul edildi
* Teklif reddedildi
* Daha sonra görüşülecek
* Müşteriye dönüştü
* Kaybedildi

Her müşteri adayı için bir sonraki işlem tarihi belirlenmelidir. Böylece “müşteriden geri dönüş bekleniyor” şeklinde belirsiz kayıtlar oluşmaz.

Örnek:

> 14 Temmuz’da teklif gönderildi.
> 17 Temmuz’da müşteriye tekrar ulaşılacak.

Belirlenen tarihte işlem yapılmazsa sistem uyarı vermelidir.

---

# 3. İLK ÖN GÖRÜŞME

İlk telefon görüşmesinde müşterinin temel ihtiyacı öğrenilir.

## Basit hizmet talepleri

Müşteri tek seferlik ve net bir hizmet istiyorsa telefon görüşmesinde hızlı fiyat verilebilir.

Örnek hizmetler:

* Tek tanıtım videosu
* Ürün çekimi
* Drone çekimi
* Tek kampanya tasarımı
* Web sitesi düzenlemesi
* Tek günlük fotoğraf çekimi

Bu durumda sistemde şu bilgiler tutulmalıdır:

* İstenen hizmet
* Hizmetin kapsamı
* Verilen fiyat
* Fiyatın verildiği tarih
* Teklifin geçerlilik süresi
* Beklenen müşteri dönüş tarihi
* Müşterinin cevabı

## Detaylı hizmet talepleri

Müşteri sosyal medya yönetimi, aylık içerik üretimi, reklam yönetimi veya kapsamlı bir hizmet istiyorsa yüz yüze görüşme planlanır.

Görüşme kaydında:

* Görüşme tarihi
* Görüşme saati
* Görüşme konumu
* Görüşmeye katılacak kişiler
* Görüşmenin amacı
* Müşterinin mevcut sorunları
* Müşterinin beklentileri
* Kullanılan mevcut sosyal medya hesapları
* Talep edilen hizmetler
* Tahmini aylık bütçe
* Görüşme notları

yer almalıdır.

---

# 4. TEKLİF YÖNETİMİ

Yüz yüze görüşmeden sonra müşteriye yazılı olarak üç farklı paket sunulacaktır.

## Teklif paketleri

### Başlangıç Paketi

Müşterinin temel ihtiyaçlarını karşılayan ekonomik paket.

### Orta Seviye Paket

Daha fazla içerik, daha düzenli çekim ve ek hizmetleri kapsayan paket.

### İleri Seviye Paket

Yoğun içerik üretimi, reklam yönetimi, kapsamlı strateji ve daha gelişmiş hizmetleri kapsayan paket.

Her pakette şu bilgiler bulunmalıdır:

* Aylık post adedi
* Aylık video adedi
* Story hizmeti
* Çekim günü adedi
* Reklam yönetimi
* Sosyal medya hesap yönetimi
* İçerik metinleri
* Tasarım hizmeti
* Video kurgu hizmeti
* Ek hizmetler
* Aylık ücret
* Tek seferlik kurulum ücreti
* Teklif geçerlilik tarihi

Teklif sistemden PDF olarak oluşturulabilmeli veya hazırlanan teklif dosyası sisteme yüklenebilmelidir.

## Teklif durumları

* Taslak
* Hazırlanıyor
* Kontrol bekliyor
* Müşteriye gönderildi
* Görüldü
* Değerlendiriliyor
* Revize teklif istendi
* Kabul edildi
* Reddedildi
* Süresi doldu

Teklif reddedildiğinde ret nedeni seçilmelidir:

* Fiyat yüksek bulundu
* Başka ajansla anlaşıldı
* Hizmet ertelendi
* Karar verici onaylamadı
* İhtiyaç ortadan kalktı
* Müşteriye ulaşılamadı
* Diğer

Bu veriler satış sürecinin ilerleyen dönemlerde analiz edilmesini sağlar.

---

# 5. SÖZLEŞME VE MÜŞTERİYE DÖNÜŞÜM

Teklif kabul edildiğinde müşteri adayı otomatik olarak aktif müşteriye dönüştürülür.

Sistem şu görevleri otomatik olarak oluşturmalıdır:

1. Sözleşmenin hazırlanması
2. Sözleşme görüşmesinin planlanması
3. Sözleşmenin imzalanması
4. Müşteri hesap bilgilerinin alınması
5. Marka bilgilerinin sisteme girilmesi
6. Drive klasörünün oluşturulması
7. İletişim grubunun oluşturulması
8. İlk çekim gününün planlanması
9. Aylık içerik planının hazırlanması

## Sözleşme bilgileri

* Sözleşme başlangıç tarihi
* Sözleşme bitiş tarihi
* Aylık hizmet bedeli
* Ödeme günü
* Sözleşme süresi
* Otomatik yenilenme durumu
* Anlaşılan hizmetler
* Aylık içerik adetleri
* Aylık çekim günü hakkı
* Reklam yönetimi hizmeti
* Ek hizmetler
* İmzalı sözleşme dosyası
* Sözleşme notları

## Hesap ve entegrasyon kontrol listesi

* Instagram hesabı
* Facebook sayfası
* Meta Business hesabı
* Reklam hesabı
* Google işletme profili
* Web sitesi
* Alan adı
* Google Drive klasörü
* Canva marka dosyaları
* Logo dosyaları
* Kurumsal renkler
* Fontlar
* Eski fotoğraf ve videolar
* Müşteri iletişim kişileri

Hesap şifreleri doğrudan açık metin olarak CRM içerisinde tutulmamalıdır. Sistem mümkün olduğu durumlarda erişim bağlantısı, yetki durumu veya güvenli parola yöneticisi referansı saklamalıdır.

---

# 6. MÜŞTERİ MARKA SAYFASI

Her aktif müşterinin kendi çalışma alanı bulunmalıdır.

Bu sayfada:

* Firma bilgileri
* Yetkili kişiler
* Sözleşme
* Hizmet paketi
* Aylık içerik hakları
* Kullanılan ve kalan içerik adetleri
* Çekim günleri
* İçerik planı
* Örnek içerik havuzu
* Tasarımlar
* Videolar
* Yayın takvimi
* Reklamlar
* Ödeme durumu
* Revize geçmişi
* Drive bağlantıları
* Müşteri notları

tek yerde görüntülenmelidir.

---

# 7. AYLIK İÇERİK PAKETİ TAKİBİ

Sözleşmede müşteriyle aylık olarak anlaşılan içerik adetleri sisteme tanımlanır.

Örnek:

> Aylık 4 post
> Aylık 8 video
> Aylık 2 çekim günü
> Reklam yönetimi
> Haftalık story paylaşımı

Her ayın başında sistem sözleşmeye göre otomatik aylık plan oluşturabilir.

## Aylık paket göstergesi

* Anlaşılan post: 4

* Planlanan post: 4

* Hazırlanan post: 3

* Yayınlanan post: 2

* Anlaşılan video: 8

* Planlanan video: 8

* Çekilen video: 7

* Kurgulanan video: 5

* Yayınlanan video: 4

Eksik içerik olduğunda koordinatöre uyarı verilmelidir.

Örnek:

> Bu müşteri için Temmuz ayında 8 video anlaşılmış ancak yalnızca 6 video planlanmış.

---

# 8. İÇERİK ARAŞTIRMA VE REFERANS HAVUZU

Post ve video üretimi başlamadan önce referans araştırması yapılır.

Referanslar şu kaynaklardan gelebilir:

* Instagram
* Pinterest
* TikTok
* YouTube
* Rakip firmalar
* Eski Dou çalışmaları
* İşletme içerisinde çekilmiş fotoğraf ve videolar
* Müşteri tarafından gönderilen örnekler

## Referans kartında bulunacak bilgiler

* Referans görsel veya video
* Kaynak bağlantısı
* Kaynak platform
* İçerik türü
* Hangi müşteri için bulunduğu
* Hangi ay kullanılacağı
* Referansın açıklaması
* Uyarlanacak bölümler
* Kullanılmayacak bölümler
* Koordinatör notu
* Seçildi veya elendi durumu

## Referans durumları

* Araştırılıyor
* Havuza eklendi
* İncelenecek
* Seçildi
* Müşteriye gösterilecek
* Üretime alınacak
* Elendi
* Kullanıldı

Referanslar görsel bir pano şeklinde görüntülenebilmelidir. Böylece müşteri için bulunan tüm post ve video fikirleri tek ekranda görülebilir.

Referans içerik doğrudan kopyalanmamalı; müşterinin marka yapısına, renklerine, kampanyasına ve hedef kitlesine göre yeniden uyarlanmalıdır.

---

# 9. İÇERİK KARTLARI

Üretilecek her post veya video için ayrı içerik kartı oluşturulmalıdır.

## Ortak alanlar

* Müşteri
* İçerik başlığı
* İçerik türü
* İçerik konusu
* Aylık plan
* Sorumlu koordinatör
* Öncelik
* Planlanan yayın tarihi
* Referans içerikler
* Çekim ihtiyacı
* Tasarım ihtiyacı
* Reklam içeriği olup olmadığı
* İçerik açıklaması
* Drive klasörü
* Durum

## Video türleri

* Tanıtım videosu
* Kampanya videosu
* Bilgilendirici video
* Eğlenceli video
* Röportaj
* Müşteri deneyimi
* Ürün videosu
* Mekân videosu
* Reels
* Story videosu
* Reklam videosu
* Podcast kesiti
* Etkinlik videosu

## Post türleri

* Kampanya postu
* Bilgilendirici post
* Ürün postu
* Hizmet postu
* Kurumsal post
* Duyuru
* Etkinlik
* Müşteri yorumu
* Karusel
* Tek görsel
* Story tasarımı

---

# 10. ÇEKİM PLANLAMA

Çekim günü hem müşteriyle hem de Dou ekibiyle planlanmalıdır.

## Çekim kaydında bulunacak bilgiler

* Müşteri
* Çekim tarihi
* Başlangıç saati
* Tahmini bitiş saati
* Konum
* Çekime katılacak ekip
* Müşteri tarafındaki yetkili
* Çekilecek içerikler
* Gerekli ekipmanlar
* Hazırlanması gereken ürünler
* Oyuncu veya konuşmacılar
* Kıyafet bilgisi
* Çekim notları
* Çekim öncesi müşteri bilgilendirme durumu
* Çekim öncesi ekip bilgilendirme durumu

## Çekim günü sınırı

Bir müşteri için aynı ay içerisinde üçten fazla çekim günü oluşturulduğunda sistem uyarı vermelidir.

Uyarı örneği:

> Bu müşteri için Temmuz ayında daha önce 3 çekim günü planlandı. Yeni çekim, aylık operasyon sınırını aşmaktadır.

Bu durum kesin bir engel olmamalıdır. Özellikle yeni müşterilerin adaptasyon sürecinde ek çekim yapılabilir.

Üçüncü günden sonraki çekimlerde şu bilgiler zorunlu olmalıdır:

* Ek çekimin nedeni
* Koordinatör onayı
* Adaptasyon süreci olup olmadığı
* Müşteriden ek ücret alınıp alınmayacağı

## Çekim durumları

* Planlanıyor
* Müşteri onayı bekliyor
* Ekip onayı bekliyor
* Kesinleşti
* Çekim günü yaklaşıyor
* Çekim başladı
* Çekim tamamlandı
* Ertelendi
* İptal edildi

---

# 11. ÇEKİM SONRASI MEDYA AYIKLAMA

Çekim tamamlandıktan sonra ham dosyalar doğrudan edit sürecine gönderilmemelidir.

Önce medya ayıklama görevi oluşturulmalıdır.

## Medya ayıklama aşamaları

1. Dosyaların Drive’a yüklenmesi
2. Bozuk ve gereksiz çekimlerin temizlenmesi
3. Kullanılabilir videoların ayrılması
4. Kullanılabilir görsellerin ayrılması
5. İçeriklere göre klasörleme yapılması
6. Editör ve tasarımcı için not eklenmesi
7. Drive bağlantısının sisteme eklenmesi

## Dosya saklama yapısı

CRM içerisinde büyük boyutlu final videoların tutulması zorunlu değildir.

Sistemde şu bilgiler bulunmalıdır:

* Ana Drive klasörü
* Ham video klasörü
* Seçilen videolar klasörü
* Fotoğraf klasörü
* Tasarım klasörü
* Kurgu klasörü
* Final içerik klasörü
* Yayınlanan içerikler klasörü

Referans görseller, küçük tasarım dosyaları, tasarım ön izlemeleri ve gerekli dokümanlar sisteme yüklenebilir.

Final video dosyası yerine Drive bağlantısı veya dosya yolu kullanılabilir.

---

# 12. VİDEO KURGU SÜRECİ

Her çekilecek video için çekimden önce veya çekim sırasında kurgu kartı hazırlanmalıdır.

## Kurgu kartındaki bilgiler

* Video adı
* Müşteri
* Video türü
* Çekim tarihi
* Tahmini video süresi
* Tahmini kurgu süresi
* Editör
* Öncelik sırası
* Planlanan kurgu başlangıç tarihi
* Planlanan teslim tarihi
* Drive bağlantısı
* Referans video
* Kullanılacak müzik
* Kullanılacak metin
* Altyazı ihtiyacı
* Kapak ihtiyacı
* Özel çekim tekniği
* Özel geçiş notları
* Ses düzenleme notları
* Koordinatör açıklaması

## Çekim sırasında kullanılan özel yöntemler

Örneğin:

* Kamera hareketi devam ettirilecek
* Geçiş için el kamerayı kapatıyor
* İlk sahne son sahneyle birleştirilecek
* Speed ramp uygulanacak
* Green screen kullanılacak
* Ses sonradan eklenecek
* Aynı hareket farklı açılardan çekildi
* Belirli bir müziğin ritmine göre kesilecek
* Görselde ürün değişimi yapılacak

Bu notlar, video edit sırasına alınmadan önce kartta bulunmalıdır.

---

# 13. EDİTÖR İŞ SIRASI

Editör kendi panelini açtığında yapacağı videoları net bir sırada görmelidir.

Örnek:

1. EN20 Kampanya Reels
2. Yapıgranit Mutfak Tezgâhı
3. Enza Beauty Müşteri Yorumu
4. Back Gym Antrenman Videosu
5. Pam Air Pilot Röportajı

Her iş için:

* Sıra numarası
* Öncelik
* Tahmini süre
* Teslim tarihi
* Kaç gündür beklediği
* Müşteri
* Video türü
* Koordinatör notu

görüntülenmelidir.

## Edit sırası kuralları

Editör işlerin sırasını görebilir ancak koordinatör gerekli durumlarda sırayı değiştirebilir.

Bir video:

* Listenin başına alınabilir
* Belirli bir sıraya taşınabilir
* Acil olarak işaretlenebilir
* Başka müşterilerin işleri arasına yerleştirilebilir
* Müşteri bazında kendi içinde sıralanabilir

Örneğin bir müşterinin sekiz videosundan yalnızca ikisi acilse bu iki video öne alınabilir, diğer altı video farklı işlerin arasına dağıtılabilir.

Her sıra değişikliğinde sistem kayıt tutmalıdır:

* Sırayı kim değiştirdi
* Önceki sıra
* Yeni sıra
* Değişiklik tarihi
* Değişiklik nedeni

## Uzun süredir bekleyen editler

Sistem bekleme süresine göre uyarı vermelidir.

Örnek:

* 2 gündür başlamadı: Bilgilendirme
* 4 gündür başlamadı: Sarı uyarı
* 7 gündür başlamadı: Kırmızı uyarı
* Teslim tarihi geçti: Geciken iş

Bu süreler yönetici tarafından değiştirilebilir.

## Kurgu durumları

* Çekim bekliyor
* Dosya ayıklama bekliyor
* Edit sırasına alınacak
* Edit sırasında
* Kurgu başladı
* İlk taslak hazır
* Koordinatör kontrolünde
* Revizede
* Müşteri onayında
* Final hazır
* Yayına hazır
* Yayınlandı

---

# 14. TASARIM SÜRECİ

Post ve story tasarımları için de video kurgusuna benzer bir sıra sistemi olmalıdır.

## Tasarım kartında

* Müşteri
* Tasarım başlığı
* Tasarım türü
* Boyut
* Referans tasarım
* Kullanılacak görseller
* Kampanya bilgileri
* Ürün fiyatları
* Metin
* Marka renkleri
* Tasarımcı
* Öncelik
* Tahmini çalışma süresi
* Teslim tarihi
* Drive veya Canva bağlantısı

bulunmalıdır.

## Tasarım durumları

* Araştırılıyor
* Referans seçildi
* Görsel bekliyor
* Tasarım sırasında
* İlk taslak hazır
* Koordinatör kontrolünde
* Revizede
* Müşteri onayında
* Final hazır
* Yayına hazır
* Yayınlandı

---

# 15. KONTROL VE REVİZE SÜRECİ

Editör veya tasarımcı işi tamamladığında içerik doğrudan müşteriye ya da yayına gitmemelidir.

Öncelikle koordinatör kontrolüne gönderilmelidir.

## Kontrol listesi

### Video kontrolü

* Yazım hatası var mı
* Logo doğru mu
* Marka renkleri doğru mu
* Ses seviyesi uygun mu
* Görüntü kalitesi yeterli mi
* Videoda gereksiz boşluk var mı
* Altyazılar doğru mu
* Fiyat ve kampanya bilgileri doğru mu
* Video ölçüsü doğru mu
* Müzik uygun mu
* Müşteriyle anlaşılan konsepte uygun mu

### Tasarım kontrolü

* Yazım hatası var mı
* Fiyat doğru mu
* Ürün doğru mu
* Logo doğru mu
* Boyut doğru mu
* Görsel kalitesi yeterli mi
* Marka kimliğine uygun mu
* Tarih ve kampanya bilgileri doğru mu

## Kontrol sonucu

### Hata yoksa

İçerik yayına hazır veya müşteri onayına gönderilir.

### Hata varsa

İçerik revizeye gönderilir ve açıklayıcı revize notu yazılır.

Revize kaydında:

* Revizeyi isteyen kişi
* Revize tarihi
* Revize nedeni
* Revize açıklaması
* Revizeyi yapacak kişi
* Revize teslim tarihi
* Revize turu

bulunmalıdır.

Bir içeriğin kaç kez revize aldığı sistemde görüntülenmelidir.

---

# 16. YAYIN PLANLAMA

Onaylanan içerik yayın takvimine alınır.

## Yayın kartında

* Müşteri
* İçerik
* Platform
* Yayın tarihi
* Yayın saati
* Açıklama metni
* Etiketler
* Konum
* İş birliği hesabı
* Kapak
* Yayın sorumlusu
* Reklama çıkacak mı
* Yayın bağlantısı

yer almalıdır.

## Yayın durumları

* Planlanacak
* Yayın tarihi belirlendi
* Yayına hazır
* Planlandı
* Yayınlandı
* Yayın ertelendi
* Müşteri isteğiyle durduruldu

Yayın zamanı geçtiği hâlde içerik yayınlanmadıysa sistem uyarı vermelidir.

---

# 17. REKLAM YÖNETİMİ

Bir içerik kampanya veya reklam amacıyla hazırlanmışsa reklam takibi ayrıca yapılmalıdır.

## Reklam görevi iki şekilde oluşturulabilir

### Yeni içerikten reklam

Hazırlanan video veya tasarım için “Reklama çıkacak” seçeneği işaretlenir.

İçerik yayınlandıktan veya onaylandıktan sonra otomatik reklam görevi oluşturulur.

### Eski içerikten reklam

Müşteri daha önce yayınlanmış bir video veya post için reklam çıkılmasını isteyebilir.

Bu durumda yeni içerik üretim görevi oluşturmadan doğrudan reklam görevi açılabilir.

## Reklam kartında

* Müşteri
* Kullanılacak içerik
* İçerik bağlantısı
* Reklam amacı
* Hedef kitle
* Bölge
* Bütçe
* Başlangıç tarihi
* Bitiş tarihi
* Reklam sorumlusu
* Reklam hesabı
* Kampanya adı
* Reklam durumu
* Sonuç notları

bulunmalıdır.

## Reklam durumları

* Reklam talebi geldi
* İçerik seçilecek
* Müşteri onayı bekliyor
* Bütçe bekleniyor
* Reklam kuruluyor
* Kontrol bekliyor
* Yayında
* Durduruldu
* Tamamlandı
* Raporlandı

## Reklam uyarıları

* Reklama çıkılması gereken içerik hâlâ reklama çıkılmadı
* Reklam başlangıç tarihi geçti
* Reklam bütçesi tanımlanmadı
* Reklam süresi tamamlandı ancak rapor hazırlanmadı
* Kampanya videosu yayınlandı ancak reklam görevi oluşturulmadı

Örnek uyarı:

> EN20 gündüz üyeliği kampanya videosu 3 gün önce yayınlandı ancak reklam durumu hâlâ başlatılmadı.

---

# 18. ROLLER VE YETKİLER

## Yönetici

* Tüm müşterileri ve işleri görür
* Teklif ve sözleşmeleri yönetir
* Ekip performansını görüntüler
* Öncelik sırasını değiştirebilir
* Raporları görüntüler

## Koordinatör

* Müşteri sürecini yönetir
* İçerik planı oluşturur
* Çekim planlar
* Edit ve tasarım sırasını belirler
* İçerikleri kontrol eder
* Revize oluşturur
* Yayın ve reklam görevlerini takip eder

## Editör

* Kendisine atanan videoları görür
* Kurgu sırasını görüntüler
* Tahmini süre girer
* Kurgu durumunu günceller
* Final Drive bağlantısını ekler
* Revizeleri tamamlar

## Tasarımcı

* Kendisine atanan tasarımları görür
* Referansları ve görselleri görüntüler
* Tasarım durumunu günceller
* Canva veya Drive bağlantısı ekler
* Revizeleri tamamlar

## Çekim ekibi

* Çekim takvimini görür
* Çekilecek içerikleri görüntüler
* Çekim notlarını ekler
* Dosyaların yüklendiğini işaretler
* Kullanılan özel çekim yöntemlerini yazar

## Reklam sorumlusu

* Reklam görevlerini görür
* Kampanyaları oluşturur
* Reklam durumlarını günceller
* Bütçe ve sonuç bilgilerini girer

---

# 19. ANA EKRANLAR

Sistemin temel ekranları şu şekilde olmalıdır:

1. Genel Dashboard
2. Potansiyel Müşteriler
3. Satış Süreci
4. Teklifler
5. Sözleşmeler
6. Aktif Müşteriler
7. Aylık İçerik Planları
8. Referans Havuzu
9. Çekim Takvimi
10. Editör İş Sırası
11. Tasarımcı İş Sırası
12. Kontrol ve Revize Merkezi
13. Yayın Takvimi
14. Reklam Takibi
15. Ekip Yoğunluğu
16. Bildirimler
17. Raporlar

---

# 20. DASHBOARD UYARILARI

Ana ekranda özellikle şu uyarılar gösterilmelidir:

* Bugün aranması gereken potansiyel müşteriler
* Dönüş yapılmayan müşteri adayları
* Uzun süredir bekleyen teklifler
* Sözleşmesi imzalanmayan kabul edilmiş teklifler
* Hesap bilgileri eksik müşteriler
* Aylık içerik planı eksik müşteriler
* Üçten fazla çekim günü planlanan müşteriler
* Çekimi yapıldığı hâlde ayıklanmayan dosyalar
* Uzun süredir bekleyen editler
* Geciken tasarımlar
* Kontrol bekleyen içerikler
* Revizede bekleyen işler
* Yayın tarihi geçen içerikler
* Reklama çıkılmayan kampanya içerikleri
* Aylık içerik adedi eksik kalan müşteriler
* Sözleşme bitiş tarihi yaklaşan müşteriler

---

# 21. TEMEL RAPORLAR

## Satış raporları

* Aylık gelen müşteri adayı
* Müşteri adaylarının geldiği kaynaklar
* Sektörlere göre müşteri adayları
* Gönderilen teklif sayısı
* Teklif kabul oranı
* Teklif reddedilme nedenleri
* Ortalama müşteri dönüş süresi

## Operasyon raporları

* Müşteri başına aylık çekim günü
* Planlanan ve tamamlanan içerikler
* Geciken işler
* Ortalama kurgu süresi
* Ortalama tasarım süresi
* En fazla revize alan müşteriler
* Editör ve tasarımcı iş yükü
* Zamanında yayınlanan içerik oranı

## Reklam raporları

* Reklama çıkan içerik sayısı
* Reklama çıkması gerekirken çıkılmayan içerikler
* Aktif reklamlar
* Tamamlanan reklamlar
* Rapor bekleyen kampanyalar

---

# 22. ÖNERİLEN VERİTABANI YAPISI

Sistemin temel tabloları:

```text
users
roles
companies
contacts
leads
lead_sources
lead_activities
meetings
opportunities
offers
offer_packages
offer_items
contracts
contract_services
client_accounts
brands
monthly_plans
monthly_deliverables
content_items
reference_assets
shoots
shoot_participants
shoot_items
media_folders
edit_jobs
edit_queue
design_jobs
reviews
revisions
publishing_jobs
advertising_jobs
notifications
activity_logs
files
comments
```

Her önemli işlem `activity_logs` tablosuna kaydedilmelidir.

Örnek kayıtlar:

* Teklif fiyatı değiştirildi
* Çekim günü ertelendi
* Edit sırası değiştirildi
* İçerik revizeye gönderildi
* Reklam görevi oluşturuldu
* Sözleşme dosyası güncellendi

---

# 23. UYGULAMANIN İLK SÜRÜMÜ

İlk sürümde en kritik bölümler geliştirilmelidir:

## Faz 1

* Kullanıcı ve rol yönetimi
* Potansiyel müşteri kaydı
* Satış süreci
* Görüşme takibi
* Teklif yönetimi
* Aktif müşteri yönetimi
* Sözleşme ve hizmet paketi
* Temel bildirimler

## Faz 2

* Aylık içerik planı
* Referans havuzu
* Çekim takvimi
* Çekim günü limit uyarısı
* Editör iş sırası
* Tasarımcı iş sırası
* Kontrol ve revize sistemi

## Faz 3

* Yayın takvimi
* Reklam yönetimi
* Gelişmiş raporlar
* Ekip kapasite planlaması
* Otomatik tekrar eden görevler
* Müşteri onay paneli

Sistemin en kritik farkı, görevleri yalnızca listelemek yerine **müşterinin ilk iletişiminden reklam raporuna kadar bütün süreci birbirine bağlı şekilde yönetmesi** olacaktır.

---

# 24. UYGULAMA DURUMU

## Faz 1 — Tamamlandı

* [x] Yönetici, koordinatör, editör, tasarımcı, çekim ekibi, reklam sorumlusu ve izleyici rolleri tanımlandı.
* [x] Sunucu işlemlerine rol bazlı yazma yetkileri eklendi; izleyici rolünün kayıt değiştirmesi engellendi.
* [x] Potansiyel müşteri kartına ad, soyad, şehir, ilçe, hizmet, referans, bütçe, işletme büyüklüğü ve ilk iletişim tarihi eklendi.
* [x] Satış süreci durumları dokümandaki aşamalarla genişletildi.
* [x] Teklif reddi ve müşteri kaybı nedenleri kaydedilebilir hale getirildi.
* [x] Her müşteri adayı için sonraki işlem tarihi zorunlu hale getirildi.
* [x] Görüşme, sözleşme ve işlem günlüğü veritabanı temelleri oluşturuldu.
* [x] Müşteriye dönüşüm tek transaction içinde ve mükerrer kayıt korumalı hale getirildi.
* [x] Dönüşüm sonrasında dokuz başlangıç görevinin otomatik oluşturulması eklendi.
* [x] Görüşme kayıt ekranı
* [x] Sözleşme ve hizmet paketi ekranı
* [x] Tekliflerde üç paketli karşılaştırma ve ret analizi
* [x] Teklif paket seviyesi, ayrıntılı durum, ret ve revize nedeni kaydı
* [x] Dashboard temel uyarıları

## Faz 2 — Tamamlandı

* [x] Operasyon Merkezi ana ekranı
* [x] Sözleşmeden otomatik aylık içerik planı üretimi
* [x] Anlaşılan, planlanan, hazırlanan ve yayınlanan post/video adetlerinin takibi
* [x] Eksik planlanan içerik uyarıları
* [x] Görsel referans havuzu ve durum akışı
* [x] Çekim takvimi, ekip, içerik ve ekipman bilgileri
* [x] Aylık üç çekim günü sonrası gerekçe ve koordinatör onayı kontrolü
* [x] Medya ayıklama akışı
* [x] Editör iş sırası ve bekleme süresi uyarıları
* [x] Tasarımcı iş sırası ve bekleme süresi uyarıları
* [x] Sıra değişikliği nedeni ve işlem günlüğü
* [x] Kontrol ve çok turlu revize merkezi

## Faz 3 — Tamamlandı

* [x] Yayın takvimi ve geciken yayın uyarısı
* [x] Yayın durum akışı ve yayın bağlantısı
* [x] İçerikten otomatik reklam görevi oluşturma
* [x] Bağımsız eski içerik için reklam görevi açma
* [x] Reklam bütçe, tarih, hedef kitle ve durum takibi
* [x] Rapor bekleyen tamamlanmış reklam uyarısı
* [x] Gelişmiş satış, operasyon ve reklam raporları
* [x] Ekip iş yükü ve kapasite görünümü
* [x] Otomatik tekrar eden görevler
* [x] Süreli ve güvenli müşteri onay paneli
* [x] Müşteri onayıyla final, revize talebiyle revize akışına otomatik geçiş
