"use client";

/**
 * iPhone 17 Pro CSS mock, ported from the user's payloat-iphone-mockup.html
 * (same source as the iOS onboarding's PhoneMock): titanium band gradient,
 * chamfer ring, black glass pad, reflection sweep, side keys, antenna dots.
 * Native design width is 430px; everything scales off `width`. Screen is
 * the page background color with a dynamic island, so zooming into it
 * lands seamlessly on the page.
 *
 * Geometry helpers exported for scroll choreography:
 *   phoneHeight(width)  — full device height
 *   islandCenterY(width) — y of the dynamic island's center from device top
 */

export const phoneHeight = (width: number) => (909 / 430) * width;
export const islandCenterY = (width: number) => (40.5 / 430) * width;
export const screenWidth = (width: number) => (408 / 430) * width;

export default function PhoneMock({
  width,
  frame = "titanium",
  frameColor,
  screenBg = "var(--background)",
  children,
}: {
  width: number;
  /** "titanium" = the full metallic band; "black" = dark titanium #1E1E1E
      edges (side keys keep their metallic finish either way). */
  frame?: "titanium" | "black";
  /** Override the band color entirely (e.g. "#000" to match the island). */
  frameColor?: string;
  /** Screen background color. */
  screenBg?: string;
  children?: React.ReactNode;
}) {
  /* native design values are for a 430px-wide device */
  const k = width / 430;
  const px = (v: number) => v * k;
  const black = frame === "black";

  return (
    <div
      className="relative"
      style={{
        width,
        height: phoneHeight(width),
        borderRadius: px(74),
        padding: px(4),
        background:
          frameColor ??
          (black
            ? "#1e1e1e"
            : "linear-gradient(145deg,#E8E8EA 0%,#9FA0A4 12%,#5B5C60 30%,#3E3F43 50%,#5B5C60 70%,#B9BABD 90%,#7E7F83 100%)"),
      }}
    >
      {/* chamfer ring */}
      {!black && (
        <div
          className="pointer-events-none absolute"
          style={{
            inset: px(3),
            borderRadius: px(71),
            background: "linear-gradient(145deg,#2A2B2E,#151618 40%,#0B0C0D)",
          }}
        />
      )}

      {/* side keys */}
      {[
        { left: px(-2.5), top: px(186), height: px(34) },
        { left: px(-2.5), top: px(250), height: px(62) },
        { left: px(-2.5), top: px(326), height: px(62) },
        { right: px(-2.5), top: px(286), height: px(96), flip: true },
        { right: px(-2.5), top: px(470), height: px(46), flip: true },
      ].map((b, i) => (
        <span
          key={i}
          className="absolute"
          style={{
            left: b.left,
            right: b.right,
            top: b.top,
            width: px(5),
            height: b.height,
            borderRadius: px(3),
            background: `linear-gradient(${b.flip ? 270 : 90}deg,#6E6F73,#3C3D41 30%,#232427)`,
          }}
        />
      ))}

      {/* antenna breaks (titanium band only) */}
      {!black &&
        [
          { top: 0, left: px(104) },
          { top: 0, right: px(104) },
          { bottom: 0, left: px(104) },
          { bottom: 0, right: px(104) },
        ].map((a, i) => (
          <span
            key={i}
            className="absolute opacity-90"
            style={{
              ...a,
              width: px(4),
              height: px(4),
              borderRadius: px(2),
              background: "#88898D",
            }}
          />
        ))}

      {/* glass + bezel */}
      <div
        className="relative z-[2] h-full overflow-hidden bg-black"
        style={{ borderRadius: px(70), padding: px(7) }}
      >
        {/* screen */}
        <div
          className="relative h-full w-full overflow-hidden"
          style={{ borderRadius: px(62), background: screenBg }}
        >
          {children}
        </div>

        {/* dynamic island (center y = 40.5k from device top); opacity and
            color are externally scriptable via --island-o / --island-bg for
            the zoom hand-off (black → #EEEEEE as it becomes the nav dock) */}
        <div
          data-island
          className="absolute left-1/2 -translate-x-1/2"
          style={{
            top: px(18),
            width: px(128),
            height: px(37),
            borderRadius: px(19),
            background: "var(--island-bg, #000)",
            opacity: "var(--island-o, 1)" as unknown as number,
          }}
        />

        {/* glass reflection sweep */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            borderRadius: px(70),
            background:
              "linear-gradient(115deg,rgba(255,255,255,.09) 0%,rgba(255,255,255,.03) 18%,transparent 30%)",
          }}
        />
      </div>
    </div>
  );
}
