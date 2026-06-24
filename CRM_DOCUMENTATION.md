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
