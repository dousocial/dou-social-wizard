"use client";

import { useState, useRef } from "react";
import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { submitQuoteRequest } from "@/lib/actions/forms";
import { Button } from "@/components/ui/Button";
import {
  TextField,
  TextArea,
  RadioGroup,
  CheckboxGroup,
  Consent,
} from "./Field";
import { Honeypot } from "./Honeypot";
import type { FormState } from "@/lib/actions/forms";

const initial: FormState = { status: "idle" };
const TOTAL_STEPS = 4;
const EASE = [0.16, 1, 0.3, 1] as const;

// ─── Adım geçiş varyantları ──────────────────────────────────────────────────
function makeStepVariants(direction: 1 | -1) {
  return {
    enter: {
      x: direction > 0 ? 48 : -48,
      opacity: 0,
    },
    center: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.4, ease: EASE },
    },
    exit: {
      x: direction > 0 ? -48 : 48,
      opacity: 0,
      transition: { duration: 0.25, ease: [0.32, 0, 0.67, 0] as const },
    },
  };
}

// ─── Progress bar ────────────────────────────────────────────────────────────
function StepProgress({ current, total }: { current: number; total: number }) {
  return (
    <div className="mb-10">
      {/* Adım sayısı */}
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-widest text-mute-400">
          Adım {current} / {total}
        </span>
        <span className="text-xs text-mute-400">
          {Math.round((current / total) * 100)}%
        </span>
      </div>

      {/* Track */}
      <div className="h-0.5 w-full overflow-hidden rounded-full bg-mute-100">
        <motion.div
          suppressHydrationWarning
          className="h-full rounded-full bg-accent"
          animate={{ width: `${(current / total) * 100}%` }}
          transition={{ duration: 0.5, ease: EASE }}
        />
      </div>

      {/* Adım noktaları */}
      <div className="mt-3 flex justify-between">
        {Array.from({ length: total }, (_, i) => (
          <motion.div
            suppressHydrationWarning
            key={i}
            animate={{
              scale: i + 1 === current ? 1.2 : 1,
              backgroundColor:
                i + 1 < current
                  ? "rgb(128 0 0)"      // accent — tamamlanan
                  : i + 1 === current
                  ? "rgb(128 0 0)"      // accent — aktif
                  : "rgb(212 212 212)", // mute-300 — bekleyen
            }}
            transition={{ duration: 0.3 }}
            className="h-2 w-2 rounded-full"
          />
        ))}
      </div>
    </div>
  );
}

