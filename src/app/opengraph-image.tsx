import { ImageResponse } from "next/og";

/**
 * The card every shared link shows. Drawn rather than shipped as a file,
 * so it stays in step with the site's own ground, mark and wordmark.
 */

export const alt = "Payloat Ledger — the ledger your agents write to";
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
          justifyContent: "space-between",
          backgroundColor: "#eeeeee",
          padding: 84,
        }}
      >
        {/* the mark and the wordmark, as the bar carries them */}
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <svg width="62" height="91" viewBox="0 0 622 910">
            <path d="M0 0H220V220H0Z" fill="#0a0a0a" />
            <path d="M220 220H622V620L432 810H235V910H40V620H411V420H220Z" fill="#0a0a0a" />
          </svg>
          <div style={{ fontSize: 58, fontWeight: 600, color: "#0a0a0a", letterSpacing: -2 }}>
            payloat
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 82,
              fontWeight: 600,
              color: "#0a0a0a",
              letterSpacing: -3.5,
              lineHeight: 1.04,
              maxWidth: 940,
            }}
          >
            Payloat lets you manage every dollar your agents spend
          </div>
          <div style={{ marginTop: 28, fontSize: 30, color: "#555555", letterSpacing: -0.5 }}>
            Every purchase, with the task behind it, before the receipt lands.
          </div>
        </div>
      </div>
    ),
    size,
  );
}
