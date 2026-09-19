"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import NavDock from "@/components/NavDock";
import FooterSection from "@/components/FooterSection";

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
      <FooterSection />
    </main>
  );
}

/* ------------------------------------------------------------------ */
/* 1. Hero                                                             */
/* ------------------------------------------------------------------ */

function Hero() {
  return (
    <section className="overflow-x-clip bg-white pt-[120px]">
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
type Stage = {
  title: string;
  desc: string;
  panel: string;
  sources: { label: string; icon: "bank" | "card" | "agent" | "slack" }[];
  columns: string[];
  rows: Row[];
};

const STAGES: Stage[] = [
  {
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
    title: "Read every charge",
    desc: "Each purchase lands with the task behind it.",
    panel: "Charges",
    sources: [
      { label: "Bank", icon: "bank" },
      { label: "Card", icon: "card" },
      { label: "Agent", icon: "agent" },
      { label: "Slack", icon: "slack" },
    ],
    columns: ["Date", "Description", "Amount", "Task"],
    rows: [
      { cells: ["Sep 18", "OpenAI", "$2,500.00", "Q3 market brief"] },
      { cells: ["Sep 18", "AWS", "$412.80", "Nightly crawl"] },
      { cells: ["Sep 17", "WebstaurantStore", "$96.50", "Kitchen restock"] },
      { cells: ["Sep 17", "Delta", "$438.00", "Offsite, Austin"], tone: "new" },
    ],
  },
  {
    title: "Match the receipts",
    desc: "Confirmations lined up against what the agent recorded.",
    panel: "Receipts",
    sources: [
      { label: "Bank", icon: "bank" },
      { label: "Card", icon: "card" },
      { label: "Agent", icon: "agent" },
      { label: "Slack", icon: "slack" },
    ],
    columns: ["Date", "Description", "Amount", "Receipt"],
    rows: [
      { cells: ["Sep 18", "OpenAI", "$2,500.00", "Matched"], tone: "ok" },
      { cells: ["Sep 18", "AWS", "$412.80", "Matched"], tone: "ok" },
      { cells: ["Sep 17", "WebstaurantStore", "$96.50", "Matched"], tone: "ok" },
      { cells: ["Sep 17", "Instacart", "$64.20", "Missing, 3 days"], tone: "stop" },
    ],
  },
  {
    title: "Close the month",
    desc: "One ledger, by team and by agent, before the statement.",
    panel: "September close",
    sources: [
      { label: "Engineering", icon: "agent" },
      { label: "Growth", icon: "agent" },
      { label: "Ops", icon: "agent" },
      { label: "Finance", icon: "slack" },
    ],
    columns: ["Team", "Agents", "Spent", "Status"],
    rows: [
      { cells: ["Engineering", "4", "$9,190.00", "Closed"], tone: "ok" },
      { cells: ["Growth", "3", "$12,480.00", "Closed"], tone: "ok" },
      { cells: ["Ops", "2", "$1,450.34", "Closed"], tone: "ok" },
      { cells: ["Company", "9", "$23,120.34", "Ready to send"], tone: "new" },
    ],
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
    <section className="overflow-x-clip text-white" style={{ backgroundColor: INK }}>
      <div className={`${GUTTER} pb-[clamp(56px,4vw,76px)] pt-[clamp(56px,3.6vw,70px)]`}>
        <motion.h2 {...up} className="text-[clamp(40px,4.2vw,80px)] font-medium leading-[1.05] tracking-[-2.5px]">
          Start strict, close sooner
        </motion.h2>
        <motion.p {...up} className="mt-[clamp(20px,2.3vw,44px)] text-[clamp(16px,1.2vw,22px)] text-white/90">
          Run every agent the company uses through the same five stages, on one ledger.
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

          {/* the ledger panel in a ruled cell */}
          <div className="relative border border-white/15 bg-white text-ink">
            <span className="pointer-events-none absolute -left-6 -right-6 -top-px h-px bg-white/15" />
            <span className="pointer-events-none absolute -bottom-px -left-6 -right-6 h-px bg-white/15" />
            <Cross pos="top-left" light />
            <Cross pos="bottom-right" light />
            <LedgerPanel key={`${i}-${tick}`} stage={stage} />
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
function LedgerPanel({ stage }: { stage: Stage }) {
  const cols = "grid-cols-[15%_35%_22%_28%]";
  const tone = (t?: Row["tone"]) =>
    t === "stop" ? "#b3261e" : t === "ok" ? GREEN : t === "new" ? "rgba(10,10,10,0.35)" : INK;
  return (
    <div className="px-[clamp(20px,4vw,72px)] py-[clamp(24px,3vw,56px)]">
      <p className="border-b border-black/[0.12] pb-4 text-[clamp(15px,1.05vw,19px)] font-medium">{stage.panel}</p>

      {/* the sources, over the second, third, fourth, and fifth tenths of
          the table, each with a dashed line down to the head */}
      <div className="relative mt-[clamp(28px,3vw,56px)] h-[clamp(120px,10vw,190px)]">
        {stage.sources.map((src, k) => {
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
              {/* the dashed line, drawn down */}
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
/* 3. Compatible                                                       */
/* ------------------------------------------------------------------ */

const STACK = [
  { src: "/logos/openai.svg", alt: "OpenAI" },
  { src: "/logos/aws.svg", alt: "AWS" },
  { src: "/logos/stripe-wordmark.svg", alt: "Stripe", low: true },
  { src: "/logos/oracle.svg", alt: "Oracle", low: true },
  { src: "/logos/brex.svg", alt: "Brex" },
  { src: "/logos/claude.svg", alt: "Claude" },
  { src: "/logos/vercel.svg", alt: "Vercel" },
  { src: "/logos/banks/capitalone.svg", alt: "Capital One", low: true },
  { src: "/logos/banks/citi.png", alt: "Citi" },
];

function Compatible() {
  return (
    <section className="overflow-x-clip" style={{ backgroundColor: MIST }}>
      <div className={`${GUTTER} grid items-center gap-12 py-[clamp(64px,5.3vw,102px)] min-[900px]:grid-cols-[847fr_973fr] min-[900px]:gap-[clamp(32px,2.7vw,52px)]`}>
        <div>
          <motion.h2 {...up} className="max-w-[720px] text-[clamp(32px,2.9vw,56px)] font-medium leading-[1.12] tracking-[-1.8px] text-ink">
            Compatible with every enterprise company running agents
          </motion.h2>
          <motion.div {...up} className="mt-[clamp(28px,2.6vw,50px)]">
            <ArrowButton href="/contact">Book a demo</ArrowButton>
          </motion.div>
        </div>

        {/* the 3x3 ruled grid */}
        <motion.div {...up} className="relative grid grid-cols-3 border border-black/[0.12] bg-transparent">
          <span className="pointer-events-none absolute -left-6 -right-6 -top-px h-px bg-black/[0.12]" />
          <span className="pointer-events-none absolute -bottom-px -left-6 -right-6 h-px bg-black/[0.12]" />
          <Cross pos="top-left" />
          <Cross pos="bottom-right" />
          {STACK.map((l, k) => (
            <div
              key={l.alt}
              className={`flex h-[clamp(80px,6.8vw,130px)] items-center justify-center border-black/[0.12] ${k % 3 ? "border-l" : ""} ${k >= 3 ? "border-t" : ""}`}
            >
              <Image
                src={l.src}
                alt={l.alt}
                width={140}
                height={40}
                className={`w-auto brightness-0 ${l.low ? "h-[clamp(12px,1vw,20px)]" : "h-[clamp(22px,1.9vw,36px)]"}`}
              />
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* 4. Pricing                                                          */
/* ------------------------------------------------------------------ */

const PLANS: {
  name: string;
  blurb: string;
  price: string | null;
  cents?: string;
  per: string[];
  cta: string;
  href: string;
  tone: "dark" | "lime";
  popular?: boolean;
  featuresHead: string;
  features: { text: string; paid?: boolean }[];
}[] = [
  {
    name: "Free",
    blurb: "Get one agent on the ledger",
    price: "$0",
    per: ["for one agent"],
    cta: "Get started free",
    href: "/signup",
    tone: "dark",
    featuresHead: "Free features:",
    features: [
      { text: "1 agent and unlimited purchases" },
      { text: "Every charge with the task behind it" },
      { text: "Receipts matched to the cent" },
      { text: "One connected bank or card" },
      { text: "Monthly summary" },
      { text: "Slack notifications" },
    ],
  },
  {
    name: "Team",
    blurb: "Run a team's agents against shared caps",
    price: "$49",
    per: ["per team / month", "billed annually"],
    cta: "Buy Team",
    href: "/signup",
    tone: "dark",
    featuresHead: "All Free features, plus:",
    features: [
      { text: "Unlimited agents in the team" },
      { text: "Caps per agent, vendor, and month" },
      { text: "Approvals in Slack" },
      { text: "Unlimited banks and cards" },
      { text: "Month-end close drafted by Payle" },
      { text: "Email and chat support" },
    ],
  },
  {
    name: "Business",
    blurb: "Every team on one ledger with the security of SSO",
    price: "$149",
    per: ["per team / month", "billed annually"],
    cta: "Buy Business",
    href: "/signup",
    tone: "lime",
    popular: true,
    featuresHead: "All Team features, plus:",
    features: [
      { text: "Single sign-on (SAML 2.0)" },
      { text: "Company-wide budgets and rollups" },
      { text: "Audit trail export" },
      { text: "Priority support" },
      { text: "Flexible payment options" },
    ],
  },
  {
    name: "Enterprise",
    blurb: "Multiple ledgers with enterprise-grade controls and a named team",
    price: null,
    per: ["Contact for pricing"],
    cta: "Contact us",
    href: "/contact",
    tone: "dark",
    featuresHead: "All Business features, plus:",
    features: [
      { text: "Multiple ledgers and workspaces" },
      { text: "Advanced security and admin controls" },
      { text: "SCIM user and group management" },
      { text: "Audit logs, reports, and reporting APIs" },
      { text: "Require 2FA for members" },
      { text: "Data residency" },
      { text: "Bring your own key", paid: true },
      { text: "Premier support", paid: true },
      { text: "Onboarding for every team", paid: true },
    ],
  },
];

function Pricing() {
  return (
    <section className="overflow-x-clip" style={{ backgroundColor: MIST }}>
      <div className={`${GUTTER} pb-[clamp(40px,2.7vw,52px)] pt-[clamp(20px,1.9vw,36px)]`}>
        {/* the four plans as cells on one ruled row */}
        <div className="relative grid border border-black/[0.12] min-[700px]:grid-cols-2 min-[1100px]:grid-cols-4">
          <span className="pointer-events-none absolute -left-6 -right-6 -top-px h-px bg-black/[0.12]" />
          <span className="pointer-events-none absolute -bottom-px -left-6 -right-6 h-px bg-black/[0.12]" />
          <Cross pos="top-left" />
          <Cross pos="bottom-right" />
          {PLANS.map((p, k) => (
            <motion.div
              key={p.name}
              {...up}
              transition={{ ...up.transition, delay: k * 0.06 }}
              className={[
                "relative flex flex-col bg-white p-[clamp(24px,1.8vw,34px)] border-black/[0.12]",
                k > 0 ? "border-t" : "",
                k % 2 === 1 ? "min-[700px]:border-l" : "",
                k >= 2 ? "min-[700px]:border-t" : "min-[700px]:border-t-0",
                k > 0 ? "min-[1100px]:border-l" : "",
                "min-[1100px]:border-t-0",
              ].join(" ")}
            >
              {p.popular && <span className="pointer-events-none absolute inset-0 border-[3px]" style={{ borderColor: GREEN }} />}
              <div className="flex items-center gap-3">
                <h3 className="text-[clamp(28px,1.9vw,36px)] font-medium tracking-[-1px] text-ink">{p.name}</h3>
                {p.popular && (
                  <span className="px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.5px] text-ink" style={{ backgroundColor: LIME }}>
                    Most popular
                  </span>
                )}
              </div>
              <p className="mt-[clamp(16px,1.5vw,28px)] min-h-[3.2em] text-[clamp(15px,1vw,19px)] leading-[1.45] text-ink">{p.blurb}</p>

              <div className="mt-[clamp(24px,2.5vw,48px)]">
                {p.price ? (
                  <p className="flex items-baseline gap-2 text-ink">
                    <span className="font-numeral text-[clamp(36px,2.4vw,46px)] font-semibold tracking-[-1.5px]" style={p.popular ? { color: GREEN } : undefined}>
                      {p.price}
                    </span>
                    <span className="text-[17px] font-semibold" style={p.popular ? { color: GREEN } : undefined}>USD</span>
                  </p>
                ) : (
                  <span className="block h-[46px] w-[46px]" aria-hidden>
                    <svg viewBox="0 0 46 46" fill="none" className="h-full w-full">
                      <rect x="3" y="6" width="28" height="20" rx="3" fill={INK} />
                      <rect x="15" y="16" width="28" height="20" rx="3" fill={INK} stroke="#ffffff" strokeWidth="2" />
                    </svg>
                  </span>
                )}
                {p.per.map((line, j) => (
                  <p key={line} className={`text-[16px] text-ink ${j === 0 ? "mt-2 font-semibold" : ""}`}>
                    {line}
                    {j === 1 && (
                      <span className="ml-3 inline-flex items-center gap-2 align-middle text-sub">
                        <span className="relative inline-block h-[20px] w-[36px] rounded-full" style={{ backgroundColor: INK }}>
                          <span className="absolute left-[2px] top-[2px] h-[16px] w-[16px] rounded-full bg-white" />
                        </span>
                        monthly
                      </span>
                    )}
                  </p>
                ))}
              </div>

              <div className="mt-[clamp(20px,1.8vw,34px)]">
                <ArrowButton href={p.href} tone={p.tone}>
                  {p.cta}
                </ArrowButton>
              </div>

              <div className="mt-[clamp(28px,2.2vw,42px)] h-[4px]" style={{ backgroundColor: INK }} />
              <p className="mt-[clamp(28px,2.4vw,46px)] text-[clamp(20px,1.4vw,26px)] text-ink">{p.featuresHead}</p>
              <ul className="mt-5 space-y-3">
                {p.features.map((f) => (
                  <li key={f.text} className="flex items-start gap-3 text-[16px] leading-[1.3] text-ink">
                    <span className="mt-[3px] flex h-[16px] w-[16px] shrink-0 items-center justify-center" style={{ color: GREEN }}>
                      {f.paid ? (
                        <span className="font-numeral text-[16px] font-bold leading-none">$</span>
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                          <path d="M2.5 8.5 6 12l7.5-8" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </span>
                    {f.text}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Shared                                                              */
/* ------------------------------------------------------------------ */

/* Mural's button: a square arrow block on the left, the label on a
   filled body */
function ArrowButton({ href, children, tone = "dark" }: { href: string; children: React.ReactNode; tone?: "dark" | "lime" }) {
  const lime = tone === "lime";
  return (
    <Link href={href} className="group inline-flex h-[60px] items-stretch text-[clamp(16px,1.15vw,22px)] transition-transform hover:scale-[1.02] active:scale-[0.98]">
      <span className="flex w-[60px] items-center justify-center" style={{ backgroundColor: lime ? GREEN : INK }}>
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
          <path d="M5 2.5 10.5 8 5 13.5" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <span
        className="flex items-center px-8"
        style={{ backgroundColor: lime ? LIME : "#2c2c2c", color: lime ? INK : "#ffffff" }}
      >
        {children}
      </span>
    </Link>
  );
}