// ─── QuoteForm ───────────────────────────────────────────────────────────────
export function QuoteForm() {
  const t = useTranslations("Quote.form");
  const reduceMotion = useReducedMotion();
  const [state, formAction, isPending] = useActionState(submitQuoteRequest, initial);
  const formRef = useRef<HTMLFormElement>(null);

  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState<1 | -1>(1);

  // Önceki adımlardan toplanan değerleri saklarız
  const [collectedData, setCollectedData] = useState<Record<string, string | string[]>>({});

  const navigate = (next: number) => {
    // Mevcut adım verilerini topla
    if (formRef.current) {
      const fd = new FormData(formRef.current);
      const snapshot: Record<string, string | string[]> = {};
      fd.forEach((value, key) => {
        if (key === "website_url") return; // honeypot
        const existing = snapshot[key];
        if (existing !== undefined) {
          snapshot[key] = Array.isArray(existing)
            ? [...existing, String(value)]
            : [String(existing), String(value)];
        } else {
          snapshot[key] = String(value);
        }
      });
      setCollectedData((prev) => ({ ...prev, ...snapshot }));
    }
    setDirection(next > step ? 1 : -1);
    setStep(next);
  };

  if (state.status === "success") {
    return <SuccessState />;
  }

  const industries = ["ecommerce", "b2b", "restaurant", "education", "healthcare", "other"];
  const services   = ["meta-ads", "social", "content", "web", "strategy"];
  const budgets    = ["lt25k", "25-50k", "50-100k", "gt100k"];

  const variants = makeStepVariants(direction);

  return (
    <div>
      <StepProgress current={step} total={TOTAL_STEPS} />

      <form ref={formRef} action={formAction} className="space-y-8">
        <Honeypot />

        {/* Önceki adımlardan gelen gizli girdiler */}
        {Object.entries(collectedData).map(([key, value]) =>
          Array.isArray(value)
            ? value.map((v, i) => (
                <input key={`${key}-${i}`} type="hidden" name={key} value={v} />
              ))
            : <input key={key} type="hidden" name={key} value={value} />
        )}

        {/* Animasyonlu adım içeriği */}
        <div className="relative overflow-hidden" style={{ minHeight: 320 }}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              suppressHydrationWarning
              key={step}
              variants={reduceMotion ? {} : variants}
              initial="enter"
              animate="center"
              exit="exit"
              className="w-full"
            >
              {step === 1 && (
                <StepSection title={t("step1.title")} description={t("step1.description")}>
                  <RadioGroup
                    label={t("industry.label")}
                    name="industry"
                    required
                    defaultValue={String(collectedData.industry ?? "")}
                    options={industries.map((v) => ({
                      value: v,
                      label: t(`industry.options.${v}`),
                    }))}
                  />
                </StepSection>
              )}

              {step === 2 && (
                <StepSection title={t("step2.title")} description={t("step2.description")}>
                  <CheckboxGroup
                    label={t("services.label")}
                    name="services"
                    options={services.map((v) => ({
                      value: v,
                      label: t(`services.options.${v}`),
                    }))}
                  />
                </StepSection>
              )}

              {step === 3 && (
                <StepSection title={t("step3.title")} description={t("step3.description")}>
                  <RadioGroup
                    label={t("budget.label")}
                    name="budget"
                    required
                    defaultValue={String(collectedData.budget ?? "")}
                    options={budgets.map((v) => ({
                      value: v,
                      label: t(`budget.options.${v}`),
                    }))}
                  />
                </StepSection>
              )}

              {step === 4 && (
                <StepSection title={t("step4.title")} description={t("step4.description")}>
                  <div className="grid gap-5 md:grid-cols-2">
                    <TextField label={t("name")}  name="name"  autoComplete="name"  required />
                    <TextField label={t("email")} name="email" type="email" autoComplete="email" required />
                    <TextField label={t("phone")} name="phone" type="tel"   autoComplete="tel"   optional optionalLabel={t("optional")} />
                    <TextField label={t("company")} name="company" optional optionalLabel={t("optional")} />
                  </div>
                  <TextArea
                    label={t("message")}
                    name="message"
                    rows={4}
                    optional
                    optionalLabel={t("optional")}
                    placeholder={t("messagePlaceholder")}
                  />
                  <Consent label={t("consent")} />
                </StepSection>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Hata mesajı */}
        {state.status === "error" && (
          <p className="rounded-lg bg-accent/5 border border-accent/20 px-4 py-3 text-sm text-accent">
            {t(`errors.${state.error}`)}
          </p>
        )}

        {/* Navigasyon */}
        <div className="flex items-center justify-between gap-4 pt-2">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => navigate(step - 1)}
              className="inline-flex items-center gap-2 text-sm font-medium text-mute-500 transition-colors hover:text-ink"
            >
              <svg viewBox="0 0 14 14" className="h-3.5 w-3.5" fill="none" aria-hidden>
                <path d="M13 7H1m0 0l5-5M1 7l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Geri
            </button>
          ) : (
            <span />
          )}

          {step < TOTAL_STEPS ? (
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={() => navigate(step + 1)}
            >
              Devam
              <svg viewBox="0 0 14 14" className="ml-2 h-3.5 w-3.5" fill="none" aria-hidden>
                <path d="M1 7h12m0 0L8 2m5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Button>
          ) : (
            <Button type="submit" size="md" disabled={isPending}>
              {isPending ? t("sending") : t("submit")}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}

// ─── Alt bileşenler ──────────────────────────────────────────────────────────

function StepSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2
          className="font-display tracking-tight text-ink"
          style={{ fontSize: "var(--text-2xl)" }}
        >
          {title}
        </h2>
        <p className="mt-2 text-sm text-mute-600">{description}</p>
      </div>
      {children}
    </div>
  );
}

function SuccessState() {
  const t = useTranslations("Quote.form");
  return (
    <motion.div
      suppressHydrationWarning
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col items-center rounded-2xl border border-mute-200 bg-mute-50 px-8 py-16 text-center"
    >
      {/* Onay ikonu */}
      <motion.div
        suppressHydrationWarning
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
        className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/10"
      >
        <svg viewBox="0 0 24 24" className="h-8 w-8 text-accent" fill="none" aria-hidden>
          <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </motion.div>

      <h3
        className="mt-6 font-display tracking-tight text-ink"
        style={{ fontSize: "var(--text-2xl)" }}
      >
        {t("successTitle")}
      </h3>
      <p className="mt-4 max-w-sm text-mute-600">{t("successBody")}</p>
    </motion.div>
  );
}
