import { ImageResponse } from "next/og";

export const alt = "Kasir Bazar - Aplikasi Kasir Offline Gratis untuk Bazar & Warung";
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
          padding: "72px",
          background: "#0f766e",
          color: "#ffffff",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "16px",
              background: "#ffffff",
              color: "#0f766e",
              fontSize: "36px",
              fontWeight: 800,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            K
          </div>
          <div
            style={{
              display: "flex",
              fontSize: "30px",
              fontWeight: 700,
              letterSpacing: "2px",
              opacity: 0.9,
            }}
          >
            KASIR BAZAR
          </div>
        </div>
        <div
          style={{
            display: "flex",
            fontSize: "68px",
            fontWeight: 800,
            marginTop: "36px",
            lineHeight: 1.1,
          }}
        >
          Kasir Offline Gratis
        </div>
        <div
          style={{
            display: "flex",
            fontSize: "40px",
            fontWeight: 600,
            marginTop: "8px",
            opacity: 0.95,
          }}
        >
          untuk Bazar {"&"} Warung
        </div>
        <div
          style={{
            display: "flex",
            fontSize: "26px",
            marginTop: "40px",
            opacity: 0.8,
          }}
        >
          Catat penjualan · Tanpa internet · Mode PWA
        </div>
      </div>
    ),
    { ...size }
  );
}
