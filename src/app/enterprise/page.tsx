"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import NavDock from "@/components/NavDock";
import FooterSection from "@/components/FooterSection";
import { ArrowButton, Compatible, Pricing } from "@/components/EnterpriseBlocks";

/**
 * Enterprise page on Mural's anatomy, measured from the 1920px captures,
 * in Payloat's type and palette, with the site's ruled grid on the
 * pictures and cards:
 *   1. Hero: a short mark, a two-line headline, a paragraph, the
 *      "Get started for free" button and a text link left; a photo
 *      bleeding to the right edge, in a ruled cell.
 *   2. A black act: headline and subline, Midday's list of five stages
 *      left, and a ledger panel right (sources, dashed lines, rows
 *      streaming in) that plays each stage in turn.
 *   3. A light band: headline and button left, a ruled 3x3 grid of the
 *      companies and tools agents already run on.
 *   4. Pricing: four plan cells on one ruled row, the popular one
 *      outlined.
 *   5. Footer.
 */

const EASE = [0.25, 0.6, 0.2, 1] as const;
const INK = "#0a0a0a";
/* the ground a full-width dark act sits on, a shade above the ink the
   type and the filled controls use */
const ACT = "#1e1e1e";
const MIST = "#eeeeee";
const GREEN = "#163300";
const LIME = "#9fe870";

const up = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.55, ease: EASE },
} as const;

/* Mural's side gutter: 52px at 1920 */
const GUTTER = "px-[clamp(20px,2.7vw,52px)]";

/* the grid's small crosshair where a rule meets a rail */
function Cross({ pos, light = false }: { pos: "top-left" | "bottom-right"; light?: boolean }) {
  const at = pos === "top-left" ? "-left-[7px] -top-[7px]" : "-bottom-[7px] -right-[7px]";
  const c = light ? "bg-white/50" : "bg-black/40";
  return (
    <span className={`pointer-events-none absolute z-10 h-[13px] w-[13px] ${at}`} aria-hidden>
      <span className={`absolute left-1/2 top-0 h-full w-px -translate-x-1/2 ${c}`} />
      <span className={`absolute left-0 top-1/2 h-px w-full -translate-y-1/2 ${c}`} />
    </span>
  );
}

export default function EnterprisePage() {
  return (
    <main className="bg-white">
      <NavDock forceDark />
      <Hero />
      <Stages />
      <Compatible />
      <Pricing />
      <div style={{ backgroundColor: "#1e1e1e" }}>
        <FooterSection tone="light" />
      </div>
    </main>
  );
}

/* ------------------------------------------------------------------ */
/* 1. Hero                                                             */
/* ------------------------------------------------------------------ */

function Hero() {
  return (
    <section className="overflow-x-clip bg-white pt-[136px]">
      <div className="grid min-[1000px]:grid-cols-[52.6fr_47.4fr]">
        <div className={`${GUTTER} flex flex-col justify-center py-[clamp(48px,6vw,120px)]`}>
          {/* Mural's five-color bar: ours, black and lime */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="flex h-[8px] w-[108px]"
          >
            <span className="flex-1" style={{ backgroundColor: INK }} />
            <span className="flex-1" style={{ backgroundColor: LIME }} />
            <span className="flex-1" style={{ backgroundColor: GREEN }} />
            <span className="flex-1" style={{ backgroundColor: MIST }} />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: EASE, delay: 0.05 }}
            className="mt-[clamp(32px,3.2vw,62px)] max-w-[640px] text-[clamp(48px,5vw,96px)] font-medium leading-[0.98] tracking-[-3px] text-ink"
          >
            Every agent,
            <br />
            one ledger
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: EASE, delay: 0.12 }}
            className="mt-[clamp(32px,4.5vw,86px)] max-w-[690px] text-[clamp(18px,1.5vw,28px)] leading-[1.6] text-ink"
          >
            Give every team&apos;s agents a mandate, a cap, and a card. Payloat
            records each purchase the moment it lands, with the task behind it,
            so the company closes the month from one ledger.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: EASE, delay: 0.18 }}
            className="mt-[clamp(32px,4vw,76px)] flex flex-wrap items-center gap-x-10 gap-y-5"
          >
            <ArrowButton href="/signup" tone="lime">
              Get started for free
            </ArrowButton>
            <Link href="/product" className="border-b-[3px] border-black/25 pb-1 text-[clamp(16px,1.15vw,22px)] text-ink transition-colors hover:border-ink">
              See how it works
            </Link>
          </motion.div>
        </div>

        {/* the photo, bleeding to the right edge, in a ruled cell */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, ease: EASE, delay: 0.15 }}
          className="relative h-[clamp(360px,48vw,924px)] border-y border-l border-black/[0.08]"
        >
          <span className="pointer-events-none absolute -left-6 -top-px right-0 h-px bg-black/[0.08]" />
          <span className="pointer-events-none absolute -bottom-px -left-6 right-0 h-px bg-black/[0.08]" />
          <Cross pos="top-left" />
          <Image src="/enterprise/hero.jpg" alt="" fill priority sizes="(min-width: 1000px) 48vw, 100vw" className="object-cover" />
        </motion.div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* 2. Stages (black)                                                   */
