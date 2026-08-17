import { cn } from "@/lib/utils";

// ─── Temel input sınıfları ────────────────────────────────────────────────────
const baseInputClass = cn(
  "w-full rounded-xl border border-mute-200 bg-paper px-4 py-3 text-ink",
  "placeholder:text-mute-400",
  // Focus — accent alt çizgi + halka
  "focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/15",
  // Hover
  "hover:border-mute-300",
  "transition-all duration-200"
);

// ─── TextField ────────────────────────────────────────────────────────────────

interface FieldProps {
  label: string;
  name: string;
  type?: "text" | "email" | "tel" | "url" | "number";
  required?: boolean;
  optional?: boolean;
  optionalLabel?: string;
  autoComplete?: string;
  placeholder?: string;
  defaultValue?: string;
  pattern?: string;
  minLength?: number;
  maxLength?: number;
  title?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function TextField({
  label,
  name,
  type = "text",
  required,
  optional,
  optionalLabel = "opsiyonel",
  autoComplete,
  placeholder,
  defaultValue,
  pattern,
  minLength,
  maxLength,
  title,
  value,
  onChange,
}: FieldProps) {
  return (
    <label className="group block">
      <FieldLabel text={label} optional={optional} optionalLabel={optionalLabel} />
      <input
        name={name}
        type={type}
        required={required}
        autoComplete={autoComplete}
        placeholder={placeholder}
        defaultValue={defaultValue}
        pattern={pattern}
        minLength={minLength}
        maxLength={maxLength}
        title={title}
        value={value}
        onChange={onChange}
        className={cn(baseInputClass, "mt-2")}
      />
    </label>
  );
}

// ─── TextArea ─────────────────────────────────────────────────────────────────

interface TextAreaProps {
  label: string;
  name: string;
  rows?: number;
  required?: boolean;
  optional?: boolean;
  optionalLabel?: string;
  placeholder?: string;
}

export function TextArea({
  label,
  name,
  rows = 5,
  required,
  optional,
  optionalLabel = "opsiyonel",
  placeholder,
}: TextAreaProps) {
  return (
    <label className="group block">
      <FieldLabel text={label} optional={optional} optionalLabel={optionalLabel} />
      <textarea
        name={name}
        rows={rows}
        required={required}
        placeholder={placeholder}
        className={cn(baseInputClass, "mt-2 resize-none")}
      />
    </label>
  );
}

// ─── RadioGroup ───────────────────────────────────────────────────────────────

interface RadioGroupProps {
  label: string;
  name: string;
  options: { value: string; label: string }[];
  required?: boolean;
  defaultValue?: string;
}

export function RadioGroup({
  label,
  name,
  options,
  required,
  defaultValue,
}: RadioGroupProps) {
  return (
    <fieldset>
      <legend className="text-sm font-medium text-ink">{label}</legend>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {options.map((opt) => (
          <label
            key={opt.value}
            className={cn(
              "flex cursor-pointer items-center gap-3 rounded-xl border border-mute-200 bg-paper px-4 py-3 text-sm",
              "transition-all duration-150",
              "hover:border-mute-400 hover:bg-mute-50",
              "has-[:checked]:border-accent has-[:checked]:bg-accent/5 has-[:checked]:shadow-[0_0_0_2px_rgb(128_0_0_/_0.08)]"
            )}
          >
            <input
              type="radio"
              name={name}
              value={opt.value}
              required={required}
              defaultChecked={defaultValue === opt.value}
              className="h-4 w-4 cursor-pointer accent-accent"
            />
            <span className="text-ink">{opt.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

// ─── CheckboxGroup ────────────────────────────────────────────────────────────

interface CheckboxGroupProps {
  label: string;
  name: string;
  options: { value: string; label: string }[];
}

export function CheckboxGroup({ label, name, options }: CheckboxGroupProps) {
  return (
    <fieldset>
      <legend className="text-sm font-medium text-ink">{label}</legend>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {options.map((opt) => (
          <label
            key={opt.value}
            className={cn(
              "flex cursor-pointer items-center gap-3 rounded-xl border border-mute-200 bg-paper px-4 py-3 text-sm",
              "transition-all duration-150",
              "hover:border-mute-400 hover:bg-mute-50",
              "has-[:checked]:border-accent has-[:checked]:bg-accent/5 has-[:checked]:shadow-[0_0_0_2px_rgb(128_0_0_/_0.08)]"
            )}
          >
            <input
              type="checkbox"
              name={name}
              value={opt.value}
              className="h-4 w-4 cursor-pointer accent-accent"
            />
            <span className="text-ink">{opt.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

// ─── Consent ──────────────────────────────────────────────────────────────────

interface ConsentProps {
  name?: string;
  label: string;
}

export function Consent({ name = "consent", label }: ConsentProps) {
  return (
    <label className="flex cursor-pointer items-start gap-3 text-sm text-mute-700">
      <input
        type="checkbox"
        name={name}
        required
        className="mt-0.5 h-4 w-4 cursor-pointer accent-accent"
      />
      <span className="leading-relaxed">{label}</span>
    </label>
  );
}

// ─── FieldLabel ───────────────────────────────────────────────────────────────

function FieldLabel({
  text,
  optional,
  optionalLabel,
}: {
  text: string;
  optional?: boolean;
  optionalLabel?: string;
}) {
  return (
    <span className="block text-sm font-medium text-ink">
      {text}
      {optional && (
        <span className="ml-1.5 font-normal text-mute-400">— {optionalLabel}</span>
      )}
    </span>
  );
}
