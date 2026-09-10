"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { animate, AnimatePresence, motion, useInView, useMotionValueEvent, useReducedMotion, useScroll } from "motion/react";
import { slackDark } from "./introProgress";
import PhoneMock, { screenWidth as phoneScreenWidth } from "./PhoneMock";

/**
 * Slack act. A #eeeeee rounded stage, inset 100px from the viewport edges,
 * capped at the viewport height minus 300px. The headline sits at the top;
 * below it a Studio Display (CSS: thin black bezel, silver back, arm and
 * base) shows the Slack desktop app in dark mode on the brand gradient
 * wallpaper. Three scenes cycle on their own timer while the act is in
 * view: a still crop of the screen's lower-left and the deck, a ZIP to the
 * full front-on view, then the final scene (same pose, the floor line and
 * the two notification bars), then back to the crop. Below
 * 900px: headline, the iPhone running Slack for iOS, the bars.
 *
 * The conversation on screen is a timed sequence (types, sends, typing
 * dots, answer, the Origin-style forecast card draws itself, notes,
 * buttons) that plays when the device is in view and loops. Reduced motion
 * shows the finished state and the final scene.
 */

const EASE = [0.25, 0.6, 0.2, 1] as const;

const up = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.55, ease: EASE },
} as const;

/* the screen's layout size. 1600x900 scaled by 1.3 (bigger type and
   images), at the panel's own aspect (1204x769) so it fills the screen */
const DESIGN = { w: 1600 / 1.3, h: (1600 / 1.3) * (769 / 1204) };

/* public/macbook.webp: the supplied MacBook Pro mock (2000x1500, background
   cut to transparency). Measured from its pixels: screen (397,312) to
   (1601,1081); lid 377..1622 wide, to y=1121; deck to y=1184. Fractions of
   the canvas: */
const FRAME = {
  aspect: 2000 / 1500,
  screen: { left: 397 / 2000, top: 312 / 1500, width: 1204 / 2000, height: 769 / 1500 },
  screenCenterY: (312 + 1081) / 2 / 1500,
  lidWidth: (1622 - 377) / 2000,
};

/* the opening pose, measured from the stage: the lid alone, 50px from
   each side of the gray box, the screen's bottom edge flush with the
   box's bottom (so the bottom bezel and the deck are out of the frame). The desktop is the
   box's own gray, so only the Slack window and the menu bar read. `y` is
   a share of the rig's height; `cropped` when the screen's top runs out
   under the headline. */
type Open = { scale: number; y: string; cropped: boolean };

/* the three poses of the rig. `fit` is the scale at which the lid spans the
   stage with 100px of room left and right, or fills the stage height,
   whichever is smaller. */
function scenes(fit: number, open: Open) {
  return [
    /* 1: the screen, flush with the box's bottom, the desktop the box's gray */
    { scale: open.scale, x: "0%", y: open.y, rotateY: 0, rotateX: 0 },
    /* 2: the whole laptop, front-on */
    { scale: fit, x: "0%", y: "0%", rotateY: 0, rotateX: 0 },
    /* 3: the same pose, the bars arrive */
    { scale: fit, x: "0%", y: "0%", rotateY: 0, rotateX: 0 },
  ] as const;
}

const ZIP = { type: "spring", stiffness: 260, damping: 30, mass: 0.9 } as const;

export default function SlackSection() {
  return (
    <>
      <DesktopAct />
      <PhoneAct />
    </>
  );
}

/* ---------- desktop: the pinned three-scene act ---------- */

/* The scenes follow the conversation: the close-up holds while Zeradam
   types, sends, and Payloat answers in text; the zip to the front-on view
   lands with the graph; the angled view once the answer is complete. */
function sceneFor(stage: Stage): number {
  return stage < 4 ? 0 : stage < 8 ? 1 : 2;
}

/* the rig's natural height as a share of the stage: the display face fills
   the stage height at scale 1 (so the close scenes rasterize crisp) and the
   stand hangs below, clipped. FACE_CENTER is the scale origin. */
const RIG_H = 1.55;
const FACE_CENTER = FRAME.screenCenterY * 100;

function DesktopAct() {
  const ref = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion() ?? false;
  const inView = useInView(ref, { amount: 0.4 });
  const convo = useConversation(inView, reduced);
  const [override, setOverride] = useState<number | null>(null);
  const [fit, setFit] = useState(1);
  const [open, setOpen] = useState<Open>({ scale: 1, y: "0%", cropped: false });

  /* the nav goes dark while the gray box is under it (the dock sits in
     the top ~70px of the viewport) */
  const { scrollYProgress: underNav } = useScroll({ target: ref, offset: ["start 70px", "end 70px"] });
  const darkOn = useRef(false);
  useMotionValueEvent(underNav, "change", (v) => {
    const target = v > 0 && v < 1;
    if (target !== darkOn.current) {
      darkOn.current = target;
      animate(slackDark, target ? 1 : 0, { duration: 0.18, ease: "easeOut" });
    }
  });

  /* measure the stage: the lid should span it minus 100px each side,
     unless the height runs out first; and the opening pose, see Open */
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const measure = () => {
      const stageW = el.clientWidth;
      const stageH = el.clientHeight;
      const rigH = stageH * RIG_H;
      const rigW = rigH * FRAME.aspect;
      const lidW = rigW * FRAME.lidWidth;
      /* the lid spans the stage minus 100px each side when it can */
      setFit(Math.max(0.5, Math.min(1, (stageW - 200) / lidW)));

      const scale = (stageW - 100) / lidW;
      const rigTop = ((1 - RIG_H) / 2) * stageH;
      const originY = rigTop + FRAME.screenCenterY * rigH;
      /* where a point of the rig (a share of its height) lands after the scale */
      const after = (rigFrac: number) => originY + (rigTop + rigFrac * rigH - originY) * scale;
      const ty = stageH + 3 - after(FRAME.screen.top + FRAME.screen.height);
      const cropped = after(FRAME.screen.top) + ty < 0;
      setOpen({ scale, y: `${(ty / rigH) * 100}%`, cropped });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  /* dev: ?slackScene=0|1|2 pins a scene for review */
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("slackScene");
    if (q !== null) setOverride(Math.min(2, Math.max(0, Number(q))));
  }, []);

  const scene = reduced ? 2 : (override ?? sceneFor(convo.stage));
  const target = scenes(fit, open)[scene];

  return (
    <section ref={ref} className="hidden px-[100px] py-4 min-[900px]:block">
      <div
        className="relative flex flex-col overflow-hidden rounded-[30px] bg-[#eeeeee]"
        style={{ height: "clamp(840px, calc(100vh - 100px), 1120px)" }}
      >
        {/* headline */}
        <motion.h2
          {...up}
          className="z-10 px-6 pt-[clamp(28px,4vh,56px)] text-center text-[clamp(32px,4.2vw,60px)] font-bold leading-[1.06] tracking-[-2px] text-ink"
        >
          Ask @Payloat what
          <br />
          your agents spent.
        </motion.h2>

        {/* the stage, its own box well below the headline */}
        <div ref={stageRef} className="relative mt-10 min-h-0 flex-1 overflow-hidden" style={{ clipPath: "inset(0)" }}>
          {/* floor: the final scene sits on it */}
          <motion.div
            initial={false}
            animate={{ opacity: scene === 2 ? 1 : 0 }}
            transition={{ duration: 0.5 }}
            className="pointer-events-none absolute inset-x-0 bottom-0 h-[9%]"
            style={{ background: "linear-gradient(180deg,#e2e2e4 0%,#e9e9eb 12%,#ededef 100%)", borderTop: "1px solid rgba(0,0,0,0.10)" }}
          />
          {/* the rig: display + stand, centered, then posed per scene */}
          <motion.div
            initial={false}
            animate={target}
            transition={reduced ? { duration: 0 } : ZIP}
            className="absolute left-1/2 -translate-x-1/2"
            style={{ top: `${(1 - RIG_H) * 50}%`, height: `${RIG_H * 100}%`, aspectRatio: String(FRAME.aspect), transformOrigin: `50% ${FACE_CENTER}%` }}
          >
            <StudioDisplay stage={convo.stage} typed={convo.typed} />
          </motion.div>

          {/* the window's top dissolves into the section while cropped */}
          <motion.div
            initial={false}
            animate={{ opacity: scene === 0 && open.cropped ? 1 : 0 }}
            transition={{ duration: 0.35 }}
            className="pointer-events-none absolute inset-x-0 top-0 z-10 h-[22%]"
            style={{ background: "linear-gradient(180deg,#eeeeee 0%,rgba(238,238,238,0.85) 30%,rgba(238,238,238,0) 100%)" }}
          />

          {/* the two bars arrive with the final scene */}
          <AnimatePresence>
            {scene === 2 && (
              <>
                <motion.div key="b1" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }} transition={{ duration: 0.45, ease: EASE, delay: 0.25 }} className="absolute left-[6%] top-[52%] z-10 w-[340px]">
                  <Bar1 />
                </motion.div>
                <motion.div key="b2" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }} transition={{ duration: 0.45, ease: EASE, delay: 0.4 }} className="absolute bottom-[14%] right-[6%] z-10 w-[340px]">
                  <Bar2 />
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

