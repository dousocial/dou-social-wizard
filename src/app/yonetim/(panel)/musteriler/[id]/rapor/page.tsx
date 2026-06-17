import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

async function getData(id: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const [{ data: musteri }, { data: metriks }, { data: teklifler }] = await Promise.all([
    supabase.from("musteriler").select("*").eq("id", id).single(),
    supabase.from("musteri_metrikleri").select("*").eq("musteri_id", id).order("ay", { ascending: false }),
    supabase.from("musteri_teklifler").select("*").eq("musteri_id", id).order("created_at", { ascending: false }),
  ]);
  if (!musteri) return null;
  return { musteri, metriks: metriks ?? [], teklifler: teklifler ?? [] };
}

function fmt(n: number) {
  return new Intl.NumberFormat("tr-TR").format(n);
}

function fmtDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("tr-TR", { year: "numeric", month: "long", day: "numeric" });
}

function formatAy(ay: string) {
  const [y, m] = ay.split("-");
  const names = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
  return `${names[parseInt(m) - 1]} ${y}`;
}

function monthsActive(startDate: string | null) {
  if (!startDate) return 0;
  const s = new Date(startDate);
  const n = new Date();
  return Math.max(0, (n.getFullYear() - s.getFullYear()) * 12 + n.getMonth() - s.getMonth());
}

const TEKLIF_DURUM_LABEL: Record<string, string> = {
  hazirlaniyor: "Hazırlanıyor",
  gonderildi:   "Gönderildi",
  gorusuluyor:  "Görüşülüyor",
  kazanildi:    "Kazanıldı",
  kaybedildi:   "Kaybedildi",
};

const DURUM_LABEL: Record<string, string> = {
  aktif: "Aktif", pasif: "Pasif", potansiyel: "Potansiyel",
};

