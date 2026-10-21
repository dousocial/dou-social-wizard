export const INTERVIEW_EVENT = "2026-10-23";
export const INTERVIEW_START = Date.parse("2026-10-23T10:00:00+03:00");
export const INTERVIEW_COUNT = 33;
export const INTERVIEW_MINUTES = 15;

// 12:00–13:00 lunch break; stable indices preserve existing reservations.
export function isInterviewSlotClosed(index: number) {
  return index >= 8 && index < 12;
}

export function interviewSlots() {
  return Array.from({ length: INTERVIEW_COUNT }, (_, index) => {
    const start = new Date(
      INTERVIEW_START + index * INTERVIEW_MINUTES * 60_000
    );
    const end = new Date(start.getTime() + INTERVIEW_MINUTES * 60_000);
    const format = (date: Date) =>
      new Intl.DateTimeFormat("tr-TR", {
        timeZone: "Europe/Istanbul",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).format(date);
    return {
      index,
      start: start.toISOString(),
      end: end.toISOString(),
      label: `${format(start)}–${format(end)}`,
    };
  });
}

export function normalizeInterviewName(input: unknown) {
  if (typeof input !== "string")
    throw new Error("Adınızı ve soyadınızı girin.");
  const fullName = input.normalize("NFKC").trim().replace(/\s+/gu, " ");
  if (
    fullName.length < 5 ||
    fullName.length > 100 ||
    !/^[\p{L}\p{M}]+(?:[ '\u2019-][\p{L}\p{M}]+)+$/u.test(fullName) ||
    !fullName.includes(" ")
  ) {
    throw new Error(
      "Adınızı ve soyadınızı birlikte yazın (en fazla 100 karakter)."
    );
  }
  return { fullName, nameKey: fullName.toLocaleLowerCase("tr-TR") };
}

export type InterviewAvailability = {
  slots: { index: number; booked: boolean; closed?: boolean }[];
  ownBooking: { slotIndex: number; fullName: string } | null;
};
