import { ImageResponse } from "next/og";

export const alt = "AR Product Viewer — place a product in your room at true scale";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "72px 80px",
          background: "linear-gradient(135deg, #0f1115 0%, #182033 60%, #1e2b45 100%)",
          color: "#e8eaed",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            fontSize: 26,
            color: "#7aa7ff",
            letterSpacing: 2,
            textTransform: "uppercase",
          }}
        >
          Augmented reality · no app install
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 76,
            fontWeight: 700,
            lineHeight: 1.1,
            marginTop: 24,
            letterSpacing: -2,
          }}
        >
          See it in your own space
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 32,
            color: "#9aa3af",
            marginTop: 26,
            lineHeight: 1.4,
            maxWidth: 900,
          }}
        >
          Point your phone at the floor and the product appears at actual size. Open the same
          link on a laptop for 3D and real-world dimensions.
        </div>
        <div style={{ display: "flex", gap: 14, marginTop: 44 }}>
          {["True scale", "Share one link", "Works on site"].map((t) => (
            <div
              key={t}
              style={{
                display: "flex",
                padding: "12px 24px",
                borderRadius: 999,
                border: "2px solid #2f3b52",
                fontSize: 26,
                color: "#c9d2e0",
              }}
            >
              {t}
            </div>
          ))}
        </div>
      </div>
    ),
    size
  );
}
