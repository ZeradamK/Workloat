"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion, useScroll, useSpring, useTransform, type MotionValue } from "motion/react";

/**
 * Track everything: the headline and one line of copy, then a pinned box
 * that plays three slides as the page scrolls. Each slide is a photo
 * mock (hands holding a phone) with one of the panels laid into the
 * phone's screen: spend by day on the portrait phone, caps per agent on
 * a plain gray slide until its mock arrives, upcoming charges on the
 * landscape phone. Scrolling down, the current slide rises, its lower
 * edge fading and blurring away, and the next zips up from below.
 * Scrolling up runs the same in reverse, fading from the top.
 *
 * The screen rectangles are measured from the mocks' pixels (see SCREENS)
 * and the panels are laid out at a design width and scaled to the screen.
 */

const EASE = [0.25, 0.6, 0.2, 1] as const;

const up = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.55, ease: EASE },
} as const;

/* the dark panels inside the screens */
const PANEL = "rgba(12,12,12,0.86)";
const PANEL_LINE = "rgba(255,255,255,0.1)";
const EYEBROW = "text-[11px] font-semibold uppercase tracking-[0.16em] text-white/60";

/* the mocks: canvas size, background, and the screen rectangle inside,
   as fractions, plus the corner radius as a share of the screen width */
