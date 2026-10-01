import Image from "next/image";
import { notFound } from "next/navigation";
import { getMarketingService } from "@/lib/marketing-services";
import { getAllPosts } from "@/lib/blog";
import { localizedUrl, SITE_URL } from "@/lib/site";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { BreadcrumbSchema } from "./BreadcrumbSchema";
import { FAQPageSchema } from "./FAQPageSchema";

export async function MarketingServicePage({
  slug,
  locale,
}: {
  slug: string;
  locale: string;
}) {
  const service = getMarketingService(slug, locale);
  if (!service) notFound();
  const en = locale === "en";
  const posts = (await getAllPosts(locale))
    .filter((post) => post.tags?.includes(slug))
    .slice(0, 4);
  const steps = en
    ? [
        "Define the brief and goals",
        "Agree scope, timing and responsibilities",
        "Produce and review the work",
        "Deliver and evaluate the next steps",
      ]
    : [
        "İhtiyaç ve hedefleri netleştiririz",
        "Kapsam, takvim ve sorumlulukları belirleriz",
        "Uygulama ve kontrolleri yürütürüz",
        "Teslimleri ve sonraki adımları değerlendiririz",
      ];
  const schema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${localizedUrl(`/${slug}`, en ? "en" : "tr")}#service`,
    name: service.title,
    description: service.lead,
    url: localizedUrl(`/${slug}`, en ? "en" : "tr"),
    provider: { "@id": `${SITE_URL}#organization` },
    areaServed: {
      "@type": "Place",
      name: slug.startsWith("denizli-") ? "Denizli" : "Türkiye",
    },
  };
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schema).replace(/</g, "\\u003c"),
        }}
      />
      <BreadcrumbSchema
        locale={en ? "en" : "tr"}
        crumbs={[
          { name: "DOU Social", path: "/" },
          { name: en ? "Services" : "Hizmetler", path: "/hizmetler" },
          { name: service.title, path: `/${slug}` },
        ]}
      />
      <FAQPageSchema items={service.faq} />
      <section className="py-20 md:py-28">
        <Container>
          <p className="text-accent text-xs font-semibold tracking-widest uppercase">
            DOU Social · Denizli
          </p>
          <h1 className="font-display text-ink mt-6 max-w-4xl text-4xl leading-tight md:text-6xl">
            {service.title}
          </h1>
          <p className="text-mute-600 mt-6 max-w-2xl text-xl">{service.lead}</p>
          <Link
            href="/teklif-al"
            className="bg-accent hover:bg-accent-hover mt-8 inline-flex min-h-12 items-center rounded-full px-7 py-3 font-semibold text-white"
          >
            {en ? "Request a proposal" : "Teklif alın"}
          </Link>
        </Container>
      </section>
      <Container>
        <div className="bg-mute-100 relative mb-12 aspect-video max-h-[560px] overflow-hidden rounded-2xl">
          <Image
            src={service.cover}
            alt={service.title}
            fill
            sizes="(max-width: 1279px) 100vw, 1200px"
            className="object-cover"
          />
        </div>
      </Container>
      <section className="border-mute-100 border-t py-16">
        <Container>
          <h2 className="font-display text-ink text-3xl">
            {en
              ? "A plan built around your needs"
              : "İhtiyacınıza göre planlanan çalışma"}
          </h2>
          <p className="text-mute-600 mt-6 max-w-3xl leading-relaxed">
            {service.intro}
          </p>
          <h2 className="font-display text-ink mt-12 text-3xl">
            {en ? "Service scope" : "Hizmet kapsamı"}
          </h2>
          <ul className="mt-6 grid gap-4 md:grid-cols-2">
            {service.deliverables.map((item) => (
              <li
                key={item}
                className="border-mute-200 text-ink rounded-xl border p-5"
              >
                {item}
              </li>
            ))}
          </ul>
        </Container>
      </section>
      <section className="bg-mute-50 py-16">
        <Container>
          <h2 className="font-display text-ink text-3xl">
            {en ? "How we work" : "Nasıl ilerliyoruz"}
          </h2>
          <ol className="mt-8 grid gap-6 md:grid-cols-4">
            {steps.map((step, index) => (
              <li key={step}>
                <span className="text-accent">0{index + 1}</span>
                <h3 className="text-ink mt-3 font-medium">{step}</h3>
              </li>
            ))}
          </ol>
          <p className="text-mute-600 mt-8 max-w-3xl text-sm">
            {en
              ? "Pricing depends on scope, production needs and timing. Any media spend is quoted separately from production or management fees. Deliveries, revisions and usage rights are agreed before work starts."
              : "Fiyatlandırma kapsam, üretim ihtiyacı ve takvime göre belirlenir. Varsa reklam bütçesi, üretim veya yönetim bedelinden ayrı değerlendirilir. Teslimler, revizyonlar ve kullanım kapsamı çalışma başlamadan netleştirilir."}
          </p>
        </Container>
      </section>
      <section className="py-16">
        <Container>
          <h2 className="font-display text-ink text-3xl">
            {en ? "Frequently asked questions" : "Sıkça sorulan sorular"}
          </h2>
          <div className="divide-mute-200 mt-8 divide-y">
            {service.faq.map((item) => (
              <details key={item.q} className="py-5">
                <summary className="text-ink cursor-pointer font-medium">
                  {item.q}
                </summary>
                <p className="text-mute-600 mt-4 max-w-3xl">{item.a}</p>
              </details>
            ))}
          </div>
        </Container>
      </section>
      {posts.length > 0 && (
        <section className="border-mute-200 border-t py-16">
          <Container>
            <h2 className="font-display text-ink text-3xl">
              {en ? "Related guides" : "İlgili rehberler"}
            </h2>
            <ul className="mt-6 grid gap-5 md:grid-cols-2">
              {posts.map((post) => (
                <li key={post.slug}>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="border-mute-200 text-ink hover:border-accent block rounded-xl border p-5"
                  >
                    <h3 className="font-medium">{post.title}</h3>
                    <p className="text-mute-600 mt-2 text-sm">
                      {post.description}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </Container>
        </section>
      )}
      <section className="bg-ink text-paper py-16">
        <Container>
          <h2 className="font-display text-3xl">
            {en ? "Let’s plan the next step" : "Bir sonraki adımı planlayalım"}
          </h2>
          <Link
            href="/iletisim"
            className="border-paper mt-6 inline-flex min-h-11 items-center rounded-full border px-6 py-3"
          >
            {en ? "Contact DOU Social" : "DOU Social ile iletişime geçin"}
          </Link>
        </Container>
      </section>
    </>
  );
}
