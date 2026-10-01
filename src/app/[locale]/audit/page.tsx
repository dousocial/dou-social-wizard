import { permanentRedirect } from "next/navigation";

export default async function AuditPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  permanentRedirect(locale === "en" ? "/en/dijital-checkup" : "/dijital-checkup");
}
