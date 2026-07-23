export interface AuditReportData {
  businessName: string;
  sector: string;
  phone: string;
  email: string;
  scores: {
    overall: number;
    instagram: number;
    linkedin: number;
    youtube: number;
    google: number;
  };
  reportText: string;
  date?: string;
}

// ─── Color helpers ─────────────────────────────────────────────────────────────

function scoreColor(s: number): string {
  if (s === 0) return "#9ca3af";
  if (s < 40) return "#dc2626";
  if (s < 60) return "#ea580c";
  if (s < 80) return "#ca8a04";
  return "#16a34a";
}

function scoreBg(s: number): string {
  if (s === 0) return "#f3f4f6";
  if (s < 40) return "#fef2f2";
  if (s < 60) return "#fff7ed";
  if (s < 80) return "#fefce8";
  return "#f0fdf4";
}

function scoreLabel(s: number): string {
  if (s === 0) return "—";
  if (s < 40) return "KRİTİK EKSİK";
  if (s < 60) return "YETERSİZ";
  if (s < 80) return "GELİŞTİRİLMELİ";
  return "İYİ DURUMDA";
}

function overallBadge(s: number): { label: string; text: string; icon: string } {
  if (s < 40)
    return {
      label: "Acil Müdahale Gerekiyor",
      text: "Dijital varlık ciddi boşluklar içeriyor. Doğru strateji ve profesyonel destek ile kısa sürede rakiplerin önüne geçilebilir.",
      icon: "⚠",
    };
  if (s < 60)
    return {
      label: "Gelişime Açık — Büyük Potansiyel Var",
      text: "Temel varlık mevcut ancak rakiplerin belirgin biçimde gerisinde kalınıyor. Hedefli bir dijital strateji ile fark kapatılabilir ve hızla lider konuma gelinebilir.",
      icon: "📈",
    };
  if (s < 80)
    return {
      label: "Orta Düzey — Optimize Edilmemiş Alanlar Var",
      text: "Sağlam bir temel kurulmuş; ancak sektör liderlerine ulaşmak için yüksek potansiyelli optimize edilmemiş alanlar dikkat çekiyor.",
      icon: "🎯",
    };
  return {
    label: "Güçlü Başlangıç — Liderliğe Bir Adım Kaldı",
    text: "Dijital varlık sektörün üzerinde seyrediyor. Sürdürülebilir büyüme için sistemli içerik ve reklam stratejisi kritik önem taşıyor.",
    icon: "🏆",
  };
}

// ─── Score card (table-based for html2canvas reliability) ─────────────────────

function scoreCard(label: string, score: number): string {
  if (score === 0) return "";
  const color = scoreColor(score);
  const bg = scoreBg(score);
  const pct = Math.min(score, 100);
  const lbl = scoreLabel(score);

  return `
  <td style="width:20%;text-align:center;padding:16px 8px;vertical-align:top;">
    <div style="display:inline-block;width:72px;height:72px;border-radius:50%;border:4px solid ${color};background:${bg};line-height:64px;text-align:center;margin-bottom:10px;">
      <span style="font-size:22px;font-weight:900;color:${color};letter-spacing:-1px;">${score}</span>
    </div>
    <div style="font-size:8.5px;font-weight:700;color:#374151;margin-bottom:4px;letter-spacing:0.02em;">${label}</div>
    <div style="background:#e5e7eb;border-radius:100px;height:3px;margin:0 auto 5px;width:60px;">
      <div style="background:${color};width:${pct}%;height:3px;border-radius:100px;max-width:60px;"></div>
    </div>
    <div style="display:inline-block;font-size:7px;font-weight:800;color:${color};background:${color}18;border-radius:100px;padding:2px 7px;border:1px solid ${color}35;letter-spacing:0.05em;">${lbl}</div>
  </td>`;
}

// ─── Inline markdown stripper ──────────────────────────────────────────────────