/* ---------- phone: not pinned ---------- */

function PhoneAct() {
  return (
    <section className="mx-4 rounded-[30px] bg-[#0a0a0a] px-5 pb-16 pt-12 min-[900px]:hidden">
      <motion.h2 {...up} className="text-center text-[clamp(32px,9vw,44px)] font-bold leading-[1.06] tracking-[-1.5px] text-white">
        Ask @Payloat what
        <br />
        your agents spent.
      </motion.h2>
      <motion.div {...up} transition={{ ...up.transition, delay: 0.1 }} className="mx-auto mt-10 w-full max-w-[380px]">
        <Phone />
      </motion.div>
    </section>
  );
}

/* ---------- the two callouts, in the goal act's notification-bar anatomy ---------- */

function NotifBar({ icon, name, note, amount }: { icon: React.ReactNode; name: string; note: string; amount: string }) {
  return (
    <div className="flex items-center gap-3 rounded-[18px] bg-white py-[6px] pl-[6px] pr-2.5 shadow-[0_18px_50px_rgba(0,0,0,0.12)]">
      <span className="flex h-[43px] w-[43px] shrink-0 items-center justify-center rounded-[11px]" style={{ backgroundColor: "#eeeeee" }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          {icon}
        </svg>
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[16px] font-semibold text-ink">{name}</span>
        <span className="block truncate text-[13px] leading-snug text-sub">{note}</span>
      </span>
      <span className="text-[17px] font-semibold tracking-[-0.43px] text-ink">{amount}</span>
      <svg width="11" height="11" viewBox="0 0 16 16" fill="none" aria-hidden className="shrink-0 text-sub">
        <path d="m5.5 3 5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

function Bar1() {
  return <NotifBar icon={<path d="M4 20V10M10 20V4M16 20v-8M22 20H2" />} name="This month" note="Graph and what to look at" amount="$27,900" />;
}

function Bar2() {
  return <NotifBar icon={<path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" />} name="Every charge" note="Answered in seconds" amount="4 agents" />;
}

/* ---------- devices ---------- */

/* The MacBook: the supplied mock (public/macbook.webp) with the gradient
   wallpaper and the Slack desktop laid into its measured screen rectangle,
   and the notch drawn back on top. */
function StudioDisplay({ stage, typed }: { stage: Stage; typed: number }) {
  return (
    <div className="relative h-full w-full" style={{ containerType: "size" }}>
      <Image src="/macbook.webp" alt="" fill priority unoptimized className="object-contain" />
      {/* the screen: the MacBook's panel has rounded top corners, so the
          content box does too (radius sized from the rig's width) */}
      <div
        className="absolute overflow-hidden bg-[#eeeeee]"
        style={{
          borderRadius: "0.9cqw 0.9cqw 0 0",
          left: `${FRAME.screen.left * 100}%`,
          top: `${FRAME.screen.top * 100}%`,
          width: `${FRAME.screen.width * 100}%`,
          height: `${FRAME.screen.height * 100}%`,
        }}
      >
        <Wallpaper />
        <ScaledScreen>
          <Desktop stage={stage} typed={typed} />
        </ScaledScreen>
        <Sheen />
        <div className="absolute left-1/2 top-0 h-[2.9%] w-[10.5%] -translate-x-1/2 rounded-b-[7px] bg-[#0b0b0c]" />
      </div>
    </div>
  );
}

/* iPhone (titanium PhoneMock, sized to its column): Slack for iOS opens
   on the DM with Payloat and the conversation runs while in view. */
function Phone() {
  const ref = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(340);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setW(el.clientWidth));
    ro.observe(el);
    setW(el.clientWidth);
    return () => ro.disconnect();
  }, []);
  const inView = useInView(ref, { amount: 0.35 });
  return (
    <div ref={ref} className="w-full">
      <PhoneMock width={w} frame="titanium" screenBg={IOS_BG}>
        <div className="absolute inset-0" style={{ width: phoneScreenWidth(w) }}>
          <SlackPhone active={inView} />
        </div>
        <div className="absolute bottom-[9px] left-1/2 h-[5px] w-[134px] -translate-x-1/2 rounded-full bg-black/85" />
      </PhoneMock>
    </div>
  );
}

/* the desktop is the section's own gray, so the opening pose reads as the
   Slack window sitting in the section until the laptop appears around it */
function Wallpaper() {
  return <div className="absolute inset-0 bg-[#eeeeee]" />;
}

function Sheen() {
  return (
    <div
      className="pointer-events-none absolute inset-0"
      style={{ background: "linear-gradient(115deg,rgba(255,255,255,0.10) 0%,rgba(255,255,255,0.03) 22%,transparent 40%)" }}
    />
  );
}

/* Lays children out at the design size and scales them to the box
   (measured, since CSS cannot divide container units by pixels). */
function ScaledScreen({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setScale(el.clientWidth / DESIGN.w);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return (
    <div ref={ref} className="absolute inset-0">
      <div className="absolute left-0 top-0 origin-top-left" style={{ width: DESIGN.w, height: DESIGN.h, transform: `scale(${scale})`, opacity: scale ? 1 : 0 }}>
        {children}
      </div>
    </div>
  );
}

/* A macOS desktop with Slack in full screen below the menu bar. The bar
   is the section's gray with black text and icons, as tall as the notch
   (the frame draws the notch over its middle). */
const MENU_H = Math.round(DESIGN.h * 0.029);
const APPLE = "M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701";
function Desktop({ stage, typed }: { stage: Stage; typed: number }) {
  return (
    <div className="relative h-full w-full" style={{ backgroundColor: "#ffffff" }}>
      <div className="absolute inset-x-0 top-0 flex items-center justify-between px-3 text-[11px] font-medium text-[#0a0a0a]" style={{ height: MENU_H, backgroundColor: "#eeeeee" }}>
        <span className="flex items-center gap-[14px]">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d={APPLE} />
          </svg>
          <span className="font-bold">Slack</span>
          <span>File</span>
          <span>Edit</span>
          <span>View</span>
          <span>Window</span>
          <span>Help</span>
        </span>
        <span className="flex items-center gap-[10px]">
          {/* battery */}
          <span className="flex items-center gap-[2px]">
            <span className="flex h-[10px] w-[20px] items-center rounded-[3px] border border-[#0a0a0a]/70 p-[1.5px]">
              <span className="h-full w-[85%] rounded-[1.5px] bg-[#0a0a0a]" />
            </span>
            <span className="h-[4px] w-[1.5px] rounded-r-[1px] bg-[#0a0a0a]/70" />
          </span>
          {/* wifi */}
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden>
            <path d="M2 8.82a15 15 0 0 1 20 0" />
            <path d="M5 12.86a10 10 0 0 1 14 0" />
            <path d="M8.5 16.43a5 5 0 0 1 7 0" />
            <path d="M12 20h.01" />
          </svg>
          {/* control center */}
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
            <path d="M4 7h16M4 17h16" />
            <circle cx="9" cy="7" r="2.6" fill="currentColor" />
            <circle cx="15" cy="17" r="2.6" fill="currentColor" />
          </svg>
          <span className="ml-1">Tue Sep 9</span>
          <span>9:41 AM</span>
        </span>
      </div>
      <div className="absolute overflow-hidden" style={{ top: MENU_H, left: 0, right: 0, bottom: 0 }}>
        <SlackWindow layout="desktop" stage={stage} typed={typed} />
      </div>
    </div>
  );
}

/* ---------- the conversation sequence ---------- */

const QUESTION = "@Payloat how much have our agents spent this month?";
const QUESTION_DM = "How much have our agents spent this month?";

/* a person typing: uneven keystrokes, a longer pause after each phrase */
function typingSchedule(text: string): number[] {
  const pauseAfter = new Set<number>();
  for (const phrase of ["@Payloat", " how much have", " our agents spent"]) {
    const i = text.indexOf(phrase);
    if (i >= 0) pauseAfter.add(i + phrase.length);
  }
  const times: number[] = [];
  let t = 0;
  let seed = 7;
  for (let i = 1; i <= text.length; i++) {
    seed = (seed * 9301 + 49297) % 233280;
    const jitter = seed / 233280; /* 0..1, deterministic */
    t += 38 + Math.round(jitter * 70); /* 38..108ms per key */
    if (text[i - 1] === " ") t += 40;
    if (pauseAfter.has(i)) t += 230; /* the pause between phrases */
    times.push(t);
  }
  return times;
}
const SCHEDULE = typingSchedule(QUESTION);

/* 0 typing · 1 sent · 2 Payloat typing · 3 answer text · 4 the card fills
   in and the amounts appear · 5 the line draws · 6 projection + markers
   · 7 notes · 8 buttons (finished) */
type Stage = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

function useConversation(active: boolean, reduced: boolean) {
  const [stage, setStage] = useState<Stage>(reduced ? 8 : 0);
  const [typed, setTyped] = useState(reduced ? QUESTION.length : 0);
  useEffect(() => {
    if (reduced) {
      setStage(8);
      setTyped(QUESTION.length);
      return;
    }
    if (!active) return;
    let cancelled = false;
    const timers: number[] = [];
    const at = (ms: number, fn: () => void) =>
      timers.push(
        window.setTimeout(() => {
          if (!cancelled) fn();
        }, ms),
      );
    const run = () => {
      setStage(0);
      setTyped(0);
      SCHEDULE.forEach((ms, i) => at(700 + ms, () => setTyped(i + 1)));
      const sent = 700 + SCHEDULE[SCHEDULE.length - 1] + 650;
      at(sent, () => setStage(1));
      at(sent + 700, () => setStage(2)); /* Payloat is typing */
      at(sent + 2600, () => setStage(3)); /* the text reply lands */
      at(sent + 3900, () => setStage(4)); /* the card fills in: the scene zips out to show it */
      at(sent + 5800, () => setStage(5)); /* the line draws */
      at(sent + 7600, () => setStage(6)); /* the projection, the markers */
      at(sent + 9600, () => setStage(7)); /* the notes */
      at(sent + 10800, () => setStage(8)); /* complete: the angled view */
      at(sent + 19500, run);
    };
    run();
    return () => {
      cancelled = true;
      timers.forEach((t) => window.clearTimeout(t));
    };
  }, [active, reduced]);
  return { stage, typed };
}

/* ---------- the Slack window, dark theme ---------- */

const TOP = "#ffffff";
const RAIL = "#ffffff";
const SIDE = "#eeeeee";
const PANE = "#ffffff";
const TEXT = "#1d1c1d";
const MUTED = "#616061";
const LINE = "rgba(29,28,29,0.13)";
const ACTIVE = "#1264a3";

const CHANNELS = ["general", "finance", "agents", "ops", "kitchen"];

type Layout = "desktop" | "phone";

const rowIn = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, ease: EASE },
} as const;

