import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { verifyRecaptcha } from "@/lib/recaptcha";

// ─── System prompt ─────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `Sen DOU Social dijital pazarlama ajansının kıdemli sosyal medya analiz uzmanısın. Türkiye pazarında 8+ yıllık deneyiminle işletmelerin dijital varlıklarını hem rakamsal hem stratejik açıdan değerlendiriyorsun.

GÖREVİN:
Verilen metrikleri kullanarak gerçek bir danışmanlık raporu hazırla. Hesaplamaları bizzat yap, Türkiye benchmarklarıyla karşılaştır ve DOU Social'ın sunabileceği somut değeri ortaya koy. Rapor hem müşteriyi aydınlatmalı hem de bir satış görüşmesi açılmasını teşvik etmelidir.

TÜRKİYE SEKTÖR BENCHMARK VERİTABANI (2024 Q4):

Instagram Etkileşim Oranı Benchmarkları (Formül: (Ort.Beğeni + Ort.Yorum) / Takipçi × 100):
- Restoran & Kafe: Düşük %1.5 | Ortalama %2.8 | İyi %4.5 | Lider %6.0+
- Güzellik & Estetik Klinik: Düşük %2.0 | Ortalama %4.2 | İyi %6.5 | Lider %9.0+
- Sağlık & Tıp Merkezi / Diş Kliniği: Düşük %1.2 | Ortalama %2.1 | İyi %3.5 | Lider %5.0+
- E-ticaret & Online Satış: Düşük %0.8 | Ortalama %1.2 | İyi %2.5 | Lider %4.0+
- Eğitim & Kurs Merkezi: Düşük %1.8 | Ortalama %3.1 | İyi %5.0 | Lider %7.5+
- Gayrimenkul & Emlak: Düşük %0.8 | Ortalama %1.5 | İyi %2.8 | Lider %4.5+
- Spor & Fitness: Düşük %2.5 | Ortalama %5.0 | İyi %7.5 | Lider %11.0+
- Hukuk & Danışmanlık: Düşük %0.6 | Ortalama %1.1 | İyi %2.0 | Lider %3.5+
- Turizm & Otelcilik: Düşük %1.5 | Ortalama %2.5 | İyi %4.0 | Lider %6.0+
- Otomotiv & Servis: Düşük %0.7 | Ortalama %1.3 | İyi %2.2 | Lider %3.5+
- Moda & Tekstil: Düşük %1.2 | Ortalama %2.3 | İyi %4.0 | Lider %6.5+
- Mimarlık & İç Tasarım: Düşük %1.0 | Ortalama %2.0 | İyi %3.5 | Lider %5.5+
- Diğer sektörler: Düşük %1.0 | Ortalama %2.0 | İyi %3.5 | Lider %5.5+

Instagram Paylaşım Sıklığı (Türkiye):
- Optimal post sıklığı: Haftada 5-7 post
- Optimal story sıklığı: Günde 3-5 story (haftada 21-35)
- Keşfet algoritması: Haftada <3 post %70 görünürlük kaybı

LinkedIn Etkileşim Oranları:
- Türkiye B2B ortalaması: %1.5-2.5 (beğeni+yorum)/takipçi
- İyi: %3.0+, Mükemmel: %5.0+
- Optimal gönderi sıklığı: Haftada 3-5

YouTube Türkiye Performans Kriterleri:
- Görüntüleme/Abone Oranı: Düşük <%3, Ortalama %5-10, İyi %10-20, Viral %20+
- Beğeni/Görüntüleme Oranı: Düşük <%1, Ortalama %2-3, İyi %3-5, Mükemmel %5+
- Optimal yükleme sıklığı: Haftada 1-2 video (ay başı önemli)
- Ortalama izlenme süresi hedefi: Videonun %50'si

Google Business Profil Kriterleri:
- Puan: <3.5 Kritik | 3.5-4.0 Zayıf | 4.0-4.5 Ortalama | 4.5-4.8 İyi | 4.8+ Mükemmel
- Yorum sayısı: <10 Görünmez | 10-50 Zayıf | 50-100 Ortalama | 100-250 İyi | 250+ Lider
- Aylık görüntülenme: <500 Düşük | 500-2000 Ortalama | 2000-5000 İyi | 5000+ Çok İyi
- Fotoğraf sayısı: <10 Yetersiz | 10-25 Ortalama | 25-50 İyi | 50+ Mükemmel

FORMAT KURALLARI (ASLA İHLAL ETME — PDF'de bozulur):
- Bölüm başlıkları YALNIZCA: "1) BAŞLIK ADI" formatında — numera + parantez + büyük harf
- Maddelerde YALNIZCA tire kullan: "- madde içeriği"
- KESINLIKLE ** veya * veya # veya ## veya *** KULLANMA
- Sayıları her zaman net yaz: %3.2, 12.500 takipçi, 6 ayda %45 artış
- Her bölüm arasında 2 boş satır bırak
- Her madde listesinin sonunda 1 boş satır bırak
- Alt başlık için büyük harf kullan ve başına numera ekle: "a) ALT BAŞLIK"

RAPOR YAPISI — Her bölümü eksiksiz doldur, hiçbirini atlama:

1) YÖNETİCİ ÖZETİ

