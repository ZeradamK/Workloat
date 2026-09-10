"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";

/**
 * Founder pitch: control who spends with agents. A gray box (the Slack
 * act's language: #eeeeee, 30px radius, 100px from the viewport edges)
 * with the headline and copy at the top and a white screen rising from
 * the bottom, cropped by the box. The screen is the Payloat web app's
 * spend controls page, laid out at a design size and scaled to fit:
 * a stat row, spend over time, caps by team with the default policy
 * band, and the "who can spend" table. Anatomy borrowed from the
 * LangChain usage page (stat row over a chart and a breakdown), Cohere's
 * spending limit bar, Navan's policy band, and Mercury's tables.
 */

const EASE = [0.25, 0.6, 0.2, 1] as const;

const up = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.55, ease: EASE },
} as const;

/* the screen's layout size; it scales to the panel's width */
const DESIGN = { w: 1180, h: 900 };

const INK = "#0a0a0a";
const MUTED = "#706e68";
const LINE = "rgba(10,10,10,0.08)";
const FILL = "#f4f4f4";
const GREEN = "#1e9e56";
const AMBER = "#c77d00";

/* sample data, labeled as such on the screen; every value is per company
   in the product */
const TEAMS = [
  { name: "Procurement", spent: 4120, cap: 5000, owner: "Zeradam K.", key: "pl_live_7f2a", status: "Active" },
  { name: "Software & seats", spent: 2860, cap: 3000, owner: "Maya C.", key: "pl_live_c91d", status: "Near cap" },
  { name: "Ops", spent: 1450, cap: 2500, owner: "Dani R.", key: "pl_live_04be", status: "Active" },
  { name: "Travel", spent: 760, cap: 2000, owner: "Zeradam K.", key: "pl_live_e3a7", status: "Active" },
  { name: "Kitchen orders", spent: 0, cap: 1500, owner: "Dani R.", key: "pl_live_9b10", status: "Paused" },
] as const;

const fmt = (n: number) => `$${n.toLocaleString("en-US")}`;

export default function ControlSection() {
  /* the screen's animations key off the panel itself (fully visible, so
     the in-view check is not diluted by the cropped screen inside it) */
  const panelRef = useRef<HTMLDivElement>(null);
  const inView = useInView(panelRef, { once: true, amount: 0.5 });
  const reduced = useReducedMotion() ?? false;
  return (
    <section className="px-4 pb-[clamp(96px,10vw,160px)] pt-4 min-[900px]:px-[100px]">
      <div className="relative overflow-hidden rounded-[30px] bg-[#eeeeee] px-6 pt-[clamp(40px,5vw,72px)] min-[900px]:px-12">
        {/* the pitch */}
        <div className="grid gap-6 min-[900px]:grid-cols-[1.1fr_1fr] min-[900px]:gap-12">
          <div>
            <motion.p {...up} className="text-[13px] font-semibold uppercase tracking-[0.08em] text-sub">
              For founders
            </motion.p>
            <motion.h2
              {...up}
              className="mt-3 text-[clamp(32px,4.2vw,60px)] font-bold leading-[1.06] tracking-[-2px] text-ink"
            >
              Control who spends
              <br />
              with agents.
            </motion.h2>
          </div>
          <motion.p {...up} className="max-w-[460px] text-[17px] leading-[1.5] text-sub min-[900px]:mt-3">
            Give each agent its own key and a cap. Every purchase, from every agent, lands in one
            interface. You see the whole company&apos;s agent spend in one place, and nothing gets
            bought without a record.
          </motion.p>
        </div>

        {/* the screen: white, rising from the box's bottom, cropped */}
        <motion.div
          ref={panelRef}
          {...up}
          transition={{ ...up.transition, delay: 0.1 }}
          className="relative mx-auto mt-[clamp(32px,4vw,56px)] w-full max-w-[1180px] overflow-hidden rounded-t-[18px] bg-white"
          style={{
            height: "clamp(320px, 44vw, 600px)",
            boxShadow: "0 -1px 0 rgba(10,10,10,0.06), 0 24px 80px rgba(10,10,10,0.10)",
          }}
        >
          <ScaledScreen>
            <SpendControls on={inView || reduced} />
          </ScaledScreen>
        </motion.div>
      </div>
    </section>
  );
}

/* lays the screen out at DESIGN.w and scales it to the panel's width. On
   narrow panels it never renders below 720px wide, so the page stays
   legible and crops on the right instead of shrinking to a thumbnail. */
