"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { deleteUserAction } from "@/lib/actions/auth";

export function DeleteUserButton({ id }: { id: string }) {
  const router = useRouter();
  const [state, action, pending] = useActionState(deleteUserAction, null);

  useEffect(() => {
    if (state?.success) router.refresh();
    if (state?.error) alert(state.error);
  }, [state, router]);

  return (
    <form action={action} style={{ display: "inline" }}>
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        disabled={pending}
        style={{
          background: "transparent",
          border: "1px solid #2a1010",
          borderRadius: 6,
          padding: "4px 10px",
          fontSize: 12,
          color: pending ? "#444" : "#7f1d1d",
          cursor: pending ? "not-allowed" : "pointer",
        }}
      >
        {pending ? "…" : "Sil"}
      </button>
    </form>
  );
}
