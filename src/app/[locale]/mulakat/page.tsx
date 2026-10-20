import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { InterviewBooking } from "@/components/interview/InterviewBooking";

export const metadata: Metadata = {
  title: "Mülakat Randevusu | 23 Ekim 2026",
  description:
    "DOU Social mülakatı için uygun saatinizi seçin. 23 Ekim Cuma, 10.00–18.00.",
  robots: { index: false, follow: false },
  alternates: { canonical: "https://www.dousocial.com/mulakat", languages: {} },
};

export default async function InterviewPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (locale !== "tr") notFound();
  setRequestLocale(locale);
  return <InterviewBooking />;
}
