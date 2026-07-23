import type { Metadata } from "next";
import { AuditTool } from "@/components/audit/AuditTool";
import { alternatesFor } from "@/lib/site";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/audit">): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: "DouAI – Sosyal Medya Analizi · DOU Social",
    description:
      "İşletmenizin sosyal medya hesaplarını ücretsiz analiz edin. Sayılarınızı girin ya da ekran görüntüsü yükleyin, DouAI saniyeler içinde kişisel rapor hazırlasın.",
    alternates: alternatesFor("/audit", locale as "tr" | "en"),
  };
}

export default function AuditPage() {
  return <AuditTool />;
}