export default async function RaporPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getData(id);
  if (!data) notFound();

  const { musteri, metriks, teklifler } = data;
  const months = monthsActive(musteri.baslangic_tarihi);
  const totalEarned = (musteri.aylik_ucret || 0) * months;
  const latest = metriks[0];
  const year = new Date().getFullYear();

  return (
    <div style={{ background: "#fff", minHeight: "100vh", padding: "40px 48px", fontFamily: "system-ui, -apple-system, sans-serif", color: "#111" }}>
      <style>{`@media print { .no-print { display: none !important; } body { background: white; } }`}</style>

      {/* ── No-print controls ── */}
      <div className="no-print" style={{ display: "flex", gap: 12, marginBottom: 32, alignItems: "center" }}>
        <a href={`/yonetim/musteriler/${musteri.id}`} style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          padding: "8px 16px", borderRadius: 8,
          background: "#f1f5f9", border: "1px solid #e2e8f0",
          color: "#334155", fontSize: 13, fontWeight: 500, textDecoration: "none",
        }}>
          ← Geri Dön
        </a>
        <button
          onClick={() => window.print()}
          style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "8px 16px", borderRadius: 8,
            background: "#1e293b", border: "none",
            color: "#fff", fontSize: 13, fontWeight: 500, cursor: "pointer",
          }}
        >
          🖨️ Yazdır
        </button>
      </div>

      {/* ── Report Header ── */}
      <div style={{
        display: "flex", alignItems: "flex-start", justifyContent: "space-between",
        paddingBottom: 24, borderBottom: "2px solid #111", marginBottom: 32,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 14,
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 22, fontWeight: 800, color: "#fff", flexShrink: 0,
          }}>
            {musteri.ad[0].toUpperCase()}
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: "#111", letterSpacing: "-0.03em" }}>{musteri.ad}</h1>
            <div style={{ display: "flex", gap: 10, marginTop: 6, alignItems: "center" }}>
              <span style={{ fontSize: 13, color: "#64748b" }}>{musteri.sektor}</span>
              <span style={{
                fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 4,
                background: musteri.durum === "aktif" ? "#dcfce7" : musteri.durum === "pasif" ? "#f1f5f9" : "#fef9c3",
                color: musteri.durum === "aktif" ? "#166534" : musteri.durum === "pasif" ? "#475569" : "#92400e",
              }}>
                {DURUM_LABEL[musteri.durum] ?? musteri.durum}
              </span>
            </div>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>Rapor Tarihi</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#333" }}>
            {new Date().toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}
          </div>
          {musteri.sorumlu && (
            <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>Sorumlu: {musteri.sorumlu}</div>
          )}
        </div>
      </div>

      {/* ── İletişim Bilgileri ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 32 }}>
        {musteri.email && (
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 3 }}>E-posta</div>
            <div style={{ fontSize: 13, color: "#333" }}>{musteri.email}</div>
          </div>
        )}
        {musteri.telefon && (
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 3 }}>Telefon</div>
            <div style={{ fontSize: 13, color: "#333" }}>{musteri.telefon}</div>
          </div>
        )}
        {musteri.website && (
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 3 }}>Website</div>
            <div style={{ fontSize: 13, color: "#333" }}>{musteri.website}</div>
          </div>
        )}
        {musteri.baslangic_tarihi && (
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 3 }}>Başlangıç Tarihi</div>
            <div style={{ fontSize: 13, color: "#333" }}>{fmtDate(musteri.baslangic_tarihi)}</div>
          </div>
        )}
        {musteri.sozlesme_bitis_tarihi && (
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 3 }}>Sözleşme Bitişi</div>
            <div style={{ fontSize: 13, color: "#333" }}>{fmtDate(musteri.sozlesme_bitis_tarihi)}</div>
          </div>
        )}
      </div>

      {/* ── Karlılık ── */}
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 14, fontWeight: 700, color: "#111", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14, borderBottom: "1px solid #e2e8f0", paddingBottom: 8 }}>
          Karlılık Özeti
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {[
            { label: "Aylık Yönetim Ücreti", value: musteri.aylik_ucret ? `₺${fmt(musteri.aylik_ucret)}` : "—", color: "#10b981" },
            { label: "Çalışma Süresi",        value: months ? `${months} ay` : "—",              color: "#6366f1" },
            { label: "Toplam Kazanım",         value: totalEarned ? `₺${fmt(totalEarned)}` : "—", color: "#6366f1" },
          ].map((s) => (
            <div key={s.label} style={{ background: "#f8fafc", borderRadius: 10, padding: "16px 20px", border: "1px solid #e2e8f0" }}>
              <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>{s.label}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Son Ay Performans ── */}
      {latest && (
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: "#111", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14, borderBottom: "1px solid #e2e8f0", paddingBottom: 8 }}>
            Son Ay Performans ({formatAy(latest.ay)})
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
            {[
              { label: "Etkileşim Oranı", value: latest.etkilesim_orani ? `%${latest.etkilesim_orani.toFixed(2)}` : "—", color: "#6366f1" },
              { label: "Takipçi Artışı",  value: latest.takipci_artisi ? (latest.takipci_artisi > 0 ? `+${fmt(latest.takipci_artisi)}` : fmt(latest.takipci_artisi)) : "—", color: "#10b981" },
              { label: "Toplam Erişim",   value: latest.toplam_erisim ? fmt(latest.toplam_erisim) : "—", color: "#3b82f6" },
              { label: "CTR",             value: latest.tiklama_orani ? `%${latest.tiklama_orani.toFixed(2)}` : "—", color: "#f59e0b" },
              { label: "Reklam Bütçesi",  value: latest.reklam_butcesi ? `₺${fmt(latest.reklam_butcesi)}` : "—", color: "#ef4444" },
              { label: "Müşteri Cirosu",  value: latest.musteri_cirosu ? `₺${fmt(latest.musteri_cirosu)}` : "—", color: "#6366f1" },
              { label: "Tıklama Sayısı",  value: latest.tiklama_sayisi ? fmt(latest.tiklama_sayisi) : "—", color: "#333" },
              { label: "Dönüşüm Sayısı",  value: latest.donusum_sayisi ? fmt(latest.donusum_sayisi) : "—", color: "#333" },
            ].map((s) => (
              <div key={s.label} style={{ background: "#f8fafc", borderRadius: 8, padding: "12px 16px", border: "1px solid #e2e8f0" }}>
                <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>{s.label}</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: s.color }}>{s.value}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Aylık Metrikler Tablosu ── */}
      {metriks.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: "#111", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14, borderBottom: "1px solid #e2e8f0", paddingBottom: 8 }}>
            Aylık Metrik Geçmişi
          </h2>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr style={{ background: "#f1f5f9" }}>
                  {["Ay", "Rek. Bütçesi", "ETK Oranı", "Takipçi ±", "Erişim", "CTR", "Tıklama", "Dönüşüm", "Müş. Cirosu"].map((h) => (
                    <th key={h} style={{ padding: "8px 12px", textAlign: "left", fontWeight: 700, color: "#64748b", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "1px solid #e2e8f0" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {metriks.map((m, i) => (
                  <tr key={m.id} style={{ background: i % 2 === 0 ? "#fff" : "#f8fafc" }}>
                    <td style={{ padding: "9px 12px", fontWeight: 600, color: "#111", borderBottom: "1px solid #f1f5f9" }}>{formatAy(m.ay)}</td>
                    <td style={{ padding: "9px 12px", color: "#333", borderBottom: "1px solid #f1f5f9" }}>{m.reklam_butcesi ? `₺${fmt(m.reklam_butcesi)}` : "—"}</td>
                    <td style={{ padding: "9px 12px", color: "#6366f1", fontWeight: m.etkilesim_orani ? 600 : 400, borderBottom: "1px solid #f1f5f9" }}>
                      {m.etkilesim_orani ? `%${m.etkilesim_orani.toFixed(2)}` : "—"}
                    </td>
                    <td style={{ padding: "9px 12px", color: m.takipci_artisi > 0 ? "#10b981" : m.takipci_artisi < 0 ? "#ef4444" : "#333", fontWeight: m.takipci_artisi ? 600 : 400, borderBottom: "1px solid #f1f5f9" }}>
                      {m.takipci_artisi ? `${m.takipci_artisi > 0 ? "+" : ""}${fmt(m.takipci_artisi)}` : "—"}
                    </td>
                    <td style={{ padding: "9px 12px", color: "#333", borderBottom: "1px solid #f1f5f9" }}>{m.toplam_erisim ? fmt(m.toplam_erisim) : "—"}</td>
                    <td style={{ padding: "9px 12px", color: "#f59e0b", fontWeight: m.tiklama_orani ? 600 : 400, borderBottom: "1px solid #f1f5f9" }}>
                      {m.tiklama_orani ? `%${m.tiklama_orani.toFixed(2)}` : "—"}
                    </td>
                    <td style={{ padding: "9px 12px", color: "#333", borderBottom: "1px solid #f1f5f9" }}>{m.tiklama_sayisi ? fmt(m.tiklama_sayisi) : "—"}</td>
                    <td style={{ padding: "9px 12px", color: "#333", borderBottom: "1px solid #f1f5f9" }}>{m.donusum_sayisi ? fmt(m.donusum_sayisi) : "—"}</td>
                    <td style={{ padding: "9px 12px", color: "#6366f1", fontWeight: m.musteri_cirosu ? 600 : 400, borderBottom: "1px solid #f1f5f9" }}>
                      {m.musteri_cirosu ? `₺${fmt(m.musteri_cirosu)}` : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Teklifler ── */}
      {teklifler.length > 0 && (
        <div style={{ marginBottom: 40 }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: "#111", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14, borderBottom: "1px solid #e2e8f0", paddingBottom: 8 }}>
            Teklifler
          </h2>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ background: "#f1f5f9" }}>
                {["Başlık", "Tutar", "Durum", "Gönderim Tarihi"].map((h) => (
                  <th key={h} style={{ padding: "8px 12px", textAlign: "left", fontWeight: 700, color: "#64748b", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "1px solid #e2e8f0" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {teklifler.map((t, i) => (
                <tr key={t.id} style={{ background: i % 2 === 0 ? "#fff" : "#f8fafc" }}>
                  <td style={{ padding: "9px 12px", fontWeight: 600, color: "#111", borderBottom: "1px solid #f1f5f9" }}>{t.baslik}</td>
                  <td style={{ padding: "9px 12px", fontWeight: 700, color: "#10b981", borderBottom: "1px solid #f1f5f9" }}>{t.tutar ? `₺${fmt(t.tutar)}` : "—"}</td>
                  <td style={{ padding: "9px 12px", borderBottom: "1px solid #f1f5f9" }}>
                    <span style={{
                      fontSize: 11, fontWeight: 600, padding: "2px 7px", borderRadius: 4,
                      background: t.durum === "kazanildi" ? "#dcfce7" : t.durum === "kaybedildi" ? "#fee2e2" : "#f1f5f9",
                      color: t.durum === "kazanildi" ? "#166534" : t.durum === "kaybedildi" ? "#991b1b" : "#475569",
                    }}>
                      {TEKLIF_DURUM_LABEL[t.durum] ?? t.durum}
                    </span>
                  </td>
                  <td style={{ padding: "9px 12px", color: "#64748b", borderBottom: "1px solid #f1f5f9" }}>{fmtDate(t.gonderim_tarihi)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Footer ── */}
      <div style={{
        borderTop: "1px solid #e2e8f0", paddingTop: 20, marginTop: 20,
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <div style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600 }}>
          DOU Social — Gizli ve Özel | {year}
        </div>
        <div style={{ fontSize: 12, color: "#94a3b8" }}>{musteri.ad} Müşteri Raporu</div>
      </div>
    </div>
  );
}
