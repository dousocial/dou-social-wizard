"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { logoutAction } from "@/lib/actions/auth";

export function LogoutButton() {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleLogout() {
    startTransition(async () => {
      await logoutAction();
      router.push("/yonetim/giris");
    });
  }

  return (
    <button
      onClick={handleLogout}
      disabled={pending}
      style={{
        background: "transparent", border: "1px solid var(--c-border)", borderRadius: 7,
        padding: "5px 12px", fontSize: 12, color: pending ? "var(--c-dim)" : "var(--c-text3)",
        cursor: pending ? "not-allowed" : "pointer",
      }}
    >
      {pending ? "…" : "Çıkış"}
    </button>
  );
}
