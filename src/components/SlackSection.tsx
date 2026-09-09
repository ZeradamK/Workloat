"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, animate, motion, useInView, useReducedMotion } from "motion/react";
import PhoneMock, { screenWidth as phoneScreenWidth } from "./PhoneMock";

/**
 * Slack act (Ramp investment-account hero anatomy, Mobbin ref
 * sites/sections/03c51e3d): bold headline over a device, two floating
 * notification bars in the goal act's exact anatomy. The page stays white;
 * the device screen wears the brand blue gradient (public/slack-gradient.jpg,
 * 3840x2160) as its wallpaper and the Slack window floats on it in Slack's
 * dark theme (Mobbin refs screens/49abc402, screens/c92cb6cf for the channel
 * anatomy: rail, sidebar, active row, message rows, toolbar composer).
 *
 * The conversation is a timed sequence that plays when the device scrolls
 * into view and loops: Zeradam's question types into the composer, sends,
 * Payloat shows typing dots, answers, the Origin-style forecast card
 * (Mobbin ref sites/sections/1fde4e1c) arrives and draws itself: solid
 * line through today, dashed projection, markers, counting numbers, then
 * the notes and buttons. Reduced motion shows the finished state.
 *
 * Devices: MacBook Pro from 900px (tilted, design 1440x900, scaled by a
 * ResizeObserver), iPhone below (PhoneMock at natural size, with the home
 * indicator and the padding it needs).
 */

const EASE = [0.25, 0.6, 0.2, 1] as const;

const up = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.55, ease: EASE },
} as const;

const DESIGN = { w: 1440, h: 900 };

export default function SlackSection() {
  return (
    <section className="mx-auto max-w-[1200px] px-6 pb-[clamp(140px,18vw,300px)] pt-[clamp(40px,5vw,96px)]">
      <motion.div {...up} className="flex flex-col items-center text-center">
        <h2 className="max-w-[760px] text-[clamp(32px,4.2vw,60px)] font-bold leading-[1.06] tracking-[-2px] text-ink">
          Ask @Payloat what
          <br />
          your agents spent.
        </h2>
        <p className="mt-4 max-w-[520px] text-[16px] leading-[1.5] text-sub">
          Anyone in your workspace can ask. Managers, finance, the owner.
          Payloat answers with the number, the graph, and what needs a look,
          right where the question was asked.
        </p>
      </motion.div>

      {/* ---- MacBook Pro, 900px and up ---- */}
      <motion.div
        {...up}
        transition={{ ...up.transition, delay: 0.1 }}
        className="relative mx-auto mt-14 hidden w-full max-w-[1100px] min-[900px]:block"
      >
        <div className="pt-[2%]" style={{ perspective: 2400, perspectiveOrigin: "50% 35%" }}>
          <div
            className="relative mx-auto w-[90%]"
            style={{ transform: "rotateY(14deg) rotateX(4deg)", transformStyle: "preserve-3d" }}
          >
            <MacBook />
          </div>
        </div>
        <Bar1 className="absolute -left-2 top-[42%] z-10 w-[340px]" delay={0.35} />
        <Bar2 className="absolute bottom-[18%] right-2 z-10 w-[340px]" delay={0.5} />
      </motion.div>

      {/* ---- iPhone, below 900px ---- */}
      <motion.div
        {...up}
        transition={{ ...up.transition, delay: 0.1 }}
        className="mx-auto mt-10 w-full max-w-[380px] min-[900px]:hidden"
      >
        <Phone />
        <div className="mt-6 flex flex-col gap-2.5">
          <Bar1 delay={0.2} />
          <Bar2 delay={0.3} />
        </div>
      </motion.div>
    </section>
  );
}

/* ---------- the two callouts, in the goal act's notification-bar anatomy ---------- */

function NotifBar({
  className = "",
  delay,
  icon,
  name,
  note,
  amount,
}: {
  className?: string;
  delay: number;
  icon: React.ReactNode;
  name: string;
  note: string;
  amount: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.55, ease: EASE, delay }}
      className={`flex items-center gap-3 rounded-[18px] py-[6px] pl-[6px] pr-2.5 shadow-[0_18px_50px_rgba(0,0,0,0.12)] ${className}`}
      style={{ backgroundColor: "#eeeeee" }}
    >
      <span className="flex h-[43px] w-[43px] shrink-0 items-center justify-center rounded-[11px] bg-white">
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
    </motion.div>
  );
}

