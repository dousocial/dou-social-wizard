export const dynamic = "force-dynamic";

export default function YonetimLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <head>
        {/* Tema flash önleme — hidrasyon öncesi çalışır */}
        <script dangerouslySetInnerHTML={{ __html: `
          try {
            var t = localStorage.getItem('adm-theme');
            if (t === 'light') document.documentElement.setAttribute('data-theme', 'light');
          } catch(e) {}
        ` }} />
        <style dangerouslySetInnerHTML={{ __html: `
          :root {
            --c-bg:       #0a0a0a;
            --c-surface:  #111111;
            --c-surface2: #0d0d0d;
            --c-border:   #222222;
            --c-border2:  #2a2a2a;
            --c-text:     #f3f4f6;
            --c-text2:    #9ca3af;
            --c-text3:    #6b7280;
            --c-dim:      #4b5563;
            --c-input:    #0a0a0a;
            --c-warm:     #131010;
            --c-warm-b:   #3a1a1a;
          }
          [data-theme="light"] {
            --c-bg:       #f1f5f9;
            --c-surface:  #ffffff;
            --c-surface2: #f8fafc;
            --c-border:   #e2e8f0;
            --c-border2:  #d1d5db;
            --c-text:     #111827;
            --c-text2:    #374151;
            --c-text3:    #4b5563;
            --c-dim:      #9ca3af;
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
        fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif",
        minHeight: "100vh",
        fontSize: 16,
      }}>
        {children}
      </body>
    </html>
  );
}