/* ------------------------------------------------------------------ */

/* Each stage is a view of the ledger, in Midday's anatomy: the sources
   the rows come from up top, dashed lines down to the table, and the
   rows streaming in one at a time. */
type Row = { cells: string[]; tone?: "ok" | "stop" | "new" };
type Source = { label: string; icon: "bank" | "card" | "agent" | "slack" };
type Notice = { logo: string; name: string; note: string; amount: string; dark?: boolean };
type Stage =
  | { kind: "table"; title: string; desc: string; panel: string; sources: Source[]; columns: string[]; rows: Row[] }
  | { kind: "inbox"; title: string; desc: string; panel: string; sources: Source[]; notices: Notice[] }
  | { kind: "cards"; title: string; desc: string; lit: number };

const STAGES: Stage[] = [
  {
    kind: "table",
    title: "Set the mandate",
    desc: "Name what each agent is for and what it may buy.",
    panel: "Mandates",
    sources: [
      { label: "Engineering", icon: "agent" },
      { label: "Growth", icon: "agent" },
      { label: "Ops", icon: "agent" },
      { label: "Finance", icon: "slack" },
    ],
    columns: ["Agent", "Mandate", "Vendors", "Owner"],
    rows: [
      { cells: ["Research agent", "Market research, Q3", "OpenAI, AWS", "Maya"] },
      { cells: ["Ad buyer", "Paid acquisition", "Meta, Google", "Dan"] },
      { cells: ["Procurement", "Kitchen supplies", "WebstaurantStore", "Priya"] },
      { cells: ["Travel agent", "Team travel", "Delta, Marriott", "Maya"], tone: "new" },
    ],
  },
  {
    kind: "table",
    title: "Give the cap",
    desc: "Per agent, per vendor, per month. Enforced on the charge.",
    panel: "Caps",
    sources: [
      { label: "Bank", icon: "bank" },
      { label: "Card", icon: "card" },
      { label: "Agent", icon: "agent" },
      { label: "Slack", icon: "slack" },
    ],
    columns: ["Agent", "Cap", "Used", "Status"],
    rows: [
      { cells: ["Research agent", "$3,000", "$2,500", "Under cap"], tone: "ok" },
      { cells: ["Ad buyer", "$5,000", "$4,120", "Under cap"], tone: "ok" },
      { cells: ["Procurement", "$800", "$891.34", "Stopped"], tone: "stop" },
      { cells: ["Travel agent", "$2,000", "$0", "Under cap"], tone: "new" },
    ],
  },
  {
    kind: "inbox",
    title: "Read every charge",
    desc: "Each purchase lands in the inbox with the task behind it.",
    panel: "Inbox",
    sources: [
      { label: "Bank", icon: "bank" },
      { label: "Card", icon: "card" },
      { label: "Agent", icon: "agent" },
      { label: "Slack", icon: "slack" },
    ],
    notices: [
      { logo: "/logos/openai.svg", name: "OpenAI", note: "Research agent · Q3 market brief", amount: "$2,500.00" },
      { logo: "/logos/aws.svg", name: "AWS", note: "Research agent · Nightly crawl", amount: "$412.80" },
      { logo: "/logos/brex.svg", name: "Brex", note: "Ad buyer · Card issued", amount: "$0.00", dark: true },
      { logo: "/logos/stripe.svg", name: "Stripe", note: "Procurement · Kitchen restock", amount: "$96.50" },
      { logo: "/logos/claude.svg", name: "Claude", note: "Support agent · Ticket summaries", amount: "$180.00" },
    ],
  },
  {
    kind: "cards",
    title: "Match the receipts",
    desc: "Every card charge lined up against the receipt the agent recorded.",
    lit: 2,
  },
];

const STAGE_MS = 6000;
const EMPTY_ROWS = 7;

