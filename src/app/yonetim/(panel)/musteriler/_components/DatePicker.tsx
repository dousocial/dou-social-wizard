"use client";

import { useState, useRef, useEffect } from "react";

const MONTHS = ["Ocak","Şubat","Mart","Nisan","Mayıs","Haziran","Temmuz","Ağustos","Eylül","Ekim","Kasım","Aralık"];
const DAYS   = ["Pt","Sa","Ça","Pe","Cu","Ct","Pz"];

interface Props {
  value: string;          // YYYY-MM-DD or ""
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
}

export function DatePicker({ value, onChange, placeholder = "Tarih seçin", required }: Props) {
  const parsed = value
    ? { y: parseInt(value.slice(0, 4)), m: parseInt(value.slice(5, 7)) - 1, d: parseInt(value.slice(8, 10)) }
    : null;

  const now = new Date();
  const [open, setOpen]           = useState(false);
  const [viewYear, setViewYear]   = useState(parsed?.y ?? now.getFullYear());
  const [viewMonth, setViewMonth] = useState(parsed?.m ?? now.getMonth());
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  function toggle() {
    if (parsed) { setViewYear(parsed.y); setViewMonth(parsed.m); }
    setOpen((o) => !o);
  }

  function prev() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  }
  function next() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  }

  function selectDay(day: number) {
    const mm = String(viewMonth + 1).padStart(2, "0");
    const dd = String(day).padStart(2, "0");
    onChange(`${viewYear}-${mm}-${dd}`);
    setOpen(false);
  }

  const offset      = (new Date(viewYear, viewMonth, 1).getDay() + 6) % 7; // Mon-first
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const displayValue = parsed
    ? `${String(parsed.d).padStart(2, "0")} ${MONTHS[parsed.m]} ${parsed.y}`
    : "";

  return (
    <div ref={ref} style={{ position: "relative" }}>
      {/* Hidden native input for form required validation */}
      <input
        type="text"
        value={value}
        onChange={() => {}}
        required={required}
        tabIndex={-1}
        aria-hidden
        style={{ position: "absolute", opacity: 0, height: 0, width: 0, pointerEvents: "none" }}
      />

      {/* Trigger */}
      <div
        onClick={toggle}
        style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "9px 12px", borderRadius: 8,
          border: "1px solid var(--c-border)",
          background: "var(--c-input)",
          color: displayValue ? "var(--c-text)" : "var(--c-dim)",
          fontSize: 13, cursor: "pointer", userSelect: "none",
          fontFamily: "inherit",
        }}
      >
        <span>{displayValue || placeholder}</span>
        <svg viewBox="0 0 16 16" fill="none" style={{ width: 14, height: 14, color: "var(--c-dim)", flexShrink: 0 }}>
          <rect x="2" y="3" width="12" height="11" rx="2" stroke="currentColor" strokeWidth="1.4"/>
          <path d="M5 1v3M11 1v3M2 7h12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
        </svg>
      </div>

      {/* Calendar dropdown */}
      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 6px)", left: 0, zIndex: 1000,
          background: "var(--c-surface)", border: "1px solid var(--c-border)",
          borderRadius: 12, padding: 14, boxShadow: "0 16px 48px rgba(0,0,0,0.45)",
          minWidth: 260,
        }}>
          {/* Month navigation */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <button type="button" onClick={prev} style={{
              background: "none", border: "1px solid var(--c-border)", borderRadius: 6,
              padding: "4px 8px", cursor: "pointer", color: "var(--c-text2)", display: "flex",
            }}>
              <svg viewBox="0 0 10 10" fill="none" style={{ width: 10, height: 10 }}>
                <path d="M7 2L3 5l4 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--c-text)" }}>
              {MONTHS[viewMonth]} {viewYear}
            </span>
            <button type="button" onClick={next} style={{
              background: "none", border: "1px solid var(--c-border)", borderRadius: 6,
              padding: "4px 8px", cursor: "pointer", color: "var(--c-text2)", display: "flex",
            }}>
              <svg viewBox="0 0 10 10" fill="none" style={{ width: 10, height: 10 }}>
                <path d="M3 2l4 3-4 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

          {/* Day headers */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2, marginBottom: 4 }}>
            {DAYS.map((d) => (
              <div key={d} style={{ textAlign: "center", fontSize: 10, fontWeight: 700, color: "var(--c-dim)", padding: "2px 0" }}>
                {d}
              </div>
            ))}
          </div>

          {/* Day grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2 }}>
            {Array.from({ length: offset }).map((_, i) => <div key={`e${i}`} />)}
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
              const isSel = parsed && parsed.y === viewYear && parsed.m === viewMonth && parsed.d === day;
              const isToday = now.getFullYear() === viewYear && now.getMonth() === viewMonth && now.getDate() === day;
              return (
                <button key={day} type="button" onClick={() => selectDay(day)} style={{
                  padding: "5px 2px", borderRadius: 6, border: "none", cursor: "pointer",
                  fontSize: 12, fontWeight: isSel ? 700 : 400, textAlign: "center",
                  background: isSel ? "#ef4444" : isToday ? "rgba(239,68,68,0.12)" : "transparent",
                  color: isSel ? "#fff" : isToday ? "#ef4444" : "var(--c-text2)",
                }}>
                  {day}
                </button>
              );
            })}
          </div>

          {/* Clear */}
          {value && (
            <button type="button" onClick={() => { onChange(""); setOpen(false); }} style={{
              marginTop: 10, width: "100%", padding: "6px", borderRadius: 7,
              border: "1px solid var(--c-border)", background: "transparent",
              color: "var(--c-dim)", fontSize: 11, cursor: "pointer",
            }}>
              Temizle
            </button>
          )}
        </div>
      )}
    </div>
  );
}