function SlackWindow({ layout, stage, typed }: { layout: Layout; stage: Stage; typed: number }) {
  const phone = layout === "phone";
  const reduced = useReducedMotion() ?? false;
  const typing = QUESTION.slice(0, typed);

  return (
    <div className="flex h-full w-full flex-col" style={{ fontFamily: "var(--font-ios)", color: TEXT, backgroundColor: PANE }}>
      {/* title bar: traffic lights + search */}
      <div className="flex h-[40px] shrink-0 items-center px-3" style={{ backgroundColor: TOP, borderBottom: `1px solid ${LINE}` }}>
        {!phone && (
          <span className="mr-4 flex items-center gap-2">
            <span className="h-[12px] w-[12px] rounded-full bg-[#ff5f57]" />
            <span className="h-[12px] w-[12px] rounded-full bg-[#febc2e]" />
            <span className="h-[12px] w-[12px] rounded-full bg-[#28c840]" />
          </span>
        )}
        {!phone && (
          <span className="mr-6 flex items-center gap-2" style={{ color: MUTED }}>
            <Glyph d="M15 6l-6 6 6 6" />
            <Glyph d="M9 6l6 6-6 6" />
            <Glyph d="M12 7v5l3 2M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z" />
          </span>
        )}
        <div className="flex h-[26px] flex-1 items-center gap-2 rounded-[6px] px-3 text-[12px]" style={{ backgroundColor: "rgba(0,0,0,0.06)", color: MUTED, maxWidth: phone ? undefined : 520 }}>
          <Glyph d="M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14ZM20 20l-3.5-3.5" size={12} />
          Search Payloat
        </div>
        {!phone && (
          <span className="ml-auto flex h-[22px] w-[22px] items-center justify-center rounded-full text-[11px]" style={{ backgroundColor: "rgba(0,0,0,0.06)", color: MUTED }}>?</span>
        )}
      </div>

      <div className="flex min-h-0 flex-1">
        {/* rail */}
        {!phone && (
          <div className="flex w-[68px] shrink-0 flex-col items-center gap-4 pt-4" style={{ backgroundColor: RAIL, borderRight: `1px solid ${LINE}` }}>
            <span className="flex h-[36px] w-[36px] items-center justify-center rounded-[9px] bg-white">
              <Image src="/payloat-app-icon-v2.png" alt="Payloat" width={36} height={36} className="h-[36px] w-[36px] rounded-[9px]" />
            </span>
            {[
              ["Home", "M4 11 12 4l8 7v9H4z"],
              ["DMs", "M20 12.5a7.5 7.5 0 0 1-11 6.6L4 20l1-4.6a7.5 7.5 0 1 1 15-2.9Z"],
              ["Activity", "M15 17H9m8-3V11a5 5 0 0 0-10 0v3l-2 3h14l-2-3Z"],
              ["Later", "M6 4h12v16l-6-4-6 4z"],
              ["More", "M5 12h.01M12 12h.01M19 12h.01"],
            ].map(([label, d], i) => (
              <span key={label} className="flex flex-col items-center gap-1 text-[10px]" style={{ color: i === 0 ? TEXT : MUTED }}>
                <span className={`flex h-[30px] w-[30px] items-center justify-center rounded-[8px] ${i === 0 ? "bg-black/[0.08]" : ""}`}>
                  <Glyph d={d} size={16} />
                </span>
                {label}
              </span>
            ))}
            <Image src="/zeradam.jpg" alt="Zeradam" width={28} height={28} className="mb-4 mt-auto h-[28px] w-[28px] rounded-[6px] object-cover" />
          </div>
        )}

        {/* sidebar */}
        {!phone && (
          <div className="flex w-[228px] shrink-0 flex-col" style={{ backgroundColor: SIDE, color: TEXT }}>
            <div className="flex h-[48px] items-center justify-between px-4" style={{ borderBottom: `1px solid ${LINE}` }}>
              <span className="flex items-center gap-1.5 text-[15px] font-bold">
                Payloat
                <Glyph d="M6 9l6 6 6-6" size={11} />
              </span>
              <span className="flex h-[26px] w-[26px] items-center justify-center rounded-full bg-[#1d1c1d] text-white">
                <Glyph d="M12 20h9M16.5 3.5a2.1 2.1 0 1 1 3 3L7 19l-4 1 1-4L16.5 3.5Z" size={13} />
              </span>
            </div>
            <div className="px-3 pt-3 text-[14px]">
              <SideRow label="Threads" icon="M20 12.5a7.5 7.5 0 0 1-11 6.6L4 20l1-4.6a7.5 7.5 0 1 1 15-2.9Z" />
              <SideRow label="Drafts & sent" icon="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7Z" />
              <SideHead>Channels</SideHead>
              {CHANNELS.map((c) => (
                <SideRow key={c} label={c} hash />
              ))}
              <SideHead>Direct messages</SideHead>
              <SideRow label="Payloat" avatar="/payloat-app-icon-v2.png" active />
              <SideRow label="Zeradam" avatar="/zeradam.jpg" you />
              <SideHead>Apps</SideHead>
              <SideRow label="Payloat" avatar="/payloat-app-icon-v2.png" />
            </div>
          </div>
        )}

        {/* channel pane */}
        <div className="flex min-w-0 flex-1 flex-col" style={{ backgroundColor: PANE }}>
          <div className="flex h-[48px] shrink-0 items-center justify-between px-4" style={{ borderBottom: `1px solid ${LINE}` }}>
            <span className="flex items-center gap-2.5 text-[15px] font-bold">
              <span className="relative">
                <Image src="/payloat-app-icon-v2.png" alt="" width={24} height={24} className="h-[24px] w-[24px] rounded-[6px]" />
                <span className="absolute -bottom-0.5 -right-0.5 h-[9px] w-[9px] rounded-full border-2 border-white bg-[#2bac76]" />
              </span>
              Payloat
              <span className="text-[12px] font-normal" style={{ color: MUTED }}>Chief Financial Agent</span>
              <Glyph d="M6 9l6 6 6-6" size={11} />
            </span>
            {!phone && (
              <div className="flex items-center gap-2 text-[12px]" style={{ color: MUTED }}>
                <span className="flex items-center gap-1 rounded-[6px] px-2 py-1" style={{ border: `1px solid ${LINE}` }}>
                  <Glyph d="M3 18v-6a9 9 0 0 1 18 0v6M3 18h4v-5H3m14 5h4v-5h-4" size={12} />
                  Huddle
                </span>
                <span className="flex items-center gap-1 rounded-[6px] px-2 py-1" style={{ border: `1px solid ${LINE}` }}>
                  <Glyph d="M4 4h16v12H8l-4 4V4Z" size={12} />
                  Canvas
                </span>
              </div>
            )}
          </div>

          <div className={`flex min-h-0 flex-1 flex-col justify-end overflow-hidden ${phone ? "px-3 pb-3" : "px-5 pb-4"}`}>
            <div className="mb-3 flex items-center gap-3">
              <span className="h-px flex-1" style={{ backgroundColor: LINE }} />
              <span className="rounded-full px-3 py-1 text-[12px] font-semibold" style={{ border: `1px solid ${LINE}` }}>
                Today
              </span>
              <span className="h-px flex-1" style={{ backgroundColor: LINE }} />
            </div>

            {/* Zeradam's message, once sent */}
            <AnimatePresence initial={false}>
              {stage >= 1 && (
                <motion.div key="q" {...rowIn} className="flex items-start gap-3">
                  <Image src="/zeradam.jpg" alt="Zeradam" width={36} height={36} className="h-[36px] w-[36px] shrink-0 rounded-[8px] object-cover" />
                  <div className="min-w-0">
                    <p className="text-[14px] leading-[1.2]">
                      <span className="font-bold">Zeradam</span>
                      <span className="ml-2 text-[11px]" style={{ color: MUTED }}>9:41 AM</span>
                    </p>
                    <p className="mt-0.5 text-[14px] leading-[1.4]">
                      <Mention />
                      {QUESTION.slice("@Payloat".length)}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Payloat typing */}
            <AnimatePresence initial={false}>
              {stage === 2 && (
                <motion.div key="dots" {...rowIn} exit={{ opacity: 0, transition: { duration: 0.15 } }} className="mt-3 flex items-center gap-3">
                  <Image src="/payloat-app-icon-v2.png" alt="Payloat" width={36} height={36} className="h-[36px] w-[36px] shrink-0 rounded-[8px]" />
                  <span className="flex items-center gap-1 rounded-[10px] px-3 py-2.5" style={{ backgroundColor: "#f4f4f4" }}>
                    {[0, 1, 2].map((i) => (
                      <motion.span
                        key={i}
                        className="h-[7px] w-[7px] rounded-full"
                        style={{ backgroundColor: MUTED }}
                        animate={{ y: [0, -4, 0], opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
                      />
                    ))}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Payloat's answer */}
            <AnimatePresence initial={false}>
              {stage >= 3 && (
                <motion.div key="a" {...rowIn} className="mt-3 flex items-start gap-3">
                  <Image src="/payloat-app-icon-v2.png" alt="Payloat" width={36} height={36} className="h-[36px] w-[36px] shrink-0 rounded-[8px]" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[14px] leading-[1.2]">
                      <span className="font-bold">Payloat</span>
                      <span className="ml-1.5 rounded-[3px] px-1 py-px text-[9px] font-semibold uppercase tracking-[0.04em]" style={{ backgroundColor: "rgba(0,0,0,0.08)", color: MUTED }}>App</span>
                      <span className="ml-2 text-[11px]" style={{ color: MUTED }}>9:41 AM</span>
                    </p>
                    <p className="mt-0.5 text-[14px] leading-[1.4]">
                      September so far across <span className="font-semibold">4 agents</span>.
                    </p>
                    <AnimatePresence initial={false}>
                      {stage >= 4 && (
                        <motion.div key="card" initial={{ opacity: 0, y: 14, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.45, ease: EASE }}>
                          <SpendCard layout={layout} stage={stage} reduced={reduced} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <AnimatePresence initial={false}>
                      {stage >= 7 && (
                        <motion.p key="notes" {...rowIn} className="mt-2.5 text-[14px] leading-[1.45]">
                          By agent: Procurement $4,120, Software &amp; seats $2,860, Ops $1,450, Travel $760. Two things to look at: Procurement went $16.50 over its cap at WebstaurantStore, and one Instacart receipt is still missing, 3 days old.
                        </motion.p>
                      )}
                    </AnimatePresence>
                    <AnimatePresence initial={false}>
                      {stage >= 8 && (
                        <motion.div key="btns" {...rowIn} className="mt-2.5 flex flex-wrap items-center gap-2">
                          {["Open in Payloat", "By agent", "Receipts"].map((b, i) => (
                            <motion.span
                              key={b}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.3, ease: EASE, delay: i * 0.08 }}
                              className={`rounded-[6px] px-3 py-1.5 text-[12px] font-semibold ${i === 0 ? "bg-[#007a5a] text-white" : ""}`}
                              style={i === 0 ? undefined : { border: `1px solid ${LINE}`, color: TEXT }}
                            >
                              {b}
                            </motion.span>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* composer: the question types here, then sends */}
            <div className="mt-4 rounded-[8px]" style={{ border: "1px solid rgba(29,28,29,0.3)", backgroundColor: "#ffffff" }}>
              {!phone && (
                <div className="flex items-center gap-3 px-3 py-1.5" style={{ color: MUTED, borderBottom: `1px solid ${LINE}` }}>
                  <span className="text-[13px] font-bold">B</span>
                  <span className="text-[13px] italic">I</span>
                  <span className="text-[13px] line-through">S</span>
                  <span className="h-3 w-px" style={{ backgroundColor: LINE }} />
                  <Glyph d="M10 13a5 5 0 0 0 7 0l2-2a5 5 0 0 0-7-7l-1 1M14 11a5 5 0 0 0-7 0l-2 2a5 5 0 0 0 7 7l1-1" size={12} />
                  <Glyph d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" size={12} />
                  <Glyph d="M16 18l6-6-6-6M8 6l-6 6 6 6" size={12} />
                </div>
              )}
              <p className="min-h-[36px] px-3 py-2 text-[14px]" style={{ color: stage === 0 && typed > 0 ? TEXT : MUTED }}>
                {stage === 0 && typed > 0 ? (
                  <>
                    {typing.startsWith("@Payloat") ? (
                      <>
                        <Mention />
                        {typing.slice("@Payloat".length)}
                      </>
                    ) : (
                      typing
                    )}
                    {!reduced && <span className="ml-px inline-block h-[14px] w-[2px] translate-y-[2px] animate-pulse bg-[#1d1c1d]" />}
                  </>
                ) : (
                  "Message Payloat"
                )}
              </p>
              <div className="flex items-center justify-between px-2.5 pb-2" style={{ color: MUTED }}>
                <div className="flex items-center gap-3">
                  <span className="flex h-[22px] w-[22px] items-center justify-center rounded-full" style={{ backgroundColor: "rgba(0,0,0,0.06)" }}>
                    <Glyph d="M12 5v14M5 12h14" size={12} />
                  </span>
                  <span className="text-[12px] font-semibold">Aa</span>
                  <Glyph d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01" size={13} />
                  <Glyph d="M12 12m-3 0a3 3 0 1 0 6 0 3 3 0 1 0-6 0M15 12v1.5a2.5 2.5 0 0 0 5 0V12a8 8 0 1 0-3 6.2" size={13} />
                </div>
                <motion.span
                  animate={{ backgroundColor: stage === 0 && typed > 0 ? "#007a5a" : "rgba(0,0,0,0.06)", color: stage === 0 && typed > 0 ? "#ffffff" : MUTED, scale: stage === 1 ? [1, 0.85, 1] : 1 }}
                  transition={{ duration: 0.3 }}
                  className="flex h-[24px] w-[30px] items-center justify-center rounded-[4px]"
                >
                  <Glyph d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7Z" size={12} />
                </motion.span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Mention() {
  return (
    <span className="rounded-[3px] px-1 py-px font-medium text-[#1264a3]" style={{ backgroundColor: "rgba(29,155,209,0.12)" }}>
      @Payloat
    </span>
  );
}

function SideHead({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-3 flex items-center gap-1 px-2 pb-1 text-[13px]" style={{ color: MUTED }}>
      <Glyph d="M6 9l6 6 6-6" size={10} />
      {children}
    </p>
  );
}

function SideRow({
  label,
  hash,
  active,
  avatar,
  initial,
  icon,
  you,
}: {
  label: string;
  hash?: boolean;
  active?: boolean;
  avatar?: string;
  initial?: string;
  icon?: string;
  you?: boolean;
}) {
  return (
    <div className="flex items-center gap-2 rounded-[6px] px-2 py-[5px]" style={{ backgroundColor: active ? ACTIVE : undefined, color: active ? "#ffffff" : TEXT }}>
      {hash && <span className="w-[10px] text-[14px] opacity-70">#</span>}
      {icon && <Glyph d={icon} size={14} />}
      {avatar && <Image src={avatar} alt="" width={20} height={20} className="h-[20px] w-[20px] rounded-[4px] object-cover" />}
      {initial && <span className="flex h-[20px] w-[20px] items-center justify-center rounded-[4px] bg-[#bcd1f7] text-[10px] font-semibold text-[#1d1c1d]">{initial}</span>}
      <span className="truncate">{label}</span>
      {you && <span className="text-[12px] opacity-60">you</span>}
    </div>
  );
}

/* ---------- Slack for iOS, light mode, a DM with Payloat ----------
   Mobbin ref screens/a38aa405: status bar; back, avatar with presence dot,
   name; canvas + headphones; the profile block (big avatar, name, title);
   the "very beginning of your direct message history" line; day labels
   with NEW on the right; message rows; "is typing…" strip; composer pill;
   Home / DMs / Activity tab bar with DMs active; home indicator. */

const IOS_BG = "#ffffff";
const IOS_INK = "#1d1c1d";
const IOS_MUTED = "#616061";
const IOS_LINE = "rgba(29,28,29,0.13)";
const IOS_BLUE = "#1264a3";

function SlackPhone({ active }: { active: boolean }) {
  const reduced = useReducedMotion() ?? false;
  const { stage, typed } = useConversation(active, reduced);
  const typing = QUESTION_DM.slice(0, Math.min(typed, QUESTION_DM.length));
  return (
    <div className="flex h-full w-full flex-col" style={{ fontFamily: "var(--font-ios)", color: IOS_INK, backgroundColor: IOS_BG }}>
      {/* status bar around the island */}
      <div className="flex h-[54px] shrink-0 items-end justify-between px-7 pb-2">
        <span className="text-[16px] font-semibold tracking-[-0.2px] tabular-nums">9:41</span>
        <span className="flex items-center gap-1.5">
          <svg width="17" height="11" viewBox="0 0 19 12" aria-hidden>
            <rect x="0" y="7.5" width="3.4" height="4.5" rx="1" fill={IOS_INK} />
            <rect x="5" y="5" width="3.4" height="7" rx="1" fill={IOS_INK} />
            <rect x="10" y="2.5" width="3.4" height="9.5" rx="1" fill={IOS_INK} />
            <rect x="15" y="0" width="3.4" height="12" rx="1" fill={IOS_INK} />
          </svg>
          <svg width="16" height="12" viewBox="0 0 24 24" fill="none" stroke={IOS_INK} strokeWidth="2.4" strokeLinecap="round" aria-hidden>
            <path d="M2 8.5a15 15 0 0 1 20 0M5.5 12a10 10 0 0 1 13 0M9 15.5a5 5 0 0 1 6 0M12 19h.01" />
          </svg>
          <svg width="25" height="12" viewBox="0 0 28 13" aria-hidden>
            <rect x="0.5" y="0.5" width="24" height="12" rx="3.8" fill="none" stroke={IOS_INK} strokeOpacity="0.4" />
            <rect x="2" y="2" width="21" height="9" rx="2.4" fill={IOS_INK} />
            <path d="M26.2 4.5v4a2.2 2.2 0 0 0 0-4Z" fill={IOS_INK} fillOpacity="0.5" />
          </svg>
        </span>
      </div>

      {/* DM bar */}
      <div className="flex h-[48px] shrink-0 items-center justify-between px-4">
        <span className="flex items-center gap-3">
          <Glyph d="M15 6l-6 6 6 6" size={18} />
          <span className="relative">
            <Image src="/payloat-app-icon-v2.png" alt="Payloat" width={30} height={30} className="h-[30px] w-[30px] rounded-[7px]" />
            <span className="absolute -bottom-0.5 -right-0.5 h-[10px] w-[10px] rounded-full border-2 border-white bg-[#2bac76]" />
          </span>
          <span className="text-[17px] font-bold">Payloat</span>
        </span>
        <span className="flex items-center gap-4">
          <Glyph d="M4 4h16v12H8l-4 4V4Z" size={20} />
          <Glyph d="M3 18v-6a9 9 0 0 1 18 0v6M3 18h4v-5H3m14 5h4v-5h-4" size={20} />
        </span>
      </div>

      {/* conversation */}
      <div className="flex min-h-0 flex-1 flex-col justify-end overflow-hidden px-4">
        {/* profile block */}
        <Image src="/payloat-app-icon-v2.png" alt="Payloat" width={64} height={64} className="h-[64px] w-[64px] rounded-[14px]" />
        <p className="mt-3 text-[22px] font-bold leading-tight">Payloat</p>
        <p className="text-[15px]" style={{ color: IOS_MUTED }}>Chief Financial Agent</p>
        <p className="mt-3 text-[15px] leading-[1.4]" style={{ color: IOS_MUTED }}>
          This is the very beginning of your direct message history with <span style={{ color: IOS_BLUE }}>@Payloat</span>. Only the two of you are in this conversation.
        </p>

        <div className="mt-4 flex items-center justify-between">
          <span className="text-[15px] font-bold">Today</span>
          <AnimatePresence initial={false}>
            {stage >= 1 && (
              <motion.span key="new" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[11px] font-bold text-[#e01e5a]">
                NEW
              </motion.span>
            )}
          </AnimatePresence>
        </div>
        <div className="mb-2 h-px w-full" style={{ backgroundColor: IOS_LINE }} />

        <AnimatePresence initial={false}>
          {stage >= 1 && (
            <motion.div key="q" {...rowIn} className="flex items-start gap-2.5">
              <Image src="/zeradam.jpg" alt="Zeradam" width={36} height={36} className="h-[36px] w-[36px] shrink-0 rounded-[8px] object-cover" />
              <div className="min-w-0">
                <p className="text-[15px] leading-[1.2]">
                  <span className="font-bold">Zeradam</span>
                  <span className="ml-2 text-[12px]" style={{ color: IOS_MUTED }}>9:41</span>
                </p>
                <p className="mt-0.5 text-[15px] leading-[1.35]">{QUESTION_DM}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence initial={false}>
          {stage >= 3 && (
            <motion.div key="a" {...rowIn} className="mt-3 flex items-start gap-2.5">
              <Image src="/payloat-app-icon-v2.png" alt="Payloat" width={36} height={36} className="h-[36px] w-[36px] shrink-0 rounded-[8px]" />
              <div className="min-w-0 flex-1">
                <p className="text-[15px] leading-[1.2]">
                  <span className="font-bold">Payloat</span>
                  <span className="ml-2 text-[12px]" style={{ color: IOS_MUTED }}>9:41</span>
                </p>
                <p className="mt-0.5 text-[15px] leading-[1.35]">
                  September so far across <span className="font-semibold">4 agents</span>.
                </p>
                <AnimatePresence initial={false}>
                  {stage >= 4 && (
                    <motion.div key="card" initial={{ opacity: 0, y: 14, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.45, ease: EASE }}>
                      <SpendCard layout="phone" stage={stage} reduced={reduced} />
                    </motion.div>
                  )}
                </AnimatePresence>
                <AnimatePresence initial={false}>
                  {stage >= 7 && (
                    <motion.p key="notes" {...rowIn} className="mt-2.5 text-[15px] leading-[1.45]">
                      Two things to look at: Procurement went $16.50 over its cap at WebstaurantStore, and one Instacart receipt is still missing, 3 days old.
                    </motion.p>
                  )}
                </AnimatePresence>
                <AnimatePresence initial={false}>
                  {stage >= 8 && (
                    <motion.div key="btns" {...rowIn} className="mt-2.5 flex flex-wrap items-center gap-2">
                      {["Open in Payloat", "By agent"].map((b, i) => (
                        <motion.span key={b} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3, ease: EASE, delay: i * 0.08 }} className={`rounded-[8px] px-3.5 py-2 text-[13px] font-semibold ${i === 0 ? "bg-[#007a5a] text-white" : ""}`} style={i === 0 ? undefined : { border: `1px solid ${IOS_LINE}`, color: IOS_INK }}>
                          {b}
                        </motion.span>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* "is typing" strip, the ref's anatomy */}
      <div className="h-[26px] shrink-0 px-3">
        <AnimatePresence initial={false}>
          {stage === 2 && (
            <motion.div key="typing" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} className="flex h-[26px] items-center gap-2 rounded-t-[10px] px-3 text-[12px]" style={{ backgroundColor: "#f4f4f4", color: IOS_MUTED }}>
              <Image src="/payloat-app-icon-v2.png" alt="" width={16} height={16} className="h-[16px] w-[16px] rounded-[4px]" />
              <span className="font-semibold" style={{ color: IOS_INK }}>Payloat</span> is typing…
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* composer pill */}
      <div className="shrink-0 px-3">
        <div className="flex h-[46px] items-center gap-3 rounded-full pl-2 pr-3" style={{ border: `1px solid ${IOS_LINE}`, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
          <span className="flex h-[30px] w-[30px] items-center justify-center rounded-full" style={{ backgroundColor: "#f0f0f0" }}>
            <Glyph d="M12 5v14M5 12h14" size={14} />
          </span>
          <p className="min-w-0 flex-1 truncate text-[15px]" style={{ color: stage === 0 && typed > 0 ? IOS_INK : IOS_MUTED }}>
            {stage === 0 && typed > 0 ? (
              <>
                {typing}
                {!reduced && <span className="ml-px inline-block h-[15px] w-[2px] translate-y-[3px] animate-pulse" style={{ backgroundColor: IOS_INK }} />}
              </>
            ) : (
              "Message Payloat"
            )}
          </p>
          <motion.span
            animate={{ backgroundColor: stage === 0 && typed > 0 ? "#007a5a" : "rgba(255,255,255,0)", color: stage === 0 && typed > 0 ? "#ffffff" : IOS_INK, scale: stage === 1 ? [1, 0.85, 1] : 1 }}
            transition={{ duration: 0.3 }}
            className="flex h-[30px] w-[30px] items-center justify-center rounded-full"
          >
            {stage === 0 && typed > 0 ? <Glyph d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7Z" size={14} /> : <Glyph d="M12 15a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3Zm6-3a6 6 0 0 1-12 0M12 18v3" size={16} />}
          </motion.span>
        </div>
      </div>

      {/* tab bar + room for the home indicator */}
      <div className="flex shrink-0 items-start justify-around px-6 pb-[30px] pt-2.5">
        {[
          ["Home", "M4 11 12 4l8 7v9H4z", false],
          ["DMs", "M20 12.5a7.5 7.5 0 0 1-11 6.6L4 20l1-4.6a7.5 7.5 0 1 1 15-2.9Z", true],
          ["Activity", "M15 17H9m8-3V11a5 5 0 0 0-10 0v3l-2 3h14l-2-3Z", false],
        ].map(([label, d, on]) => (
          <span key={String(label)} className="relative flex flex-col items-center gap-1 text-[10px] font-medium" style={{ color: on ? IOS_INK : IOS_MUTED }}>
            <Glyph d={String(d)} size={22} />
            <span className="absolute -right-1 top-0 h-[7px] w-[7px] rounded-full bg-[#611f69]" />
            {String(label)}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ---------- the answer card: Origin forecast anatomy, drawn on arrival ---------- */

/* daily cumulative spend in $K, Sep 1 through today (day 9), then projection */
const SO_FAR = [0, 1.9, 3.2, 3.4, 5.1, 6.0, 7.3, 8.6, 9.2];
const PROJECTED = [9.2, 10.4, 11.1, 12.6, 13.0, 14.4, 15.1, 15.9, 17.2, 17.8, 19.0, 19.6, 20.9, 21.4, 22.6, 23.3, 24.1, 25.2, 25.9, 26.8, 27.1, 27.9];
const MAX = 32;
const SPENT = 9190;
const PROJECTED_TOTAL = 27900;

function useCountUp(target: number, go: boolean, reduced: boolean, duration = 1.2) {
  const [v, setV] = useState(reduced ? target : 0);
  useEffect(() => {
    if (reduced) {
      setV(target);
      return;
    }
    if (!go) {
      setV(0);
      return;
    }
    const c = animate(0, target, { duration, ease: [0.22, 0.9, 0.3, 1], onUpdate: (x) => setV(Math.round(x)) });
    return () => c.stop();
  }, [go, target, reduced, duration]);
  return v;
}

function SpendCard({ layout, stage, reduced }: { layout: Layout; stage: Stage; reduced: boolean }) {
  const phone = layout === "phone";
  const W = phone ? 380 : 720;
  const H = phone ? 190 : 200;
  const padL = 14;
  const padR = phone ? 46 : 60;
  const padT = 14;
  const padB = 30;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;
  const days = 30;
  const x = (day: number) => padL + (day / days) * plotW;
  const y = (k: number) => padT + plotH - (k / MAX) * plotH;

  const solidD = SO_FAR.map((v, i) => `${i === 0 ? "M" : "L"}${x(i)},${y(v)}`).join(" ");
  const dashedD = PROJECTED.map((v, i) => `${i === 0 ? "M" : "L"}${x(SO_FAR.length - 1 + i)},${y(v)}`).join(" ");
  const todayX = x(SO_FAR.length - 1);
  const area = `${x(0)},${y(0)} ${SO_FAR.map((v, i) => `${x(i)},${y(v)}`).join(" ")} ${todayX},${y(0)}`;

  const cardIn = stage >= 4;
  const lineIn = stage >= 5;
  const projIn = stage >= 6;
  const spent = useCountUp(SPENT, cardIn, reduced, 1.4);
  const proj = useCountUp(PROJECTED_TOTAL, projIn, reduced, 1.1);

  const markers = [
    { day: 4, d: "M12 3v18M6 9l6-6 6 6", delay: 0.2 },
    { day: 16, d: "M20 12a8 8 0 1 1-2.3-5.6M20 3.5V8h-4.5", delay: 0.7 },
  ];
  const yTicks = phone ? [0, 16, 32] : [0, 8, 16, 24, 32];
  const xTicks = (
    phone
      ? [
          [0, "SEP 1", "start"],
          [8, "TODAY", "middle"],
          [30, "SEP 30", "end"],
        ]
      : [
          [0, "SEP 1", "start"],
          [8, "TODAY", "middle"],
          [15, "SEP 15", "middle"],
          [22, "SEP 22", "middle"],
          [30, "SEP 30", "end"],
        ]
  ) as [number, string, "start" | "middle" | "end"][];

  const fmt = (n: number) => `$${n.toLocaleString("en-US")}`;

  return (
    <motion.div
      className="relative mt-2.5 w-full max-w-[720px] overflow-hidden rounded-[12px] text-white"
      style={{ border: "1px solid rgba(255,255,255,0.14)" }}
      initial={false}
      animate={{ clipPath: cardIn || reduced ? "inset(0 0% 0 0 round 12px)" : "inset(0 100% 0 0 round 12px)" }}
      transition={{ duration: 0.8, ease: EASE }}
    >
      <Image src="/slack-gradient.jpg" alt="" fill sizes="720px" className="object-cover" />
      <div className="relative p-4">
        <motion.div
          initial={false}
          animate={{ opacity: cardIn ? 1 : 0, y: cardIn ? 0 : 8 }}
          transition={{ duration: 0.5, ease: EASE, delay: cardIn ? 0.6 : 0 }}
          className={`flex items-start justify-between ${phone ? "pr-1" : "pr-[50px]"}`}
        >
          <div>
            <p className="text-[11px] text-white/75">Spent so far · September</p>
            <p className="font-numeral text-[22px] font-semibold leading-tight tracking-[-0.8px] tabular-nums">{fmt(spent)}</p>
          </div>
          <motion.div initial={false} animate={{ opacity: projIn ? 1 : 0.35 }} transition={{ duration: 0.4 }}>
            <p className="text-[11px] text-white/75">{phone ? "Projected Sep 30" : "Projected by Sep 30"}</p>
            <p className="font-numeral flex items-center gap-1.5 text-[22px] font-semibold leading-tight tracking-[-0.8px] tabular-nums">
              {fmt(proj)}
              <Glyph d="M7 17 17 7M9 7h8v8" size={14} />
            </p>
            <p className="font-numeral text-[11px] text-white/75">{phone ? "+$18,710 (204%)" : "+$18,710 (204%) · 4 agents"}</p>
          </motion.div>
        </motion.div>

        <motion.svg viewBox={`0 0 ${W} ${H}`} className="mt-1 block h-auto w-full" aria-hidden initial={false} animate={{ opacity: cardIn ? 1 : 0 }} transition={{ duration: 0.5, delay: cardIn ? 0.9 : 0 }}>
          {[0, 0.25, 0.5, 0.75, 1].map((f) => (
            <line key={f} x1={padL} x2={padL + plotW} y1={y(f * MAX)} y2={y(f * MAX)} stroke="rgba(255,255,255,0.14)" strokeDasharray="2 4" />
          ))}
          {[5, 10, 15, 20, 25].map((d) => (
            <line key={d} x1={x(d)} x2={x(d)} y1={padT} y2={padT + plotH} stroke="rgba(255,255,255,0.09)" strokeDasharray="2 4" />
          ))}
          {/* so far: line draws, area fades under it */}
          <motion.polygon points={area} fill="rgba(255,255,255,0.28)" initial={false} animate={{ opacity: lineIn ? 1 : 0 }} transition={{ duration: 0.6, delay: lineIn ? 0.6 : 0 }} />
          <motion.path d={solidD} fill="none" stroke="#ffffff" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" initial={false} animate={{ pathLength: lineIn ? 1 : 0, opacity: lineIn ? 1 : 0 }} transition={{ pathLength: { duration: 1.2, ease: "easeInOut" }, opacity: { duration: 0.1 } }} />
          <motion.g initial={false} animate={{ opacity: lineIn ? 1 : 0 }} transition={{ duration: 0.3, delay: lineIn ? 1.1 : 0 }}>
            <line x1={todayX} x2={todayX} y1={padT - 4} y2={padT + plotH} stroke="#ffffff" strokeWidth="1.5" />
            <circle cx={todayX} cy={padT - 4} r="3" fill="#ffffff" />
          </motion.g>
          {/* projection reveals left to right through a clip */}
          <defs>
            <clipPath id={`proj-${layout}`}>
              <motion.rect x={todayX} y={0} height={H} initial={false} animate={{ width: projIn ? W - todayX : 0 }} transition={{ duration: 1.0, ease: "easeInOut" }} />
            </clipPath>
          </defs>
          <path d={dashedD} fill="none" stroke="#ffffff" strokeWidth="2" strokeDasharray="5 5" strokeLinejoin="round" strokeLinecap="round" clipPath={`url(#proj-${layout})`} />
          {markers.map((m) => {
            const mx = x(m.day);
            const my = m.day < SO_FAR.length ? y(SO_FAR[m.day]) : y(PROJECTED[m.day - (SO_FAR.length - 1)]);
            const show = m.day < SO_FAR.length ? lineIn : projIn;
            return (
              <motion.g key={m.day} initial={false} animate={{ opacity: show ? 1 : 0, scale: show ? 1 : 0.6 }} transition={{ duration: 0.35, ease: EASE, delay: show ? m.delay + 0.5 : 0 }} style={{ transformOrigin: `${mx}px ${my}px` }}>
                <line x1={mx} x2={mx} y1={my} y2={padT + plotH} stroke="#ffffff" strokeWidth="1.5" />
                <circle cx={mx} cy={my} r="13" fill="#ffffff" />
                <path d={m.d} transform={`translate(${mx - 7} ${my - 7}) scale(0.58)`} fill="none" stroke="#0a1fd2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </motion.g>
            );
          })}
          {yTicks.map((k) => (
            <text key={k} x={W - padR + 12} y={y(k) + 4} fill="rgba(255,255,255,0.8)" fontSize="10" fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace" letterSpacing="1">
              ${k}K
            </text>
          ))}
          {xTicks.map(([d, l, a]) => (
            <text key={l} x={x(d)} y={H - 8} textAnchor={a} fill="rgba(255,255,255,0.8)" fontSize="10" fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace" letterSpacing="1.5">
              {l}
            </text>
          ))}
        </motion.svg>

      </div>
    </motion.div>
  );
}

function Glyph({ d, size = 14 }: { d: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={d} />
    </svg>
  );
}
