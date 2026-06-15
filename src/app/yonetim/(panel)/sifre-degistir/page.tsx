import { ChangePasswordForm } from "./_components/ChangePasswordForm";

export default function SifreDegistirPage() {
  return (
    <div style={{ maxWidth: 520 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: "var(--c-text)" }}>Şifre Değiştir</h1>
        <p style={{ margin: "6px 0 0", fontSize: 15, color: "var(--c-text3)" }}>Hesabınızın şifresini güncelleyin.</p>
      </div>
      <ChangePasswordForm />
    </div>
  );
}
