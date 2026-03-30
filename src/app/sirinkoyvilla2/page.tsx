import type { Metadata } from "next";
import Link from "next/link";
import CloudPanoEmbed from "./CloudPanoEmbed";

export const metadata: Metadata = {
  title: "Şirinköy Villa 2 | Dou Social",
  description: "Şirinköy Villa 2 için 360 derece sanal tur sayfası.",
};

export default function SirinkoyVilla2Page() {
  return (
    <main className="min-h-screen px-4 py-10 text-white md:px-8 md:py-14">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <div className="flex flex-col gap-4 rounded-[32px] border border-white/10 bg-black/35 p-6 backdrop-blur md:p-8">
          <Link
            href="/"
            className="w-fit text-sm font-medium uppercase tracking-[0.24em] text-[#ffb3b3] transition-colors hover:text-white"
          >
            DouSocial
          </Link>
          <div className="space-y-3">
            <p className="text-sm uppercase tracking-[0.32em] text-white/55">
              360 Sanal Tur
            </p>
            <h1 className="text-3xl font-semibold tracking-tight md:text-5xl">
              Şirinköy Villa 2
            </h1>
            <p className="max-w-2xl text-sm leading-7 text-white/70 md:text-base">
              Aşağıdaki gömülü görüntüleyici üzerinden turu tam ekran
              deneyimleyebilirsiniz.
            </p>
          </div>
        </div>

        <CloudPanoEmbed />
      </div>
    </main>
  );
}