const MIN_W = 720;
function ScaledScreen({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setScale(Math.max(el.clientWidth, MIN_W) / DESIGN.w);
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

/* ---------- the spend controls page ---------- */

function SpendControls({ on }: { on: boolean }) {
  const total = TEAMS.reduce((s, t) => s + t.spent, 0);
  const caps = TEAMS.reduce((s, t) => s + t.cap, 0);

  return (
    <div className="h-full w-full px-8 pt-6 text-[13px]" style={{ color: INK, fontFamily: "var(--font-ios)" }}>
      {/* top bar */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[12px]" style={{ color: MUTED }}>
            Company · Sample data
          </p>
          <h3 className="mt-0.5 text-[22px] font-bold tracking-[-0.5px]">Spend controls</h3>
        </div>
        <div className="flex items-center gap-2">
          <Pill>September 2026</Pill>
          <Pill>All teams</Pill>
          <span className="rounded-full bg-[#0a0a0a] px-4 py-2 text-[12px] font-semibold text-white">Add agent</span>
        </div>
      </div>

      {/* stat row */}
      <div className="mt-5 grid grid-cols-4 gap-3">
        <Stat label="Spent this month" value={fmt(total)} note={`of ${fmt(caps)} in caps`} />
        <Stat label="Agents spending" value="17" note="1 paused" />
        <Stat label="Purchases" value="212" note="8 today" />
        <Stat label="Needs a look" value="2" note="1 near cap, 1 receipt missing" tone="amber" />
      </div>

      {/* chart + caps */}
      <div className="mt-3 grid grid-cols-[1.6fr_1fr] gap-3">
        <Card title="Spend over time" aside="Solid is recorded, dashed is the run rate">
          <SpendChart on={on} />
        </Card>
        <Card title="Caps by team" aside="Per agent, per month">
          <div className="mt-1 flex flex-col gap-3">
            {TEAMS.slice(0, 4).map((t, i) => {
              const pct = Math.min(100, Math.round((t.spent / t.cap) * 100));
              const warn = pct >= 90;
              return (
                <div key={t.name}>
                  <div className="flex items-baseline justify-between">
                    <span className="font-semibold">{t.name}</span>
                    <span className="font-numeral tabular-nums" style={{ color: warn ? AMBER : MUTED }}>
                      {fmt(t.spent)} <span style={{ color: MUTED }}>/ {fmt(t.cap)}</span>
                    </span>
                  </div>
                  <div className="mt-1.5 h-[6px] overflow-hidden rounded-full" style={{ backgroundColor: FILL }}>
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: warn ? AMBER : INK }}
                      initial={{ width: 0 }}
                      animate={{ width: on ? `${pct}%` : 0 }}
                      transition={{ duration: 0.8, ease: EASE, delay: 0.2 + i * 0.08 }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          {/* default policy band */}
          <div className="mt-4 border-t pt-3" style={{ borderColor: LINE }}>
            <p className="text-[12px] font-semibold">Default policy per purchase</p>
            <div className="mt-2 flex h-[22px] overflow-hidden rounded-[6px] text-[10px] font-semibold">
              <span className="flex flex-[2] items-center justify-center" style={{ backgroundColor: FILL, color: INK }}>
                Recorded
              </span>
              <span className="flex flex-[1.2] items-center justify-center text-white" style={{ backgroundColor: AMBER }}>
                Flagged
              </span>
              <span className="flex flex-[1] items-center justify-center text-white" style={{ backgroundColor: INK }}>
                Blocked
              </span>
            </div>
            <div className="mt-1 flex text-[10px]" style={{ color: MUTED }}>
              <span className="flex-[2]">$0</span>
              <span className="flex-[1.2]">$250</span>
              <span className="flex-[1]">$500</span>
            </div>
          </div>
        </Card>
      </div>

      {/* who can spend */}
      <Card title="Who can spend" aside="Each agent holds one key. Revoke it and the agent stops." className="mt-3">
        <table className="mt-1 w-full border-collapse text-left">
          <thead>
            <tr className="text-[11px]" style={{ color: MUTED }}>
              {["Agent", "Owner", "Key", "Cap", "This month", "Status"].map((h) => (
                <th key={h} className="border-b py-2 font-medium" style={{ borderColor: LINE }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TEAMS.map((t) => (
              <tr key={t.name} className="border-b" style={{ borderColor: LINE }}>
                <td className="py-2.5 font-semibold">
                  <span className="flex items-center gap-2">
                    <span className="flex h-[22px] w-[22px] items-center justify-center rounded-[6px] text-[10px] font-bold" style={{ backgroundColor: FILL }}>
                      {t.name[0]}
                    </span>
                    {t.name}
                  </span>
                </td>
                <td className="py-2.5">{t.owner}</td>
                <td className="py-2.5 font-mono text-[12px]" style={{ color: MUTED }}>
                  {t.key}…
                </td>
                <td className="font-numeral py-2.5 tabular-nums">{fmt(t.cap)}</td>
                <td className="font-numeral py-2.5 tabular-nums">{fmt(t.spent)}</td>
                <td className="py-2.5">
                  <Status value={t.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="flex items-center gap-1.5 rounded-full px-3 py-2 text-[12px] font-medium" style={{ border: `1px solid ${LINE}` }}>
      {children}
      <svg width="10" height="10" viewBox="0 0 16 16" fill="none" aria-hidden>
        <path d="M3 5.5 8 10.5l5-5" stroke={MUTED} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

function Stat({ label, value, note, tone }: { label: string; value: string; note: string; tone?: "amber" }) {
  return (
    <div className="rounded-[12px] px-4 py-3" style={{ border: `1px solid ${LINE}` }}>
      <p className="text-[12px]" style={{ color: MUTED }}>
        {label}
      </p>
      <p className="font-numeral mt-1 text-[26px] font-bold leading-none tracking-[-0.8px] tabular-nums" style={{ color: tone === "amber" ? AMBER : INK }}>
        {value}
      </p>
      <p className="mt-1.5 text-[11px]" style={{ color: MUTED }}>
        {note}
      </p>
    </div>
  );
}

function Card({ title, aside, className, children }: { title: string; aside?: string; className?: string; children: React.ReactNode }) {
  return (
    <div className={`rounded-[12px] px-4 py-3 ${className ?? ""}`} style={{ border: `1px solid ${LINE}` }}>
      <div className="flex items-baseline justify-between">
        <p className="text-[13px] font-semibold">{title}</p>
        {aside && (
          <p className="text-[11px]" style={{ color: MUTED }}>
            {aside}
          </p>
        )}
      </div>
      {children}
    </div>
  );
}

function Status({ value }: { value: (typeof TEAMS)[number]["status"] }) {
  const color = value === "Active" ? GREEN : value === "Near cap" ? AMBER : MUTED;
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold" style={{ border: `1px solid ${LINE}`, color }}>
      <span className="h-[6px] w-[6px] rounded-full" style={{ backgroundColor: color }} />
      {value}
    </span>
  );
}

/* cumulative spend for the month: solid to today (day 10), dashed run
   rate to the 30th; the y axis reads to the caps total */
function SpendChart({ on }: { on: boolean }) {
  const W = 700;
  const H = 210;
  const padL = 8;
  const padR = 44;
  const padT = 14;
  const padB = 26;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;
  const DAYS = 30;
  const TODAY = 10;
  const MAX = 14000;
  const spent = [0, 380, 910, 1420, 2260, 3010, 4180, 5220, 6640, 8030, 9190];
  const x = (d: number) => padL + ((d - 1) / (DAYS - 1)) * plotW;
  const y = (v: number) => padT + plotH - (v / MAX) * plotH;
  const solid = spent.map((v, i) => `${i === 0 ? "M" : "L"}${x(i + 1).toFixed(1)} ${y(v).toFixed(1)}`).join(" ");
  const area = `${solid} L${x(TODAY + 1).toFixed(1)} ${y(0)} L${x(1)} ${y(0)} Z`;
  const runRate = (9190 / TODAY) * DAYS;
  const dashed = `M${x(TODAY + 1).toFixed(1)} ${y(9190).toFixed(1)} L${x(DAYS).toFixed(1)} ${y(Math.min(MAX, runRate)).toFixed(1)}`;
  const ticks = [0, 3500, 7000, 10500, 14000];
  const labels: [number, string][] = [
    [1, "Sep 1"],
    [TODAY + 1, "Today"],
    [20, "Sep 20"],
    [30, "Sep 30"],
  ];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="mt-2 block w-full" aria-hidden>
      {ticks.map((t) => (
        <g key={t}>
          <line x1={padL} x2={padL + plotW} y1={y(t)} y2={y(t)} stroke={LINE} strokeDasharray="2 4" />
          <text x={W - padR + 10} y={y(t) + 4} fontSize="10" fill={MUTED} fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace">
            ${t / 1000}k
          </text>
        </g>
      ))}
      <motion.path d={area} fill="rgba(10,10,10,0.07)" initial={false} animate={{ opacity: on ? 1 : 0 }} transition={{ duration: 0.6, delay: 0.5 }} />
      <motion.path
        d={solid}
        fill="none"
        stroke={INK}
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
        initial={false}
        animate={{ pathLength: on ? 1 : 0, opacity: on ? 1 : 0 }}
        transition={{ duration: 1.1, ease: EASE, delay: 0.2 }}
      />
      <motion.path
        d={dashed}
        fill="none"
        stroke={INK}
        strokeWidth="1.5"
        strokeDasharray="4 5"
        initial={false}
        animate={{ opacity: on ? 0.55 : 0 }}
        transition={{ duration: 0.5, delay: 1.2 }}
      />
      <motion.g initial={false} animate={{ opacity: on ? 1 : 0 }} transition={{ duration: 0.4, delay: 1.1 }}>
        <line x1={x(TODAY + 1)} x2={x(TODAY + 1)} y1={padT} y2={padT + plotH} stroke={INK} strokeWidth="1" />
        <circle cx={x(TODAY + 1)} cy={y(9190)} r="4" fill={INK} />
      </motion.g>
      {labels.map(([d, l]) => (
        <text key={l} x={x(d)} y={H - 8} fontSize="10" fill={MUTED} textAnchor={d === 1 ? "start" : d === 30 ? "end" : "middle"} fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace">
          {l}
        </text>
      ))}
    </svg>
  );
}
