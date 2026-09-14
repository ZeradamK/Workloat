"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import PhoneMock, { screenWidth as phoneScreenWidth } from "./PhoneMock";

/**
 * Built for agents, on X Money's three-column anatomy: an eyebrow and a
 * two-tone headline on the left, a phone on a hatched canvas in the
 * middle (cut at the canvas's foot), a paragraph at the top right and
 * three benefit rows with hairlines at the bottom right. The phone runs
 * the agent's own view: the month's figure, the four events an agent
 * posts, caps and activity, a task with its budget, and the agents.
 */

const EASE = [0.25, 0.6, 0.2, 1] as const;

const up = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.55, ease: EASE },
} as const;

const INK = "#0a0a0a";
const MUTED = "#706e68";
const LINE = "rgba(10,10,10,0.08)";
const SCREEN_BG = "#f4f4f2";

const POINTS = [
  {
    title: "A budget on every task",
    icon: <path d="M3 17l6-6 4 4 8-8M15 7h6v6" />,
  },
  {
    title: "Receipts the agent can read back",
    icon: <path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3ZM9 8h6M9 12h6" />,
  },
  {
    title: "One key per agent, revoked in a click",
    icon: <path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6l-8-3ZM9 12l2 2 4-4" />,
  },
] as const;

/* the hatch on the canvas: short diagonal strokes, sparse */
const HATCH =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='72' height='72'%3E%3Cg stroke='%23c9c9c6' stroke-width='1.6' stroke-linecap='round'%3E%3Cpath d='M8 16l8-8'/%3E%3Cpath d='M44 40l8-8'/%3E%3Cpath d='M20 64l8-8'/%3E%3Cpath d='M56 12l8-8'/%3E%3C/g%3E%3C/svg%3E\")";

export default function AgentsBuiltSection() {
  return (
    <section className="mx-auto max-w-[1200px] px-6 py-[clamp(56px,7vw,112px)]">
      <div className="grid gap-10 min-[900px]:grid-cols-[1fr_1.15fr_1fr] min-[900px]:gap-8">
        {/* left: the eyebrow and the two-tone headline */}
        <div>
          <motion.p {...up} className="flex items-center gap-2 text-[15px] font-medium text-ink">
            <span className="h-[6px] w-[6px] bg-[#b8b6b0]" />
            Payloat for agents
          </motion.p>
          <motion.h2 {...up} className="mt-6 text-[clamp(30px,3vw,40px)] font-medium leading-[1.12] tracking-[-1.2px]">
            <span className="block text-ink">Built for agents</span>
            <span className="block text-[#8a8883]">Every task comes with a budget</span>
          </motion.h2>
        </div>

        {/* middle: the phone on the hatched canvas */}
        <motion.div
          {...up}
          transition={{ ...up.transition, delay: 0.08 }}
          className="relative h-[560px] overflow-hidden rounded-[6px] min-[900px]:h-[640px]"
          style={{ backgroundColor: "#f3f3f1", backgroundImage: HATCH }}
        >
          <div className="absolute left-1/2 top-[68px] w-[min(78%,330px)] -translate-x-1/2">
            <Phone />
          </div>
        </motion.div>

        {/* right: the paragraph up top, the three rows at the foot */}
        <div className="flex flex-col justify-between gap-10">
          <motion.p {...up} className="text-[16px] leading-[1.55] text-sub">
            Payloat helps fintech teams put agents to work safely. Each agent sees what it is
            allowed to spend on the task in front of it, what it already bought, and what is still
            open, before it acts.
          </motion.p>
          <motion.ul {...up} className="flex flex-col">
            {POINTS.map((p, i) => (
              <li key={p.title} className="flex items-center gap-3 py-4" style={{ borderTop: i === 0 ? "none" : `1px solid ${LINE}` }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={INK} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="shrink-0">
                  {p.icon}
                </svg>
                <span className="text-[16px] font-medium text-ink">{p.title}</span>
              </li>
            ))}
          </motion.ul>
        </div>
      </div>
    </section>
  );
}

/* ---------- the phone ---------- */

const DESIGN_W = 408;

function Phone() {
  const ref = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(330);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setW(el.clientWidth));
    ro.observe(el);
    setW(el.clientWidth);
    return () => ro.disconnect();
  }, []);
  const scale = phoneScreenWidth(w) / DESIGN_W;
  return (
    <div ref={ref} className="w-full">
      <PhoneMock width={w} frame="titanium" screenBg={SCREEN_BG}>
        <div className="absolute inset-0 overflow-hidden" style={{ width: phoneScreenWidth(w) }}>
          <div className="absolute left-0 top-0 origin-top-left" style={{ width: DESIGN_W, transform: `scale(${scale})` }}>
            <Screen />
          </div>
        </div>
      </PhoneMock>
    </div>
  );
}

const AGENTS = [
  { name: "Procurement", spent: 4120, cap: 5000 },
  { name: "Software & seats", spent: 2860, cap: 3000 },
] as const;

const fmt = (n: number) => `$${n.toLocaleString("en-US")}`;

