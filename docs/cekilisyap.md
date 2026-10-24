# Instagram çekilişi

`/cekilisyap` tam HTML arayüzü döndüren bağımsız bir Next.js Route Handler'dır. Yerel dil arakatmanı bu URL'yi yönlendirmez. Masaüstü ve mobil menüde Çekiliş Yap bağlantısı vardır. Mevcut sayfalar ve API'ler değiştirilmez; çekiliş API'leri yalnızca `/api/cekilisyap/{status,comments,draw}` altındadır.

## Canlı yorum bağlantısı

Vercel projesinin production ve gerekli preview ortamına `APIFY_API_TOKEN` gizli değişkenini ekleyin ve yeniden yayınlayın. Anahtarı repoya veya istemci koduna koymayın. Kullanıcıdan Instagram girişi istenmez. Hesap ve servis bakiyesi ayrıca gereklidir; yeni üyelik veya ücretli plan bu değişiklikle satın alınmaz. Anahtar yoksa durum uç noktası `configured: false` döndürür; yorum isteği açık bir 503 mesajı verir.

Bağdaştırıcı Apify `apify/instagram-comment-scraper` Actor'ünü başlatır. İş kimliği, servis anahtarıyla imzalanmış HttpOnly/Secure/SameSite çerezine bağlanır. Başka bir iş kimliği okunmaz. Sonuçlar 1.000 satırlık sayfalarla alınır. Yorum sınırına ulaşılması, erişim hatası veya yarım aktarımda çekiliş listesi oluşturulmaz. Instagram'daki gizlenmiş, silinmiş veya erişilemeyen yorumlar için tam kapsam garantisi verilmez; aktarım kapsamı operatöre gösterilir.

POST istekleri aynı kaynaktan gelmelidir. Sitede var olan istek sınırlayıcıyla IP başına 10 dakikada 3 yorum aktarımı, 12 seçim uygulanır. Bu sınırlayıcı işlem belleğindedir; dağıtık, toplam harcama kotası değildir. Servis hesabında uygun harcama limiti tutulmalıdır. Kalıcı, dağıtık kota ve sonuç arşivi bu sürümde bulunmaz.

Demo, JSON aktarımı, etiket/kelime/tarih filtreleri, tek kişi hakkı, rastgele kazanan ve sıralı yedekler, manuel takip/beğeni onayı, yerel geçmiş ve indirmeler desteklenir. Seçim sunucuda Web Crypto ve rejection sampling kullanır. İndirilebilir HTML önizlemesi kendi tarayıcısında seçim yapar ve canlı servis iddiasında bulunmaz. Sonuç özeti bağımsız denetim sertifikası değildir.
