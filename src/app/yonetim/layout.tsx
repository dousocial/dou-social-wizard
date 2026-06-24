export const dynamic = "force-dynamic";

export default function YonetimLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;1,9..40,400&display=swap" rel="stylesheet" />
        {/* Tema flash önleme — hidrasyon öncesi çalışır */}
        <script id="adm-theme-init" dangerouslySetInnerHTML={{ __html: `
          try {
            var t = localStorage.getItem('adm-theme');
            if (t === 'light') document.documentElement.setAttribute('data-theme', 'light');
          } catch(e) {}
        ` }} />
        <style dangerouslySetInnerHTML={{ __html: `
          :root {
            --c-bg:       #080808;
            --c-surface:  #101010;
            --c-surface2: #0c0c0c;
            --c-border:   #1f1f1f;
            --c-border2:  #282828;
            --c-text:     #ffffff;
            --c-text2:    #e2e8f0;
            --c-text3:    #94a3b8;
            --c-dim:      #64748b;
            --c-input:    #080808;
            --c-warm:     #130f0f;
            --c-warm-b:   #3a1a1a;
          }
          @keyframes spin { to { transform: rotate(360deg); } }
          [data-theme="light"] {
            --c-bg:       #f1f5f9;
            --c-surface:  #ffffff;
            --c-surface2: #f8fafc;
            --c-border:   #e2e8f0;
            --c-border2:  #d1d5db;
            --c-text:     #0f172a;
            --c-text2:    #1e293b;
            --c-text3:    #475569;
            --c-dim:      #94a3b8;
            --c-input:    #f8fafc;
            --c-warm:     #fff5f5;
            --c-warm-b:   #fecaca;
          }
        ` }} />
      </head>
      <body style={{
        margin: 0, padding: 0,
        background: "var(--c-bg)",
        color: "var(--c-text)",
        fontFamily: "'DM Sans', 'Inter', ui-sans-serif, system-ui, sans-serif",
        minHeight: "100vh",
        fontSize: 16,
        WebkitFontSmoothing: "antialiased",
        MozOsxFontSmoothing: "grayscale",
      } as React.CSSProperties}>
        {children}
      </body>
    </html>
  );
}
