"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { setupAction } from "@/lib/actions/auth";

const inputStyle: React.CSSProperties = {
  width: "100%", background: "var(--c-input)", border: "1px solid var(--c-border2)",
  borderRadius: 8, padding: "10px 12px", fontSize: 14, color: "var(--c-text)",
  outline: "none", boxSizing: "border-box",
};

export function SetupForm() {
  const router = useRouter();
  const [state, action, pending] = useActionState(setupAction, null);

  useEffect(() => {
    if (state?.success) {
      router.push("/yonetim/giris?bilgi=" + encodeURIComponent("Admin oluşturuldu, giriş yapabilirsiniz"));
    }
  }, [state, router]);

  return (
    <>
      {state?.error && (
        <div style={{ background: "#2d1010", border: "1px solid #4a1010", borderRadius: 8, padding: "10px 14px", marginBottom: 18, fontSize: 13, color: "#f87171" }}>
          {state.error}
        </div>
      )}
      <form action={action} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div>
          <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "var(--c-text2)", marginBottom: 6 }}>Kullanıcı Adı</label>
          <input name="username" type="text" required style={inputStyle} />
        </div>
        <div>
          <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "var(--c-text2)", marginBottom: 6 }}>
            Şifre <span style={{ color: "var(--c-dim)" }}>(en az 8 karakter)</span>
          </label>
          <input name="password" type="password" required minLength={8} style={inputStyle} />
        </div>
        <button type="submit" disabled={pending} style={{
          background: pending ? "#4a0000" : "#800000", color: "#fff", border: "none",
          borderRadius: 8, padding: "11px 0", fontSize: 14, fontWeight: 600,
          cursor: pending ? "not-allowed" : "pointer", marginTop: 4, opacity: pending ? 0.7 : 1,
        }}>
          {pending ? "Oluşturuluyor…" : "Admini Oluştur"}
        </button>
      </form>
    </>
  );
}
