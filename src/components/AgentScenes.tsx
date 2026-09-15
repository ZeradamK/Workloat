"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, animate, motion } from "motion/react";

/**
 * The scenes inside the product page's black canvas, one per tab. Each is
 * a different drawing of the same investing agent, in mono chips and thin
 * lines on black, and each animates in when its tab is chosen:
 *
 *  Mandate        the six terms of the mandate converge down curved lines
 *                 into the agent (Titan Intake's capture funnel)
 *  Caps           four budget gauges fill to their share, the one near its
 *                 cap turns amber and raises an alert (our own bars)
 *  Orders         an order card travels a pipeline, lighting each stage as
 *                 it passes (Linear's timeline)
 *  Confirmations  what the agent recorded on the left, what the broker
 *                 confirmed on the right, lines drawn between the pairs,
 *                 one left open (Customer.io's source-to-destination map)
 *  Reporting      the position draws itself as a line while the figures
 *                 count up (the Origin forecast we use elsewhere)
 */

const EASE = [0.25, 0.6, 0.2, 1] as const;
const MONO = "ui-monospace, SFMono-Regular, Menlo, monospace";
/* every color comes from the canvas: it sets these variables for a dark
   or a light ground */
const FG = "var(--sc-fg)";
const MUTED = "var(--sc-muted)";
const LINE = "var(--sc-line)";
const FILL = "var(--sc-fill)";
const TRACK = "var(--sc-track)";
const AMBER = "#f0b36a";
const GREEN = "#3ddc97";

export type SceneKey = "mandate" | "caps" | "orders" | "confirmations" | "reporting";

export default function AgentScene({ scene }: { scene: SceneKey }) {
  return (
    <div className="relative mx-auto w-full max-w-[600px]" style={{ aspectRatio: "4 / 3" }}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={scene}
          className="absolute inset-0"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3, ease: EASE }}
        >
          {scene === "mandate" && <Mandate />}
          {scene === "caps" && <Caps />}
          {scene === "orders" && <Orders />}
          {scene === "confirmations" && <Confirmations />}
          {scene === "reporting" && <Reporting />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ---------- pieces ---------- */

function Chip({ children, tone = "dark", className, style }: { children: React.ReactNode; tone?: "dark" | "light" | "amber" | "green"; className?: string; style?: React.CSSProperties }) {
  const tones = {
    dark: { backgroundColor: "var(--sc-chip-bg)", border: "1px solid var(--sc-chip-border)", color: FG },
    light: { backgroundColor: "var(--sc-chip-on-bg)", border: "1px solid var(--sc-chip-on-bg)", color: "var(--sc-chip-on-fg)" },
    amber: { backgroundColor: "rgba(240,179,106,0.14)", border: `1px solid ${AMBER}`, color: AMBER },
    green: { backgroundColor: "rgba(61,220,151,0.12)", border: `1px solid ${GREEN}`, color: GREEN },
  } as const;
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-[8px] px-3 py-2 text-[10px] font-medium tracking-[0.14em] ${className ?? ""}`}
      style={{ fontFamily: MONO, ...tones[tone], ...style }}
    >
      {children}
    </span>
  );
}

function Mark({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <Image src="/payloat-icon-dark.svg" alt="" width={30} height={30} className="h-[30px] w-[30px]" style={{ filter: "var(--sc-icon)" }} />
      <span className="text-[10px] font-medium tracking-[0.16em]" style={{ fontFamily: MONO, color: FG }}>
        {label}
      </span>
    </div>
  );
}

/* counts from 0 to `to` when mounted */
function Count({ to, prefix = "", suffix = "", decimals = 0, duration = 1.2, delay = 0 }: { to: number; prefix?: string; suffix?: string; decimals?: number; duration?: number; delay?: number }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    const c = animate(0, to, { duration, delay, ease: EASE, onUpdate: setV });
    return () => c.stop();
  }, [to, duration, delay]);
  return (
    <>
      {prefix}
      {v.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
      {suffix}
    </>
  );
}

/* ---------- 1. mandate: the terms funnel into the agent ---------- */

const TERMS = ["SCOPE", "TICKERS", "HORIZON", "RISK", "REBALANCE", "LIMITS"];

function Mandate() {
  const xs = TERMS.map((_, i) => 60 + (i * 480) / (TERMS.length - 1));
  return (
    <div className="absolute inset-0">
      <svg viewBox="0 0 600 450" className="absolute inset-0 h-full w-full" aria-hidden>
        {xs.map((x, i) => (
          <motion.path
            key={i}
            d={`M${x} 70 C ${x} 190, 300 190, 300 300`}
            fill="none"
            stroke={LINE}
            strokeWidth="1"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.15 + i * 0.08 }}
          />
        ))}
        {/* a pulse that runs the lines into the center, over and over */}
        {xs.map((x, i) => (
          <motion.circle
            key={`p${i}`}
            r="2.4"
            fill={FG}
            initial={{ offsetDistance: "0%", opacity: 0 }}
            animate={{ offsetDistance: ["0%", "100%"], opacity: [0, 1, 1, 0] }}
            transition={{ duration: 2.4, ease: "easeInOut", delay: 1.2 + i * 0.35, repeat: Infinity, repeatDelay: 2.4 }}
            style={{ offsetPath: `path("M${x} 70 C ${x} 190, 300 190, 300 300")` }}
          />
        ))}
      </svg>
      {TERMS.map((t, i) => (
        <motion.div
          key={t}
          className="absolute -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${(xs[i] / 600) * 100}%`, top: `${(70 / 450) * 100}%` }}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: EASE, delay: i * 0.08 }}
        >
          <Chip>{t}</Chip>
        </motion.div>
      ))}
      <motion.div
        className="absolute left-1/2 -translate-x-1/2"
        style={{ top: `${(300 / 450) * 100}%` }}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: EASE, delay: 0.9 }}
      >
        <div className="rounded-[14px] px-6 py-4" style={{ backgroundColor: "var(--sc-chip-bg)", border: "1px solid var(--sc-chip-border)" }}>
          <Mark label="MANDATE, SIGNED" />
        </div>
      </motion.div>
    </div>
  );
}