function Screen() {
  return (
    <div className="px-4 pt-[56px] text-ink" style={{ fontFamily: "var(--font-ios)" }}>
      {/* status bar */}
      <div className="absolute left-0 right-0 top-[16px] flex items-center justify-between px-7 text-[15px] font-semibold">
        <span>4:20</span>
        <span className="flex items-center gap-1.5">
          <svg width="18" height="12" viewBox="0 0 18 12" fill="currentColor" aria-hidden>
            <rect x="0" y="8" width="3" height="4" rx="0.8" />
            <rect x="5" y="5.5" width="3" height="6.5" rx="0.8" />
            <rect x="10" y="3" width="3" height="9" rx="0.8" />
            <rect x="15" y="0" width="3" height="12" rx="0.8" />
          </svg>
          <span className="flex h-[12px] w-[24px] items-center rounded-[4px] border-[1.5px] border-current p-[1.5px]">
            <span className="h-full w-[85%] rounded-[1.5px] bg-current" />
          </span>
        </span>
      </div>

      {/* title row */}
      <div className="mt-3 flex items-center justify-between">
        <Image src="/payloat-app-icon-v2.png" alt="" width={30} height={30} className="h-[30px] w-[30px] rounded-[8px]" />
        <span className="text-[17px] font-semibold">Agents</span>
        <span className="flex items-center gap-3" style={{ color: INK }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden><circle cx="12" cy="12" r="9" /><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .8-1 1.5M12 17h.01" /></svg>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" /></svg>
        </span>
      </div>

      {/* the figure */}
      <p className="mt-5 text-[13px]" style={{ color: MUTED }}>
        Agent spend this month
      </p>
      <p className="font-numeral mt-1 text-[38px] font-semibold leading-none tracking-[-1.5px] tabular-nums">
        $9,190<span className="text-[22px] align-top">00</span>
      </p>
      <p className="mt-2 flex items-center gap-1 text-[12px]" style={{ color: MUTED }}>
        17 agents, all under their caps
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></svg>
      </p>

      {/* the four events an agent posts */}
      <div className="mt-4 grid grid-cols-4 gap-2">
        {[
          ["Intent", "M12 5v14M5 12h14"],
          ["Checkout", "M4 6h16l-1.5 9h-13L4 6ZM9 20h.01M15 20h.01"],
          ["Receipt", "M6 3h12v18l-3-2-3 2-3-2-3 2V3ZM9 8h6M9 12h6"],
          ["Status", "M5 12l4 4L19 6"],
        ].map(([label, d]) => (
          <span key={label} className="flex h-[58px] flex-col items-center justify-center gap-1.5 rounded-[12px] bg-white text-[11px] font-medium">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={INK} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d={d} /></svg>
            {label}
          </span>
        ))}
      </div>

      {/* caps and activity */}
      <div className="mt-2 grid grid-cols-2 gap-2">
        <div className="rounded-[12px] bg-white p-3">
          <p className="text-[13px] font-semibold">Caps</p>
          {AGENTS.map((a) => (
            <div key={a.name} className="mt-2 flex items-center justify-between text-[11px]">
              <span style={{ color: MUTED }}>{a.name.split(" ")[0]}</span>
              <span className="font-numeral font-semibold tabular-nums" style={{ color: a.spent / a.cap > 0.9 ? "#c77d00" : INK }}>
                {Math.round((a.spent / a.cap) * 100)}%
              </span>
            </div>
          ))}
        </div>
        <div className="rounded-[12px] bg-white p-3">
          <p className="text-[13px] font-semibold">Activity</p>
          {[
            ["/logos/openai.svg", "OpenAI", "$2,500"],
            ["/logos/vercel.svg", "Vercel", "$350"],
          ].map(([logo, name, amt]) => (
            <div key={name} className="mt-2 flex items-center justify-between text-[11px]">
              <span className="flex items-center gap-1.5" style={{ color: MUTED }}>
                <Image src={logo} alt="" width={12} height={12} className="h-[12px] w-[12px] object-contain" />
                {name}
              </span>
              <span className="font-numeral font-semibold tabular-nums">{amt}</span>
            </div>
          ))}
        </div>
      </div>

      {/* a task with its budget, peeking like the card */}
      <div className="mt-3 rounded-t-[16px] bg-[#0f0f10] px-4 pb-6 pt-3 text-white">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium text-white/60">Task · Procurement agent</span>
          <span className="rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-semibold">Over cap</span>
        </div>
        <p className="mt-1 text-[14px] font-semibold">Restock deli paper</p>
        <p className="font-numeral mt-0.5 text-[12px] text-white/70 tabular-nums">$216.50 intended · cap $200.00</p>
      </div>

      {/* the agents */}
      <div className="-mt-3 grid grid-cols-2 gap-2">
        {AGENTS.map((a) => (
          <div key={a.name} className="rounded-[12px] bg-white p-3" style={{ boxShadow: "0 -6px 16px rgba(0,0,0,0.06)" }}>
            <p className="flex items-center gap-1.5 text-[12px] font-medium">
              <span className="flex h-[16px] w-[16px] items-center justify-center rounded-full bg-[#eeeeee] text-[9px] font-bold">{a.name[0]}</span>
              {a.name}
            </p>
            <p className="mt-3 text-[10px]" style={{ color: MUTED }}>
              of {fmt(a.cap)} cap
            </p>
            <p className="font-numeral text-[18px] font-semibold tabular-nums">{fmt(a.spent)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
