import { ImageResponse } from "next/og";
import { getTranslations } from "next-intl/server";

export const alt = "DOU Social";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OG({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Meta" });

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#000000",
          color: "#FFFFFF",
          padding: "80px",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 120,
            fontWeight: 700,
            letterSpacing: "-0.04em",
            lineHeight: 1,
            display: "flex",
            alignItems: "center",
          }}
        >
          DOU
          <span
            style={{
              marginLeft: 24,
              padding: "8px 24px",
              border: "2px solid #800000",
              color: "#800000",
              fontSize: 32,
              fontWeight: 600,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
            }}
          >
            Social
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <p
            style={{
              fontSize: 56,
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              fontWeight: 600,
              maxWidth: 900,
              margin: 0,
            }}
          >
            {t("siteTitle").replace("DOU Social — ", "")}
          </p>
          <p
            style={{
              marginTop: 24,
              fontSize: 24,
              color: "#A3A3A3",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            dousocial.com
          </p>
        </div>
      </div>
    ),
    { ...size }
  );
}
