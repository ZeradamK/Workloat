"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import Image from "next/image";
import PhoneMock, { islandCenterY, phoneHeight } from "./PhoneMock";
import { introT } from "./introProgress";

/* white tinted 10% toward #EEEEEE — the phone screen and h1 tone */
const TINT_10 = "color-mix(in srgb, #eeeeee 10%, #ffffff)";

/**
 * DORMANT SECTION — not currently rendered; saved for future use.
 *
 * The black pre-hero scroll act (300vh): iPhone mock centered showing the
 * real app screenshot, headline left, description right (Cash App hero
 * anatomy). On scroll:
 *   1. the side texts parallax away
 *   2. the phone rises and grows; its dynamic island color-morphs
 *      black → #EEEEEE and docks pixel-exact behind the nav dock while
 *      the screenshot dissolves at the convergence
 *   3. after a beat of scroll, the scale booms: you zoom straight through
 *      the phone's blank screen into the white page.
 *
 * TO RE-ENABLE: in src/app/page.tsx render
 *   <NavDock introChoreo />   (instead of <NavDock />)
 *   <IntroZoom />             (above the hero section)
 * Everything else (introProgress signal, NavDock reveal choreography,
 * /app-home-shot-v2.png asset) is already wired. Only runs at >= 800px;
 * below that it pins introT to 1 and hides itself.
 */

const PHONE_W = 320;
/* nav dock center: top 20px + half of its 48px height */
const DOCK_CENTER_Y = 44;

export default function IntroZoom() {
  const ref = useRef<HTMLDivElement>(null);
  const [vh, setVh] = useState(900);

  useEffect(() => {
    const measure = () => setVh(window.innerHeight);
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });
  const t = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 28,
    mass: 0.25,
  });

  /* broadcast the smoothed progress so NavDock can sync its reveal.
     Below 800px the act doesn't exist: introT pins to 1 so the nav
     chrome is simply visible and the page starts at the hero. */
  const narrowRef = useRef(false);
  useMotionValueEvent(t, "change", (v) => {
    if (!narrowRef.current) introT.set(v);
  });
  useLayoutEffect(() => {
    const mq = window.matchMedia("(max-width: 799px)");
    const apply = () => {
      narrowRef.current = mq.matches;
      introT.set(mq.matches ? 1 : t.get());
    };
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [t]);

  const phoneH = phoneHeight(PHONE_W);
  const islandCY = islandCenterY(PHONE_W);
  /* translate needed so the island's center lands on the dock's center
     (translate happens after scale in CSS, so this delta is unscaled) */
  const dockDelta = DOCK_CENTER_Y - ((vh - phoneH) / 2 + islandCY);

  /* side texts drift apart and dissolve */
  const h1X = useTransform(t, [0, 0.3], [0, -160]);
  const h1O = useTransform(t, [0.04, 0.28], [1, 0]);
  const pX = useTransform(t, [0, 0.3], [0, 160]);
  const pO = useTransform(t, [0.04, 0.28], [1, 0]);

  /* phone: rise to dock, then boom through the screen.
     transformOrigin sits on the island, so once docked, all further
     scaling explodes around the pinned island point. */
  const y = useTransform(t, [0.12, 0.52], [0, dockDelta]);
  /* scale holds gentle through the hand-off, then a bit more scroll
     triggers the boom into the page */
  const scale = useTransform(t, [0, 0.35, 0.62, 0.75, 1], [1, 1.12, 1.35, 1.6, 11]);
  /* the hand-off is a color morph: the docked island turns #EEEEEE, and
     the moment it lands the dock has fully eased in, concentric with it */
  const islandBg = useTransform(t, [0.45, 0.62], ["#000000", "#eeeeee"]);
  /* island bows out under the opaque dock, while still narrower than it */
  const islandO = useTransform(t, [0.7, 0.8], [1, 0]);
  /* the app screenshot dissolves at the camera-bar/nav-bar convergence,
     leaving the clean tinted screen for the boom */
  const shotO = useTransform(t, [0.5, 0.62], [1, 0]);
  /* absorb any last frame remnants into the page background */
  const coverO = useTransform(t, [0.94, 1], [0, 1]);

  return (
    /* the whole act exists only at >= 800px; below, the page opens on the hero */
    <div ref={ref} className="relative hidden h-[300vh] min-[800px]:block">
      <div className="sticky top-0 h-screen overflow-hidden bg-black">
        {/* left headline, centered between the screen edge and the phone's
            left line (gutter = 50% - half the phone width) */}
        <div className="absolute left-0 top-1/2 flex w-[calc(50%-160px)] -translate-y-1/2 justify-center">
          <motion.h1
            style={{ x: h1X, opacity: h1O, color: TINT_10 }}
            className="w-max text-[clamp(22px,3.2vw,52px)] font-semibold leading-[1.0] tracking-[-0.02em]"
          >
            See every dollar
            <br />
            your agents spend
          </motion.h1>
        </div>

        {/* right description, centered between the phone's right line and
            the screen edge */}
        <div className="absolute right-0 top-1/2 flex w-[calc(50%-160px)] -translate-y-1/2 justify-center">
          <motion.p
            style={{ x: pX, opacity: pO }}
            className="w-[85%] max-w-[300px] text-pretty text-[17px] leading-[1.3] text-white"
          >
            Every purchase, subscription, order, and receipt your agents
            record, in one ledger
          </motion.p>
        </div>

        {/* the phone */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            style={
              {
                y,
                scale,
                transformOrigin: `50% ${islandCY}px`,
                "--island-o": islandO,
                "--island-bg": islandBg,
              } as React.ComponentProps<typeof motion.div>["style"]
            }
          >
            <PhoneMock width={PHONE_W} frame="black" screenBg={TINT_10}>
              {/* real app screenshot (1206×2622 = the screen's exact aspect),
                  sliding behind the mock's camera bar */}
              <motion.div
                className="absolute inset-0"
                style={{ opacity: shotO }}
              >
                <Image
                  src="/app-home-shot-v2.png"
                  alt=""
                  fill
                  priority
                  sizes="440px"
                  className="object-cover"
                />
              </motion.div>
            </PhoneMock>
          </motion.div>
        </div>

        {/* end-of-boom cover: everything settles onto the page background */}
        <motion.div
          style={{ opacity: coverO }}
          className="pointer-events-none absolute inset-0 bg-background"
        />
      </div>
    </div>
  );
}
