const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, AlignmentType,
  BorderStyle, Header, Footer, PageNumber,
  LevelFormat, TabStopType, TabStopPosition,
} = require("docx");

const RED   = "800000";
const DARK  = "1a1a1a";
const MUTE  = "555555";
const LIGHT = "888888";

const sp = (before = 0, after = 0) => ({ spacing: { before, after } });

function heading(text) {
  return new Paragraph({
    ...sp(280, 80),
    children: [new TextRun({ text, bold: true, size: 22, color: DARK, font: "Arial" })],
  });
}

function body(text, color = MUTE) {
  return new Paragraph({
    ...sp(0, 100),
    children: [new TextRun({ text, size: 20, color, font: "Arial" })],
  });
}

function rule() {
  return new Paragraph({
    border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: "E5E5E5" } },
    ...sp(160, 160),
    children: [],
  });
}

function bulletItem(text) {
  return new Paragraph({
    numbering: { reference: "bullets", level: 0 },
    ...sp(0, 60),
    children: [new TextRun({ text, size: 20, color: MUTE, font: "Arial" })],
  });
}

const doc = new Document({
  numbering: {
    config: [
      {
        reference: "bullets",
        levels: [{
          level: 0, format: LevelFormat.BULLET, text: "–",
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 480, hanging: 240 } } },
        }],
      },
    ],
  },

  sections: [{
    properties: {
      page: {
        size: { width: 11906, height: 16838 },
        margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
      },
    },

    headers: {
      default: new Header({
        children: [
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: "E5E5E5" } },
            spacing: { after: 160 },
            children: [
              new TextRun({ text: "DOU Social — Yapımedya Reklamcılık A.Ş.", size: 16, color: LIGHT, font: "Arial" }),
            ],
          }),
        ],
      }),
    },

    footers: {
      default: new Footer({
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            border: { top: { style: BorderStyle.SINGLE, size: 4, color: "E5E5E5" } },
            spacing: { before: 120 },
            tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
            children: [
              new TextRun({ text: "Haziran 2026", size: 16, color: LIGHT, font: "Arial" }),
              new TextRun({ text: "\t", size: 16, font: "Arial" }),
              new TextRun({ text: "Sayfa ", size: 16, color: LIGHT, font: "Arial" }),
              new TextRun({ children: [PageNumber.CURRENT], size: 16, color: LIGHT, font: "Arial" }),
            ],
          }),
        ],
      }),
    },

    children: [
      // Cover
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 480, after: 80 },
        children: [new TextRun({ text: "KİŞİSEL VERİLERİN KORUNMASI VE İŞLENMESİ POLİTİKASI", bold: true, size: 34, color: RED, font: "Arial" })],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 80 },
        children: [new TextRun({ text: "Dou Social — Yapımedya Reklamcılık A.Ş.", size: 22, color: DARK, font: "Arial" })],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 480 },
        children: [new TextRun({ text: "Haziran 2026", size: 18, color: LIGHT, font: "Arial" })],
      }),

      rule(),

      // Intro
      body("Dou Social olarak, 6698 sayılı Kişisel Verilerin Korunması Kanunu (“KVKK”) kapsamında kişisel verilerinizin gizliliğini ve güvenliğini sağlamak temel önceliklerimiz arasındadır. Bu politika, www.dousocial.com adresli internet sitemiz ve sunduğumuz dijital/sosyal medya hizmetleri aracılığıyla elde edilen kişisel verilerin hangi amaçlarla işlendiğini, nasıl saklandığını ve nasıl korunduğunu açıklamak amacıyla hazırlanmıştır."),

      rule(),

      // 1
      heading("1. Veri Sorumlusu"),
      bulletItem("Veri Sorumlusu: Dou Social"),
      bulletItem("Adres: Zafer, Zafer Cd. No: 60, 20020 Denizli Merkezefendi/Denizli"),
      bulletItem("Telefon: +90 530 084 5468"),
      bulletItem("E-posta: info@dousocial.com"),

      rule(),

      // 2
      heading("2. İşlenen Kişisel Veriler"),
      body("Kimlik bilgileri (isim-soyisim), iletişim bilgileri (e-posta, telefon), müşteri işlem bilgileri (platform kullanım detayları, etkileşim verileri), finansal bilgiler (varsa hizmet satın alımları), kurumsal bilgiler ve internet kullanım bilgileri (IP adresi, çerez kayıtları), şikayet ve destek talepleri."),

      rule(),

      // 3
      heading("3. Kişisel Verilerin İşlenme Amaçları"),
      body("Hizmet sunumu (sosyal medya ve dijital platform hizmetlerine erişim), hesap ve kampanya yönetimi, faturalandırma, müşteri iletişimi, kullanıcı etkileşim ve performans analizi ile hukuki yümlülüklerin yerine getirilmesi."),

      rule(),

      // 4
      heading("4. Kişisel Verilerin Toplanma Yöntemleri ve Hukuki Sebepler"),
      body("Kişisel verileriniz; web sitemiz, e-posta iletişimleri, sosyal medya hesaplarımız (@dousocial vb.), analiz araçları ve entegre çalışılan dijital platformlar (Meta, Google vb.) aracılığıyla toplanmaktadır."),

      rule(),

      // 5
      heading("5. Kişisel Verilerin Aktarımı"),
      body("Verileriniz; muhasebe işlemleri için mali müşavirler, bankalar ve ödeme kuruluşlarına, sunucu hizmeti alınan teknik altyapı sağlayıcılarına (AWS, Google Cloud, Meta, Google Analytics vb.) ve yasal zorunluluk hallerinde yetkili kamu kurumlarına aktarılabilir."),

      rule(),

      // 6
      heading("6. Kişisel Verilerin Saklanması ve Korunması"),
      body("Kişisel verileriniz, işlenme amaçlarının gerektirdiği süre boyunca ve ilgili mevzuatta öngörülen zamanaşımı süreleri dikkate alınarak muhafaza edilmektedir. İşlenme amacının ortadan kalkması halinde veriler, Dou Social tarafından silinir veya anonim hale getirilir."),
      bulletItem("Dijital ortamlarda şifreleme ve güncel güvenlik duvarları kullanılmaktadır."),
      bulletItem("Erişimler yalnızca yetkili personel ve yöneticiler ile sınırlandırılmıştır."),

      rule(),

      // 7
      heading("7. İlgili Kişinin Hakları"),
      body("KVKK’nın 11. maddesi uyarınca; verilerinizin işlenip işlenmediğini öğrenme, düzeltme talep etme ve silinmesini isteme haklarına sahipsiniz. Taleplerinizi info@dousocial.com adresine iletebilirsiniz. Başvurularınız yasal süre olan en geç 30 gün içinde sonuçlandırılır."),

      rule(),

      // 8
      heading("8. Çerez (Cookie) Politikası"),
      body("www.dousocial.com, kullanıcı deneyiminizi geliştirmek, site üzerindeki tercihlerinizi hatırlamak ve site trafiğini analiz etmek (performans ve analitik çerezleri) amacıyla çerezler kullanır. Kullanıcılar tarayıcı ayarlarından çerezleri diledikleri zaman yönetebilir veya devre dışı bırakabilir."),

      rule(),

      // 9
      heading("9. Politika Güncellemeleri"),
      body("Bu politika, bilişim ve dijital medya sektörü mevzuat değişiklikleri ile şirket uygulamaları doğrultusunda güncellenebilir. Güncel metin her zaman www.dousocial.com adresinde yayımlanır."),

      rule(),

      // 10
      heading("10. Yürürlük"),
      body("İşbu politika yayımlandığı tarihte yürürlüye girer ve Dou Social tarafından yürütülen tüm veri işleme faaliyetleri için bağlayıcıdır."),
    ],
  }],
});

const outPath = "C:\\Users\\Efe\\Downloads\\dou-social-web-main\\public\\kvkk-aydinlatma-metni.docx";
Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync(outPath, buffer);
  console.log("Created:", outPath, "(" + buffer.length + " bytes)");
});
