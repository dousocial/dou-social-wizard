/**
 * Hidden field for spam bots. Humans never see/fill it; bots auto-fill all fields.
 * If `website_url` arrives non-empty, the submission is silently dropped.
 */
export function Honeypot() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        left: "-9999px",
        top: "auto",
        width: 1,
        height: 1,
        overflow: "hidden",
      }}
    >
      <label>
        Website URL (do not fill)
        <input
          type="text"
          name="website_url"
          tabIndex={-1}
          autoComplete="off"
        />
      </label>
    </div>
  );
}
