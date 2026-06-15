"use client";

import { useActionState, useState } from "react";
import { useTranslations } from "next-intl";
import { submitContactForm, type FormState } from "@/lib/actions/forms";
import { Button } from "@/components/ui/Button";
import { TextField, TextArea } from "./Field";
import { Honeypot } from "./Honeypot";
import { KVKKConsentField } from "./KVKKConsentField";

const initial: FormState = { status: "idle" };

function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 4) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 4)} ${digits.slice(4)}`;
  return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
}

export function ContactForm() {
  const t = useTranslations("Contact.form");
  const [phone, setPhone] = useState("");
  const [state, formAction, isPending] = useActionState(
    submitContactForm,
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
    <form action={formAction} className="space-y-6">
      <Honeypot />

      <div className="grid gap-6 md:grid-cols-2">
        <TextField
          label={t("name")}
          name="name"
          autoComplete="name"
          required
        />
        <TextField
          label={t("email")}
          name="email"
          type="email"
          autoComplete="email"
          required
        />
      </div>

      <TextField
        label={t("phone")}
        name="phone"
        type="tel"
        autoComplete="tel"
        required
        value={phone}
        onChange={(e) => setPhone(formatPhone(e.target.value))}
        placeholder="0555 555 5555"
        pattern="0[0-9]{3} [0-9]{3} [0-9]{4}"
        minLength={13}
        maxLength={13}
        title="0555 555 5555 formatında gir"
      />

      <TextArea label={t("message")} name="message" required />

      <KVKKConsentField />

      {state.status === "error" && (
        <p className="text-sm text-accent">{t(`errors.${state.error}`)}</p>
      )}

      <Button type="submit" disabled={isPending}>
        {isPending ? t("sending") : t("submit")}
      </Button>
    </form>
  );
}
