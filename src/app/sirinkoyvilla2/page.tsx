import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Şirinköy Villa 2 | Dou Social",
  description: "Şirinköy Villa 2 için 360 derece sanal tur sayfası.",
};

export default function SirinkoyVilla2Page() {
  return (
    <main className="fixed inset-0 h-screen w-screen overflow-hidden bg-black">
      <iframe
        src="https://app.cloudpano.com/tours/O36i7SP5a"
        title="Şirinköy Villa 2 360 Sanal Tur"
        className="block h-full w-full border-0"
        allow="camera; microphone; vr; accelerometer; gyroscope; fullscreen"
        allowFullScreen
      />
    </main>
  );
}