/* ---------- 2. caps: four gauges fill, one runs hot ---------- */

const GAUGES = [
  { label: "PER ORDER", used: 216.5, cap: 500 },
  { label: "PER DAY", used: 1240, cap: 2000 },
  { label: "PER MONTH", used: 3240, cap: 5000 },
  { label: "AAPL", used: 1900, cap: 2000 },
] as const;

function Caps() {
  return (
    <div className="absolute inset-0 flex flex-col justify-center gap-5 px-2 min-[520px]:px-8">
      {GAUGES.map((g, i) => {
        const pct = g.used / g.cap;
        const hot = pct >= 0.9;
        return (
          <div key={g.label} className="flex items-center gap-4">
            <Chip tone={hot ? "amber" : "dark"} className="w-[112px] justify-center">
              {g.label}
            </Chip>
            <div className="relative h-[10px] flex-1 overflow-hidden rounded-full" style={{ backgroundColor: TRACK }}>
              <motion.div
                className="absolute inset-y-0 left-0 rounded-full"
                style={{ backgroundColor: hot ? AMBER : FG }}
                initial={{ width: 0 }}
                animate={{ width: `${pct * 100}%` }}
                transition={{ duration: 1.1, ease: EASE, delay: 0.2 + i * 0.12 }}
              />
              {/* the cap mark */}
              <span className="absolute inset-y-0 right-0 w-[2px]" style={{ backgroundColor: LINE }} />
            </div>
            <span className="font-numeral w-[72px] text-right text-[13px] tabular-nums" style={{ color: FG }}>
              <Count to={pct * 100} suffix="%" delay={0.2 + i * 0.12} />
            </span>
          </div>
        );
      })}
      <motion.div
        className="mt-2 flex items-center gap-3 self-start"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE, delay: 1.5 }}
      >
        <Chip tone="amber">ALERT</Chip>
        <span className="text-[12px]" style={{ color: MUTED }}>AAPL is at 95% of its cap. The next order over $100 stops.</span>
      </motion.div>
    </div>
  );
}

