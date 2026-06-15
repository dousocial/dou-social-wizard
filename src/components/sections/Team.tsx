import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";

// ─── Ekip üyeleri ─────────────────────────────────────────────────────────────
// Fotoğraf eklemek için: photo alanına "/team/isim.jpg" yaz
// ve public/team/ klasörüne fotoğrafı koy.

const TEAM = [
  {
    name: "Emin Kahraman",
    role: "CEO",
    photo: "/team/emin.jpg",
    quote: "Burada sadece hedefleri değil, başarıyı paylaşmanın tadını çıkarıyoruz. DOU’da vizyonumuzu gerçeğe dönüştürürken her gün yeni bir şeyler öğrenmek paha biçilemez.",
  },
  {
    name: "Doğukan Şahin",
    role: "Kurucu - Proje Yönetici",
    photo: "/team/dogukan.png",
    quote: "DOU’nun temellerini atarken hayalim sadece bir iş değil, bir aile kurmaktı. Her projede bu heyecanı ekibimle paylaşmak en büyük motivasyonum!",
  },
  {
    name: "Miray Dede",
    role: "Koordinatör",
    photo: null as string | null,
    quote: "Ekipler arası köprü kurarken her sabah bu enerjik ofise gelmek motivasyon kaynağım. DOU’da düzeni sağlamak, bu harika ekiple çok daha keyifli!",
  },
  {
    name: "Fuat Koraç",
    role: "Videographer",
    photo: "/team/fuat.png",
    quote: "Hayatı bir kadrajın içinden, en estetik haliyle yakalamayı seviyorum. Hızlı tüketilen dijital dünyada kaliteden ödün vermeden, dinamik çekimler ve ritmik kurgularla markaların ve fikirlerin görsel kimliğini tasarlıyorum.",
  },
  {
    name: "Nur Tekin",
    role: "Çekim Asistanı",
    photo: "/team/nur.png",
    quote: "En iyi kareler bazen saniyeler içinde ortaya çıkar. O anları yakalarken DOU’nun yaratıcı projelerine katkı sağlamak benim için büyük bir mutluluk.",
  },
  {
    name: "Ali Efekan Gökcen",
    role: "Yazılım Uzmanı",
    photo: "/team/efe.png",
    quote: "Kod yazmak sadece bir iş değil, ortak vizyonumuzu dijital dünyada hayata geçirme sanatı. DOU ailesinin bir parçası olarak her gün yeni bir teknolojik çözüme imza atmak paha biçilemez.",
  },
];

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

function MemberCard({ member, index }: { member: typeof TEAM[number]; index: number }) {
  return (
    <Reveal variant="fadeUp" delay={index * 0.07} className="group">
      <div className="flex h-full flex-col items-center rounded-2xl border border-mute-100 bg-paper px-6 py-8 text-center shadow-sm transition-transform duration-300 ease-out group-hover:scale-105">
        {/* Fotoğraf alanı */}
        <div className="relative mb-6 h-32 w-32 shrink-0 overflow-hidden rounded-2xl border border-mute-200 bg-mute-100">
          {member.photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={member.photo}
              alt={member.name}
              className="h-full w-full object-cover transition-all duration-300 md:grayscale md:group-hover:grayscale-0"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-mute-100 to-mute-200">
              <span className="font-display text-4xl font-bold text-mute-400">
                {initials(member.name)}
              </span>
            </div>
          )}
        </div>

        {/* İsim */}
        <p className="font-display text-xl font-semibold leading-snug tracking-tight text-ink">
          {member.name}
        </p>

        {/* Unvan */}
        <p className="mt-2 text-xs font-medium uppercase tracking-[0.18em] text-mute-400">
          {member.role}
        </p>

        {/* Alıntı */}
        <div className="mt-6 border-t border-mute-100 pt-6">
          <p className="text-sm leading-relaxed text-mute-400 italic">
            "{member.quote}"
          </p>
        </div>
      </div>
    </Reveal>
  );
}


export function Team() {
  return (
    <Section spacing="md" className="border-t border-mute-100 bg-paper">
      <Container>
        {/* Başlık */}
        <Reveal className="mb-14 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              Ekibimiz
            </p>
            <h2
              className="mt-3 font-display font-bold leading-tight tracking-tight text-ink"
              style={{ fontSize: "var(--text-4xl)" }}
            >
              Birlikte yapıyoruz.
            </h2>
          </div>
          <p className="max-w-xs text-sm text-mute-500 md:text-right">
            Strateji, içerik, kamera, kod — hepsi tek çatı altında, hepsi sizin için.
          </p>
        </Reveal>

        {/* Ekip kartları */}
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3">
          {TEAM.map((member, i) => (
            <MemberCard key={member.name} member={member} index={i} />
          ))}
        </div>
      </Container>
    </Section>
  );
}
