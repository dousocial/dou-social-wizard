"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { submitMeetingRequest } from "@/lib/actions/forms";
import { Button } from "@/components/ui/Button";
import { TextField, TextArea, CheckboxGroup, Consent } from "./Field";
import { Honeypot } from "./Honeypot";
import type { FormState } from "@/lib/actions/forms";

const initial: FormState = { status: "idle" };

export function MeetingForm() {
  const t = useTranslations("Meeting.form");
  const [state, formAction, isPending] = useActionState(
    submitMeetingRequest,
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

  const slots = ["morning", "afternoon", "evening"];

  return (
    <form action={formAction} className="space-y-8">
      <Honeypot />
      <div className="grid gap-6 md:grid-cols-2">
        <TextField label={t("name")} name="name" autoComplete="name" required />
        <TextField
          label={t("email")}
          name="email"
          type="email"
          autoComplete="email"
          required
        />
        <TextField
          label={t("phone")}
          name="phone"
          type="tel"
          autoComplete="tel"
          optional
          optionalLabel={t("optional")}
        />
      </div>

      <TextArea
        label={t("topic.label")}
        name="topic"
        rows={4}
        required
        placeholder={t("topic.placeholder")}
      />

      <CheckboxGroup
        label={t("slots.label")}
        name="slots"
        options={slots.map((v) => ({
          value: v,
          label: t(`slots.options.${v}`),
        }))}
      />

      <Consent label={t("consent")} />

      {state.status === "error" && (
        <p className="text-sm text-accent">{t(`errors.${state.error}`)}</p>
      )}

      <Button type="submit" size="lg" disabled={isPending}>
        {isPending ? t("sending") : t("submit")}
      </Button>
    </form>
  );
}
