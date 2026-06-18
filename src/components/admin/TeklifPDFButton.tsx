"use client";

import { useState } from "react";

type Hizmet = { ad: string; fiyat: number };

export type TeklifForPDF = {
  id: string;
  teklif_no?: string;
  baslik: string;
  hizmetler?: Hizmet[];
  tutar?: number;
  notlar?: string;
  gonderim_tarihi?: string | null;
  created_at: string;
};

function fmtPara(n: number) {
  return new Intl.NumberFormat("tr-TR").format(n);
}

function fmtTarih(d: string | null | undefined) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("tr-TR", {
    day: "2-digit", month: "long", year: "numeric",
  }).toUpperCase();
}

function esc(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function toBase64(url: string): Promise<string> {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch {
    return "";
  }
}

function buildHTML(
  musteriAd: string,
  teklifNo: string,
  tarih: string,
  hizmetler: Hizmet[],
  toplam: number,
  notlar: string | undefined,
  logoBase64: string,
): string {
  const rows = hizmetler.map(h => `
    <div style="border-bottom:1px solid #ddd;padding:10px 0;">
      <div style="font-size:13px;font-weight:700;color:#111;">${esc(h.ad)}</div>
      <div style="font-size:13px;color:#444;margin-top:4px;">${esc(fmtPara(h.fiyat))} ₺</div>
    </div>`).join("");

  const notlarHtml = notlar?.trim()
    ? `<div style="margin-top:16px;font-size:11px;color:#555;font-style:italic;">${esc(notlar)}</div>`
    : "";

  const logoHtml = logoBase64
    ? `<img src="${logoBase64}" alt="DOU Social" style="width:105px;display:block;margin-top:4px;" />`
    : `<div style="color:#fff;font-size:18px;font-weight:900;margin-top:4px;letter-spacing:2px;">DOU</div>`;

  return `
<div style="display:flex;width:794px;height:1123px;font-family:Arial,Helvetica,sans-serif;background:#fff;overflow:hidden;">

  <!-- Sol sidebar -->
  <div style="width:175px;background:#111;flex-shrink:0;position:relative;display:flex;flex-direction:column;align-items:center;padding-top:28px;overflow:hidden;">
    ${logoHtml}
    <div style="
      position:absolute;
      left:50%;
      top:62%;
      transform:translate(-50%,-50%) rotate(-90deg);
      white-space:nowrap;
      color:#fff;
      font-size:27px;
      font-weight:900;
      letter-spacing:5px;
      text-transform:uppercase;
      font-family:Arial,Helvetica,sans-serif;
    ">Sosyal Medya HİZMETLERİ</div>
  </div>

  <!-- Sağ içerik -->
  <div style="flex:1;padding:40px 44px 30px;display:flex;flex-direction:column;min-width:0;overflow:hidden;">

    <!-- Müşteri + TEKLİF başlığı -->
    <div style="text-align:right;margin-bottom:24px;">
      <div style="font-size:34px;font-weight:900;color:#111;line-height:1.1;text-transform:uppercase;">${esc(musteriAd)}</div>
      <div style="font-size:34px;font-weight:900;color:#111;text-transform:uppercase;">TEKLİF</div>
      <div style="margin-top:10px;font-size:11px;color:#444;line-height:2.2;">
        <div><strong>TEKLİF NO:</strong>&nbsp;${esc(teklifNo)}</div>
        <div><strong>TARİH:</strong>&nbsp;${esc(tarih)}</div>
      </div>
    </div>

    <div style="border-top:2px solid #111;margin-bottom:22px;"></div>

    <!-- Hizmetler -->
    <div style="flex:1;">${rows}</div>

    ${notlarHtml}

    <!-- Toplam -->
    <div style="border-top:2px solid #111;margin-top:20px;padding-top:14px;">
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <div style="font-size:15px;font-weight:700;color:#111;">Toplam</div>
        <div style="font-size:15px;font-weight:700;color:#111;">${esc(fmtPara(toplam))} ₺</div>
      </div>
    </div>

    <!-- Footer -->
    <div style="border-top:1px solid #ddd;margin-top:24px;padding-top:16px;display:flex;justify-content:space-between;align-items:flex-end;">
      <div style="font-size:10px;color:#666;line-height:1.9;">
        <div>0 (530) 084 54 68</div>
        <div>info@dousocial.com</div>
        <div>www.dousocial.com</div>
      </div>
      <div style="text-align:right;font-size:10px;color:#666;line-height:1.9;">
        <div><strong>E-Fatura:</strong> info@yapimedyagroup.com</div>
        <div style="font-weight:900;font-size:13px;letter-spacing:1px;color:#111;margin-top:6px;">YAPIMEDYA</div>
        <div style="font-size:9px;color:#aaa;margin-top:2px;">© DOU Social — Tüm hakları saklıdır.</div>
      </div>
    </div>

  </div>
</div>`;
}

export function TeklifPDFButton({ teklif, musteriAd }: { teklif: TeklifForPDF; musteriAd: string }) {
  const [loading, setLoading] = useState(false);

  const hizmetler: Hizmet[] = teklif.hizmetler?.length
    ? teklif.hizmetler
    : [{ ad: teklif.baslik, fiyat: teklif.tutar ?? 0 }];

  const toplam = hizmetler.reduce((s, h) => s + (h.fiyat || 0), 0);
  const teklifNo = teklif.teklif_no?.trim() || teklif.id.slice(0, 8).toUpperCase();
  const tarih = fmtTarih(teklif.gonderim_tarihi ?? teklif.created_at);

  async function handleDownload() {
    if (loading) return;
    setLoading(true);

    let container: HTMLDivElement | null = null;

    try {
      // 1. Logoyu base64'e çevir (off-screen yükleme sorunundan kaçınmak için)
      const logoBase64 = await toBase64("/brand/dou-logo-light.png");

      // 2. Sayfaya geçici div ekle, HTML'i inject et
      container = document.createElement("div");
      container.style.cssText = "position:fixed;top:0;left:0;z-index:99999;pointer-events:none;";
      container.innerHTML = buildHTML(musteriAd, teklifNo, tarih, hizmetler, toplam, teklif.notlar, logoBase64);
      document.body.appendChild(container);

      // 3. Tarayıcının paint etmesi için bekle
      await new Promise<void>(r => setTimeout(r, 250));

      // 4. html2canvas ile yakala
      const html2canvas = (await import("html2canvas")).default;
      const { jsPDF } = await import("jspdf");

      const innerEl = container.firstElementChild as HTMLElement;
      const canvas = await html2canvas(innerEl, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: false,
      });

      // 5. PDF oluştur ve indir
      const pdf = new jsPDF({ format: "a4", unit: "mm", orientation: "portrait" });
      pdf.addImage(canvas.toDataURL("image/jpeg", 0.92), "JPEG", 0, 0, 210, 297);

      const slug = musteriAd.replace(/\s+/g, "-").replace(/[^\w\-]/g, "");
      pdf.save(`Teklif-${teklifNo}-${slug}.pdf`);

    } finally {
      if (container && document.body.contains(container)) {
        document.body.removeChild(container);
      }
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      title="PDF İndir"
      style={{
        padding: "4px 7px", borderRadius: 5, background: "transparent",
        border: "1px solid var(--c-border)", color: "#6366f1",
        cursor: loading ? "wait" : "pointer",
        display: "flex", alignItems: "center", gap: 3,
        fontSize: 10, fontWeight: 600,
        opacity: loading ? 0.6 : 1, flexShrink: 0,
      }}
    >
      {loading ? "..." : (
        <>
          <svg viewBox="0 0 14 14" fill="none" style={{ width: 11, height: 11 }}>
            <path d="M7 1v8M4 6l3 3 3-3M2 11h10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          PDF
        </>
      )}
    </button>
  );
}
