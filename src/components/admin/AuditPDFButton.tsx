"use client";

import { useState } from "react";
import { buildAuditReportHTML, type AuditReportData } from "@/lib/buildAuditReportHTML";

// Find the nearest white/empty row at or before targetY (within searchRange px)
// to avoid cutting through text
function findSafeCutY(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  targetY: number,
  searchRange: number
): number {
  for (let y = targetY; y > targetY - searchRange && y > 0; y--) {
    const data = ctx.getImageData(0, y, canvasWidth, 1).data;
    let isLight = true;
    for (let x = 0; x < canvasWidth; x++) {
      const r = data[x * 4], g = data[x * 4 + 1], b = data[x * 4 + 2];
      if (r < 230 || g < 230 || b < 230) {
        isLight = false;
        break;
      }
    }
    if (isLight) return y;
  }
  return targetY;
}

export function AuditPDFButton({ audit }: { audit: AuditReportData & { businessName: string; createdAt: string } }) {
  const [loading, setLoading] = useState(false);

  async function handlePDF() {
    setLoading(true);
    try {
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);

      const container = document.createElement("div");
      container.style.cssText = "position:absolute;left:-9999px;top:0;z-index:-1;";
      container.innerHTML = buildAuditReportHTML({
        ...audit,
        date: new Date(audit.createdAt).toLocaleDateString("tr-TR", { day: "2-digit", month: "long", year: "numeric" }),
      });
      document.body.appendChild(container);

      try {
        const el = container.firstElementChild as HTMLElement;
        const canvas = await html2canvas(el, {
          scale: 2,
          useCORS: true,
          backgroundColor: "#ffffff",
          logging: false,
          windowWidth: 794,
        });

        const ctx = canvas.getContext("2d")!;
        const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
        const pageWmm = doc.internal.pageSize.getWidth();   // 210mm
        const pageHmm = doc.internal.pageSize.getHeight();  // 297mm

        // Canvas pixels per A4 page height
        const pageHpx = Math.round((pageHmm / pageWmm) * canvas.width);

        let currentY = 0;
        let page = 0;

        while (currentY < canvas.height) {
          if (page > 0) doc.addPage();

          // Find a safe cut point (whitespace row) near the page boundary
          let cutY: number;
          if (currentY + pageHpx >= canvas.height) {
            cutY = canvas.height;
          } else {
            cutY = findSafeCutY(ctx, canvas.width, currentY + pageHpx, Math.round(pageHpx * 0.12));
          }

          // Crop this page's slice from the canvas
          const sliceH = cutY - currentY;
          const pageCanvas = document.createElement("canvas");
          pageCanvas.width = canvas.width;
          pageCanvas.height = sliceH;
          const pCtx = pageCanvas.getContext("2d")!;
          pCtx.drawImage(canvas, 0, currentY, canvas.width, sliceH, 0, 0, canvas.width, sliceH);

          // Place on PDF — height in mm proportional to slice
          const sliceHmm = sliceH * (pageWmm / canvas.width);
          doc.addImage(pageCanvas.toDataURL("image/jpeg", 0.93), "JPEG", 0, 0, pageWmm, sliceHmm);

          currentY = cutY;
          page++;
        }

        doc.save(`DOU-AI-Audit-${audit.businessName.replace(/\s+/g, "-")}.pdf`);
      } finally {
        document.body.removeChild(container);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handlePDF}
      disabled={loading}
      style={{
        background: loading ? "#e5e5e5" : "#800000",
        color: loading ? "#999" : "#fff",
        border: "none",
        borderRadius: 6,
        padding: "5px 12px",
        fontSize: 12,
        fontWeight: "bold",
        cursor: loading ? "not-allowed" : "pointer",
        whiteSpace: "nowrap",
      }}
    >
      {loading ? "…" : "↓ PDF"}
    </button>
  );
}
