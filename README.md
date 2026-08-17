# DOU Social — Pazarlama Sitesi

Ajansın herkese açık pazarlama sitesi (`dousocial.com`). `dou-social-crm` reposundan tamamen ayrı, bağımsız bir Next.js uygulamasıdır — CRM/admin paneli (`/yonetim`) burada YOKTUR (o `dou-social-crm` reposunda ve `crm.dousocial.com`'da yaşar).

## Kurulum

```bash
pnpm install
# .env.local oluştur — bkz. aşağıdaki "Gerekli ortam değişkenleri"
pnpm dev
```

## Dağıtım

Bu repo **GitHub'a bağlı otomatik deploy kullanmaz** — Vercel projesi (`dou-social-wizard`) doğrudan CLI ile deploy edilir:

```bash
vercel --prod --yes
```

`main` branch'e push etmek tek başına canlıya yansımaz.

## Gerekli ortam değişkenleri

- `NEXT_PUBLIC_SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` — `dou-social-crm` ile AYNI Supabase projesi (veritabanı paylaşılıyor: iletişim formu, dijital checkup, blog, projeler, influencer başvuruları CRM tarafında görünür)
- `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` / reCAPTCHA server key — form spam koruması
- Google/analytics ile ilgili anahtarlar — bkz. `.env.local` mevcut değerler

## Notlar

- `supabase/` klasöründeki `.sql` dosyaları yalnızca bu sitenin kendi tablolarına ait (blog, projeler, influencer başvuru formu, genel şema referansı). CRM'in kendi şema migration'ları `dou-social-crm` reposundadır.
- Eski (CRM ayrılmadan önceki) `/yonetim` admin paneli kalıntısı bu repodan tamamen kaldırıldı — daha önce yanlışlıkla canlıda hâlâ erişilebilir durumdaydı, artık yok.
