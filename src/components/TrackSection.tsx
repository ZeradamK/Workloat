"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion, useScroll, useSpring, useTransform, type MotionValue } from "motion/react";

/**
 * Track everything: the headline and one line of copy, then a pinned box
 * that plays three slides as the page scrolls. Each slide is a photo
 * mock (hands holding a phone) with one of the panels laid into the
 * phone's screen: spend by day on the portrait phone, caps per agent on
 * a plain gray slide until its mock arrives, upcoming charges filling
 * the landscape phone. Scrolling down, the current slide rises, its lower
 * edge fading and blurring away, and the next zips up from below.
 * Scrolling up runs the same in reverse, fading from the top.
 *
 * Each mock is shown through a window (a top and bottom share of the
 * photo) scaled to the box's height, so the box's bottom edge is where
 * the hands are cut. The screen rectangles are measured from the mocks'
 * pixels (see SCREENS); the panels are laid out at a design width and
 * scaled to the screen. Screens are #eeeeee, panels white, type SF Pro.
 */

const EASE = [0.25, 0.6, 0.2, 1] as const;

const up = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.55, ease: EASE },
} as const;

const SCREEN_BG = "#eeeeee";
const INK = "#0a0a0a";
const MUTED = "#706e68";
const LINE = "rgba(10,10,10,0.08)";

/* the mocks: canvas size, backdrop, the window shown (shares of the
   height), the screen rectangle (fractions), and the corner radius as a
   share of the screen width. `tilt` straightens a leaning phone; the
   portrait mock measures level, so it stays at 0. */
const SCREENS = {
  portrait: {
    src: "/mocks/spend-portrait.webp", w: 1000, h: 1500, bg: "#ffffff", tilt: 0,
    window: { top: 0.125, bottom: 0.7 },
    left: 334 / 1000, top: 217 / 1500, width: 343 / 1000, height: 742 / 1500, radius: 0.13, island: true,
  },
  landscape: {
    src: "/mocks/upcoming-landscape.webp", w: 4800, h: 3584, bg: "#d5d5d5", tilt: 0,
    window: { top: 0.14, bottom: 0.82 },
    left: 1158 / 4800, top: 805 / 3584, width: 2489 / 4800, height: 1750 / 3584, radius: 0.04, island: false,
  },
} as const;

/* sample data, per company in the product. September 2026 starts on a
   Tuesday; spend by day through the 10th sums to $9,190 */
const SPEND_BY_DAY = [380, 530, 510, 840, 750, 1170, 1040, 1420, 1390, 1160];
const TODAY = 10;
const DAYS = 30;
const OFFSET = 2;

const CAPS = [
  { name: "Procurement", spent: 4120, cap: 5000 },
  { name: "Software & seats", spent: 2860, cap: 3000 },
  { name: "Ops", spent: 1450, cap: 2500 },
] as const;
const CAPS_TOTAL = { spent: 9190, cap: 14000 };

const UPCOMING: Record<number, { logos: string[]; amount: string }> = {
  15: { logos: ["/logos/vercel.svg"], amount: "$350" },
  17: { logos: ["/logos/stripe.png", "/logos/aws.svg"], amount: "$1,450" },
  19: { logos: ["/logos/claude.svg"], amount: "$4,000" },
  22: { logos: ["/logos/openai.svg"], amount: "$2,500" },
  25: { logos: ["/logos/brex.svg"], amount: "$12,480" },
};

const fmt = (n: number) => `$${n.toLocaleString("en-US")}`;
const short = (n: number) => (n >= 1000 ? `$${(n / 1000).toFixed(1).replace(/\.0$/, "")}k` : `$${n}`);

const SLIDES = 3;
/* the pinned box: 30% shorter than the viewport, less the page's inset */
const BOX_H = "max(420px, calc(70vh - 34px))";

