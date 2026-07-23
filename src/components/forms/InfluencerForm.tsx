"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { submitInfluencerApplication } from "@/lib/actions/forms";
import { Button } from "@/components/ui/Button";
import { TextField, CheckboxGroup, Consent } from "./Field";
import { Honeypot } from "./Honeypot";
import { KVKKConsentField } from "./KVKKConsentField";
import type { FormState } from "@/lib/actions/forms";

const initial: FormState = { status: "idle" };

const SECTORS = [
  "spor-fitness",
  "guzellik-estetik",
  "moda",
  "yiyecek-icecek",
  "egitim",
  "e-ticaret",
  "teknoloji",
  "saglik",
  "diger",
];

export function InfluencerForm() {
  const t = useTranslations("Influencer.form");
  const [state, formAction, isPending] = useActionState(
    submitInfluencerApplication,
    initial
  );

  if (state.status === "success") {
    return (
      <div className="rounded-2xl border border-mute-200 bg-mute-50 p-10 text-center">
        <h3 className="font-display text-3xl tracking-tight text-ink">
          {t("successTitle")}
        </h3>
        <p className="mt-4 text-mute-600">{t("successBody")}</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-8">
      <Honeypot />

      <div className="grid gap-6 md:grid-cols-2">
        <TextField label={t("name")} name="name" autoComplete="name" required />
        <TextField
          label={t("phone")}
          name="phone"
          type="tel"
          autoComplete="tel"
          required
          placeholder="0555 555 5555"
        />
        <TextField
          label={t("email")}
          name="email"
          type="email"
          autoComplete="email"
          optional
          optionalLabel={t("optional")}
        />
        <TextField
          label={t("social")}
          name="social"
          placeholder="@kullaniciadi"
          required
        />
      </div>

      <TextField
        label={t("price")}
        name="price"
        placeholder={t("pricePlaceholder")}
        optional
        optionalLabel={t("optional")}
      />

      <TextField
        label={t("interests")}
        name="interests"
        placeholder={t("interestsPlaceholder")}
        optional
        optionalLabel={t("optional")}
      />

      <CheckboxGroup
        label={t("sectors.label")}
        name="sectors"
        options={SECTORS.map((v) => ({
          value: v,
          label: t(`sectors.options.${v}`),
        }))}
      />

      <TextField
        label={t("contentUrl")}
        name="content_url"
        type="url"
        placeholder="https://instagram.com/reel/..."
        optional
        optionalLabel={t("optional")}
      />

      <div className="space-y-4 rounded-2xl border border-mute-200 bg-mute-50/60 p-5">
        <Consent name="declaration" label={t("declaration")} />
        <KVKKConsentField />
      </div>

      {state.status === "error" && (
        <p className="text-sm text-accent">{t(`errors.${state.error}`)}</p>
      )}

      <Button type="submit" size="lg" disabled={isPending}>
        {isPending ? t("sending") : t("submit")}
      </Button>
    </form>
  );
}