/* ---------- 3. orders: a card travels the pipeline ---------- */

const STAGES = ["INTENT", "CHECKOUT", "FILL", "RECEIPT"];

function Orders() {
  const [stage, setStage] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setStage((s) => (s + 1) % (STAGES.length + 1)), 1400);
    return () => window.clearInterval(id);
  }, []);
  const at = Math.min(stage, STAGES.length - 1);
  const xs = STAGES.map((_, i) => 12 + (i * 76) / (STAGES.length - 1));
  return (
    <div className="absolute inset-0">
      {/* the track */}
      <div className="absolute left-[12%] right-[12%] top-1/2 h-px" style={{ backgroundColor: LINE }} />
      <motion.div
        className="absolute left-[12%] top-1/2 h-px"
        style={{ backgroundColor: FG }}
        animate={{ width: `${(at * 76) / (STAGES.length - 1)}%` }}
        transition={{ duration: 0.8, ease: EASE }}
      />
      {STAGES.map((s, i) => (
        <div key={s} className="absolute -translate-x-1/2" style={{ left: `${xs[i]}%`, top: "50%" }}>
          <motion.span
            className="absolute left-1/2 top-0 h-[10px] w-[10px] -translate-x-1/2 -translate-y-1/2 rounded-full"
            animate={{ scale: i === at ? 1.4 : 1 }}
            style={{ border: "1px solid", backgroundColor: i <= at ? FG : "var(--sc-chip-bg)", borderColor: i <= at ? FG : LINE }}
            transition={{ duration: 0.4, ease: EASE }}
          />
          <div className="absolute left-1/2 top-[22px] -translate-x-1/2">
            <Chip tone={i === at ? "light" : "dark"}>{s}</Chip>
          </div>
        </div>
      ))}
      {/* the order card, riding above the track */}
      <motion.div
        className="absolute -translate-x-1/2"
        style={{ top: "18%" }}
        animate={{ left: `${xs[at]}%` }}
        transition={{ duration: 0.8, ease: EASE }}
      >
        <div className="w-[236px] rounded-[12px] px-4 py-3" style={{ backgroundColor: "var(--sc-card-bg)", color: "var(--sc-card-fg)", border: "1px solid var(--sc-chip-border)" }}>
          <div className="flex items-center justify-between gap-3">
            <span className="whitespace-nowrap text-[13px] font-semibold">AAPL · 12 shares</span>
            <span className="font-numeral text-[13px] font-semibold tabular-nums">$2,340.50</span>
          </div>
          <p className="mt-0.5 text-[11px]" style={{ color: "var(--sc-card-muted)" }}>Investing agent · Rebalance to 60/40</p>
          <AnimatePresence mode="wait" initial={false}>
            <motion.p
              key={STAGES[at]}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-2 text-[10px] font-medium tracking-[0.12em]"
              style={{ fontFamily: MONO, color: "var(--sc-card-fg)" }}
            >
              {["INTENT POSTED", "ORDER PLACED", "FILLED AT $195.04", "CONFIRMATION MATCHED"][at]}
            </motion.p>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

/* ---------- 4. confirmations: recorded on the left, confirmed on the right ---------- */

const PAIRS = [
  { left: "AAPL · 12 sh", right: "AAPL · 12 sh", ok: true },
  { left: "MSFT · 4 sh", right: "MSFT · 4 sh", ok: true },
  { left: "VTI · 20 sh", right: "VTI · 20 sh", ok: true },
  { left: "NVDA · 3 sh", right: null, ok: false },
] as const;

function Confirmations() {
  const ys = PAIRS.map((_, i) => 24 + i * 18);
  return (
    <div className="absolute inset-0">
      <div className="absolute left-[8%] top-[6%] text-[10px] tracking-[0.16em]" style={{ fontFamily: MONO, color: MUTED }}>
        AGENT RECORDED
      </div>
      <div className="absolute right-[8%] top-[6%] text-[10px] tracking-[0.16em]" style={{ fontFamily: MONO, color: MUTED }}>
        BROKER CONFIRMED
      </div>
      <svg viewBox="0 0 600 450" className="absolute inset-0 h-full w-full" aria-hidden>
        {PAIRS.map((p, i) => {
          const y = (ys[i] / 100) * 450;
          return (
            <motion.path
              key={i}
              d={`M 200 ${y} C 300 ${y}, 300 ${y}, 400 ${y}`}
              fill="none"
              stroke={p.ok ? FG : AMBER}
              strokeWidth="1"
              strokeDasharray={p.ok ? undefined : "4 5"}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: p.ok ? 1 : 0.45, opacity: 1 }}
              transition={{ duration: 0.8, ease: EASE, delay: 0.3 + i * 0.18 }}
            />
          );
        })}
      </svg>
      {PAIRS.map((p, i) => (
        <div key={i}>
          <motion.div
            className="absolute left-[8%] -translate-y-1/2"
            style={{ top: `${ys[i]}%` }}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, ease: EASE, delay: i * 0.12 }}
          >
            <Chip>{p.left}</Chip>
          </motion.div>
          <motion.div
            className="absolute right-[8%] -translate-y-1/2"
            style={{ top: `${ys[i]}%` }}
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, ease: EASE, delay: 0.9 + i * 0.18 }}
          >
            {p.right ? <Chip tone="green">✓ {p.right}</Chip> : <Chip tone="amber">MISSING · 3 DAYS</Chip>}
          </motion.div>
        </div>
      ))}
      <motion.div
        className="absolute bottom-[6%] left-[8%] flex items-center gap-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 1.9 }}
      >
        <Chip tone="green">3 OF 4 MATCHED</Chip>
        <span className="text-[12px]" style={{ color: MUTED }}>One confirmation to chase. Payloat already asked the broker.</span>
      </motion.div>
    </div>
  );
}

