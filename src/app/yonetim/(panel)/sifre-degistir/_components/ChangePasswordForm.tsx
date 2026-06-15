"use client";

import { useActionState } from "react";
import { changePasswordAction } from "@/lib/actions/auth";

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "var(--c-input)",
  border: "1px solid var(--c-border2)",
  borderRadius: 8,
  padding: "12px 14px",
  fontSize: 16,
  color: "var(--c-text)",
  outline: "none",
  boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 14,
  fontWeight: 600,
  color: "var(--c-text2)",
  marginBottom: 7,
};

export function ChangePasswordForm() {
  const [state, action, pending] = useActionState(changePasswordAction, null);

  return (
    <div style={{ background: "var(--c-surface)", border: "1px solid var(--c-border)", borderRadius: 12, padding: "28px 32px" }}>
      {state?.error && (
        <div style={{ background: "#2d1010", border: "1px solid #5a1515", borderRadius: 8, padding: "12px 16px", marginBottom: 20, fontSize: 15, color: "#f87171" }}>
          {state.error}
        </div>
      )}
      {state?.success && (
        <div style={{ background: "#0d2d1a", border: "1px solid #134d2a", borderRadius: 8, padding: "12px 16px", marginBottom: 20, fontSize: 15, color: "#4ade80" }}>
          Şifre başarıyla güncellendi.
        </div>
      )}

      <form action={action} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <div>
          <label style={labelStyle}>Mevcut Şifre</label>
          <input name="current" type="password" required autoComplete="current-password" style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>
            Yeni Şifre{" "}
            <span style={{ color: "var(--c-text3)", fontWeight: 400, fontSize: 13 }}>(en az 8 karakter)</span>
          </label>
          <input name="next" type="password" required minLength={8} autoComplete="new-password" style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Yeni Şifre (Tekrar)</label>
          <input name="confirm" type="password" required minLength={8} autoComplete="new-password" style={inputStyle} />
        </div>
        <button
          type="submit"
          disabled={pending}
          style={{
            background: pending ? "#4a0000" : "#9b1c1c",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "14px 0",
            fontSize: 16,
            fontWeight: 600,
            cursor: pending ? "not-allowed" : "pointer",
            marginTop: 6,
            opacity: pending ? 0.7 : 1,
          }}
        >
          {pending ? "Güncelleniyor…" : "Şifreyi Güncelle"}
        </button>
      </form>
    </div>
  );
}
