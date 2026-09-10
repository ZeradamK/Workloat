"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useInView, useReducedMotion } from "motion/react";
import PhoneMock, { screenWidth as phoneScreenWidth } from "./PhoneMock";

/**
 * Founder pitch, on Origin's "Track your spending" section anatomy: a
 * black rounded box, an iPhone on the left rising from the box's bottom
 * (cropped), the headline, copy, and a call to action on the right. The
 * phone shows two cards: agent spend this month as a donut by team, and
 * the upcoming charges agents hold. Below 900px the copy stacks above the
 * phone.
 */

const EASE = [0.25, 0.6, 0.2, 1] as const;

const up = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.55, ease: EASE },
} as const;

/* sample data, per company in the product */
const TEAMS = [
  { name: "Procurement", spent: 4120, color: "#3a7bd5" },
  { name: "Software & seats", spent: 2860, color: "#b5563a" },
  { name: "Ops", spent: 1450, color: "#0f6e5c" },
  { name: "Travel", spent: 760, color: "#f0b36a" },
] as const;
const TOTAL = TEAMS.reduce((s, t) => s + t.spent, 0);

const UPCOMING = [
  { name: "OpenAI", logo: "/logos/openai.svg", cadence: "Monthly", due: "Due in 1 day", tone: "#c8401f", amount: 2500 },
  { name: "Vercel", logo: "/logos/vercel.svg", cadence: "Monthly", due: "Due in 3 days", tone: "#b58a00", amount: 350 },
  { name: "AWS", logo: "/logos/aws.svg", cadence: "Monthly", due: "Due in 6 days", tone: "#706e68", amount: 850 },
] as const;

const fmt = (n: number) => `$${n.toLocaleString("en-US")}`;

export default function ControlSection() {
  return (
    <section className="px-4 pb-[clamp(96px,10vw,160px)] pt-4 min-[900px]:px-[100px]">
      <div
        className="relative overflow-hidden rounded-[30px] bg-[#0a0a0a] px-6 pt-12 min-[900px]:grid min-[900px]:grid-cols-2 min-[900px]:items-center min-[900px]:px-12 min-[900px]:pt-0"
        style={{ minHeight: "clamp(560px, 58vw, 880px)" }}
      >
        {/* copy: right column on desktop, first on phones */}
        <div className="min-[900px]:order-2 min-[900px]:pl-8">
          <motion.h2
            {...up}
            className="text-[clamp(34px,4.6vw,66px)] font-bold leading-[1.04] tracking-[-2px] text-white"
          >
            Remotely look
            <br />
            over expenses.
          </motion.h2>
          <motion.p {...up} className="mt-6 max-w-[480px] text-[clamp(17px,1.4vw,21px)] leading-[1.5] text-white/80">
            Open Payloat from anywhere and see what every agent spent: each purchase, its receipt,
            and how close it sits to its cap. You do not have to be in the room to know.
          </motion.p>
          <motion.div {...up} className="mt-8">
            <Link
              href="/signup"
              className="inline-flex h-12 items-center rounded-full bg-white px-6 text-[14px] font-semibold tracking-[-0.3px] text-ink transition-transform hover:scale-[1.03] active:scale-[0.97]"
            >
              Get started
            </Link>
          </motion.div>
        </div>

        {/* the phone: rises from the box's bottom, cropped */}
        <div className="relative mt-12 h-[clamp(420px,52vw,760px)] min-[900px]:order-1 min-[900px]:mt-0 min-[900px]:h-full min-[900px]:min-h-[inherit]">
          <motion.div
            {...up}
            transition={{ ...up.transition, delay: 0.1 }}
            className="absolute bottom-[-18%] left-1/2 w-[min(78%,400px)] -translate-x-1/2 min-[900px]:bottom-[-14%] min-[900px]:left-[10%] min-[900px]:w-[min(64%,384px)] min-[900px]:translate-x-0"
          >
            <Phone />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ---------- the phone ---------- */

const SCREEN_BG = "#f6f6f4";
const DESIGN_W = 408; /* the screen's width on a 430px device */

function Phone() {
  const ref = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(360);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setW(el.clientWidth));
    ro.observe(el);
    setW(el.clientWidth);
    return () => ro.disconnect();
  }, []);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const reduced = useReducedMotion() ?? false;
  const scale = phoneScreenWidth(w) / DESIGN_W;
  return (
    <div ref={ref} className="w-full">
      <PhoneMock width={w} frame="titanium" screenBg={SCREEN_BG}>
        <div className="absolute inset-0 overflow-hidden" style={{ width: phoneScreenWidth(w) }}>
          <div className="absolute left-0 top-0 origin-top-left" style={{ width: DESIGN_W, transform: `scale(${scale})` }}>
            <Screen on={inView || reduced} />
          </div>
        </div>
      </PhoneMock>
    </div>
  );
}

