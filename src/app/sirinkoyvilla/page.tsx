import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Şirinköy Villa | Dou Social",
  description: "Şirinköy Villa için 360 derece sanal tur sayfası.",
};

export default function SirinkoyVillaPage() {
  return (
    <main className="fixed inset-0 h-screen w-screen overflow-hidden bg-black">
      <iframe
        src="https://app.cloudpano.com/tours/hUWVMjFKi"
        title="Şirinköy Villa 360 Sanal Tur"
        className="block h-full w-full border-0"
        allow="camera; microphone; vr; accelerometer; gyroscope; fullscreen"
        allowFullScreen
      />
    </main>
  );
}
