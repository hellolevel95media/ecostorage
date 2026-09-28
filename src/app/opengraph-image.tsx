import { ImageResponse } from "next/og";

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
          padding: "80px",
          background: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 88,
              height: 88,
              borderRadius: 20,
              background: "#00e599",
              color: "#04140d",
              fontSize: 52,
              fontWeight: 700,
            }}
          >
            E
          </div>
          <div style={{ display: "flex", fontSize: 64, fontWeight: 700, color: "#0b0f17" }}>
            <span style={{ color: "#00e599" }}>Eco</span>
            <span>Storage</span>
          </div>
        </div>
        <div style={{ display: "flex", marginTop: 36, fontSize: 32, color: "#0b0f17b3", maxWidth: 900 }}>
          Storage that moves at the speed of your life.
        </div>
        <div style={{ display: "flex", marginTop: 24, fontSize: 24, color: "#00805f" }}>
          Personal &amp; corporate storage, pickup to delivery — across Singapore.
        </div>
      </div>
    ),
    size
  );
}
