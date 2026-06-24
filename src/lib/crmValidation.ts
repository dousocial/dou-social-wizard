export function cleanText(value: string | null | undefined) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

export function cleanMultiline(value: string | null | undefined) {
  return String(value ?? "")
    .split(/\r?\n/)
    .map((line) => cleanText(line))
    .filter(Boolean)
    .join("\n");
}

export function normalizePhoneDigits(value: string | null | undefined) {
  let digits = String(value ?? "").replace(/\D/g, "");
  if (digits.startsWith("90") && digits.length === 12) digits = `0${digits.slice(2)}`;
  if (digits.startsWith("5") && digits.length === 10) digits = `0${digits}`;
  return digits.slice(0, 11);
}

export function formatPhoneTR(value: string | null | undefined) {
  const digits = normalizePhoneDigits(value);
  if (!digits) return "";
  if (digits.length <= 4) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 4)} ${digits.slice(4)}`;
  return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
}

export function isValidPhoneTR(value: string | null | undefined, required = false) {
  const digits = normalizePhoneDigits(value);
  if (!digits) return !required;
  return digits.length === 11 && digits.startsWith("0");
}

export function normalizeTaxNumber(value: string | null | undefined) {
  return String(value ?? "").replace(/\D/g, "").slice(0, 11);
}

export function isValidTaxNumber(value: string | null | undefined) {
  const digits = normalizeTaxNumber(value);
  return !digits || digits.length === 10 || digits.length === 11;
}

export function uniqueCleanOptions(values: Array<string | null | undefined>) {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const value of values) {
    const cleaned = cleanText(value);
    const key = cleaned.toLocaleLowerCase("tr-TR");
    if (!cleaned || seen.has(key)) continue;
    seen.add(key);
    result.push(cleaned);
  }

  return result.sort((a, b) => a.localeCompare(b, "tr-TR"));
}