function Bar1({ className, delay }: { className?: string; delay: number }) {
  return (
    <NotifBar
      className={className}
      delay={delay}
      icon={<path d="M4 20V10M10 20V4M16 20v-8M22 20H2" />}
      name="This month"
      note="The graph and what to look at"
      amount="$27,900"
    />
  );
}

function Bar2({ className, delay }: { className?: string; delay: number }) {
  return (
    <NotifBar
      className={className}
      delay={delay}
      icon={<path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" />}
      name="Every charge"
      note="Answered in seconds"
      amount="4 agents"
    />
  );
}

/* ---------- devices ---------- */

/* MacBook Pro: the whole lid in the same black as the notch, gradient
   screen, then the aluminum deck with its center lip. */
function MacBook() {
  return (
    <div className="relative" style={{ transformStyle: "preserve-3d" }}>
      <div
        className="relative rounded-[16px] bg-[#0e0e10] p-[10px] pb-[12px]"
        style={{ boxShadow: "0 60px 120px rgba(20,40,120,0.30), 0 24px 48px rgba(0,0,0,0.18)" }}
      >
        <div className="relative aspect-[1440/900] w-full overflow-hidden rounded-[8px] bg-[#0a1fd2]">
          <Wallpaper />
          <ScaledScreen>
            <Desktop />
          </ScaledScreen>
          <div className="absolute left-1/2 top-0 h-[14px] w-[120px] -translate-x-1/2 rounded-b-[8px] bg-[#0e0e10]" />
          <Sheen />
        </div>
      </div>
      <div
        className="relative mx-auto h-[16px] w-[106%] -translate-x-[3%] rounded-b-[12px]"
        style={{
          background: "linear-gradient(180deg,#ececee 0%,#c8c8cc 55%,#8f8f95 100%)",
          boxShadow: "0 18px 40px rgba(0,0,0,0.18)",
        }}
      >
        <div className="absolute left-1/2 top-0 h-[6px] w-[110px] -translate-x-1/2 rounded-b-[6px]" style={{ background: "linear-gradient(180deg,#b5b5ba,#d9d9dc)" }} />
      </div>
    </div>
  );
}

/* iPhone: the site's PhoneMock in pure black to match the island. Slack for
   iOS fills the screen in dark mode (Mobbin ref screens/b684c99d: status bar,
   back + channel title bar, day label, message rows, composer pill, Home /
   DMs / Activity tab bar, home indicator). */
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
      <PhoneMock width={w} frame="black" frameColor="#000000" screenBg={IOS_BG}>
        <div className="absolute inset-0" style={{ width: phoneScreenWidth(w) }}>
          <SlackPhone active={inView} />
        </div>
        <div className="absolute bottom-[9px] left-1/2 h-[5px] w-[134px] -translate-x-1/2 rounded-full bg-white/90" />
      </PhoneMock>
    </div>
  );
}

function Wallpaper() {
  return <Image src="/slack-gradient.jpg" alt="" fill sizes="(min-width: 900px) 1000px, 100vw" className="object-cover" />;
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
      <div
        className="absolute left-0 top-0 origin-top-left"
        style={{ width: DESIGN.w, height: DESIGN.h, transform: `scale(${scale})`, opacity: scale ? 1 : 0 }}
      >
        {children}
      </div>
    </div>
  );
}

/* A macOS desktop: menu bar, the Slack window floating on the wallpaper. */
function Desktop() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.35 });
  return (
    <div ref={ref} className="relative h-full w-full">
      <div className="absolute inset-x-0 top-0 flex h-[26px] items-center justify-between px-4 text-[12px] font-medium text-white/90" style={{ backgroundColor: "rgba(0,0,0,0.22)" }}>
        <span className="flex items-center gap-4">
          <span></span>
          <span className="font-bold">Slack</span>
          <span>File</span>
          <span>Edit</span>
          <span>View</span>
          <span>Window</span>
          <span>Help</span>
        </span>
        <span className="flex items-center gap-3">
          <span>Tue Sep 9</span>
          <span>9:41 AM</span>
        </span>
      </div>
      <div className="absolute overflow-hidden rounded-[12px] shadow-[0_30px_80px_rgba(0,0,0,0.45)]" style={{ top: 54, left: 44, right: 44, bottom: 40 }}>
        <SlackWindow layout="desktop" active={inView} />
      </div>
    </div>
  );
}