function Screen({ on }: { on: boolean }) {
  return (
    <div className="px-4 pt-[68px] text-ink" style={{ fontFamily: "var(--font-ios)" }}>
      {/* status bar */}
      <div className="absolute left-0 right-0 top-[18px] flex items-center justify-between px-8 text-[15px] font-semibold">
        <span>9:41</span>
        <span className="flex items-center gap-1.5">
          <svg width="18" height="12" viewBox="0 0 18 12" fill="currentColor" aria-hidden>
            <rect x="0" y="8" width="3" height="4" rx="0.8" />
            <rect x="5" y="5.5" width="3" height="6.5" rx="0.8" />
            <rect x="10" y="3" width="3" height="9" rx="0.8" />
            <rect x="15" y="0" width="3" height="12" rx="0.8" />
          </svg>
          <svg width="16" height="12" viewBox="0 0 24 18" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden>
            <path d="M2 6.5a15 15 0 0 1 20 0M5.5 10.5a10 10 0 0 1 13 0M9 14.5a5 5 0 0 1 6 0M12 17.5h.01" />
          </svg>
          <span className="flex items-center gap-[2px]">
            <span className="flex h-[12px] w-[24px] items-center rounded-[4px] border-[1.5px] border-current p-[1.5px]">
              <span className="h-full w-[90%] rounded-[1.5px] bg-current" />
            </span>
            <span className="h-[5px] w-[1.5px] rounded-r-[1px] bg-current opacity-60" />
          </span>
        </span>
      </div>

      {/* agent spend, by team */}
      <div className="rounded-[20px] bg-white px-6 pb-5 pt-5">
        <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-sub">Agent spend</p>
        <div className="mt-4 border-t border-black/[0.07]" />
        <div className="relative mx-auto mt-5 h-[228px] w-[228px]">
          <Donut on={on} />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="font-numeral text-[30px] font-bold leading-none tracking-[-1px] tabular-nums">{fmt(TOTAL)}</p>
            <p className="mt-2 text-[14px] text-sub">Spent this month</p>
          </div>
        </div>
        <div className="mt-6 flex h-[48px] items-center justify-center rounded-full border border-black/15 text-[13px] font-semibold uppercase tracking-[0.12em]">
          See all
        </div>
      </div>

      {/* upcoming charges */}
      <div className="mt-4 rounded-[20px] bg-white px-6 pb-4 pt-5">
        <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-sub">Upcoming charges</p>
        <div className="mt-4 border-t border-black/[0.07]" />
        <div className="mt-2 flex flex-col">
          {UPCOMING.map((u) => (
            <div key={u.name} className="flex items-center gap-4 py-3.5">
              <span className="flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-[12px] bg-[#f0f0ee]">
                <Image src={u.logo} alt="" width={24} height={24} className="h-[24px] w-[24px] object-contain" />
              </span>
              <span className="min-w-0 flex-1">
                <p className="text-[17px] font-medium leading-tight">{u.name}</p>
                <p className="mt-0.5 text-[14px] leading-tight text-sub">
                  {u.cadence} <span style={{ color: u.tone }}>({u.due})</span>
                </p>
              </span>
              <span className="font-numeral text-[17px] font-medium tabular-nums">{fmt(u.amount)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* the donut: one arc per team, drawn in on view, gaps between them */
function Donut({ on }: { on: boolean }) {
  const S = 228;
  const r = 96;
  const c = S / 2;
  const stroke = 30;
  const gap = 0.055; /* radians between arcs */
  let a = -Math.PI / 2;
  const arcs = TEAMS.map((t) => {
    const span = (t.spent / TOTAL) * Math.PI * 2;
    const a0 = a + gap / 2;
    const a1 = a + span - gap / 2;
    a += span;
    const p = (ang: number) => [c + r * Math.cos(ang), c + r * Math.sin(ang)] as const;
    const [x0, y0] = p(a0);
    const [x1, y1] = p(a1);
    const large = a1 - a0 > Math.PI ? 1 : 0;
    return { ...t, d: `M${x0.toFixed(2)} ${y0.toFixed(2)} A${r} ${r} 0 ${large} 1 ${x1.toFixed(2)} ${y1.toFixed(2)}` };
  });
  return (
    <svg width={S} height={S} viewBox={`0 0 ${S} ${S}`} aria-hidden>
      {arcs.map((s, i) => (
        <motion.path
          key={s.name}
          d={s.d}
          fill="none"
          stroke={s.color}
          strokeWidth={stroke}
          strokeLinecap="round"
          initial={false}
          animate={{ pathLength: on ? 1 : 0, opacity: on ? 1 : 0 }}
          transition={{ duration: 0.7, ease: EASE, delay: 0.15 + i * 0.12 }}
        />
      ))}
    </svg>
  );
}
