import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Reveal, RevealItem } from "@/components/ui/Reveal";

// ─── Logo eklemek için ────────────────────────────────────────────────────────
// 1. Logoyu public/logos/ klasörüne koy (örn: public/logos/yapigranit.png)
// 2. İlgili müşterinin logo alanını güncelle: logo: "/logos/yapigranit.png"

const CLIENTS = [
  { id: 1, name: "YAPIGRANİT MERMERCİLİK", initials: "YG", logo: "/logos/yapigranit.png" },
  { id: 2,  name: "FITLIFE KITCHEN",        initials: "E2", logo:"/logos/fitlife.png" },
  { id: 3,  name: "EN20 SPOR SALONU",         initials: "FL", logo:"/logos/en20.png" },
  { id: 4,  name: "KAYRA DESIGNER",          initials: "KD", logo:"/logos/kayra.png"  },
  { id: 5,  name: "B2 MİMARLIK",            initials: "B2", logo:"/logos/b2mimarlik.png"  },
  { id: 6,  name: "VİNTORA ETİKET",         initials: "VE", logo:"/logos/vintora.png"  },
  { id: 7,  name: "REAL BROKER",            initials: "RB", logo:"/logos/rb.png"  },
  { id: 8,  name: "DİYETİSYEN CEYLİN YASTIKÇI", initials: "CY", logo:"/logos/ceylin.png"  },
  { id: 9,  name: "HANGARAGE",              initials: "HG", logo:"/logos/han.png"  },
  { id: 10, name: "PAMAİR HAVACILIK",       initials: "PA", logo:"/logos/pamair.png"  },
];

export async function ClientLogos() {
  const t = await getTranslations("ClientLogos");

  return (
    <Section spacing="md" className="border-t border-mute-100">
      <Container>
        <Reveal className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            {t("eyebrow")}
          </p>
          <h2
            className="mt-3 font-display leading-tight tracking-tight text-ink"
            style={{ fontSize: "var(--text-3xl)" }}
          >
            {t("title")}
          </h2>
        </Reveal>

        <Reveal stagger className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5 md:gap-4">
          {CLIENTS.map((client) => (
            <RevealItem key={client.id}>
              <div className="group relative aspect-[4/3] overflow-hidden rounded-xl bg-mute-100 transition-all duration-300 hover:bg-accent hover:shadow-md">
                {client.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={client.logo}
                    alt={client.name}
                    className="absolute inset-0 h-full w-full object-cover grayscale opacity-50 transition-all duration-300 group-hover:grayscale-0 group-hover:brightness-0 group-hover:invert group-hover:opacity-100 group-hover:scale-105"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="font-display text-2xl font-bold text-mute-300 transition-colors duration-300 group-hover:text-white/60">
                      {client.initials}
                    </span>
                  </div>
                )}
                {/* Şirket adı — hover'da aşağıdan kayarak gelir */}
                <div className="absolute inset-x-0 bottom-0 translate-y-full transition-transform duration-300 ease-out group-hover:translate-y-0">
                  <div className="bg-black/40 px-3 py-2 backdrop-blur-sm">
                    <p className="truncate text-center text-[9px] font-semibold uppercase tracking-[0.15em] text-white">
                      {client.name}
                    </p>
                  </div>
                </div>
              </div>
            </RevealItem>
          ))}
        </Reveal>
      </Container>
    </Section>
  );
}