/* ---------- the conversation sequence ---------- */

const QUESTION = "@Payloat how much have our agents spent this month?";
const TYPE_MS = 28;

/* 0 typing · 1 sent · 2 Payloat typing · 3 answer text · 4 card + line
   · 5 projection + markers · 6 notes · 7 buttons (finished) */
type Stage = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

function useConversation(active: boolean, reduced: boolean) {
  const [stage, setStage] = useState<Stage>(reduced ? 7 : 0);
  const [typed, setTyped] = useState(reduced ? QUESTION.length : 0);
  useEffect(() => {
    if (reduced) {
      setStage(7);
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
      for (let i = 1; i <= QUESTION.length; i++) at(400 + i * TYPE_MS, () => setTyped(i));
      const sent = 400 + QUESTION.length * TYPE_MS + 550;
      at(sent, () => setStage(1));
      at(sent + 500, () => setStage(2));
      at(sent + 1700, () => setStage(3));
      at(sent + 2200, () => setStage(4));
      at(sent + 3700, () => setStage(5));
      at(sent + 4900, () => setStage(6));
      at(sent + 5400, () => setStage(7));
      at(sent + 12500, run);
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

const TOP = "#121417";
const RAIL = "#0f1113";
const SIDE = "#19171d";
const PANE = "#1a1d21";
const TEXT = "#e8e9ea";
const MUTED = "#9d9fa3";
const LINE = "rgba(255,255,255,0.10)";
const ACTIVE = "#1164a3";

const CHANNELS = ["general", "finance", "agents", "ops", "kitchen"];

type Layout = "desktop" | "phone";

const rowIn = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, ease: EASE },
} as const;

function SlackWindow({ layout, active }: { layout: Layout; active: boolean }) {
  const phone = layout === "phone";
  const reduced = useReducedMotion() ?? false;
  const { stage, typed } = useConversation(active, reduced);
  const typing = QUESTION.slice(0, typed);

  return (
    <div className="flex h-full w-full flex-col" style={{ fontFamily: "var(--font-ios)", color: TEXT, backgroundColor: PANE }}>
      {/* title bar: traffic lights + search */}
      <div className="flex h-[40px] shrink-0 items-center px-3" style={{ backgroundColor: TOP }}>
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
        <div className="flex h-[26px] flex-1 items-center gap-2 rounded-[6px] px-3 text-[12px]" style={{ backgroundColor: "rgba(255,255,255,0.10)", color: MUTED, maxWidth: phone ? undefined : 520 }}>
          <Glyph d="M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14ZM20 20l-3.5-3.5" size={12} />
          Search Payloat
        </div>
        {!phone && (
          <span className="ml-auto flex h-[22px] w-[22px] items-center justify-center rounded-full text-[11px]" style={{ backgroundColor: "rgba(255,255,255,0.10)", color: MUTED }}>?</span>
        )}
      </div>

      <div className="flex min-h-0 flex-1">
        {/* rail */}
        {!phone && (
          <div className="flex w-[68px] shrink-0 flex-col items-center gap-4 pt-4" style={{ backgroundColor: RAIL }}>
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
                <span className={`flex h-[30px] w-[30px] items-center justify-center rounded-[8px] ${i === 0 ? "bg-white/15" : ""}`}>
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
              <span className="flex h-[26px] w-[26px] items-center justify-center rounded-full bg-white text-[#19171d]">
                <Glyph d="M12 20h9M16.5 3.5a2.1 2.1 0 1 1 3 3L7 19l-4 1 1-4L16.5 3.5Z" size={13} />
              </span>
            </div>
            <div className="px-3 pt-3 text-[14px]">
              <SideRow label="Threads" icon="M20 12.5a7.5 7.5 0 0 1-11 6.6L4 20l1-4.6a7.5 7.5 0 1 1 15-2.9Z" />
              <SideRow label="Drafts & sent" icon="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7Z" />
              <SideHead>Channels</SideHead>
              {CHANNELS.map((c) => (
                <SideRow key={c} label={c} hash active={c === "agents"} />
              ))}
              <SideHead>Direct messages</SideHead>
              <SideRow label="Zeradam" avatar="/zeradam.jpg" you />
              <SideRow label="Maya Chen" initial="M" />
              <SideRow label="Payloat" avatar="/payloat-app-icon-v2.png" />
              <SideHead>Apps</SideHead>
              <SideRow label="Payloat" avatar="/payloat-app-icon-v2.png" />
            </div>
          </div>
        )}

        {/* channel pane */}
        <div className="flex min-w-0 flex-1 flex-col" style={{ backgroundColor: PANE }}>
          <div className="flex h-[48px] shrink-0 items-center justify-between px-4" style={{ borderBottom: `1px solid ${LINE}` }}>
            <span className="flex items-center gap-1 text-[15px] font-bold">
              # agents
              <Glyph d="M6 9l6 6 6-6" size={11} />
            </span>
            {!phone && (
              <div className="flex items-center gap-2 text-[12px]" style={{ color: MUTED }}>
                <span className="flex items-center gap-1.5 rounded-[6px] px-2 py-1" style={{ border: `1px solid ${LINE}` }}>
                  <span className="flex -space-x-1.5">
                    <Image src="/zeradam.jpg" alt="" width={18} height={18} className="h-[18px] w-[18px] rounded-[4px] border border-[#1a1d21] object-cover" />
                    <span className="h-[18px] w-[18px] rounded-[4px] border border-[#1a1d21] bg-[#bcd1f7]" />
                    <span className="h-[18px] w-[18px] rounded-[4px] border border-[#1a1d21] bg-[#f5c6a5]" />
                  </span>
                  12
                </span>
                <span className="flex items-center gap-1 rounded-[6px] px-2 py-1" style={{ border: `1px solid ${LINE}` }}>
                  <Glyph d="M3 18v-6a9 9 0 0 1 18 0v6M3 18h4v-5H3m14 5h4v-5h-4" size={12} />
                  Huddle
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
                  <span className="flex items-center gap-1 rounded-[10px] px-3 py-2.5" style={{ backgroundColor: "rgba(255,255,255,0.08)" }}>
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
                      <span className="ml-1.5 rounded-[3px] px-1 py-px text-[9px] font-semibold uppercase tracking-[0.04em]" style={{ backgroundColor: "rgba(255,255,255,0.12)", color: MUTED }}>App</span>
                      <span className="ml-2 text-[11px]" style={{ color: MUTED }}>9:41 AM</span>
                    </p>
                    <p className="mt-0.5 text-[14px] leading-[1.4]">
                      September so far across <span className="font-semibold">4 agents</span>. Two things to look at, under the chart.
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
                        <motion.div key="btns" {...rowIn} className="mt-2.5 flex flex-wrap items-center gap-2">
                          {["Open in Payloat", "By agent", "Receipts"].map((b, i) => (
                            <motion.span
                              key={b}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.3, ease: EASE, delay: i * 0.08 }}
                              className={`rounded-[6px] px-3 py-1.5 text-[12px] font-semibold ${i === 0 ? "bg-[#007a5a] text-white" : ""}`}
                              style={i === 0 ? undefined : { border: "1px solid rgba(255,255,255,0.3)", color: TEXT }}
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
            <div className="mt-4 rounded-[8px]" style={{ border: "1px solid rgba(255,255,255,0.28)", backgroundColor: "#222529" }}>
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
                    {!reduced && <span className="ml-px inline-block h-[14px] w-[2px] translate-y-[2px] animate-pulse bg-white" />}
                  </>
                ) : (
                  "Message #agents"
                )}
              </p>
              <div className="flex items-center justify-between px-2.5 pb-2" style={{ color: MUTED }}>
                <div className="flex items-center gap-3">
                  <span className="flex h-[22px] w-[22px] items-center justify-center rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.10)" }}>
                    <Glyph d="M12 5v14M5 12h14" size={12} />
                  </span>
                  <span className="text-[12px] font-semibold">Aa</span>
                  <Glyph d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01" size={13} />
                  <Glyph d="M12 12m-3 0a3 3 0 1 0 6 0 3 3 0 1 0-6 0M15 12v1.5a2.5 2.5 0 0 0 5 0V12a8 8 0 1 0-3 6.2" size={13} />
                </div>
                <motion.span
                  animate={{ backgroundColor: stage === 0 && typed > 0 ? "#007a5a" : "rgba(255,255,255,0.10)", scale: stage === 1 ? [1, 0.85, 1] : 1 }}
                  transition={{ duration: 0.3 }}
                  className="flex h-[24px] w-[30px] items-center justify-center rounded-[4px] text-white"
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
    <span className="rounded-[3px] px-1 py-px font-medium text-[#1d9bd1]" style={{ backgroundColor: "rgba(29,155,209,0.18)" }}>
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
    <div className="flex items-center gap-2 rounded-[6px] px-2 py-[5px]" style={{ backgroundColor: active ? ACTIVE : undefined, color: active ? "#ffffff" : "rgba(232,233,234,0.85)" }}>
      {hash && <span className="w-[10px] text-[14px] opacity-70">#</span>}
      {icon && <Glyph d={icon} size={14} />}
      {avatar && <Image src={avatar} alt="" width={20} height={20} className="h-[20px] w-[20px] rounded-[4px] object-cover" />}
      {initial && <span className="flex h-[20px] w-[20px] items-center justify-center rounded-[4px] bg-[#bcd1f7] text-[10px] font-semibold text-[#1d1c1d]">{initial}</span>}
      <span className="truncate">{label}</span>
      {you && <span className="text-[12px] opacity-60">you</span>}
    </div>
  );
}

/* ---------- Slack for iOS, dark mode, full screen ---------- */

const IOS_BG = "#1a1d21";

function SlackPhone({ active }: { active: boolean }) {
  const reduced = useReducedMotion() ?? false;
  const { stage, typed } = useConversation(active, reduced);
  const typing = QUESTION.slice(0, typed);
  return (
    <div className="flex h-full w-full flex-col" style={{ fontFamily: "var(--font-ios)", color: TEXT, backgroundColor: IOS_BG }}>
      {/* status bar around the island */}
      <div className="flex h-[54px] shrink-0 items-end justify-between px-7 pb-2">
        <span className="text-[16px] font-semibold tracking-[-0.2px] tabular-nums">9:41</span>
        <span className="flex items-center gap-1.5">
          <svg width="17" height="11" viewBox="0 0 19 12" aria-hidden>
            <rect x="0" y="7.5" width="3.4" height="4.5" rx="1" fill="#fff" />
            <rect x="5" y="5" width="3.4" height="7" rx="1" fill="#fff" />
            <rect x="10" y="2.5" width="3.4" height="9.5" rx="1" fill="#fff" />
            <rect x="15" y="0" width="3.4" height="12" rx="1" fill="#fff" />
          </svg>
          <svg width="16" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" aria-hidden>
            <path d="M2 8.5a15 15 0 0 1 20 0M5.5 12a10 10 0 0 1 13 0M9 15.5a5 5 0 0 1 6 0M12 19h.01" />
          </svg>
          <svg width="25" height="12" viewBox="0 0 28 13" aria-hidden>
            <rect x="0.5" y="0.5" width="24" height="12" rx="3.8" fill="none" stroke="#fff" strokeOpacity="0.4" />
            <rect x="2" y="2" width="21" height="9" rx="2.4" fill="#fff" />
            <path d="M26.2 4.5v4a2.2 2.2 0 0 0 0-4Z" fill="#fff" fillOpacity="0.5" />
          </svg>
        </span>
      </div>

      {/* channel bar */}
      <div className="flex h-[50px] shrink-0 items-center justify-between px-4">
        <span className="flex items-center gap-3">
          <Glyph d="M15 6l-6 6 6 6" size={18} />
          <span className="leading-tight">
            <span className="block text-[17px] font-bold">#agents</span>
            <span className="block text-[12px]" style={{ color: MUTED }}>12 members, 2 pins</span>
          </span>
        </span>
        <span className="flex items-center gap-4" style={{ color: TEXT }}>
          <Glyph d="M4 4h16v12H8l-4 4V4Z" size={20} />
          <span className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[12px]" style={{ backgroundColor: "rgba(255,255,255,0.12)" }}>
            <Glyph d="M3 18v-6a9 9 0 0 1 18 0v6M3 18h4v-5H3m14 5h4v-5h-4" size={14} />
            1
          </span>
        </span>
      </div>

      {/* conversation */}
      <div className="flex min-h-0 flex-1 flex-col justify-end overflow-hidden px-4 pb-2">
        <p className="mb-2 text-[15px] font-bold">Today</p>

        <AnimatePresence initial={false}>
          {stage >= 1 && (
            <motion.div key="q" {...rowIn} className="flex items-start gap-2.5">
              <Image src="/zeradam.jpg" alt="Zeradam" width={36} height={36} className="h-[36px] w-[36px] shrink-0 rounded-[8px] object-cover" />
              <div className="min-w-0">
                <p className="text-[15px] leading-[1.2]">
                  <span className="font-bold">Zeradam</span>
                  <span className="ml-2 text-[12px]" style={{ color: MUTED }}>9:41</span>
                </p>
                <p className="mt-0.5 text-[15px] leading-[1.35]">
                  <Mention />
                  {QUESTION.slice("@Payloat".length)}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence initial={false}>
          {stage === 2 && (
            <motion.div key="dots" {...rowIn} exit={{ opacity: 0, transition: { duration: 0.15 } }} className="mt-3 flex items-center gap-2.5">
              <Image src="/payloat-app-icon-v2.png" alt="Payloat" width={36} height={36} className="h-[36px] w-[36px] shrink-0 rounded-[8px]" />
              <span className="flex items-center gap-1 rounded-[10px] px-3 py-2.5" style={{ backgroundColor: "rgba(255,255,255,0.08)" }}>
                {[0, 1, 2].map((i) => (
                  <motion.span key={i} className="h-[7px] w-[7px] rounded-full" style={{ backgroundColor: MUTED }} animate={{ y: [0, -4, 0], opacity: [0.5, 1, 0.5] }} transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }} />
                ))}
              </span>
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
                  <span className="ml-1.5 rounded-[3px] px-1 py-px text-[9px] font-semibold uppercase tracking-[0.04em]" style={{ backgroundColor: "rgba(255,255,255,0.12)", color: MUTED }}>App</span>
                  <span className="ml-2 text-[12px]" style={{ color: MUTED }}>9:41</span>
                </p>
                <p className="mt-0.5 text-[15px] leading-[1.35]">
                  September so far across <span className="font-semibold">4 agents</span>. Two things to look at.
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
                    <motion.div key="btns" {...rowIn} className="mt-2.5 flex flex-wrap items-center gap-2">
                      {["Open in Payloat", "By agent"].map((b, i) => (
                        <motion.span key={b} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3, ease: EASE, delay: i * 0.08 }} className={`rounded-[8px] px-3.5 py-2 text-[13px] font-semibold ${i === 0 ? "bg-[#007a5a] text-white" : ""}`} style={i === 0 ? undefined : { border: "1px solid rgba(255,255,255,0.3)", color: TEXT }}>
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

      {/* composer pill */}
      <div className="shrink-0 px-3 pt-1">
        <div className="flex h-[46px] items-center gap-3 rounded-full pl-2 pr-3" style={{ backgroundColor: "#26292e", border: "1px solid rgba(255,255,255,0.10)" }}>
          <span className="flex h-[30px] w-[30px] items-center justify-center rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.10)" }}>
            <Glyph d="M12 5v14M5 12h14" size={14} />
          </span>
          <p className="min-w-0 flex-1 truncate text-[15px]" style={{ color: stage === 0 && typed > 0 ? TEXT : MUTED }}>
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
                {!reduced && <span className="ml-px inline-block h-[15px] w-[2px] translate-y-[3px] animate-pulse bg-white" />}
              </>
            ) : (
              "Message #agents"
            )}
          </p>
          <motion.span
            animate={{ backgroundColor: stage === 0 && typed > 0 ? "#007a5a" : "rgba(255,255,255,0)", scale: stage === 1 ? [1, 0.85, 1] : 1 }}
            transition={{ duration: 0.3 }}
            className="flex h-[30px] w-[30px] items-center justify-center rounded-full"
            style={{ color: TEXT }}
          >
            {stage === 0 && typed > 0 ? <Glyph d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7Z" size={14} /> : <Glyph d="M12 15a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3Zm6-3a6 6 0 0 1-12 0M12 18v3" size={16} />}
          </motion.span>
        </div>
      </div>

      {/* tab bar + room for the home indicator */}
      <div className="flex shrink-0 items-start justify-around px-6 pb-[30px] pt-2.5">
        {[
          ["Home", "M4 11 12 4l8 7v9H4z", true],
          ["DMs", "M20 12.5a7.5 7.5 0 0 1-11 6.6L4 20l1-4.6a7.5 7.5 0 1 1 15-2.9Z", false],
          ["Activity", "M15 17H9m8-3V11a5 5 0 0 0-10 0v3l-2 3h14l-2-3Z", false],
        ].map(([label, d, on]) => (
          <span key={String(label)} className="relative flex flex-col items-center gap-1 text-[10px] font-medium" style={{ color: on ? TEXT : MUTED }}>
            <Glyph d={String(d)} size={22} />
            <span className="absolute -right-1 top-0 h-[7px] w-[7px] rounded-full bg-[#e01e5a]" />
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

  const lineIn = stage >= 4;
  const projIn = stage >= 5;
  const notesIn = stage >= 6;
  const spent = useCountUp(SPENT, lineIn, reduced, 1.3);
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
    <div className="relative mt-2.5 w-full max-w-[720px] overflow-hidden rounded-[12px] text-white" style={{ border: "1px solid rgba(255,255,255,0.14)" }}>
      <Image src="/slack-gradient.jpg" alt="" fill sizes="720px" className="object-cover" />
      <div className="relative p-4">
        <div className={`flex items-start justify-between ${phone ? "pr-1" : "pr-[50px]"}`}>
          <div>
            <p className="text-[11px] text-white/75">Spent so far · September</p>
            <p className="font-numeral text-[22px] font-semibold leading-tight tracking-[-0.8px] tabular-nums">{fmt(spent)}</p>
          </div>
          <motion.div initial={false} animate={{ opacity: projIn ? 1 : 0.35 }} transition={{ duration: 0.4 }}>
            <p className="text-[11px] text-white/75">Projected by Sep 30</p>
            <p className="font-numeral flex items-center gap-1.5 text-[22px] font-semibold leading-tight tracking-[-0.8px] tabular-nums">
              {fmt(proj)}
              <Glyph d="M7 17 17 7M9 7h8v8" size={14} />
            </p>
            <p className="font-numeral text-[11px] text-white/75">+$18,710 (204%) · 4 agents</p>
          </motion.div>
        </div>

        <svg viewBox={`0 0 ${W} ${H}`} className="mt-1 block h-auto w-full" aria-hidden>
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
        </svg>

        <motion.div
          initial={false}
          animate={{ opacity: notesIn ? 1 : 0, y: notesIn ? 0 : 8 }}
          transition={{ duration: 0.4, ease: EASE }}
          className={`mt-1.5 grid gap-3 border-t border-white/20 pt-2.5 ${phone ? "" : "grid-cols-[1fr_1.15fr] gap-5"}`}
        >
          {!phone && (
            <div className="flex flex-col gap-1 text-[12px]">
              {[
                ["Procurement", "$4,120"],
                ["Software & seats", "$2,860"],
                ["Ops", "$1,450"],
                ["Travel", "$760"],
              ].map(([n, v]) => (
                <div key={n} className="flex items-center justify-between">
                  <span className="text-white/85">{n}</span>
                  <span className="font-numeral font-semibold">{v}</span>
                </div>
              ))}
            </div>
          )}
          <div className="flex flex-col gap-1.5 text-[12px] leading-[1.35]">
            <p className="flex items-start gap-2">
              <span className="mt-[5px] h-[6px] w-[6px] shrink-0 rounded-full bg-[#ffb4a2]" />
              Procurement went $16.50 over its cap at WebstaurantStore.
            </p>
            <p className="flex items-start gap-2">
              <span className="mt-[5px] h-[6px] w-[6px] shrink-0 rounded-full bg-[#d6f251]" />
              One Instacart receipt is still missing, 3 days old.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function Glyph({ d, size = 14 }: { d: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={d} />
    </svg>
  );
}
