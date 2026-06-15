"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { addUserAction } from "@/lib/actions/auth";

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "var(--c-input)",
  border: "1px solid var(--c-border2)",
  borderRadius: 7,
  padding: "9px 11px",
  fontSize: 13,
  color: "var(--c-text)",
  outline: "none",
  boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 12,
  fontWeight: 500,
  color: "var(--c-text3)",
  marginBottom: 5,
};

export function AddUserForm() {
  const router = useRouter();
  const [state, action, pending] = useActionState(addUserAction, null);

  useEffect(() => {
    if (state?.success) {
      router.push("/yonetim/kullanicilar?bilgi=" + encodeURIComponent("Kullanıcı eklendi"));
    }
  }, [state, router]);

  return (
    <div style={{ background: "var(--c-surface)", border: "1px solid var(--c-border)", borderRadius: 10, padding: "20px" }}>
      <h2 style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 600, color: "var(--c-text)" }}>Yeni Kullanıcı Ekle</h2>

      {state?.error && (
        <div style={{
          background: "#2d1010",
          border: "1px solid #4a1010",
          borderRadius: 8,
          padding: "10px 14px",
          marginBottom: 14,
          fontSize: 13,
          color: "#f87171",
        }}>
          {state.error}
        </div>
      )}

      <form action={action} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div>
          <label style={labelStyle}>Kullanıcı Adı</label>
          <input name="username" type="text" required style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>
            Şifre{" "}
            <span style={{ color: "var(--c-dim)" }}>(varsayılan: dousocial20)</span>
          </label>
          <input
            name="password"
            type="text"
            required
            minLength={8}
            defaultValue="dousocial20"
            style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>Rol</label>
          <select name="role" style={{ ...inputStyle, cursor: "pointer" }}>
            <option value="izleyici">İzleyici — sadece görüntüleyebilir</option>
            <option value="yonetici">Yönetici — tam erişim</option>
          </select>
        </div>
        <button
          type="submit"
          disabled={pending}
          style={{
            background: pending ? "#4a0000" : "#800000",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "10px 0",
            fontSize: 13,
            fontWeight: 600,
            cursor: pending ? "not-allowed" : "pointer",
            marginTop: 4,
            opacity: pending ? 0.7 : 1,
          }}
        >
          {pending ? "Ekleniyor…" : "Kullanıcı Ekle"}
        </button>
      </form>
    </div>
  );
}