export default function TrackSection() {
  const runway = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion() ?? false;
  const { scrollYProgress } = useScroll({ target: runway, offset: ["start start", "end end"] });
  /* a spring on the progress gives the zip between slides */
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 24, mass: 0.6 });

  return (
    <section className="mx-auto max-w-[1200px] px-6 py-[clamp(32px,5vw,80px)]">
      {/* the head */}
      <div className="mx-auto max-w-[560px] text-center">
        <motion.h2 {...up} className="text-[clamp(26px,2.6vw,36px)] font-medium leading-[1.15] tracking-[-1px] text-ink">
          Track everything
        </motion.h2>
        <motion.p {...up} className="mt-4 text-[16px] leading-[1.5] text-sub">
          Connect your banks and give each agent a key to see all of it in one place. Easy to
          find, easy to understand.
        </motion.p>
      </div>

      {/* the runway: the box pins while the three slides play */}
      <div ref={runway} className="relative mt-[clamp(32px,4vw,56px)]" style={{ height: reduced ? "auto" : `${SLIDES * 100}vh` }}>
        <div
          className="sticky overflow-hidden rounded-[30px]"
          style={{ top: "calc(15vh + 17px)", height: BOX_H, backgroundColor: SCREEN_BG }}
        >
          <Slide index={0} progress={progress} reduced={reduced} bg={SCREENS.portrait.bg}>
            <Mock spec={SCREENS.portrait} panelWidth={300} panelShare={1} panelTop={0.1}>
              <SpendPanel />
            </Mock>
          </Slide>
          <Slide index={1} progress={progress} reduced={reduced} bg={SCREEN_BG}>
            <div className="flex h-full w-full items-center justify-center px-6">
              <div className="w-full max-w-[380px]">
                <CapsPanel />
              </div>
            </div>
          </Slide>
          <Slide index={2} progress={progress} reduced={reduced} bg={SCREENS.landscape.bg}>
            <Mock spec={SCREENS.landscape} panelWidth={640} panelShare={1} panelTop={0} fill>
              <UpcomingPanel />
            </Mock>
          </Slide>
        </div>
      </div>
    </section>
  );
}

/* ---------- the slides ---------- */

/* One slide of the pinned box. `t` is its distance from the front: 0 is
   in view, 1 is fully risen and gone, -1 is waiting below. Rising, the
   slide lifts, blurs, and its lower edge fades out; waiting below, its
   upper edge is the faded one. */
function Slide({ index, progress, reduced, bg, children }: { index: number; progress: MotionValue<number>; reduced: boolean; bg: string; children: React.ReactNode }) {
  const t = useTransform(progress, (v) => v * (SLIDES - 1) - index);
  const y = useTransform(t, (v) => `${Math.max(-1, Math.min(1, v)) * -56}%`);
  const scale = useTransform(t, (v) => 1 - Math.min(1, Math.abs(v)) * 0.06);
  const opacity = useTransform(t, (v) => 1 - Math.min(1, Math.abs(v) * 1.25));
  const filter = useTransform(t, (v) => `blur(${Math.min(1, Math.abs(v)) * 16}px)`);
  const mask = useTransform(t, (v) => {
    const a = Math.min(1, Math.abs(v));
    if (a < 0.02) return "none";
    /* rising: fade the bottom; waiting below: fade the top */
    const dir = v > 0 ? "to bottom" : "to top";
    const solid = Math.max(0, 100 - a * 130);
    return `linear-gradient(${dir}, #000 ${solid}%, transparent 100%)`;
  });
  const display = useTransform(t, (v) => (Math.abs(v) >= 1 ? "none" : "block"));
  if (reduced) {
    return index === 0 ? (
      <div className="absolute inset-0" style={{ backgroundColor: bg }}>
        {children}
      </div>
    ) : null;
  }
  return (
    <motion.div
      className="absolute inset-0 will-change-transform"
      style={{ backgroundColor: bg, y, scale, opacity, filter, maskImage: mask, WebkitMaskImage: mask, display, zIndex: SLIDES - index }}
    >
      {children}
    </motion.div>
  );
}

/* A photo mock in the slide: the mock's window (top to bottom share) is
   scaled to the box's height and its top pinned to the box's top, so the
   box's bottom edge is the cut through the hands. The panel is designed
   at `panelWidth` px and scaled to span `panelShare` of the screen's
   width, `panelTop` of the screen's height down; with `fill` it is also
   stretched to the screen's full height. */
