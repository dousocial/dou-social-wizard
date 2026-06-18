"use client";

import { useRef, useState } from "react";

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

export function TeklifPDFButton({ teklif, musteriAd }: { teklif: TeklifForPDF; musteriAd: string }) {
  const [loading, setLoading] = useState(false);
  const templateRef = useRef<HTMLDivElement>(null);

  const hizmetler: Hizmet[] = teklif.hizmetler?.length
    ? teklif.hizmetler
    : [{ ad: teklif.baslik, fiyat: teklif.tutar ?? 0 }];

  const toplam = hizmetler.reduce((s, h) => s + (h.fiyat || 0), 0);
  const teklifNo = teklif.teklif_no?.trim() || teklif.id.slice(0, 8).toUpperCase();
  const tarih = fmtTarih(teklif.gonderim_tarihi ?? teklif.created_at);

  async function handleDownload() {
    const el = templateRef.current;
    if (!el || loading) return;
    setLoading(true);

    // Save original style, then show element at top-left for capture
    const originalStyle = el.getAttribute("style") ?? "";
    el.style.cssText = "position:fixed;top:0;left:0;z-index:99999;width:794px;height:1123px;background:#fff;font-family:Arial,Helvetica,sans-serif;display:flex;";

    try {
      const html2canvas = (await import("html2canvas")).default;
      const { jsPDF } = await import("jspdf");

      // Two rAF ticks to let browser paint the newly visible element
      await new Promise<void>(r => requestAnimationFrame(() => requestAnimationFrame(() => r())));

      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: "#ffffff",
        width: 794,
        height: 1123,
        scrollX: 0,
        scrollY: 0,
        windowWidth: 794,
        windowHeight: 1123,
      });

      const pdf = new jsPDF({ format: "a4", unit: "mm", orientation: "portrait" });
      const img = canvas.toDataURL("image/jpeg", 0.92);
      pdf.addImage(img, "JPEG", 0, 0, 210, 297);

      const slug = musteriAd.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9\-_ğüşıöçĞÜŞİÖÇ]/g, "");
      pdf.save(`Teklif-${teklifNo}-${slug}.pdf`);
    } finally {
      el.setAttribute("style", originalStyle);
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={handleDownload}
        disabled={loading}
        title="PDF İndir"
        style={{
          padding: "4px 7px", borderRadius: 5, background: "transparent",
          border: "1px solid var(--c-border)", color: "#6366f1", cursor: loading ? "wait" : "pointer",
          display: "flex", alignItems: "center", gap: 3, fontSize: 10, fontWeight: 600,
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

      {/* ── Hidden PDF template — shown only during html2canvas capture ── */}
      <div
        ref={templateRef}
        style={{
          position: "fixed",
          left: "-9999px",
          top: 0,
          width: 794,
          height: 1123,
          background: "#fff",
          fontFamily: "Arial, Helvetica, sans-serif",
          display: "flex",
        }}
      >
        {/* Left black sidebar */}
        <div style={{
          width: 175,
          background: "#111",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "24px 0",
          flexShrink: 0,
          overflow: "hidden",
        }}>
          {/* DOU Logo */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/dou-logo-light.png"
            alt="DOU Social"
            crossOrigin="anonymous"
            style={{ width: 100, marginTop: 8 }}
          />

          {/* Vertical brand text */}
          <div style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginTop: 24,
          }}>
            <div style={{
              writingMode: "vertical-rl",
              transform: "rotate(180deg)",
              color: "#fff",
              fontSize: 22,
              fontWeight: 900,
              letterSpacing: 5,
              textTransform: "uppercase",
              lineHeight: 1,
              whiteSpace: "nowrap",
            }}>
              Sosyal Medya HİZMETLERİ
            </div>
          </div>
        </div>

        {/* Right content */}
        <div style={{
          flex: 1,
          padding: "40px 44px 30px",
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
        }}>
          {/* Customer + TEKLIF heading */}
          <div style={{ textAlign: "right", marginBottom: 24 }}>
            <div style={{ fontSize: 34, fontWeight: 900, color: "#111", lineHeight: 1.1, textTransform: "uppercase" }}>
              {musteriAd}
            </div>
            <div style={{ fontSize: 34, fontWeight: 900, color: "#111", textTransform: "uppercase" }}>
              TEKLİF
            </div>
            <div style={{ marginTop: 10, fontSize: 11, color: "#444", lineHeight: 2.2 }}>
              <div><strong>TEKLİF NO:</strong>&nbsp;{teklifNo}</div>
              <div><strong>TARİH:</strong>&nbsp;{tarih}</div>
            </div>
          </div>

          {/* Divider */}
          <div style={{ borderTop: "2px solid #111", marginBottom: 22 }} />

          {/* Service items */}
          <div style={{ flex: 1 }}>
            {hizmetler.map((h, i) => (
              <div key={i} style={{
                borderBottom: "1px solid #ddd",
                padding: "10px 0",
              }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#111" }}>{h.ad}</div>
                <div style={{ fontSize: 13, color: "#444", marginTop: 4 }}>
                  {fmtPara(h.fiyat)} ₺
                </div>
              </div>
            ))}
          </div>

          {/* Notes */}
          {teklif.notlar?.trim() && (
            <div style={{ marginTop: 16, fontSize: 11, color: "#555", fontStyle: "italic" }}>
              {teklif.notlar}
            </div>
          )}

          {/* Total */}
          <div style={{ borderTop: "2px solid #111", marginTop: 20, paddingTop: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#111" }}>Toplam</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#111" }}>{fmtPara(toplam)} ₺</div>
            </div>
          </div>

          {/* Footer */}
          <div style={{ borderTop: "1px solid #ddd", marginTop: 24, paddingTop: 16, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <div style={{ fontSize: 10, color: "#666", lineHeight: 1.9 }}>
              <div>0 (530) 084 54 68</div>
              <div>info@dousocial.com</div>
              <div>www.dousocial.com</div>
            </div>
            <div style={{ textAlign: "right", fontSize: 10, color: "#666", lineHeight: 1.9 }}>
              <div><strong>E-Fatura:</strong> info@yapimedyagroup.com</div>
              <div style={{ fontWeight: 900, fontSize: 13, letterSpacing: 1, color: "#111", marginTop: 6 }}>
                YAPIMEDYA
              </div>
              <div style={{ fontSize: 9, color: "#aaa", marginTop: 2 }}>
                © DOU Social — Tüm hakları saklıdır.
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
