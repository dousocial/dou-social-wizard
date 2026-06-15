import type { Metadata } from "next";
import { AuditTool } from "@/components/audit/AuditTool";

export const metadata: Metadata = {
  title: "DouAI – Sosyal Medya Analizi · DOU Social",
  description:
    "İşletmenizin sosyal medya hesaplarını ücretsiz analiz edin. Sayılarınızı girin ya da ekran görüntüsü yükleyin, DouAI saniyeler içinde kişisel rapor hazırlasın.",
};

export default function AuditPage() {
  return <AuditTool />;
}
