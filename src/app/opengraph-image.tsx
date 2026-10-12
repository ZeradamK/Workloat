import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

/**
 * The card every shared link shows. Drawn rather than shipped as a file,
 * so it stays in step with the site's own ground and wordmark.
 */

export const alt = "Workloat. Give your work to a Loat. It answers to you.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  const wordmark = await readFile(join(process.cwd(), "public/brand/workloat-wordmark-dark.png"));
  const src = `data:image/png;base64,${wordmark.toString("base64")}`;
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
        {/* the wordmark, as the bar carries it */}
        <div style={{ display: "flex" }}>
          <img src={src} width={421} height={50} alt="" />
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
            Give your work to a Loat. It answers to you.
          </div>
          <div style={{ marginTop: 28, fontSize: 30, color: "#555555", letterSpacing: -0.5 }}>
            Each Loat has its own email address, a human owner and your OK before it writes to anyone else.
          </div>
        </div>
      </div>
    ),
    size,
  );
}
