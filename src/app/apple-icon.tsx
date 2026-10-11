import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#00e599",
          color: "#04140d",
        }}
      >
        <svg width="148" height="133" viewBox="2.3 3.3 19.4 17.4" fill="none" stroke="#04140d" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9.5 12 4l9 5.5V20H3z" /><path d="M7.5 20v-7.5h9V20" /><path d="M7.5 15h9M7.5 17.5h9" /></svg>
      </div>
    ),
    size
  );
}
