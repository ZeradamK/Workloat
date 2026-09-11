"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";

/**
 * Track everything, on Origin's three-card anatomy: a centered headline
 * with a two-line lead and a pill button, then three tall rounded cards.
 * Each card carries a dark translucent panel near its top (spend by day,
 * caps per agent, upcoming charges on a calendar) and a caption at its
 * foot. The cards' grounds are #eeeeee for now; photos come later, so the
 * card ground and caption color are the two constants to change.
 */

const EASE = [0.25, 0.6, 0.2, 1] as const;

const up = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.55, ease: EASE },
} as const;

/* the card grounds and the captions on them; swap when the photos land */
const CARD_BG = "#eeeeee";
const CAPTION = "#0a0a0a";
const CAPTION_SUB = "#706e68";

/* the dark panels inside the cards */
const PANEL = "rgba(12,12,12,0.86)";
const PANEL_LINE = "rgba(255,255,255,0.1)";
const EYEBROW = "text-[11px] font-semibold uppercase tracking-[0.16em] text-white/60";

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

export default function TrackSection() {
  return (
    <section className="mx-auto max-w-[1200px] px-6 py-[clamp(56px,7vw,112px)]">
      {/* the head */}
      <div className="mx-auto max-w-[560px] text-center">
        <motion.h2 {...up} className="text-[clamp(38px,5vw,72px)] font-bold leading-[1.02] tracking-[-2.5px] text-ink">
          Track everything
        </motion.h2>
        <motion.p {...up} className="mt-5 text-[16px] font-semibold text-ink">
          Every agent, every charge.
        </motion.p>
        <motion.p {...up} className="mt-1 text-[16px] leading-[1.5] text-sub">
          Connect your banks and give each agent a key to see all of it in one place. Easy to
          find, easy to understand.
        </motion.p>
        <motion.div {...up} className="mt-7">
          <Link
            href="/ledger"
            className="inline-flex h-12 items-center rounded-full bg-[#0a0a0a] px-6 text-[13px] font-semibold uppercase tracking-[0.08em] text-white transition-transform hover:scale-[1.03] active:scale-[0.97]"
          >
            More about the ledger
          </Link>
        </motion.div>
      </div>

      {/* the three cards */}
      <div className="mt-12 grid gap-5 min-[800px]:mt-16 min-[800px]:grid-cols-3">
        {/* 1. spend this month */}
        <Card title="Monitor agent spend" body="See every purchase, by agent and by day, the moment it lands.">
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
        </Card>

        {/* 2. caps per agent */}
        <Card title="Set a cap per agent" body="Each agent gets a cap. Payloat tracks it against every purchase all month long.">
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
        </Card>

        {/* 3. upcoming charges */}
        <Card title="Catch renewals early" body="Find, review, and stop the subscriptions your agents hold, in seconds.">
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
        </Card>
      </div>
    </section>
  );
}

/* a tall card: the panel sits in the upper part, the caption at the foot */
function Card({ title, body, children }: { title: string; body: string; children: React.ReactNode }) {
  return (
    <motion.div {...up} className="flex min-h-[640px] flex-col rounded-[22px] px-5 pb-6 pt-[72px] min-[800px]:min-h-[700px] min-[800px]:pt-[84px]" style={{ backgroundColor: CARD_BG }}>
      {children}
      <div className="mt-auto pt-10">
        <p className="text-[16px] font-semibold" style={{ color: CAPTION }}>
          {title}
        </p>
        <p className="mt-1 text-[15px] leading-[1.5]" style={{ color: CAPTION_SUB }}>
          {body}
        </p>
      </div>
    </motion.div>
  );
}

function Panel({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-[16px]" style={{ backgroundColor: PANEL, border: `1px solid ${PANEL_LINE}`, backdropFilter: "blur(10px)" }}>
      {children}
    </div>
  );
}

/* Origin's budget bar: a solid fill, a dashed tail to the projected mark,
   the share at the right */
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
