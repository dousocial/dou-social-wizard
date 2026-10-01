import { Link } from "@/i18n/navigation";
import { getMarketingService } from "@/lib/marketing-services";

export function MarketingServiceCard({
  slug,
  locale,
  headingAs = "h3",
}: {
  slug: string;
  locale: string;
  headingAs?: "h2" | "h3";
}) {
  const service = getMarketingService(slug, locale);
  if (!service) return null;
  const Heading = headingAs;
  return (
    <Link
      href={`/${slug}`}
      className="group bg-paper hover:bg-mute-50 focus-visible:outline-accent flex h-full flex-col overflow-hidden text-left transition focus-visible:outline-2"
    >
      <div className="flex flex-1 flex-col p-8 md:p-10">
        <Heading className="font-display text-ink text-xl leading-tight font-bold tracking-tight">
          {service.title}
        </Heading>
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
