import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { getMarketingService } from "@/lib/marketing-services";

export function MarketingServiceCard({
  slug,
  locale,
}: {
  slug: string;
  locale: string;
}) {
  const service = getMarketingService(slug, locale);
  if (!service) return null;
  return (
    <Link
      href={`/${slug}`}
      className="group bg-paper hover:bg-mute-50 focus-visible:outline-accent flex h-full flex-col overflow-hidden text-left transition focus-visible:outline-2"
    >
      <div className="bg-mute-100 relative aspect-video overflow-hidden">
        <Image
          src={service.cover}
          alt=""
          fill
          sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-1 flex-col p-8 md:p-10">
        <h3 className="font-display text-ink text-xl leading-tight font-bold tracking-tight">
          {service.title}
        </h3>
        <p className="text-mute-500 mt-3 flex-1 text-sm leading-relaxed">
          {service.lead}
        </p>
        <span className="text-accent mt-8 text-sm font-medium">
          {locale === "en" ? "Explore service →" : "Hizmeti incele →"}
        </span>
      </div>
    </Link>
  );
}