function Mock({ spec, panelWidth, panelShare, panelTop, fill, children }: { spec: (typeof SCREENS)[keyof typeof SCREENS]; panelWidth: number; panelShare: number; panelTop: number; fill?: boolean; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ w: 0, h: 0 });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setBox({ w: el.clientWidth, h: el.clientHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const windowH = (spec.window.bottom - spec.window.top) * spec.h;
  const k = box.h ? box.h / windowH : 0;
  const imgW = spec.w * k;
  const imgH = spec.h * k;
  const screen = { left: spec.left * imgW, top: spec.top * imgH, width: spec.width * imgW, height: spec.height * imgH };
  const scale = (screen.width * panelShare) / panelWidth;
  return (
    <div ref={ref} className="relative h-full w-full overflow-hidden">
      {k > 0 && (
        <div
          className="absolute"
          style={{ left: (box.w - imgW) / 2, top: -spec.window.top * imgH, width: imgW, height: imgH, transform: spec.tilt ? `rotate(${spec.tilt}deg)` : undefined }}
        >
          <Image src={spec.src} alt="" fill sizes="(min-width: 1200px) 1400px, 120vw" className="object-contain" />
          {/* the screen: the gray ground, then the panel */}
          <div className="absolute overflow-hidden" style={{ ...screen, borderRadius: screen.width * spec.radius, backgroundColor: SCREEN_BG }}>
            {spec.island && (
              <div className="absolute left-1/2 -translate-x-1/2 rounded-full bg-[#050505]" style={{ top: screen.height * 0.022, width: screen.width * 0.29, height: screen.height * 0.034 }} />
            )}
            <div
              className="absolute origin-top-left"
              style={{
                left: (screen.width - panelWidth * scale) / 2,
                top: screen.height * panelTop,
                width: panelWidth,
                height: fill ? screen.height / scale : undefined,
                transform: `scale(${scale})`,
              }}
            >
              {children}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- the panels, white on the gray screens ---------- */

function Panel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-[18px] bg-white ${className ?? ""}`} style={{ color: INK, boxShadow: "0 1px 2px rgba(10,10,10,0.06)" }}>
      {children}
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <p className="text-[14px] font-semibold">{children}</p>;
}

function SpendPanel() {
  return (
    <Panel>
      <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: `1px solid ${LINE}` }}>
        <Label>Spend this month</Label>
        <span className="rounded-full px-2.5 py-1 text-[12px] font-medium" style={{ backgroundColor: SCREEN_BG, color: MUTED }}>
          September
        </span>
      </div>
      <div className="px-5 pb-5 pt-4">
        <p className="font-numeral text-[36px] font-semibold leading-none tracking-[-1.2px] tabular-nums">{fmt(CAPS_TOTAL.spent)}</p>
        <p className="mt-1.5 text-[13px]" style={{ color: MUTED }}>
          17 agents, 10 days in
        </p>
        <div className="mt-4 grid grid-cols-7 gap-[5px]">
          {Array.from({ length: OFFSET }).map((_, i) => (
            <span key={`o${i}`} />
          ))}
          {Array.from({ length: DAYS }).map((_, i) => {
            const d = i + 1;
            const v = SPEND_BY_DAY[i];
            const has = v !== undefined;
            const heat = has ? v / 1420 : 0;
            const today = d === TODAY;
            return (
              <span
                key={d}
                className="flex h-[52px] flex-col justify-between rounded-[7px] px-[6px] py-[6px] leading-none"
                style={{
                  backgroundColor: today ? INK : has ? `rgba(10,10,10,${0.06 + heat * 0.16})` : SCREEN_BG,
                  color: today ? "#ffffff" : INK,
                }}
              >
                <span className="text-[12px] font-medium" style={{ color: today ? "#ffffff" : has ? INK : MUTED }}>
                  {d}
                </span>
                <span className="font-numeral text-[11px] font-semibold tabular-nums" style={{ color: today ? "#ffffff" : has ? INK : "rgba(112,110,104,0.5)" }}>
                  {has ? short(v) : "·"}
                </span>
              </span>
            );
          })}
        </div>
      </div>
    </Panel>
  );
}

function CapsPanel() {
  return (
    <Panel>
      <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: `1px solid ${LINE}` }}>
        <Label>Caps</Label>
        <span className="text-[12px]" style={{ color: MUTED }}>
          Per agent, per month
        </span>
      </div>
      <div className="px-5 pb-5 pt-4">
        <div className="flex items-baseline justify-between">
          <span className="text-[15px] font-semibold">All agents</span>
          <span className="font-numeral text-[15px] tabular-nums">
            {fmt(CAPS_TOTAL.spent)} <span style={{ color: MUTED }}>of {fmt(CAPS_TOTAL.cap)}</span>
          </span>
        </div>
        <Bar pct={CAPS_TOTAL.spent / CAPS_TOTAL.cap} className="mt-2" />
        <ul className="mt-5 flex flex-col gap-4">
          {CAPS.map((c) => (
            <li key={c.name} className="flex items-center gap-3">
              <span className="flex h-[32px] w-[32px] shrink-0 items-center justify-center rounded-full text-[12px] font-bold" style={{ backgroundColor: SCREEN_BG }}>
                {c.name[0]}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[14px] font-medium">{c.name}</span>
                <Bar pct={c.spent / c.cap} className="mt-1.5" />
              </span>
            </li>
          ))}
        </ul>
      </div>
    </Panel>
  );
}

/* fills the landscape screen: the header, the weekday row, two week rows
   that share the remaining height */
function UpcomingPanel() {
  return (
    <Panel className="flex h-full flex-col rounded-none">
      <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: `1px solid ${LINE}` }}>
        <Label>Upcoming charges</Label>
        <span className="text-[12px]" style={{ color: MUTED }}>
          September 13 to 26
        </span>
      </div>
      <div className="flex min-h-0 flex-1 flex-col px-4 pb-4 pt-2">
        <div className="grid grid-cols-7 text-center text-[12px] font-medium" style={{ color: MUTED }}>
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <span key={d} className="py-2">
              {d}
            </span>
          ))}
        </div>
        <div className="grid min-h-0 flex-1 grid-cols-7 grid-rows-2">
          {Array.from({ length: 14 }).map((_, i) => {
            const d = 13 + i;
            const u = UPCOMING[d];
            return (
              <span
                key={d}
                className="flex flex-col items-center gap-1.5 pt-2 text-[13px]"
                style={{ borderTop: `1px solid ${LINE}`, borderLeft: i % 7 === 0 ? "none" : `1px solid ${LINE}` }}
              >
                <span className="font-medium" style={{ color: u ? INK : MUTED }}>
                  {d}
                </span>
                {u && (
                  <>
                    <span className="flex items-center">
                      {u.logos.map((l, j) => (
                        <span key={l} className="flex h-[26px] w-[26px] items-center justify-center rounded-full border border-black/10 bg-white" style={{ marginLeft: j === 0 ? 0 : -7 }}>
                          <Image src={l} alt="" width={15} height={15} className="h-[15px] w-[15px] object-contain" />
                        </span>
                      ))}
                    </span>
                    <span className="font-numeral text-[12px] font-semibold tabular-nums">{u.amount}</span>
                  </>
                )}
              </span>
            );
          })}
        </div>
      </div>
    </Panel>
  );
}

/* Origin's budget bar: a solid fill, a dashed tail, the share at the right */
function Bar({ pct, className }: { pct: number; className?: string }) {
  const p = Math.min(1, pct);
  return (
    <span className={`flex items-center gap-2 ${className ?? ""}`}>
      <span className="relative h-[6px] flex-1 overflow-hidden rounded-full" style={{ backgroundColor: SCREEN_BG }}>
        <span className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${p * 100}%`, backgroundColor: INK }} />
        <span
          className="absolute inset-y-0"
          style={{ left: `${p * 100}%`, width: `${Math.min(18, (1 - p) * 100)}%`, backgroundImage: `repeating-linear-gradient(90deg,${INK} 0 4px,transparent 4px 7px)`, opacity: 0.6 }}
        />
      </span>
      <span className="font-numeral w-[44px] text-right text-[12px] tabular-nums" style={{ color: MUTED }}>
        {Math.round(p * 100)}%
      </span>
    </span>
  );
}