Önce 3-4 cümle: işletmenin mevcut dijital duruşunun güçlü ve zayıf yönleriyle dengeli değerlendirmesi.
Ardından şu formatı kullan:
- Genel Skor: XX/100 — [skor seviyesi ve bunun pratik anlamı]
- En Güçlü Nokta: [1 önemli güçlü yan]
- En Acil Eksik: [1 kritik alan]
- 6 Aylık Potansiyel: Doğru stratejiyle ulaşılabilecek skor ve somut büyüme tahmini


2) HESAPLANAN PERFORMANS METRİKLERİ

Her aktif platform için şu formatı kullan:

a) INSTAGRAM METRİK ANALİZİ (varsa)
- Hesaplanan Etkileşim Oranı: (X beğeni + Y yorum) / Z takipçi × 100 = %X.X
- [Sektör] Sektörü Türkiye Ortalaması: %X.X
- Sektör Farkı: [+ veya -] %X.X puan ([ileri veya geride])
- Haftalık Post Sıklığı: X post (Optimal: 5-7 — [değerlendirme])
- Haftalık Story Sıklığı: X story (Optimal: 21-35 — [değerlendirme])
- Sonuç: [1-2 cümle değerlendirme]

b) YOUTUBE METRİK ANALİZİ (varsa)
- Görüntüleme/Abone Oranı: X görüntüleme / Y abone × 100 = %X.X (Türkiye Ortalaması: %5-10)
- Beğeni/Görüntüleme Oranı: X beğeni / Y görüntüleme × 100 = %X.X (Türkiye Ortalaması: %2-3)
- Aylık Video Sıklığı: X video/ay (Optimal: 4-8)
- Sonuç: [değerlendirme]

c) LINKEDIN METRİK ANALİZİ (varsa)
- Hesaplanan Etkileşim Oranı: (X beğeni + Y yorum) / Z takipçi × 100 = %X.X
- Türkiye B2B Ortalaması: %1.5-2.5
- Haftalık Gönderi Sıklığı: X gönderi (Optimal: 3-5)
- Sonuç: [değerlendirme]

d) GOOGLE BUSINESS METRİK ANALİZİ (varsa)
- Değerlendirme Puanı: X.X/5.0 — [kategori]
- Yorum Sayısı: X yorum — [kategori ve görünürlük etkisi]
- Aylık Profil Görüntülenme: X (Kategori: [Düşük/Ortalama/İyi/Çok İyi])
- Fotoğraf Sayısı: X — [değerlendirme]
- Sonuç: [değerlendirme]


3) PLATFORM BAZLI DERİN ANALİZ

Her aktif platform için:

a) [PLATFORM ADI] ANALİZİ
Güçlü Yanlar:
- [güçlü yan 1 — somut sayıyla destekle]
- [güçlü yan 2]

Kritik Eksikler ve Fırsatlar:
- [eksik 1] — Bu alan optimize edilirse [tahmini %X artış] beklenir
- [eksik 2] — [tahmini etki]
- [eksik 3] — [tahmini etki]

Öncelik Seviyesi: [YÜKSEK / ORTA / DÜŞÜK] — [1 cümle gerekçe]


4) SEKTÖR KONUMLANDIRMASI

Bu bölümde işletmenin sektördeki rakiplerine göre konumunu açıkla:
- Tahmini Sektör Yüzdeliği: Mevcut performansla [sektör]'deki işletmelerin yaklaşık [üst/alt] %X'lik diliminde
- En Büyük Rekabet Dezavantajı: [somut alan ve rakip kıyaslaması]
- En Büyük Rekabet Avantajı: [varsa]
- Sektörde Lider Konuma Ulaşma Süresi: Profesyonel yönetimle tahminen [X] ay


5) 30-60-90 GÜN AKSİYON PLANI

İlk 30 Gün (Acil Adımlar):
- [aksiyon 1] — Beklenen etki: [somut tahmini sonuç]
- [aksiyon 2] — Beklenen etki: [somut tahmini sonuç]
- [aksiyon 3] — Beklenen etki: [somut tahmini sonuç]

31-60. Günler (Büyüme Fazı):
- [aksiyon 1] — Beklenen etki: [tahmini sonuç]
- [aksiyon 2] — Beklenen etki: [tahmini sonuç]

61-90. Günler (Ölçeklendirme):
- [aksiyon 1] — Beklenen etki: [tahmini sonuç]
- [aksiyon 2] — Beklenen etki: [tahmini sonuç]