/* ---------- 5. reporting: the position draws itself ---------- */

const PTS = [0, 4, 3, 9, 12, 10, 16, 20, 18, 25, 28, 27, 34, 38, 36, 44, 48, 52, 50, 58];

function Reporting() {
  const W = 600;
  const H = 450;
  const padL = 24;
  const padR = 24;
  const top = 150;
  const bottom = 380;
  const pts = PTS.map((v, i) => [padL + (i * (W - padL - padR)) / (PTS.length - 1), bottom - (v / 60) * (bottom - top)] as const);
  const d = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
  return (
    <div className="absolute inset-0">
      <div className="absolute left-[4%] top-[6%] flex gap-8">
        {[
          ["POSITION", 24180, "$"],
          ["COST BASIS", 21600, "$"],
          ["P&L", 2580, "+$"],
        ].map(([label, value, prefix], i) => (
          <div key={String(label)}>
            <p className="text-[10px] tracking-[0.16em]" style={{ fontFamily: MONO, color: MUTED }}>
              {label}
            </p>
            <p className="font-numeral mt-1 text-[22px] font-semibold tabular-nums" style={{ color: i === 2 ? GREEN : FG }}>
              <Count to={Number(value)} prefix={String(prefix)} delay={0.3 + i * 0.15} />
            </p>
          </div>
        ))}
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 h-full w-full" aria-hidden>
        {[top, (top + bottom) / 2, bottom].map((y) => (
          <line key={y} x1={padL} x2={W - padR} y1={y} y2={y} stroke={TRACK} strokeDasharray="2 5" />
        ))}
        <motion.path d={`${d} L${W - padR} ${bottom} L${padL} ${bottom} Z`} fill={FILL} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 1.2 }} />
        <motion.path d={d} fill="none" stroke={FG} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.6, ease: EASE, delay: 0.2 }} />
        <motion.circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r="5" fill={FG} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3, delay: 1.8 }} />
      </svg>
      <div className="absolute bottom-[4%] left-[4%] right-[4%] flex flex-wrap gap-2">
        {["BY AGENT", "BY TICKER", "COST BASIS", "EXPORT CSV"].map((c, i) => (
          <motion.div key={c} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: EASE, delay: 1.6 + i * 0.08 }}>
            <Chip>{c}</Chip>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
