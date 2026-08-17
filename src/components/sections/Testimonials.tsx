"use client";

import { useRef, useEffect } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

// ─── Veri ─────────────────────────────────────────────────────────────────────
// Google Places API bağlandığında bu dizi API'den gelecek.
// Şimdilik örnek verilerle çalışıyor.

interface Review {
  author_name: string;
  rating: number;
  text: string;
  relative_time_description: string;
  profile_photo_url?: string;
}

const PLACEHOLDER_REVIEWS: Review[] = [
  { author_name: "Ayşe Kaya",        rating: 5, relative_time_description: "1 ay önce",  text: "Sosyal medya yönetimimizi DOU Social'a bıraktıktan sonra takipçi sayımız 3 ayda %180 arttı. Gerçekten profesyonel bir ekip." },
  { author_name: "Mehmet Demir",     rating: 5, relative_time_description: "2 ay önce",  text: "Meta reklam kampanyamızda beklediğimizin çok üzerinde sonuç aldık. Reklam bütçemizi verimli kullandılar, dönüşüm oranlarımız ciddi yükseldi." },
  { author_name: "Zeynep Arslan",    rating: 5, relative_time_description: "3 ay önce",  text: "İçerik kalitesi ve strateji konusunda gerçekten uzmanlar. Her detayı düşünmüşler, işletmemizin sesi tam yansıtılıyor." },
  { author_name: "Can Öztürk",       rating: 5, relative_time_description: "1 ay önce",  text: "Hızlı iletişim, şeffaf raporlama ve ölçülebilir sonuçlar. Bu üçünü bir arada sunan nadir ajanslardan biri." },
  { author_name: "Selin Yıldız",     rating: 5, relative_time_description: "2 hafta önce", text: "Web sitemizin yenilenmesinden sosyal medyaya kadar her şeyi koordineli şekilde yönettiler. Tek elden hizmet gerçekten çok kolaylaştırdı." },
  { author_name: "Burak Şahin",      rating: 5, relative_time_description: "3 ay önce",  text: "Rakip analizinden içerik takvimine, reklam optimizasyonundan raporlamaya kadar eksiksiz bir hizmet. Kesinlikle tavsiye ediyorum." },
  { author_name: "Deniz Çelik",      rating: 5, relative_time_description: "1 ay önce",  text: "Google Business profilimizi ve sosyal medyamızı aynı anda geliştirdiler. Organik aramalarda çok daha görünür hale geldik." },
  { author_name: "Hande Koç",        rating: 5, relative_time_description: "5 ay önce",  text: "Aylık raporlar çok detaylı ve anlaşılır. Neyin işe yarayıp yaramadığını net görüyoruz. Tam şeffaflık." },
];

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} viewBox="0 0 16 16" className={cn("h-3.5 w-3.5", i < rating ? "fill-amber-400" : "fill-mute-200")}>
          <path d="M8 1l1.854 3.756L14 5.528l-3 2.924.708 4.126L8 10.5l-3.708 2.078L5 8.452 2 5.528l4.146-.772z" />
        </svg>
      ))}
    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="flex w-[340px] shrink-0 flex-col rounded-2xl border border-mute-200 bg-paper p-6 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {review.profile_photo_url ? (
            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full">
              <Image
                src={review.profile_photo_url}
                alt={review.author_name}
                fill
                sizes="40px"
                className="object-cover"
              />
            </div>
          ) : (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/10 font-display text-sm font-bold text-accent">
              {review.author_name.charAt(0)}
            </div>
          )}
          <div>
            <p className="text-sm font-semibold text-ink">{review.author_name}</p>
            <p className="text-xs text-mute-400">{review.relative_time_description}</p>
          </div>
        </div>
        {/* Google icon */}
        <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 opacity-70" aria-hidden>
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
      </div>
      <Stars rating={review.rating} />
      <p className="mt-3 flex-1 text-sm leading-relaxed text-mute-600 line-clamp-4">
        &ldquo;{review.text}&rdquo;
      </p>
    </div>
  );
}

function Marquee({ reviews }: { reviews: Review[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const doubled = [...reviews, ...reviews];

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let x = 0;
    let raf: number;
    const speed = 0.5;

    function tick() {
      x -= speed;
      const halfW = track!.scrollWidth / 2;
      if (Math.abs(x) >= halfW) x = 0;
      track!.style.transform = `translateX(${x}px)`;
      raf = requestAnimationFrame(tick);
    }

    raf = requestAnimationFrame(tick);

    const pause  = () => cancelAnimationFrame(raf);
    const resume = () => { raf = requestAnimationFrame(tick); };
    track.addEventListener("mouseenter", pause);
    track.addEventListener("mouseleave", resume);

    return () => {
      cancelAnimationFrame(raf);
      track.removeEventListener("mouseenter", pause);
      track.removeEventListener("mouseleave", resume);
    };
  }, []);

  return (
    <div className="overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
      <div ref={trackRef} className="flex gap-5 will-change-transform">
        {doubled.map((r, i) => (
          <ReviewCard key={i} review={r} />
        ))}
      </div>
    </div>
  );
}

export function Testimonials({ reviews }: { reviews?: Review[] }) {
  const items = reviews ?? PLACEHOLDER_REVIEWS;

  return (
    <section className="overflow-hidden border-t border-mute-100 bg-mute-50 py-20 md:py-28">
      {/* Başlık */}
      <div className="mx-auto mb-14 max-w-[1120px] px-6 md:px-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              Müşteri Yorumları
            </p>
            <h2
              className="mt-3 font-display font-bold leading-tight tracking-tight text-ink"
              style={{ fontSize: "var(--text-4xl)" }}
            >
              Müşterilerimiz ne diyor?
            </h2>
          </div>
          <a
            href="https://g.page/r/CRxPLlbRtuQzEAE/review"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 self-start rounded-full border border-mute-200 bg-paper px-4 py-2 transition-colors hover:border-mute-400 md:self-auto"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span className="text-xs font-medium text-mute-600">Google'da Değerlendir</span>
          </a>
        </div>
      </div>

      {/* Marquee */}
      <Marquee reviews={items} />
    </section>
  );
}