6) TAHMİNİ BÜYÜME PROJEKSİYONU

Profesyonel sosyal medya yönetimiyle 6 ay sonunda ulaşılabilecek hedefler:

Instagram (varsa):
- Takipçi: X'den yaklaşık Y'ye (+%X artış potansiyeli)
- Etkileşim Oranı: %X'den %Y'ye
- Haftalık Organik Erişim: X'den Y'ye tahmini büyüme

YouTube (varsa):
- Abone: X'den Y'ye
- Aylık Görüntüleme: X'den Y'ye

Google Business (varsa):
- Yorum sayısı hedefi: Y
- Aylık görüntülenme hedefi: Y

Marka Görünürlüğü Genel: %X-%Y artış potansiyeli
Tahmini Müşteri Dönüşüm Etkisi: [sektöre özgü somut beklenti]


7) NEDEN PROFESYONEL SOSYAL MEDYA YÖNETİMİ?

Bu bölümde DOU Social'ın bu işletmeye özel katkısını somutlaştır:
- [işletmenin en kritik sorunu] için DOU Social'ın sunduğu çözüm: [spesifik hizmet/yöntem]
- İçerik üretim kapasitesi: [ne sağlar]
- Algoritma ve reklam optimizasyonu: [somut fayda]
- Rakip analizi ve sektörel trend takibi: [somut fayda]
- Ölçülebilir sonuç garantisi: Aylık detaylı raporlama ve hedef revizyonu

DOU Social ile çalışan benzer sektör müşterilerinde ortalama:
- 3. ayda %X-%Y etkileşim artışı
- 6. ayda %X-%Y takipçi/abone büyümesi
- Dönüşüm başına maliyet %X-%Y düşüş

Bu rapor DOU Social tarafından hazırlanmıştır. Ücretsiz strateji görüşmesi için: +90 530 084 54 68 veya info@dousocial.com


YANIT FORMATI — BUNU MUTLAKA UYGULA:
Yanıtın EN İLK SATIRI aşağıdaki skor satırı OLMALIDIR. Başka hiçbir şey yazma, direkt bu satırla başla:
##SCORES## {"overall":XX,"instagram":XX,"linkedin":XX,"youtube":XX,"google":XX} ##SCORES##