const SCREENS = {
  portrait: { src: "/mocks/spend-portrait.webp", w: 1000, h: 1500, bg: "#ffffff", left: 334 / 1000, top: 217 / 1500, width: 343 / 1000, height: 742 / 1500, radius: 0.13, island: true },
  landscape: { src: "/mocks/upcoming-landscape.webp", w: 4800, h: 3584, bg: "#d5d5d5", left: 1158 / 4800, top: 805 / 3584, width: 2489 / 4800, height: 1750 / 3584, radius: 0.04, island: false },
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
          className="sticky top-[24px] overflow-hidden rounded-[30px]"
          style={{ height: reduced ? "min(80vh, 820px)" : "calc(100vh - 48px)", backgroundColor: "#eeeeee" }}
        >
          <Slide index={0} progress={progress} reduced={reduced} bg={SCREENS.portrait.bg}>
            <Mock spec={SCREENS.portrait} panelWidth={343} panelShare={1} panelTop={0.12}>
              <SpendPanel />
            </Mock>
          </Slide>
          <Slide index={1} progress={progress} reduced={reduced} bg="#eeeeee">
            <div className="flex h-full w-full items-center justify-center px-6">
              <div className="w-full max-w-[360px]">
                <CapsPanel />
              </div>
            </div>
          </Slide>
          <Slide index={2} progress={progress} reduced={reduced} bg={SCREENS.landscape.bg}>
            <Mock spec={SCREENS.landscape} panelWidth={560} panelShare={0.72} panelTop={0.1}>
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

/* A photo mock fitted inside the slide (whole image visible), with the
   panel laid into the phone's screen. The panel is designed at
   `panelWidth` px and scaled so it spans `panelShare` of the screen's
   width, `panelTop` of the screen's height down from its top. */
function Mock({ spec, panelWidth, panelShare, panelTop, children }: { spec: (typeof SCREENS)[keyof typeof SCREENS]; panelWidth: number; panelShare: number; panelTop: number; children: React.ReactNode }) {
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
  const k = Math.min(box.w / spec.w, box.h / spec.h) || 0;
  const imgW = spec.w * k;
  const imgH = spec.h * k;
  const screen = { left: spec.left * imgW, top: spec.top * imgH, width: spec.width * imgW, height: spec.height * imgH };
  const scale = (screen.width * panelShare) / panelWidth;
  return (
    <div ref={ref} className="relative h-full w-full">
      {k > 0 && (
        <div className="absolute" style={{ left: (box.w - imgW) / 2, top: (box.h - imgH) / 2, width: imgW, height: imgH }}>
          <Image src={spec.src} alt="" fill sizes="(min-width: 1200px) 1200px, 100vw" className="object-contain" priority={false} />
          {/* the screen: the brand gradient, then the panel */}
          <div className="absolute overflow-hidden" style={{ ...screen, borderRadius: screen.width * spec.radius }}>
            <Image src="/slack-gradient.jpg" alt="" fill sizes="1200px" className="object-cover" />
            {/* the dynamic island, drawn back over the wallpaper */}
            {spec.island && (
              <div className="absolute left-1/2 -translate-x-1/2 rounded-full bg-[#050505]" style={{ top: screen.height * 0.022, width: screen.width * 0.29, height: screen.height * 0.034 }} />
            )}
            <div
              className="absolute origin-top-left"
              style={{ left: (screen.width - panelWidth * scale) / 2, top: screen.height * panelTop, width: panelWidth, transform: `scale(${scale})` }}
            >
              {children}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- the panels ---------- */

function Panel({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-[16px]" style={{ backgroundColor: PANEL, border: `1px solid ${PANEL_LINE}`, backdropFilter: "blur(10px)" }}>
      {children}
    </div>
  );
}

function SpendPanel() {
  return (
    <Panel>
      <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: `1px solid ${PANEL_LINE}` }}>
        <p className={EYEBROW}>Spend this month</p>
        <span className="flex items-center gap-1">
          <span className="flex h-[26px] w-[30px] items-center justify-center rounded-l-[7px]" style={{ border: `1px solid ${PANEL_LINE}` }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M3 17l5-6 4 4 5-8 4 5" /></svg>
          </span>
          <span className="-ml-1 flex h-[26px] w-[30px] items-center justify-center rounded-r-[7px]" style={{ border: `1px solid ${PANEL_LINE}` }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" aria-hidden><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></svg>
          </span>
          <span className="ml-1.5 flex h-[26px] w-[30px] items-center justify-center rounded-[7px]" style={{ border: `1px solid ${PANEL_LINE}` }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="#fff" aria-hidden><path d="M12 2l2.2 6.8L21 11l-6.8 2.2L12 20l-2.2-6.8L3 11l6.8-2.2z" /></svg>
          </span>
        </span>
      </div>
      <div className="px-5 pb-5 pt-4">
        <p className="font-numeral text-[30px] font-semibold leading-none tracking-[-1px] text-white tabular-nums">{fmt(CAPS_TOTAL.spent)}</p>
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
                className="flex h-[46px] flex-col justify-between rounded-[6px] px-[6px] py-[5px] text-[11px] leading-none"
                style={{
                  border: `1px solid ${PANEL_LINE}`,
                  backgroundColor: today ? "#ffffff" : has ? `rgba(255,255,255,${0.08 + heat * 0.45})` : "transparent",
                  color: today ? "#0a0a0a" : has && heat > 0.55 ? "#0a0a0a" : "#ffffff",
                }}
              >
                <span className={has ? "" : "text-white/70"}>{d}</span>
                <span className={`font-numeral text-[10px] tabular-nums ${has ? "" : "text-white/40"}`}>{has ? short(v) : "-"}</span>
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
      <div className="px-5 py-4" style={{ borderBottom: `1px solid ${PANEL_LINE}` }}>
        <p className={EYEBROW}>Caps</p>
      </div>
      <div className="px-5 pb-5 pt-4 text-white">
        <div className="flex items-baseline justify-between text-[15px]">
          <span className="font-semibold">All agents</span>
          <span className="font-numeral tabular-nums">
            {fmt(CAPS_TOTAL.spent)} <span className="text-white/60">of {fmt(CAPS_TOTAL.cap)}</span>
          </span>
        </div>
        <Bar pct={CAPS_TOTAL.spent / CAPS_TOTAL.cap} className="mt-2" />
        <ul className="mt-5 flex flex-col gap-4">
          {CAPS.map((c) => (
            <li key={c.name} className="flex items-center gap-3">
              <span className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full text-[11px] font-bold" style={{ backgroundColor: "rgba(255,255,255,0.12)" }}>
                {c.name[0]}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[13px]">{c.name}</span>
                <Bar pct={c.spent / c.cap} className="mt-1.5" />
              </span>
            </li>
          ))}
        </ul>
      </div>
    </Panel>
  );
}

function UpcomingPanel() {
  return (
    <Panel>
      <div className="px-5 py-4" style={{ borderBottom: `1px solid ${PANEL_LINE}` }}>
        <p className={EYEBROW}>Upcoming charges</p>
      </div>
      <div className="px-3 pb-4 pt-3 text-white">
        <div className="grid grid-cols-7 text-center text-[11px] font-medium text-white/70">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <span key={d} className="py-1.5">
              {d}
            </span>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {Array.from({ length: 14 }).map((_, i) => {
            const d = 13 + i;
            const u = UPCOMING[d];
            return (
              <span
                key={d}
                className="flex h-[74px] flex-col items-center gap-1 pt-1.5 text-[12px]"
                style={{ borderTop: `1px solid ${PANEL_LINE}`, borderLeft: i % 7 === 0 ? "none" : `1px solid ${PANEL_LINE}` }}
              >
                <span className="text-white/80">{d}</span>
                {u && (
                  <>
                    <span className="flex items-center">
                      {u.logos.map((l, j) => (
                        <span key={l} className="flex h-[20px] w-[20px] items-center justify-center rounded-full bg-white" style={{ marginLeft: j === 0 ? 0 : -6 }}>
                          <Image src={l} alt="" width={12} height={12} className="h-[12px] w-[12px] object-contain" />
                        </span>
                      ))}
                    </span>
                    <span className="font-numeral text-[10px] tabular-nums">{u.amount}</span>
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
      <span className="relative h-[6px] flex-1 overflow-hidden rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.14)" }}>
        <span className="absolute inset-y-0 left-0 rounded-full bg-white" style={{ width: `${p * 100}%` }} />
        <span
          className="absolute inset-y-0"
          style={{ left: `${p * 100}%`, width: `${Math.min(18, (1 - p) * 100)}%`, backgroundImage: "repeating-linear-gradient(90deg,#fff 0 4px,transparent 4px 7px)", opacity: 0.8 }}
        />
      </span>
      <span className="font-numeral w-[44px] text-right text-[12px] tabular-nums text-white/85">{Math.round(p * 100)}%</span>
    </span>
  );
}