function processInline(s: string): string {
  return s
    .replace(/\*\*\*(.*?)\*\*\*/g, "<b>$1</b>")
    .replace(/\*\*(.*?)\*\*/g, "<b>$1</b>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/`(.*?)`/g, "<code style='background:#f4f4f4;padding:1px 4px;border-radius:3px;font-size:8px;'>$1</code>")
    .replace(/(%[\d,.]+)/g, "<b style='color:#800000;'>$1</b>")
    .replace(/([\d.,]+\.[\d]+\s*(?:takipçi|abone|yorum|beğeni|görüntüleme|puan|yorum))/gi, "<b>$1</b>");
}

// ─── Spacer (ensures html2canvas finds a clean white cut row) ─────────────────

function spacer(px = 40): string {
  return `<div style="height:${px}px;background:#ffffff;"></div>`;
}

// ─── Section divider ──────────────────────────────────────────────────────────

function sectionHeader(title: string): string {
  return `
  ${spacer(28)}
  <div style="background:#ffffff;padding:0 0 10px 0;">
    <div style="display:table;width:100%;">
      <div style="display:table-cell;vertical-align:middle;white-space:nowrap;padding-right:12px;">
        <div style="font-size:10px;font-weight:900;color:#111827;letter-spacing:0.08em;text-transform:uppercase;white-space:nowrap;">${title}</div>
      </div>
      <div style="display:table-cell;vertical-align:middle;width:100%;">
        <div style="height:2px;background:linear-gradient(90deg,#800000 0%,#80000030 100%);border-radius:2px;"></div>
      </div>
    </div>
  </div>
  ${spacer(8)}`;
}

// ─── Report text formatter ─────────────────────────────────────────────────────

function formatReportText(text: string): string {
  const lines = text.split("\n");
  const html: string[] = [];
  let inList = false;

  for (const raw of lines) {
    const line = raw.trim();

    // Empty line
    if (!line) {
      if (inList) { html.push(`</div>${spacer(10)}`); inList = false; }
      else html.push(spacer(6));
      continue;
    }

    // Strip residual markdown headings
    if (/^#{1,4}\s/.test(line)) {
      if (inList) { html.push("</div>"); inList = false; }
      const content = line.replace(/^#{1,4}\s+/, "");
      html.push(`
        ${spacer(16)}
        <div style="font-size:10px;font-weight:900;color:#1f2937;padding:7px 12px;background:#f9fafb;border-left:3px solid #800000;border-radius:0 6px 6px 0;margin-bottom:8px;letter-spacing:0.03em;">
          ${processInline(content)}
        </div>`);
      continue;
    }

    // Numbered section heading: "1) BAŞLIK" or "a) ALT BAŞLIK"
    if (/^[1-9]\d*\)\s/.test(line)) {
      if (inList) { html.push("</div>"); inList = false; }
      const content = line.replace(/^[1-9]\d*\)\s+/, "");
      html.push(`
        ${spacer(20)}
        <div style="background:linear-gradient(135deg,#7f0000 0%,#991b1b 100%);border-radius:8px;padding:10px 16px;margin-bottom:12px;">
          <div style="font-size:10.5px;font-weight:900;color:#ffffff;letter-spacing:0.06em;text-transform:uppercase;">${processInline(content)}</div>
        </div>`);
      continue;
    }

    // Sub-heading: "a) ALT BAŞLIK" or "b) ..."
    if (/^[a-z]\)\s/i.test(line)) {
      if (inList) { html.push("</div>"); inList = false; }
      const content = line.replace(/^[a-z]\)\s+/i, "");
      html.push(`
        ${spacer(12)}
        <div style="font-size:10px;font-weight:800;color:#1f2937;padding:6px 12px;background:#f3f4f6;border-left:3px solid #800000;border-radius:0 6px 6px 0;margin-bottom:8px;">
          ${processInline(content)}
        </div>`);
      continue;
    }

    // All-caps heading (like "Güçlü Yanlar:" or "KRİTİK EKSİKLER:")
    if (/^[A-ZÇŞĞÜÖİ][A-ZÇŞĞÜÖİ\s\d:&–\-/]{3,}:?$/.test(line)) {
      if (inList) { html.push("</div>"); inList = false; }
      html.push(`
        ${spacer(10)}
        <div style="font-size:9.5px;font-weight:800;color:#374151;margin-bottom:6px;padding-bottom:3px;border-bottom:1px solid #e5e7eb;">
          ${processInline(line)}
        </div>`);
      continue;
    }

    // Inline sub-label (e.g., "Güçlü Yanlar:" at start of line)
    if (/^[A-ZÇŞĞÜÖİa-zçşğüöı].{2,40}:\s*$/.test(line)) {
      if (inList) { html.push("</div>"); inList = false; }
      html.push(`
        <div style="font-size:9px;font-weight:700;color:#374151;margin-top:10px;margin-bottom:4px;">
          ${processInline(line)}
        </div>`);
      continue;
    }

    // Bullet point
    if (/^[-•·]\s/.test(line)) {
      if (!inList) {
        html.push(`<div style="padding-left:0;">`);
        inList = true;
      }
      const content = line.replace(/^[-•·]\s+/, "");
      html.push(`
        <div style="display:table;width:100%;margin-bottom:5px;">
          <div style="display:table-cell;width:14px;vertical-align:top;padding-top:2px;">
            <div style="width:5px;height:5px;border-radius:50%;background:#800000;margin-top:3px;"></div>
          </div>
          <div style="display:table-cell;vertical-align:top;font-size:9px;color:#374151;line-height:1.75;">
            ${processInline(content)}
          </div>
        </div>`);
      continue;
    }

    // Regular paragraph
    if (inList) { html.push("</div>"); inList = false; }
    html.push(`<p style="font-size:9px;color:#4b5563;line-height:1.9;margin:0 0 6px 0;">${processInline(line)}</p>`);
  }

  if (inList) html.push("</div>");
  return html.join("");
}