function Stages() {
  const [i, setI] = useState(0);
  /* the act runs on its own: each stage streams in, then the next; a
     click picks a stage and restarts the clock from it */
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setTimeout(() => setI((v) => (v + 1) % STAGES.length), STAGE_MS);
    return () => clearTimeout(id);
  }, [i, tick]);
  const pick = (k: number) => {
    setI(k);
    setTick((t) => t + 1);
  };
  const stage = STAGES[i];

  return (
    <section className="overflow-x-clip text-white" style={{ backgroundColor: ACT }}>
      <div className={`${GUTTER} pb-[clamp(56px,4vw,76px)] pt-[clamp(56px,3.6vw,70px)]`}>
        <motion.h2 {...up} className="text-[clamp(40px,4.2vw,80px)] font-medium leading-[1.05] tracking-[-2.5px]">
          Manage your agents&apos; spending
        </motion.h2>
        <motion.p {...up} className="mt-[clamp(20px,2.3vw,44px)] text-[clamp(16px,1.2vw,22px)] text-white/90">
          Run every agent the company uses through the same four stages, on one ledger.
        </motion.p>

        <div className="mt-[clamp(40px,4.5vw,86px)] grid gap-10 min-[900px]:grid-cols-[406fr_1372fr] min-[900px]:gap-[42px]">
          {/* the stages, Midday's list: a marker rail on the left, the
              active title inked in with its line, the rest dimmed */}
          <ul className="relative self-center border-l border-white/15">
            {STAGES.map((s, k) => (
              <li key={s.title} className="relative">
                {k === i && (
                  <motion.span layoutId="stageMark" className="absolute -left-px top-1/2 h-[22px] w-[3px] -translate-y-1/2 bg-white" />
                )}
                <button
                  type="button"
                  onClick={() => pick(k)}
                  className="w-full py-[clamp(12px,1.1vw,20px)] pl-7 text-left"
                >
                  <span className={`block text-[clamp(22px,1.7vw,32px)] font-medium tracking-[-0.8px] transition-colors duration-300 ${k === i ? "text-white" : "text-white/35"}`}>
                    {s.title}
                  </span>
                  <AnimatePresence initial={false}>
                    {k === i && (
                      <motion.span
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: EASE }}
                        className="block overflow-hidden"
                      >
                        <span className="block max-w-[340px] pt-2 text-[clamp(14px,1vw,18px)] leading-[1.45] text-white/70">{s.desc}</span>
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>
              </li>
            ))}
          </ul>

          {/* the panel in a ruled cell. The cell holds its height across
              stages: the tallest stage (the table) is laid out invisibly
              underneath as a sizer, and the live stage sits over it,
              centered when it is shorter. */}
          <div className="relative border border-white/15 bg-white text-ink">
            <span className="pointer-events-none absolute -left-6 -right-6 -top-px h-px bg-white/15" />
            <span className="pointer-events-none absolute -bottom-px -left-6 -right-6 h-px bg-white/15" />
            <Cross pos="top-left" light />
            <Cross pos="bottom-right" light />
            <div className="invisible" aria-hidden>
              <LedgerPanel stage={STAGES[0] as Extract<Stage, { kind: "table" }>} still />
            </div>
            <div className="absolute inset-0 flex flex-col justify-center">
              {stage.kind === "table" && <LedgerPanel key={`${i}-${tick}`} stage={stage} />}
              {stage.kind === "inbox" && <InboxPanel key={`${i}-${tick}`} stage={stage} />}
              {stage.kind === "cards" && <CardsPanel key={`${i}-${tick}`} stage={stage} />}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* Midday's panel: the title over a rule, the sources with dashed lines
   down to the table's head, the rows streaming in, the empty rows
   ruled below. Everything animates in on mount, so a stage change
   re-mounts it. */
function LedgerPanel({ stage, still = false }: { stage: Extract<Stage, { kind: "table" }>; still?: boolean }) {
  /* still: the sizer copy, laid out at rest with no motion */
  if (still) {
    return (
      <div className="px-[clamp(20px,4vw,72px)] py-[clamp(24px,3vw,56px)]">
        <p className="border-b border-black/[0.12] pb-4 text-[clamp(15px,1.05vw,19px)] font-medium">{stage.panel}</p>
        <div className="mt-[clamp(28px,3vw,56px)] h-[clamp(120px,10vw,190px)]" />
        <div className="border border-black/[0.12] text-[clamp(11px,0.8vw,15px)]">
          <div className="grid grid-cols-[15%_35%_22%_28%] border-b border-black/[0.12]">
            {stage.columns.map((c) => (
              <span key={c} className="px-3 py-2.5">{c}</span>
            ))}
          </div>
          {stage.rows.map((r) => (
            <div key={r.cells.join()} className="grid grid-cols-[15%_35%_22%_28%] border-b border-black/[0.12]">
              {r.cells.map((c, j) => (
                <span key={j} className="truncate px-3 py-2.5">{c}</span>
              ))}
            </div>
          ))}
          {Array.from({ length: EMPTY_ROWS }).map((_, k) => (
            <div key={k} className="border-b border-black/[0.08] last:border-b-0">
              <span className="block h-[clamp(28px,2.2vw,40px)]" />
            </div>
          ))}
        </div>
      </div>
    );
  }
  const cols = "grid-cols-[15%_35%_22%_28%]";
  const tone = (t?: Row["tone"]) =>
    t === "stop" ? "#b3261e" : t === "ok" ? GREEN : t === "new" ? "rgba(10,10,10,0.35)" : INK;
  return (
    <div className="px-[clamp(20px,4vw,72px)] py-[clamp(24px,3vw,56px)]">
      <p className="border-b border-black/[0.12] pb-4 text-[clamp(15px,1.05vw,19px)] font-medium">{stage.panel}</p>

      <Sources sources={stage.sources} />

      {/* the table */}
      <div className="border border-black/[0.12] text-[clamp(11px,0.8vw,15px)]">
        <div className={`grid ${cols} border-b border-black/[0.12]`} style={{ backgroundColor: MIST }}>
          {stage.columns.map((c) => (
            <span key={c} className="border-l border-black/[0.12] px-3 py-2.5 text-ink/70 first:border-l-0">{c}</span>
          ))}
        </div>
        {stage.rows.map((r, k) => (
          <motion.div
            key={r.cells.join()}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: EASE, delay: 0.9 + k * 0.55 }}
            className={`grid ${cols} border-b border-black/[0.12]`}
            style={{ color: tone(r.tone) }}
          >
            {r.cells.map((c, j) => (
              <span key={j} className={`truncate border-l border-black/[0.12] px-3 py-2.5 first:border-l-0 ${j === 1 ? "font-medium" : ""} ${j === 2 ? "font-numeral tabular-nums" : ""}`}>
                {j === 3 && r.tone && r.tone !== "new" && (
                  <span className="mr-2 inline-block h-[9px] w-[9px] align-middle" style={{ backgroundColor: tone(r.tone) }} />
                )}
                {c}
              </span>
            ))}
          </motion.div>
        ))}
        {Array.from({ length: EMPTY_ROWS }).map((_, k) => (
          <div key={k} className={`grid ${cols} border-b border-black/[0.08] last:border-b-0`}>
            {stage.columns.map((c) => (
              <span key={c} className="h-[clamp(28px,2.2vw,40px)] border-l border-black/[0.08] first:border-l-0" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/* the sources over the second, third, fourth, and fifth tenths of the
   panel, each with a dashed line drawn down to what follows */
function Sources({ sources }: { sources: Source[] }) {
  return (
    <div className="relative mt-[clamp(28px,3vw,56px)] h-[clamp(120px,10vw,190px)]">
      {sources.map((src, k) => {
        const left = 22 + k * 19;
        return (
          <div key={src.label + k} className="absolute top-0 flex -translate-x-1/2 flex-col items-center" style={{ left: `${left}%` }}>
            <motion.span
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: EASE, delay: 0.1 + k * 0.08 }}
              className="text-[clamp(9px,0.65vw,12px)] text-ink/60"
            >
              {src.label}
            </motion.span>
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: EASE, delay: 0.15 + k * 0.08 }}
              className="mt-1.5 flex h-[clamp(28px,2.2vw,40px)] w-[clamp(28px,2.2vw,40px)] items-center justify-center"
              style={{ backgroundColor: MIST }}
            >
              <SourceIcon kind={src.icon} />
            </motion.span>
            <motion.span
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ duration: 0.6, ease: EASE, delay: 0.4 + k * 0.08 }}
              className="mt-1 w-px origin-top"
              style={{
                height: "clamp(56px,6vw,120px)",
                backgroundImage: "linear-gradient(to bottom, rgba(10,10,10,0.35) 50%, transparent 50%)",
                backgroundSize: "1px 6px",
              }}
            />
          </div>
        );
      })}
    </div>
  );
}

/* the inbox: the goal act's notification bars, each charge landing at
   the top and pushing the rest down, like a bank's transaction feed */
function InboxPanel({ stage }: { stage: Extract<Stage, { kind: "inbox" }> }) {
  return (
    <div className="px-[clamp(20px,4vw,72px)] py-[clamp(24px,3vw,56px)]">
      <p className="border-b border-black/[0.12] pb-4 text-[clamp(15px,1.05vw,19px)] font-medium">{stage.panel}</p>
      <Sources sources={stage.sources} />
      <div className="mx-auto flex max-w-[560px] flex-col gap-3">
        {stage.notices.map((n, k) => (
          <motion.div
            key={n.name + k}
            initial={{ opacity: 0, y: -18, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 380, damping: 26, delay: 0.9 + k * 0.6 }}
            className="flex items-center gap-3 border border-black/[0.1] py-[6px] pl-[6px] pr-3"
            style={{ backgroundColor: n.dark ? INK : MIST, color: n.dark ? "#ffffff" : INK }}
          >
            <span className="flex h-[43px] w-[43px] shrink-0 items-center justify-center bg-white">
              <Image src={n.logo} alt="" width={22} height={22} className="h-[22px] w-[22px] object-contain" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[16px] font-semibold leading-tight">{n.name}</span>
              <span className="block truncate text-[13px] leading-snug" style={{ opacity: 0.6 }}>{n.note}</span>
            </span>
            <span className="text-[16px] font-semibold tabular-nums">{n.amount}</span>
            <svg width="10" height="10" viewBox="0 0 16 16" fill="none" aria-hidden className="shrink-0" style={{ opacity: 0.5 }}>
              <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* Ramp's anatomy: a ruled grid of six tiles, a title and a line in each,
   the stage's tile lit */
const TILES: [string, string][] = [
  ["Caps", "Per agent, per vendor, per month, enforced on the charge."],
  ["Approvals", "Anything over a cap waits for the budget owner in Slack."],
  ["Receipts", "Every card charge matched to the receipt the agent recorded."],
  ["Vendors", "Spend by vendor across every team and every agent."],
  ["Close", "The month drafted by Payle, reviewed by your team."],
  ["Exports", "The ledger, receipts, and approvals, ready for the audit."],
];

function CardsPanel({ stage }: { stage: Extract<Stage, { kind: "cards" }> }) {
  return (
    <div className="px-[clamp(20px,4vw,72px)] py-[clamp(24px,3vw,56px)]">
      <div className="relative">
        <div className="grid border border-black/[0.12] min-[700px]:grid-cols-3">
          {TILES.map(([t, d], k) => (
            <motion.div
              key={t}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: EASE, delay: 0.1 + k * 0.08 }}
              className={`flex min-h-[clamp(150px,13vw,240px)] flex-col justify-between border-black/[0.12] p-[clamp(14px,1.3vw,24px)] ${k % 3 ? "min-[700px]:border-l" : ""} ${k >= 3 ? "min-[700px]:border-t" : ""} ${k > 0 ? "border-t min-[700px]:border-t-0" : ""} ${k >= 3 ? "min-[700px]:border-t" : ""}`}
              style={{ backgroundColor: k === stage.lit ? "#ffffff" : MIST }}
            >
              <p className="text-[clamp(15px,1.1vw,20px)] font-medium text-ink">{t}</p>
              <p className="max-w-[260px] text-[clamp(11px,0.75vw,13px)] leading-[1.4] text-ink/60">{d}</p>
            </motion.div>
          ))}
        </div>

      </div>
    </div>
  );
}

function SourceIcon({ kind }: { kind: "bank" | "card" | "agent" | "slack" }) {
  const s = { stroke: INK, strokeWidth: 1.4, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, fill: "none" };
  return (
    <svg width="55%" height="55%" viewBox="0 0 20 20" aria-hidden>
      {kind === "bank" && (
        <>
          <path d="M3 8 10 4l7 4" {...s} />
          <path d="M4 8v7M8 8v7M12 8v7M16 8v7M3 16h14" {...s} />
        </>
      )}
      {kind === "card" && (
        <>
          <rect x="3" y="5" width="14" height="10" rx="1.5" {...s} />
          <path d="M3 9h14" {...s} />
        </>
      )}
      {kind === "agent" && (
        <>
          <rect x="4" y="4" width="12" height="12" rx="2" {...s} />
          <path d="M8 9h.01M12 9h.01M8 12.5h4" {...s} />
        </>
      )}
      {kind === "slack" && (
        <>
          <path d="M7 3v14M13 3v14M3 7h14M3 13h14" {...s} />
        </>
      )}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Shared                                                              */
/* ------------------------------------------------------------------ */

