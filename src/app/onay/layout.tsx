import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function ApprovalLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="tr">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif" }}>{children}</body>
    </html>
  );
}
