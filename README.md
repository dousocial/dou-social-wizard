This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Mülakat randevuları

Aday sayfası: https://www.dousocial.com/mulakat

23 Ekim 2026 Cuma günü Türkiye saatiyle 10.00–18.00 arasında 15 dakikalık aralıklarla 33 başlangıç saati bulunur. Son görüşme 18.00–18.15 arasındadır. Aday yalnızca ad soyad ve saat girer. İsimler herkese açık listede gösterilmez.

Kurulum: `supabase/interview-booking.sql` paylaşılan Supabase projesinde uygulanır. `SUPABASE_SERVICE_ROLE_KEY` yalnızca sunucuda, gerçek service_role anahtarı olarak tanımlanmalıdır; anonim/publishable anahtar özel randevu tablosunu okuyamaz. Ortam değişkeni değişikliğinden sonra yeniden yayın gerekir. Hiçbir anahtar repoya veya istemciye eklenmez.

PostgreSQL benzersiz indeksleri aynı saate, normalize edilmiş aynı ad soyada ve aynı tarayıcıya ikinci aktif kaydı engeller. İsimle başvuru kimlik doğrulaması değildir; aynı ad soyada sahip adaylar ekiple iletişime geçmelidir. Saatler 10 saniyede bir güncellenir ve kayıt ancak veritabanı onayından sonra gösterilir.

Ekip listesi: https://crm.dousocial.com/yonetim/mulakat (`dousocial/dou-social-crm` deposu). Erişim için `crm.write` gerekir.