// ─── Logo ─────────────────────────────────────────────────────────────────────

function headerLogo(): string {
  return `
  <td style="vertical-align:middle;padding:0 0 0 0;white-space:nowrap;">
    <table style="border-collapse:collapse;">
      <tr>
        <td style="vertical-align:middle;padding-right:10px;">
          <div style="width:38px;height:38px;background:rgba(255,255,255,0.95);border-radius:9px;text-align:center;line-height:38px;">
            <span style="font-size:20px;font-weight:900;color:#800000;letter-spacing:-2px;">D</span>
          </div>
        </td>
        <td style="vertical-align:middle;">
          <div style="font-size:16px;font-weight:900;color:#ffffff;letter-spacing:-0.3px;line-height:1;">DOU <span style="color:#fca5a5;">AI</span></div>
          <div style="font-size:7px;color:rgba(255,220,220,0.85);letter-spacing:0.12em;margin-top:2px;text-transform:uppercase;">Yapay Zeka Destekli Analiz</div>
        </td>
      </tr>
    </table>
  </td>`;
}

// ─── Main builder ─────────────────────────────────────────────────────────────

export function buildAuditReportHTML(data: AuditReportData): string {
  const { businessName, sector, phone, email, scores, reportText } = data;
  const date =
    data.date ??
    new Date().toLocaleDateString("tr-TR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

  const scorePlatforms = [
    { label: "Genel", val: scores.overall },
    { label: "Instagram", val: scores.instagram },
    { label: "LinkedIn", val: scores.linkedin },
    { label: "YouTube", val: scores.youtube },
    { label: "Google", val: scores.google },
  ].filter((p) => p.val > 0);

  const scoreCardsHTML = scorePlatforms
    .map((p) => scoreCard(p.label, p.val))
    .join("");

  const badge = overallBadge(scores.overall);
  const badgeColor = scoreColor(scores.overall);
  const badgeBg = scoreBg(scores.overall);

  // ── Key stats strip (3 highlight boxes) ──────────────────────────────────────
  const activePlatformCount = [
    scores.instagram,
    scores.linkedin,
    scores.youtube,
    scores.google,
  ].filter((s) => s > 0).length;

  const lowestPlatform = scorePlatforms
    .filter((p) => p.label !== "Genel")
    .sort((a, b) => a.val - b.val)[0];

  const highestPlatform = scorePlatforms
    .filter((p) => p.label !== "Genel")
    .sort((a, b) => b.val - a.val)[0];

  function kpiBox(value: string, label: string, color: string): string {
    return `
    <td style="width:33.33%;padding:0 6px;">
      <div style="background:#f9fafb;border:1px solid #e5e7eb;border-top:3px solid ${color};border-radius:8px;padding:12px 14px;text-align:center;">
        <div style="font-size:20px;font-weight:900;color:${color};letter-spacing:-0.5px;line-height:1;margin-bottom:5px;">${value}</div>
        <div style="font-size:8px;color:#6b7280;font-weight:500;line-height:1.3;">${label}</div>
      </div>
    </td>`;
  }

  return `
<div style="width:794px;font-family:Arial,Helvetica,sans-serif;background:#ffffff;margin:0 auto;padding:0;box-sizing:border-box;">

  <!-- ═══ HEADER ═══ -->
  <div style="background:linear-gradient(135deg,#6b0000 0%,#991b1b 60%,#7f1d1d 100%);padding:20px 30px;">
    <table style="width:100%;border-collapse:collapse;">
      <tr>
        ${headerLogo()}
        <td style="text-align:right;vertical-align:middle;padding:0;">
          <div style="font-size:9px;font-weight:700;color:rgba(255,210,210,0.9);letter-spacing:0.15em;text-transform:uppercase;margin-bottom:4px;">Sosyal Medya Performans Raporu</div>
          <div style="font-size:8px;color:rgba(255,190,190,0.75);margin-bottom:2px;">${date}</div>
          <div style="font-size:7.5px;color:rgba(255,180,180,0.6);">dousocial.com &nbsp;·&nbsp; +90 530 084 54 68</div>
        </td>
      </tr>
    </table>
  </div>

  <!-- ═══ BODY ═══ -->
  <div style="padding:26px 30px 0;">

    <!-- Müşteri Bilgileri -->
    <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;padding:14px 18px;margin-bottom:0;">
      <div style="font-size:7.5px;font-weight:800;color:#800000;letter-spacing:0.2em;text-transform:uppercase;margin-bottom:10px;padding-bottom:8px;border-bottom:1px solid #e5e7eb;">Müşteri Bilgileri</div>
      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="width:50%;font-size:9.5px;color:#374151;padding:2px 0;vertical-align:top;"><span style="font-weight:700;color:#111827;">İşletme / Marka:</span>&nbsp; ${businessName || "—"}</td>
          <td style="width:50%;font-size:9.5px;color:#374151;padding:2px 0;vertical-align:top;"><span style="font-weight:700;color:#111827;">Telefon:</span>&nbsp; ${phone || "—"}</td>
        </tr>
        <tr>
          <td style="font-size:9.5px;color:#374151;padding:6px 0 0 0;vertical-align:top;"><span style="font-weight:700;color:#111827;">Sektör:</span>&nbsp; ${sector || "—"}</td>
          <td style="font-size:9.5px;color:#374151;padding:6px 0 0 0;vertical-align:top;"><span style="font-weight:700;color:#111827;">E-posta:</span>&nbsp; ${email || "—"}</td>
        </tr>
      </table>
    </div>

    <!-- KPI Strip -->
    ${spacer(18)}
    <table style="width:100%;border-collapse:collapse;margin:0 -6px;">
      <tr>
        ${kpiBox(String(scores.overall > 0 ? scores.overall + "/100" : "—"), "Genel Dijital Skor", scoreColor(scores.overall))}
        ${kpiBox(String(activePlatformCount), "Analiz Edilen Platform", "#1d4ed8")}
        ${lowestPlatform ? kpiBox(lowestPlatform.label, "En Acil Gelişim Alanı", scoreColor(lowestPlatform.val)) : kpiBox("—", "En Acil Gelişim Alanı", "#9ca3af")}
      </tr>
    </table>

    <!-- Platform Skor Tablosu -->
    ${sectionHeader("Platform Skorları")}
    <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;padding:14px 10px;">
      <table style="width:100%;border-collapse:collapse;">
        <tr>
          ${scoreCardsHTML || `<td style="padding:16px;font-size:9px;color:#9ca3af;">Skor bilgisi mevcut değil.</td>`}
        </tr>
      </table>
    </div>

    <!-- Durum Bandı -->
    ${spacer(18)}
    ${
      scores.overall > 0
        ? `<div style="background:${badgeBg};border:1px solid ${badgeColor}40;border-left:4px solid ${badgeColor};border-radius:8px;padding:13px 16px;">
      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="vertical-align:top;width:28px;font-size:20px;line-height:1;padding:0 10px 0 0;">${badge.icon}</td>
          <td style="vertical-align:top;padding:0;">
            <div style="font-size:10px;font-weight:800;color:${badgeColor};margin-bottom:5px;">${badge.label} — Genel Skor: ${scores.overall}/100</div>
            <div style="font-size:8.5px;color:#4b5563;line-height:1.65;">${badge.text}</div>
          </td>
        </tr>
      </table>
    </div>`
        : ""
    }

    <!-- Detaylı Analiz Raporu -->
    ${sectionHeader("Detaylı Analiz Raporu")}
    <div style="background:#ffffff;">
      ${formatReportText(reportText)}
    </div>

    <!-- CTA Kutusu -->
    ${spacer(36)}
    <div style="background:linear-gradient(135deg,#1f2937 0%,#111827 100%);border-radius:12px;padding:22px 28px;">
      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="vertical-align:middle;padding:0;width:70%;">
            <div style="font-size:13px;font-weight:900;color:#ffffff;margin-bottom:6px;">Bu raporu birlikte harekete geçirme vakti.</div>
            <div style="font-size:8.5px;color:#9ca3af;line-height:1.65;margin-bottom:12px;">DOU Social uzmanları, rapordaki her eksikliği sistematik şekilde kapatmak için hazır. Ücretsiz strateji görüşmesinde size özel büyüme planı oluşturalım.</div>
            <table style="border-collapse:collapse;">
              <tr>
                <td style="padding-right:20px;white-space:nowrap;"><span style="font-size:8.5px;color:#d1fae5;font-weight:600;">📞 +90 530 084 54 68</span></td>
                <td style="padding-right:20px;white-space:nowrap;"><span style="font-size:8.5px;color:#dbeafe;font-weight:600;">✉ info@dousocial.com</span></td>
                <td style="white-space:nowrap;"><span style="font-size:8.5px;color:#fce7f3;font-weight:600;">🌐 dousocial.com</span></td>
              </tr>
            </table>
          </td>
          <td style="vertical-align:middle;text-align:right;padding:0;width:30%;">
            <div style="display:inline-block;background:#800000;border-radius:8px;padding:12px 20px;">
              <div style="font-size:9px;font-weight:800;color:#ffffff;letter-spacing:0.05em;">ÜCRETSİZ</div>
              <div style="font-size:9px;font-weight:800;color:#fca5a5;margin-top:3px;">GÖRÜŞME AL →</div>
            </div>
          </td>
        </tr>
      </table>
    </div>

    ${spacer(50)}
  </div>

  <!-- ═══ FOOTER ═══ -->
  <div style="background:#f3f4f6;border-top:1px solid #e5e7eb;padding:10px 30px;">
    <table style="width:100%;border-collapse:collapse;">
      <tr>
        <td style="vertical-align:middle;font-size:7.5px;color:#9ca3af;padding:0;">
          DOU Social (Yapımedya Reklamcılık A.Ş.) &nbsp;·&nbsp; Zafer Mah. Zafer Cd. No:60/1 Merkezefendi / Denizli
        </td>
        <td style="vertical-align:middle;text-align:right;font-size:7.5px;color:#d1d5db;padding:0;white-space:nowrap;">
          Bu rapor DouAI tarafından ${date} tarihinde oluşturulmuştur.
        </td>
      </tr>
    </table>
  </div>

</div>`;
}
