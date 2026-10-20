"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { interviewSlots, type InterviewAvailability } from "@/lib/interview";
import styles from "./interview.module.css";
import Link from "next/link";

const slots = interviewSlots();

export function InterviewBooking() {
  const [availability, setAvailability] =
    useState<InterviewAvailability | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loadError, setLoadError] = useState("");
  const [pending, setPending] = useState(false);
  const [now, setNow] = useState(0);
  const inFlight = useRef(false);
  const confirmation = useRef<HTMLDivElement>(null);

  const refresh = useCallback(async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    try {
      const response = await fetch("/api/interview", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setAvailability(data);
      setLoadError("");
      setNow(Date.now());
    } catch {
      setLoadError(
        "Güncel saatler yüklenemedi. Bağlantınızı kontrol edip tekrar deneyin."
      );
    } finally {
      inFlight.current = false;
    }
  }, []);

  useEffect(() => {
    // State updates occur only after the availability network request resolves.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refresh();
    const update = () => {
      if (!document.hidden) void refresh();
    };
    const timer = setInterval(update, 10_000);
    window.addEventListener("focus", update);
    document.addEventListener("visibilitychange", update);
    return () => {
      clearInterval(timer);
      window.removeEventListener("focus", update);
      document.removeEventListener("visibilitychange", update);
    };
  }, [refresh]);

  const own = availability?.ownBooking;
  const selectedSlot = selected === null ? null : slots[selected];
  const selectedUnavailable =
    selected !== null &&
    (availability?.slots[selected]?.booked ||
      Date.parse(slots[selected].start) <= now);
  const remaining =
    availability?.slots.filter(
      (slot) => !slot.booked && Date.parse(slots[slot.index].start) > now
    ).length ?? 0;

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending || selected === null || selectedUnavailable || loadError)
      return;
    setPending(true);
    setError("");
    const website = new FormData(event.currentTarget).get("website");
    try {
      const response = await fetch("/api/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName: name, slotIndex: selected, website }),
      });
      const data = await response.json();
      if (!response.ok) {
        if (response.status === 409) {
          setSelected(null);
          void refresh();
        }
        throw new Error(data.error || "Randevu alınamadı.");
      }
      setAvailability((current) =>
        current ? { ...current, ownBooking: data.ownBooking } : current
      );
      requestAnimationFrame(() => confirmation.current?.focus());
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Bağlantı kurulamadı. Lütfen tekrar deneyin."
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <section className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.intro}>
          <p className={styles.eyebrow}>DOU SOCIAL · EKİPLE TANIŞMA</p>
          <h1>
            Tanışmak için
            <br />
            bir saat seç.
          </h1>
          <p className={styles.lead}>
            Adını, soyadını yaz. Sana uygun boş saati seç ve mülakat randevunu
            oluştur.
          </p>
          <div className={styles.dateCard}>
            <span className={styles.day}>23</span>
            <div>
              <strong>Ekim 2026</strong>
              <span>Cuma · Türkiye saati</span>
            </div>
          </div>
          <div className={styles.facts}>
            <span>10.00–18.00</span>
            <span>15 dakika / görüşme</span>
          </div>
          <p className={styles.note}>
            Son randevu 18.00’de başlar. Her aday yalnızca bir saat seçebilir.
            Dolu saatler seçilemez; liste otomatik güncellenir.
          </p>
          <a className={styles.contact} href="https://wa.me/905300845468">
            Sorun mu yaşıyorsun? Bize yaz ↗
          </a>
        </header>

        <div className={styles.panel}>
          {own ? (
            <div
              ref={confirmation}
              tabIndex={-1}
              className={styles.confirmation}
            >
              <span className={styles.check} aria-hidden="true">
                ✓
              </span>
              <p className={styles.eyebrow}>GÖRÜŞMEK ÜZERE</p>
              <h2>Randevun hazır.</h2>
              <p>
                <strong>{own.fullName}</strong>, seni bekliyoruz.
              </p>
              <div className={styles.receipt}>
                <span>23 Ekim 2026 · Cuma</span>
                <strong>{slots[own.slotIndex].label}</strong>
                <span>Türkiye saati (UTC+3)</span>
              </div>
              <p className={styles.note}>
                Bu ekranın görüntüsünü kaydedebilirsin. Aynı tarayıcıdan bu
                bağlantıyı açarak randevunu tekrar görebilirsin. Değişiklik
                gerekiyorsa bizimle iletişime geç.
              </p>
              <a className={styles.contact} href="https://wa.me/905300845468">
                DOU Social ile iletişime geç ↗
              </a>
            </div>
          ) : (
            <form onSubmit={submit}>
              <div className={styles.step}>
                <span>01</span>
                <h2>Önce seni tanıyalım.</h2>
              </div>
              <label className={styles.label} htmlFor="interview-name">
                Ad soyad
              </label>
              <input
                className={styles.input}
                id="interview-name"
                name="fullName"
                autoComplete="name"
                placeholder="Adın ve soyadın"
                required
                minLength={5}
                maxLength={100}
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={pending}
              />
              <div hidden aria-hidden="true">
                <label htmlFor="interview-website">Web sitesi</label>
                <input
                  id="interview-website"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                />
              </div>

              <div className={`${styles.step} ${styles.second}`}>
                <span>02</span>
                <h2>Uygun saatini seç.</h2>
              </div>
              <div className={styles.legend}>
                <span>
                  <i /> Boş
                </span>
                <span>
                  <i className={styles.filledDot} /> Dolu
                </span>
                <span className={styles.count}>
                  {availability ? `${remaining} boş saat` : "Yükleniyor…"}
                </span>
              </div>
              {loadError ? (
                <div role="alert" className={styles.error}>
                  {loadError}{" "}
                  <button type="button" onClick={() => void refresh()}>
                    Tekrar yükle
                  </button>
                </div>
              ) : null}
              <fieldset
                className={styles.slots}
                disabled={pending || !availability || !!loadError}
              >
                <legend className={styles.srOnly}>
                  23 Ekim Cuma mülakat saatleri
                </legend>
                {slots.map((slot) => {
                  const booked =
                    availability?.slots[slot.index]?.booked ?? false;
                  const past = now > 0 && Date.parse(slot.start) <= now;
                  const disabled = booked || past;
                  return (
                    <label
                      key={slot.index}
                      className={`${styles.slot} ${disabled ? styles.unavailable : ""} ${selected === slot.index && !disabled ? styles.selected : ""}`}
                    >
                      <input
                        type="radio"
                        name="slot"
                        value={slot.index}
                        checked={selected === slot.index}
                        disabled={disabled}
                        onChange={() => {
                          setSelected(slot.index);
                          setError("");
                        }}
                        required
                        aria-label={`${slot.label}, ${booked ? "Dolu" : past ? "Saati geçti" : "Boş"}`}
                      />
                      <strong>{slot.label.split("–")[0]}</strong>
                      <span>
                        {booked
                          ? "Dolu"
                          : past
                            ? "Geçti"
                            : selected === slot.index
                              ? "Seçildi"
                              : "Boş"}
                      </span>
                    </label>
                  );
                })}
              </fieldset>
              {selectedUnavailable ? (
                <p role="status" className={styles.error}>
                  Seçtiğin saat artık uygun değil. Lütfen başka bir boş saat
                  seç.
                </p>
              ) : null}
              {availability && remaining === 0 ? (
                <p role="status" className={styles.error}>
                  Uygun saat kalmadı. Yeni bir görüşme için bizimle iletişime
                  geçebilirsin.
                </p>
              ) : null}
              <div className={styles.summary} aria-live="polite">
                <span>Seçtiğin görüşme</span>
                <strong>
                  {selectedSlot && !selectedUnavailable
                    ? `23 Ekim · ${selectedSlot.label}`
                    : "Henüz bir saat seçmedin"}
                </strong>
              </div>
              {error ? (
                <p role="alert" className={styles.error}>
                  {error}
                </p>
              ) : null}
              <button
                className={styles.submit}
                type="submit"
                disabled={
                  pending ||
                  !availability ||
                  selected === null ||
                  selectedUnavailable ||
                  !!loadError
                }
              >
                {pending ? "Randevun kaydediliyor…" : "Randevumu oluştur"}
                <span aria-hidden="true">↗</span>
              </button>
              <p className={styles.privacy}>
                Ad soyadın yalnızca görüşme planlaması için DOU Social ekibiyle
                paylaşılır; diğer adaylara gösterilmez.{" "}
                <Link href="/gizlilik-politikasi">Gizlilik politikası</Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
