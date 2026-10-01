import { getLocale } from "next-intl/server";
import { MARKETING_SERVICES } from "@/lib/marketing-services";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";

export async function MarketingServicesSection() {
  const en = (await getLocale()) === "en";
  return (
    <section className="border-mute-100 border-t py-16 md:py-24">
      <Container>
        <h2 className="font-display text-ink text-3xl md:text-4xl">
          {en
            ? "Advertising and production services"
            : "Reklam yönetimi ve çekim hizmetleri"}
        </h2>
        <p className="text-mute-600 mt-4 max-w-2xl">
          {en
            ? "Explore campaign management and photography or video coverage in Denizli."
            : "Google, Meta, Facebook ve Instagram reklam yönetimi ile Denizli etkinlik ve organizasyon çekimi hizmetlerimizi inceleyin."}
        </p>
        <ul className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {MARKETING_SERVICES.map((item) => {
            const content = en ? item.en : item.tr;
            return (
              <li key={item.slug}>
                <Link
                  href={`/${item.slug}`}
                  className="border-mute-200 hover:border-accent focus-visible:outline-accent block h-full rounded-2xl border p-6 transition focus-visible:outline-2"
                >
                  <h3 className="font-display text-ink text-xl">
                    {content.title}
                  </h3>
                  <p className="text-mute-600 mt-3 text-sm">{content.lead}</p>
                  <span className="text-accent mt-5 inline-block text-sm">
                    {en ? "Explore service →" : "Hizmeti incele →"}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}