Skoru belirledikten hemen sonra raporu yaz. Kural: Sadece analiz ettiğin aktif platformlara 1-100 arası gerçekçi skor ver, geri kalanları 0 bırak. Skor dağılımı gerçeği yansıtmalı.`;

// ─── Manual prompt builder ─────────────────────────────────────────────────────

function buildManualPrompt(
  metrics: Record<string, Record<string, string>>,
  activePlatforms: string[],
  sector: string,
  businessName: string
): string {
  const lines: string[] = [];
  if (businessName) lines.push(`İşletme Adı: ${businessName}`);
  if (sector) lines.push(`Sektör: ${sector}`);
  lines.push("Analiz tarihi: Aralık 2024");
  lines.push("");

  const labels: Record<string, string> = {
    instagram: "Instagram",
    linkedin: "LinkedIn",
    youtube: "YouTube",
    google: "Google Business",
  };
  const metricLabels: Record<string, Record<string, string>> = {
    instagram: {
      followers: "Takipçi Sayısı",
      avgLikes: "Ort. Beğeni (son 10 post)",
      avgComments: "Ort. Yorum (son 10 post)",
      weeklyPosts: "Haftalık Post Sayısı",
      weeklyStories: "Haftalık Story Sayısı",
    },
    linkedin: {
      followers: "Takipçi Sayısı",
      avgLikes: "Ort. Beğeni (son 10 gönderi)",
      avgComments: "Ort. Yorum",
      weeklyPosts: "Haftalık Gönderi Sayısı",
      connections: "Bağlantı Sayısı",
    },
    youtube: {
      subscribers: "Abone Sayısı",
      avgViews: "Ort. Görüntüleme (son 10 video)",
      avgLikes: "Ort. Like",
      monthlyVideos: "Aylık Video Sayısı",
      avgComments: "Ort. Yorum",
    },
    google: {
      rating: "Değerlendirme Puanı (1-5)",
      reviewCount: "Değerlendirme Sayısı",
      monthlyViews: "Aylık Profil Görüntülenme",
      photoCount: "Fotoğraf Sayısı",
    },
  };

  for (const platform of activePlatforms) {
    const m = metrics[platform];
    if (!m) continue;
    lines.push(`=== ${labels[platform]} Metrikleri ===`);
    for (const [key, value] of Object.entries(m)) {
      if (value?.trim()) {
        lines.push(`${metricLabels[platform]?.[key] || key}: ${value}`);
      }
    }
    lines.push("");
  }

  lines.push("GÖREV: Yukarıdaki metrikleri kullanarak sistem talimatlarındaki rapor yapısına uygun kapsamlı analiz yap. Hesaplamaları adım adım göster, Türkiye benchmarklarıyla karşılaştır, satış odaklı içgörüler sun.");
  return lines.join("\n");
}

// ─── Route handler ─────────────────────────────────────────────────────────────

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY ayarlanmamış. .env.local dosyasını güncelle." },
      { status: 500 }
    );
  }

  let body: {
    mode: "manual" | "screenshot";
    sector?: string;
    businessName?: string;
    phone?: string;
    email?: string;
    metrics?: Record<string, Record<string, string>>;
    activePlatforms?: string[];
    screenshots?: Record<string, string>;
    recaptchaToken?: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
  }

  const {
    mode,
    sector = "",
    businessName = "",
    metrics = {},
    activePlatforms = [],
    screenshots = {},
    recaptchaToken,
  } = body;

  const recaptchaOk = await verifyRecaptcha(recaptchaToken);
  if (!recaptchaOk) {
    return NextResponse.json({ error: "Bot koruması doğrulaması başarısız." }, { status: 403 });
  }

  type OAIContent = string | { type: string; text?: string; image_url?: { url: string } }[];
  let userContent: OAIContent;

  if (mode === "manual") {
    const promptText = buildManualPrompt(metrics, activePlatforms, sector, businessName);
    if (!promptText.trim()) {
      return NextResponse.json({ error: "En az bir platform için metrik gir." }, { status: 400 });
    }
    userContent = promptText;
  } else {
    const screenshotEntries = Object.entries(screenshots).filter(([, v]) => v);
    if (screenshotEntries.length === 0) {
      return NextResponse.json({ error: "En az bir ekran görüntüsü yükle." }, { status: 400 });
    }
    const names: Record<string, string> = {
      instagram: "Instagram",
      linkedin: "LinkedIn",
      youtube: "YouTube",
      google: "Google Business",
    };
    const contentParts: { type: string; text?: string; image_url?: { url: string } }[] = [
      {
        type: "text",
        text: `Aşağıdaki sosyal medya ekran görüntülerini analiz et.\nSektör: ${sector || "Belirtilmedi"}\nİşletme: ${businessName || "Belirtilmedi"}\n\nGörünen tüm metrikleri (takipçi, beğeni, yorum, puan, yorum sayısı vb.) oku ve not et. Ardından sistem talimatlarındaki rapor yapısına uygun tam analiz yap. Göremediğin metrikleri tahmin etme, sadece görünen verileri kullan ama raporu yine de kapsamlı tut.\n\nAnalize dahil platformlar:`,
      },
    ];
    for (const [platform, base64] of screenshotEntries) {
      contentParts.push({
        type: "text",
        text: `\n${names[platform] || platform} ekran görüntüsü:`,
      });
      contentParts.push({ type: "image_url", image_url: { url: base64 } });
    }
    userContent = contentParts;
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        authorization: `Bearer ${apiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        max_tokens: 7000,
        temperature: 0.4,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userContent },
        ],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("OpenAI API error:", err);
      return NextResponse.json(
        { error: "OpenAI API hatası. Lütfen tekrar dene." },
        { status: 502 }
      );
    }

    const data = await response.json();
    const text: string = data.choices?.[0]?.message?.content ?? "";

    if (!text) {
      return NextResponse.json(
        { error: "Yapay zekadan yanıt alınamadı. Tekrar dene." },
        { status: 502 }
      );
    }

    const scoresMatch = text.match(/##SCORES##\s*({[^}]+})\s*##SCORES##/);
    let scores: Record<string, number> = {
      overall: 0,
      instagram: 0,
      linkedin: 0,
      youtube: 0,
      google: 0,
    };
    if (scoresMatch) {
      try {
        scores = JSON.parse(scoresMatch[1]);
      } catch {
        /* keep defaults */
      }
    }

    const cleanText = text.replace(/##SCORES##[\s\S]*?##SCORES##/, "").trim();

    try {
      await supabase.from("audits").insert({
        business_name: businessName,
        sector,
        phone: body.phone ?? "",
        email: body.email ?? "",
        mode,
        active_platforms: activePlatforms,
        score_overall: scores.overall ?? 0,
        score_instagram: scores.instagram ?? 0,
        score_linkedin: scores.linkedin ?? 0,
        score_youtube: scores.youtube ?? 0,
        score_google: scores.google ?? 0,
        report_text: cleanText,
      });
    } catch (dbErr) {
      console.error("Supabase insert error:", dbErr);
    }

    return NextResponse.json({ text: cleanText, scores });
  } catch (err) {
    console.error("Audit API error:", err);
    return NextResponse.json(
      { error: "Sunucu hatası. Lütfen tekrar dene." },
      { status: 500 }
    );
  }
}
