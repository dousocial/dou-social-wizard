# Instagram çekilişi

`/cekilisyap` tam HTML arayüzü döndüren bağımsız bir Next.js Route Handler'dır. Yerel dil arakatmanı bu URL'yi yönlendirmez. Masaüstü ve mobil menüde Çekiliş Yap bağlantısı vardır. Mevcut sayfalar ve API'ler değiştirilmez; çekiliş API'leri yalnızca `/api/cekilisyap/{status,comments,draw}` altındadır.

## Canlı yorum bağlantısı

Vercel projesinin production ve gerekli preview ortamına `APIFY_API_TOKEN` gizli değişkenini ekleyin ve yeniden yayınlayın. Anahtarı repoya veya istemci koduna koymayın. Kullanıcıdan Instagram girişi istenmez. Hesap ve servis bakiyesi ayrıca gereklidir; yeni üyelik veya ücretli plan bu değişiklikle satın alınmaz. Anahtar yoksa durum uç noktası `configured: false` döndürür; yorum isteği açık bir 503 mesajı verir.

Bağdaştırıcı Apify `apify/instagram-comment-scraper` Actor'ünü başlatır. İş kimliği, servis anahtarıyla imzalanmış HttpOnly/Secure/SameSite çerezine bağlanır. Başka bir iş kimliği okunmaz. Sonuçlar 1.000 satırlık sayfalarla alınır. Yorum sınırına ulaşılması, erişim hatası veya yarım aktarımda çekiliş listesi oluşturulmaz. Instagram'daki gizlenmiş, silinmiş veya erişilemeyen yorumlar için tam kapsam garantisi verilmez; aktarım kapsamı operatöre gösterilir.

POST istekleri aynı kaynaktan gelmelidir. Sitede var olan istek sınırlayıcıyla IP başına 10 dakikada 3 yorum aktarımı, 12 seçim uygulanır. Bu sınırlayıcı işlem belleğindedir; dağıtık, toplam harcama kotası değildir. Servis hesabında uygun harcama limiti tutulmalıdır. Kalıcı, dağıtık kota ve sonuç arşivi bu sürümde bulunmaz.

Demo, JSON aktarımı, etiket/kelime/tarih filtreleri, tek kişi hakkı, rastgele kazanan ve sıralı yedekler, manuel takip/beğeni onayı, yerel geçmiş ve indirmeler desteklenir. Seçim sunucuda Web Crypto ve rejection sampling kullanır. İndirilebilir HTML önizlemesi kendi tarayıcısında seçim yapar ve canlı servis iddiasında bulunmaz. Sonuç özeti bağımsız denetim sertifikası değildir.

## 1.000 yorum seçeneği

Toplama ekranında iki ayrı seçenek bulunur. Erişilebilir yorumlar mevcut Apify actorünü kullanır ve oturum açılmadan erişilebilen yorumlarla sınırlıdır. 1.000 yorum seçeneği `louisdeconinck/instagram-comments-scraper` actorünü `{urls: [url], maxComments: 1000}` ile çalıştırır. Sağlayıcı ücretsiz Apify hesaplarında gönderi başına 15 kayıt sınırı uygular; yüksek hacimli kullanım ücretli plan gerektirir. Sonuç, canlı bir gönderide ayrıca doğrulanmalıdır.

Hedef ve iş kimliği birlikte imzalanır. 1.000 kayıt hedefi karşılanmazsa veya kayıtlar yinelenmişse liste çekilişe yüklenmez. Bu seçenek tam 1.000 yorumda durur; daha büyük gönderilerde tüm katılımcıları kapsamaz. Kullanıcı kapsamı doğrulamalıdır. İş başına Apify `maxTotalChargeUsd=2` limiti uygulanır; bu, dağıtık genel bütçe koruması veya aylık harcama sınırı değildir.

Kaynak: https://apify.com/louisdeconinck/instagram-comments-scraper
