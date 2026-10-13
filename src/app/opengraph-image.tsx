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
            <svg width="72" height="65" viewBox="2.3 3.3 19.4 17.4" fill="none" stroke="#04140d" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9.5 12 4l9 5.5V20H3z" /><path d="M7.5 20v-7.5h9V20" /><path d="M7.5 15h9M7.5 17.5h9" /></svg>
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
          Storage &amp; moving from one team — across Singapore.
        </div>
      </div>
    ),
    size
  );
}
