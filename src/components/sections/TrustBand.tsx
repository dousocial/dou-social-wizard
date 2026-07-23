import { Container } from "@/components/ui/Container";

// ─── Partner badge icons ──────────────────────────────────────────────────────

function MetaIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="currentColor" aria-hidden>
      <path d="M6.915 4.03c-1.968 0-3.683 1.28-4.871 3.113C.704 9.208 0 11.883 0 14.449c0 .706.07 1.369.21 1.973.14.604.375 1.082.745 1.43.37.348.85.523 1.43.523.905 0 1.742-.441 2.513-1.322.77-.881 1.513-2.263 2.213-4.148l.366-1.olean.044-.107c.34-.825.743-1.73 1.207-2.714C9.61 6.972 10.68 5.63 12 5.63c1.32 0 2.39 1.343 3.272 3.031.463.984.866 1.89 1.207 2.714l.44.107.366 1.066c.7 1.885 1.443 3.267 2.213 4.148.77.881 1.608 1.322 2.513 1.322.58 0 1.06-.175 1.43-.523.37-.348.605-.826.745-1.43.14-.604.21-1.267.21-1.973 0-2.566-.704-5.241-2.044-7.306C20.768 5.31 19.053 4.03 17.085 4.03c-.68 0-1.31.196-1.89.588-.579.392-1.104.963-1.576 1.713-.285.45-.557.97-.815 1.554-.258-.584-.53-1.103-.815-1.554-.472-.75-.997-1.321-1.576-1.713-.58-.392-1.21-.588-1.89-.588H6.915zm5.085 9.78c-.34.78-.68 1.503-1.018 2.166-.338.663-.672 1.26-1.001 1.79-.33.53-.658.968-.985 1.312-.327.344-.648.574-.962.689A2.3 2.3 0 017.5 20c-.5 0-.946-.16-1.337-.48-.39-.32-.732-.8-1.022-1.442-.29-.64-.522-1.42-.697-2.34-.174-.92-.262-1.94-.262-3.059 0-.898.073-1.758.22-2.58.146-.822.382-1.576.706-2.262.325-.686.748-1.237 1.27-1.652.52-.415 1.14-.622 1.858-.622.588 0 1.117.183 1.586.548.469.365.898.903 1.287 1.614.26.478.51 1.022.752 1.633.24.61.47 1.28.687 2.007zm.87-2.007c.218-.727.447-1.397.687-2.007.242-.611.492-1.155.752-1.633.389-.711.818-1.249 1.287-1.614.469-.365.998-.548 1.586-.548.718 0 1.338.207 1.858.622.522.415.945.966 1.27 1.652.324.686.56 1.44.706 2.262.147.822.22 1.682.22 2.58 0 1.12-.088 2.14-.262 3.059-.175.92-.407 1.7-.697 2.34-.29.642-.632 1.122-1.022 1.442-.39.32-.837.48-1.337.48a2.3 2.3 0 01-.534-.077c-.314-.115-.635-.345-.962-.689-.327-.344-.655-.782-.985-1.312-.33-.53-.663-1.127-1.001-1.79-.338-.663-.678-1.386-1.018-2.166z" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="none" aria-hidden>
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

// ─── Stats ────────────────────────────────────────────────────────────────────

const STATS = [
  { value: "1000+", label: "Tamamlanan Proje" },
  { value: "5+",    label: "Yıl Deneyim"      },
  { value: "%100",  label: "Müşteri Memnuniyeti" },
  { value: "3.2×",  label: "Ortalama ROAS"    },
] as const;

// ─── Component ────────────────────────────────────────────────────────────────

export function TrustBand() {
  return (
    <div className="border-y border-mute-100 bg-mute-50">
      <Container size="wide">
        <div className="flex flex-col gap-6 py-6 md:flex-row md:items-center md:gap-0 md:divide-x md:divide-mute-200 md:py-0">

          {/* Partner rozetleri */}
          <div className="flex shrink-0 items-center gap-6 md:pr-8">
            {/* Meta Business Partner */}
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-ink text-paper">
                <MetaIcon />
              </div>
              <div className="leading-tight">
                <p className="text-xs font-medium uppercase tracking-[0.15em] text-mute-500">
                  Meta
                </p>
                <p className="font-display text-xs font-bold text-ink">Business Partner</p>
              </div>
            </div>

            <div className="h-8 w-px bg-mute-200" />

            {/* Google Partner */}
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-paper ring-1 ring-mute-200">
                <GoogleIcon />
              </div>
              <div className="leading-tight">
                <p className="text-xs font-medium uppercase tracking-[0.15em] text-mute-500">
                  Google
                </p>
                <p className="font-display text-xs font-bold text-ink">Partner</p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-x-8 gap-y-3 md:flex-1 md:justify-around md:pl-8">
            {STATS.map((s) => (
              <div key={s.label} className="flex items-baseline gap-2">
                <span className="font-display text-lg font-bold tracking-tight text-ink">
                  {s.value}
                </span>
                <span className="text-xs text-mute-500">{s.label}</span>
              </div>
            ))}
          </div>

        </div>
      </Container>
    </div>
  );
}
