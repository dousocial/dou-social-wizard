"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { loginAction } from "@/lib/actions/auth";

const inputStyle: React.CSSProperties = {
  width: "100%", background: "var(--c-input)", border: "1px solid var(--c-border2)",
  borderRadius: 8, padding: "12px 14px", fontSize: 16, color: "var(--c-text)",
  outline: "none", boxSizing: "border-box",
};

export function LoginForm({ bilgi }: { bilgi?: string }) {
  const router = useRouter();
  const [state, action, pending] = useActionState(loginAction, null);

  useEffect(() => {
    if (state?.success) router.push("/yonetim/leads");
  }, [state, router]);

  return (
    <div style={{ background: "var(--c-surface)", border: "1px solid var(--c-border)", borderRadius: 14, padding: "32px 36px" }}>
      <h1 style={{ margin: "0 0 8px", fontSize: 22, fontWeight: 700, color: "var(--c-text)" }}>Giriş Yap</h1>
      <p style={{ margin: "0 0 28px", fontSize: 15, color: "var(--c-text3)" }}>Panel erişimi için giriş yapın.</p>

      {state?.error && (
        <div style={{ background: "#2d1010", border: "1px solid #5a1515", borderRadius: 8, padding: "12px 16px", marginBottom: 20, fontSize: 15, color: "#f87171" }}>
          {state.error}
        </div>
      )}
      {bilgi && !state?.error && (
        <div style={{ background: "#0d2d1a", border: "1px solid #134d2a", borderRadius: 8, padding: "12px 16px", marginBottom: 20, fontSize: 15, color: "#4ade80" }}>
          {decodeURIComponent(bilgi)}
        </div>
      )}

      <form action={action} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <div>
          <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "var(--c-text2)", marginBottom: 7 }}>Kullanıcı Adı</label>
          <input name="username" type="text" autoComplete="username" required style={inputStyle} />
        </div>
        <div>
          <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "var(--c-text2)", marginBottom: 7 }}>Şifre</label>
          <input name="password" type="password" autoComplete="current-password" required style={inputStyle} />
        </div>
        <button type="submit" disabled={pending} style={{
          background: pending ? "#4a0000" : "#9b1c1c", color: "#fff", border: "none",
          borderRadius: 8, padding: "14px 0", fontSize: 16, fontWeight: 600,
          cursor: pending ? "not-allowed" : "pointer", marginTop: 4, opacity: pending ? 0.7 : 1,
        }}>
          {pending ? "Giriş yapılıyor…" : "Giriş Yap"}
        </button>
      </form>
    </div>
  );
}
