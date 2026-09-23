"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, animate, motion, useMotionValue } from "motion/react";
import NavDock from "@/components/NavDock";
import FooterSection from "@/components/FooterSection";
import StatsStatement from "@/components/StatsStatement";
import FlowHero from "@/components/FlowHero";
import { ArrowButton } from "@/components/EnterpriseBlocks";
import InsightsChart from "@/components/tracker/InsightsChart";
import AgentScene, { type SceneKey } from "@/components/AgentScenes";
import { money } from "@/components/tracker/money";

/**
 * Financial teams page, on Amigo's full-page anatomy (measured from the
 * 1920px capture) with Payloat's type and palette. Payle is the financial
 * manager agent that runs on Payloat infrastructure.
 *
 *   1. Hero: "Built for how your team spends", the tab rail with the
 *      agent scenes and three ruled stats; then the flow act (FlowHero,
 *      shared with the home page) with the team → Payle → agents card.
 *   2. Stats band and statement on the green (StatsStatement, shared
 *      with the home page), then the green fades to white.
 *   4. Workflows: centered headline, a carousel of tall canvases with a
 *      centered pill label, arrows, a note.
 *   5. The playbook on black: two-tone headline, pill, numbered tabs, a
 *      sub-block with a Slack-style exchange.
 *   6. Security and integrations on black with a ruled logo strip.
 *   7. Built for how you spend: two-tone centered headline, tab rail with
 *      an animated scene, three ruled stats.
 *   8. Set up in days: headline + steps card, then a ruled bank strip.
 *   9. Guides: three tall cards.
 *  10. CTA card on the green.
 *  11. Footer on the green.
 */

const EASE = [0.25, 0.6, 0.2, 1] as const;
const GREEN = "#163300";
const INK = "#0a0a0a";

const up = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.55, ease: EASE },
} as const;

/* Amigo's page frame: 30px rails at 1920 with 1px hairlines, content at
   +32 inside them */
const FRAME = "mx-auto max-w-[1860px] border-x border-black/[0.08]";
const INNER = "px-[clamp(20px,1.7vw,32px)]";

/* mono caps, the small labels Amigo sets in a monospace face */
const MONO =
  "font-numeral text-[12px] uppercase tracking-[1.8px]";
/* the same caps in SF Pro, for the guide covers' chips */
const CAPS = "text-[12px] uppercase tracking-[1.8px]";

/* the site's ruled grid: a rule running 24px past a frame, and the
   crosshair where a rule meets a rail */
function Rule({ pos }: { pos: "top" | "bottom" }) {
  return <span className={`pointer-events-none absolute -left-6 -right-6 h-px bg-black/[0.08] ${pos === "top" ? "-top-px" : "-bottom-px"}`} />;
}
function Cross({ pos }: { pos: "top-left" | "bottom-right" }) {
  const at = pos === "top-left" ? "-left-[7px] -top-[7px]" : "-bottom-[7px] -right-[7px]";
  return (
    <span className={`pointer-events-none absolute z-10 h-[13px] w-[13px] ${at}`} aria-hidden>
      <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-black/40" />
      <span className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-black/40" />
    </span>
  );
}

const DAILY = [
  0, 85, 85, 210, 210, 340, 340, 495, 640, 640, 820, 980, 980, 1210, 1385,
  1500, 1500, 1830, 2100, 2350,
];
const X_LABELS = ["Jul 01", "Jul 07", "Jul 13", "Jul 20"];

const FINANCE_TASKS = [
  "Runway forecasting",
  "Vendor spend caps",
  "Budget approvals",
  "Month-end close",
  "Agent charge review",
  "Subscription audits",
  "Card issuing for agents",
  "Receipt matching",
  "Cost per task reporting",
  "Overspend alerts",
  "Renewal negotiations",
  "Cash position updates",
  "Department budgets",
  "Slack approvals",
  "Refund tracking",
  "Vendor onboarding",
  "Quarterly planning",
  "Board reporting",
  "Tax categorization",
  "Duplicate charge checks",
];

const BANK_LOGOS = [
  { src: "/logos/banks/chase.jpg", alt: "Chase" },
  { src: "/logos/banks/mercury.png", alt: "Mercury" },
  { src: "/logos/brex.svg", alt: "Brex" },
  { src: "/logos/stripe.svg", alt: "Stripe" },
  { src: "/logos/banks/citi.png", alt: "Citi" },
  { src: "/logos/banks/wellsfargo.png", alt: "Wells Fargo" },
];

export default function FinanceTeamsPage() {
  return (
    <main className="bg-[#eeeeee]">
      <NavDock forceDark />

      <BuiltFor />
      <FlowHero
        lines={["The finance", "agent that", "watches every", "dollar your", "agents spend."]}
        body="Payle plans budgets, approves agent charges, and closes the month, so your team can focus on the customer."
        cta={{ label: "Book a demo", href: "/contact" }}
        tasks={FINANCE_TASKS}
        from="Your finance team"
        agent="Payle"
        to="Your agents"
        trustedLabel="Trusted by finance teams on"
        logos={BANK_LOGOS}
      />
      <StatsStatement
        stats={[
          { label: "Payle watches agent charges", value: "24/7" },
          { label: "To approve a charge under cap", value: "<1s" },
          { label: "Spent past a cap Payle did not approve", value: "$0" },
        ]}
        quote="The expensive mistakes in finance are the ones nobody saw coming. Payle sees every agent charge the moment it lands, so the team decides before the money moves, and spends its time on the customer instead of the spreadsheet."
        name="Payle"
        role="Financial manager agent, running on Payloat infrastructure"
        to="#eeeeee"
        navSkin="light"
      />
      <Workflows />
      <Playbook />
      <Security />
      <SetUp />
      <Guides />
      <Cta />

      <div style={{ backgroundColor: GREEN }}>
        <FooterSection tone="light" />
      </div>
    </main>
  );
}

/* ------------------------------------------------------------------ */
/* 4. Workflows carousel                                               */
/* ------------------------------------------------------------------ */

const WORKFLOWS = [
  { label: "Budgeting", canvas: "mist" as const, figure: "budgets" as const },
  { label: "Approvals", canvas: "ink" as const, figure: "approval" as const },
  { label: "Month-end close", canvas: "green" as const, figure: "close" as const },
  { label: "Vendor spend", canvas: "mist" as const, figure: "vendors" as const },
  { label: "Forecasting", canvas: "ink" as const, figure: "forecast" as const },
];

const CARD_W = 452;
const CARD_GAP = 22;

function Workflows() {
  const [index, setIndex] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);
  /* measured: the row's inner width, from which the card width (452px,
     or narrower on small screens), the edge room (100px, less on small
     screens), and how far the track may travel all follow. The first
     card starts at the edge room; the last card ends at the same room
     from the right, and the track stops there. */
  const [m, setM] = useState({ card: CARD_W, pad: 100, travel: 0 });
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const measure = () => {
      const w = el.clientWidth;
      const pad = Math.min(100, Math.max(20, w * 0.06));
      const card = Math.min(CARD_W, w - 2 * pad);
      const track = WORKFLOWS.length * card + (WORKFLOWS.length - 1) * CARD_GAP;
      setM({ card, pad, travel: Math.max(0, track + 2 * pad - w) });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const step = m.card + CARD_GAP;
  const max = WORKFLOWS.length - 1;
  /* the track's x: the arrows animate it, a drag moves it live and then
     snaps to the nearest card by position and fling, never past the
     ends */
  const x = useMotionValue(0);
  const go = (i: number) => {
    const next = Math.min(max, Math.max(0, i));
    setIndex(next);
    animate(x, -Math.min(next * step, m.travel), { type: "spring", stiffness: 140, damping: 26 });
  };
  const atEnd = index === max || index * step >= m.travel;
  return (
    <section className="overflow-hidden pb-[clamp(72px,7vw,140px)] pt-[clamp(40px,4.4vw,84px)]">
      {/* the headline in a framed cell of the grid */}
      <div className="px-6">
        <div className="relative mx-auto max-w-[1200px] border-x border-black/[0.08]">
          <Rule pos="top" />
          <Cross pos="top-left" />
          <motion.h2
            {...up}
            className="border-t border-black/[0.08] px-6 py-[clamp(40px,4.5vw,72px)] text-center text-[clamp(32px,3.3vw,64px)] font-medium leading-[1.05] tracking-[-2px] text-ink"
          >
            Workflows built for finance teams.
          </motion.h2>
        </div>
      </div>

      {/* the track on the ruled grid: cells with room between them, each
          cell's edges running out to the two full-width rules above and
          below; drag it or use the arrows */}
      <div ref={wrapRef} className="relative border-y border-black/[0.08] py-6">
        <motion.div
          className="flex cursor-grab gap-[22px] active:cursor-grabbing"
          style={{ x, paddingLeft: m.pad }}
          drag="x"
          dragConstraints={{ left: -m.travel, right: 0 }}
          dragElastic={0.12}
          dragMomentum={false}
          onDragEnd={(_, info) => {
            const fling = info.velocity.x;
            const at = -x.get() / step;
            const target =
              Math.abs(fling) > 400 ? (fling < 0 ? Math.ceil(at) : Math.floor(at)) : Math.round(at);
            go(target);
          }}
        >
          {WORKFLOWS.map((w) => (
            <WorkflowCard key={w.label} {...w} width={m.card} />
          ))}
        </motion.div>
      </div>

      <div className="mt-[clamp(40px,4.5vw,86px)] flex justify-center gap-[22px]">
        <button
          type="button"
          aria-label="Previous"
          onClick={() => go(index - 1)}
          className="flex h-[34px] w-[34px] items-center justify-center border border-black/[0.12] bg-white text-ink transition-transform hover:scale-105 disabled:opacity-40"
          disabled={index === 0}
        >
          <ArrowIcon dir="left" />
        </button>
        <button
          type="button"
          aria-label="Next"
          onClick={() => go(index + 1)}
          className="flex h-[34px] w-[34px] items-center justify-center border border-black/[0.12] bg-white text-ink transition-transform hover:scale-105 disabled:opacity-40"
          disabled={atEnd}
        >
          <ArrowIcon dir="right" />
        </button>
      </div>
      <p className="mt-[clamp(28px,2.8vw,54px)] px-6 text-center text-[clamp(15px,0.95vw,18px)] text-sub">
        Run a workflow we have not listed? Payle learns the way your team
        works.{" "}
        <Link href="/contact" className="underline underline-offset-4">
          Reach out.
        </Link>
      </p>
    </section>
  );
}

function ArrowIcon({ dir }: { dir: "left" | "right" }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden
      style={{ transform: dir === "left" ? "rotate(180deg)" : undefined }}
    >
      <path d="M2.5 8h11m0 0L8.8 3.3M13.5 8l-4.7 4.7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function WorkflowCard({
  label,
  canvas,
  figure,
  width,
}: (typeof WORKFLOWS)[number] & { width: number }) {
  const bg = canvas === "mist" ? "#eeeeee" : canvas === "ink" ? INK : GREEN;
  const dark = canvas !== "mist";
  return (
    <div className="relative shrink-0" style={{ width, height: Math.round(width * (630 / 452)) }}>
      {/* the cell's edges run out to the rules above and below */}
      <span className="pointer-events-none absolute -bottom-6 -top-6 left-0 w-px bg-black/[0.08]" />
      <span className="pointer-events-none absolute -bottom-6 -top-6 right-0 w-px bg-black/[0.08]" />
      <div
        className="relative h-full w-full overflow-hidden border border-black/[0.08]"
        style={{ backgroundColor: bg }}
      >
      <div className="absolute inset-x-[36px] top-[44px]">
        <Figure kind={figure} dark={dark} />
      </div>
      <span className="absolute left-1/2 top-1/2 flex h-[50px] -translate-x-1/2 -translate-y-1/2 items-center border border-[#0a0a0a] bg-white px-[26px] text-[18px] text-ink">
        {label}
      </span>
      </div>
    </div>
  );
}

function Figure({
  kind,
  dark,
}: {
  kind: (typeof WORKFLOWS)[number]["figure"];
  dark: boolean;
}) {
  const fg = dark ? "#ffffff" : INK;
  const muted = dark ? "rgba(255,255,255,0.55)" : "rgba(10,10,10,0.5)";
  const track = dark ? "rgba(255,255,255,0.14)" : "rgba(10,10,10,0.08)";
  const card = dark ? "rgba(255,255,255,0.08)" : "#ffffff";
  const line = dark ? "rgba(255,255,255,0.2)" : "rgba(10,10,10,0.12)";
  if (kind === "budgets") {
    const rows = [
      ["Engineering agents", 0.72, 8400],
      ["Growth agents", 0.41, 2150],
      ["Support agents", 0.9, 3900],
    ] as const;
    return (
      <div className="flex flex-col gap-4">
        {rows.map(([name, pct, amt]) => (
          <div key={name}>
            <div className="flex items-center justify-between text-[13px]" style={{ color: fg }}>
              <span>{name}</span>
              <span className="font-numeral">{money(amt)}</span>
            </div>
            <div className="mt-2 h-[6px] border" style={{ backgroundColor: track, borderColor: line }}>
              <motion.div
                className="h-full"
                style={{ backgroundColor: pct > 0.85 ? "#9fe870" : fg }}
                initial={{ width: 0 }}
                whileInView={{ width: `${pct * 100}%` }}
                viewport={{ once: true }}
                transition={{ duration: 1.1, ease: EASE }}
              />
            </div>
          </div>
        ))}
      </div>
    );
  }
  if (kind === "approval") {
    return (
      <div className="border p-4" style={{ backgroundColor: card, borderColor: line }}>
        <div className="flex items-center justify-between text-[12px]" style={{ color: muted }}>
          <span>OpenAI · research agent</span>
          <span>2:14 PM</span>
        </div>
        <p className="font-numeral mt-2 text-[26px] font-semibold tracking-[-1px]" style={{ color: fg }}>
          {money(2500)}
        </p>
        <p className="mt-1 text-[13px]" style={{ color: muted }}>
          Under the $3,000 monthly cap. Approved by Payle.
        </p>
        <div className="mt-3 flex gap-2">
          <span className="border px-3 py-1 text-[12px] font-medium" style={{ backgroundColor: "#9fe870", color: INK, borderColor: line }}>
            Approved
          </span>
          <span className="border px-3 py-1 text-[12px] font-medium" style={{ backgroundColor: track, color: fg, borderColor: line }}>
            Task: Q3 market brief
          </span>
        </div>
      </div>
    );
  }
  if (kind === "close") {
    const items = ["Receipts matched", "Charges categorized", "Caps reconciled", "Report sent"];
    return (
      <div className="flex flex-col gap-3">
        {items.map((it, i) => (
          <div key={it} className="flex items-center gap-3 text-[14px]" style={{ color: fg }}>
            <span
              className="flex h-5 w-5 items-center justify-center border"
              style={{ backgroundColor: i < 3 ? "#9fe870" : track, borderColor: line }}
            >
              {i < 3 && (
                <svg width="10" height="10" viewBox="0 0 16 16" fill="none" aria-hidden>
                  <path d="M3 8.5 6.5 12 13 4.5" stroke={INK} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </span>
            {it}
          </div>
        ))}
      </div>
    );
  }
  if (kind === "vendors") {
    const v = [
      ["/logos/openai.svg", "OpenAI", 4120],
      ["/logos/aws.svg", "AWS", 2870],
      ["/logos/stripe.svg", "Stripe", 610],
    ] as const;
    return (
      <div className="flex flex-col gap-2.5">
        {v.map(([src, name, amt]) => (
          <div key={name} className="flex items-center gap-3 border px-3 py-2.5" style={{ backgroundColor: card, borderColor: line }}>
            <span className="flex h-8 w-8 items-center justify-center border border-black/[0.12] bg-white">
              <Image src={src} alt={name} width={18} height={18} className="h-[18px] w-[18px]" />
            </span>
            <span className="flex-1 text-[13px]" style={{ color: fg }}>{name}</span>
            <span className="font-numeral text-[13px]" style={{ color: fg }}>{money(amt)}</span>
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="border p-4" style={{ backgroundColor: card, borderColor: line }}>
      <p className="text-[12px]" style={{ color: muted }}>Projected agent spend, July</p>
      <p className="font-numeral mt-1 text-[24px] font-semibold tracking-[-1px]" style={{ color: fg }}>
        {money(2350)}
      </p>
      <InsightsChart daily={DAILY} xLabels={X_LABELS} tone={dark ? "dark" : "light"} className="mt-2 h-[110px]" />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 5. The playbook (black)                                             */
/* ------------------------------------------------------------------ */

const PLAYS = [
  {
    tab: "Live budgets",
    title: "Live budgets",
    body: "Every team's budget updates the moment an agent charges a card. Payle knows what is left, what is committed, and what is about to renew.",
    ask: "@Payle how much of the growth budget is left this month?",
    reply: "$1,850 of $4,000. Three agents spent $2,150, mostly on ad tooling. Two renewals land Friday for $420 total.",
    bar: 0.54,
  },
  {
    tab: "Approvals in Slack",
    title: "Approvals in Slack",
    body: "Charges under a cap clear on their own. Anything over it waits for one tap from the person who owns the budget, right where the team already works.",
    ask: "@Payle approve the $2,500 OpenAI charge for the research agent.",
    reply: "Approved. It is logged against Q3 market brief. The research agent has $500 of cap left this month.",
    bar: 0.83,
  },
  {
    tab: "Supervised close",
    title: "Supervised close",
    body: "Payle matches receipts, categorizes every charge, and drafts the month-end report. Your team reviews it instead of building it.",
    ask: "@Payle where is the July close?",
    reply: "Ready for review. 142 charges matched, 2 need a receipt from the support agent. The draft report is in the ledger.",
    bar: 0.98,
  },
];

/* the crosshair in white, for the exchange card on black */
function PlayCross({ pos }: { pos: "top-left" | "bottom-right" }) {
  const at = pos === "top-left" ? "-left-[7px] -top-[7px]" : "-bottom-[7px] -right-[7px]";
  return (
    <span className={`pointer-events-none absolute z-10 h-[13px] w-[13px] ${at}`} aria-hidden>
      <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-white/60" />
      <span className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-white/60" />
    </span>
  );
}

function Playbook() {
  const [i, setI] = useState(0);
  const play = PLAYS[i];
  return (
    <section className="text-white" style={{ backgroundColor: INK }}>
      <div className={`${FRAME} border-white/10`}>
        <div className="relative px-[clamp(20px,2.5vw,48px)]">
          {/* Amigo's long vertical rule at x 78 */}
          <div className="absolute bottom-0 left-[clamp(20px,2.5vw,48px)] top-[clamp(120px,9vw,172px)] hidden w-px bg-white/15 min-[800px]:block" />

          <div className="pl-[clamp(0px,1.6vw,30px)] pt-[clamp(120px,9.5vw,182px)]">
            <motion.h2
              {...up}
              className="max-w-[1000px] text-[clamp(34px,3.9vw,74px)] font-medium leading-[1.06] tracking-[-2.5px]"
            >
              The Payle playbook
              <br />
              <span className="text-white/50">
                A financial manager trained on how the best finance teams
                actually run.
              </span>
            </motion.h2>
            <motion.div {...up} className="mt-[clamp(48px,6vw,116px)]">
              <ArrowButton href="/product" tone="inverse">
                Explore the platform
              </ArrowButton>
            </motion.div>

            {/* tabs, mono caps with the active bar on the rule */}
            <ul className="mt-[clamp(80px,11vw,214px)] flex flex-col gap-[clamp(18px,1.9vw,36px)]">
              {PLAYS.map((p, k) => (
                <li key={p.tab} className="relative">
                  {k === i && (
                    <motion.span
                      layoutId="playbookMark"
                      className="absolute top-1/2 h-[26px] w-[3px] -translate-y-1/2 bg-white"
                      style={{ left: "calc(-1 * clamp(1px,1.65vw,31px))" }}
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => setI(k)}
                    className={`${MONO} text-[clamp(11px,0.8vw,15px)] transition-colors`}
                    style={{ color: k === i ? "#ffffff" : "rgba(255,255,255,0.4)" }}
                  >
                    0{k + 1}&nbsp;&nbsp;{p.tab}
                  </button>
                </li>
              ))}
            </ul>

            {/* the sub-block: title at Amigo's x 250, copy, and the Slack exchange */}
            <div className="grid gap-10 pb-[clamp(96px,10vw,190px)] pt-[clamp(72px,7.5vw,146px)] min-[1000px]:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] min-[1000px]:pl-[clamp(40px,7.4vw,144px)]">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={play.title}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10, transition: { duration: 0.15 } }}
                  transition={{ duration: 0.35, ease: EASE }}
                >
                  <h3 className="text-[clamp(32px,2.9vw,56px)] font-medium leading-none tracking-[-1.5px]">
                    {play.title}
                  </h3>
                  <p className="mt-[clamp(24px,2.4vw,46px)] max-w-[520px] text-[clamp(16px,1vw,19px)] leading-[1.45] text-white/70">
                    {play.body}
                  </p>
                </motion.div>
              </AnimatePresence>

              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={play.ask}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10, transition: { duration: 0.15 } }}
                  transition={{ duration: 0.35, ease: EASE, delay: 0.05 }}
                  className="relative max-w-[560px] border border-white/25 text-white"
                  style={{ backgroundColor: INK }}
                >
                  {/* the grid's rules and crosshairs, in white */}
                  <span className="pointer-events-none absolute -left-6 -right-6 -top-px h-px bg-white/25" />
                  <span className="pointer-events-none absolute -bottom-px -left-6 -right-6 h-px bg-white/25" />
                  <PlayCross pos="top-left" />
                  <PlayCross pos="bottom-right" />
                  <div className="flex items-start gap-3 p-5">
                    <Image
                      src="/zeradam.jpg"
                      alt=""
                      width={32}
                      height={32}
                      className="mt-0.5 h-8 w-8 shrink-0 border border-white/25 object-cover"
                    />
                    <div>
                      <p className="text-[13px] font-semibold">Zeradam</p>
                      <p className="mt-0.5 text-[15px] leading-[1.4]">{play.ask}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 border-t border-white/25 p-5">
                    <Image
                      src="/payloat-mark-tile.svg"
                      alt=""
                      width={32}
                      height={32}
                      className="mt-0.5 h-8 w-8 shrink-0 border border-white/25"
                    />
                    <div className="flex-1">
                      <p className="text-[13px] font-semibold">
                        Payle <span className="ml-1 border border-white/25 px-1.5 py-px text-[10px] font-medium text-white/70">APP</span>
                      </p>
                      <p className="mt-0.5 text-[15px] leading-[1.4]">{play.reply}</p>
                      <div className="mt-3 h-[6px] border border-white/25">
                        <motion.div
                          className="h-full"
                          style={{ backgroundColor: "#ffffff" }}
                          initial={{ width: 0 }}
                          animate={{ width: `${play.bar * 100}%` }}
                          transition={{ duration: 0.9, ease: EASE, delay: 0.2 }}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* 6. Security and integrations (black)                                */
/* ------------------------------------------------------------------ */

const INTEGRATIONS = [
  { src: "/logos/stripe.svg", alt: "Stripe" },
  { src: "/logos/brex.svg", alt: "Brex" },
  { src: "/logos/aws.svg", alt: "AWS" },
  { src: "/logos/vercel.svg", alt: "Vercel" },
  { src: "/logos/openai.svg", alt: "OpenAI" },
  { src: "/logos/claude.svg", alt: "Claude" },
];

function Security() {
  return (
    <section className="text-white" style={{ backgroundColor: INK }}>
      <div className={`${FRAME} border-white/10`}>
        <div className={`${INNER} pt-[clamp(72px,7vw,136px)]`}>
          <div className="grid gap-8 pb-[clamp(48px,5vw,96px)] min-[900px]:grid-cols-[minmax(0,720px)_1fr] min-[900px]:items-end">
            <motion.h2
              {...up}
              className="text-[clamp(30px,2.9vw,56px)] font-medium leading-[1.06] tracking-[-1.8px]"
            >
              Enterprise-grade security meets seamless integration.
            </motion.h2>
            <motion.p {...up} className="max-w-[520px] text-[clamp(15px,1vw,19px)] leading-[1.45] text-white/60">
              Payle reads your banks and cards through Plaid and Teller, never
              holds your credentials, and every action it takes is logged to
              the ledger with the task it was given.
            </motion.p>
          </div>
        </div>
        <div className="border-t border-white/15">
          <div className={`${INNER} grid grid-cols-3 min-[800px]:grid-cols-6`}>
            {INTEGRATIONS.map((l) => (
              <div key={l.alt} className="flex h-[clamp(72px,5.6vw,108px)] items-center justify-center">
                <Image
                  src={l.src}
                  alt={l.alt}
                  width={120}
                  height={36}
                  className="h-[clamp(18px,1.4vw,26px)] w-auto opacity-80 brightness-0 invert"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* 7. Built for how you spend                                          */
/* ------------------------------------------------------------------ */

const STEPS: { tab: string; title: string; body: string; scene: SceneKey }[] = [
  {
    tab: "Define",
    title: "Define",
    body: "Tell Payle what each agent may buy, from which vendors, and up to what amount. It turns that into caps it enforces on every charge.",
    scene: "mandate",
  },
  {
    tab: "Connect",
    title: "Connect",
    body: "Link the banks and cards your agents already spend on. Payle reads every charge as it lands and matches it to the agent and its task.",
    scene: "confirmations",
  },
  {
    tab: "Report",
    title: "Report",
    body: "Spend by agent, by vendor, by task, every day. At month end Payle drafts the close and your team signs off.",
    scene: "reporting",
  },
];

const SCENE_VARS = {
  "--sc-fg": "#0a0a0a",
  "--sc-muted": "rgba(10,10,10,0.6)",
  "--sc-line": "rgba(10,10,10,0.3)",
  "--sc-fill": "rgba(10,10,10,0.06)",
  "--sc-track": "rgba(10,10,10,0.1)",
  "--sc-chip-bg": "#ffffff",
  "--sc-chip-border": "rgba(10,10,10,0.12)",
  "--sc-chip-on-bg": "#0a0a0a",
  "--sc-chip-on-fg": "#ffffff",
  "--sc-card-bg": "#ffffff",
  "--sc-card-fg": "#0a0a0a",
  "--sc-card-muted": "#706e68",
  "--sc-icon": "none",
} as React.CSSProperties;

const BUILT_STATS = [
  { value: "0 min", label: "Of manual reconciliation each month" },
  { value: "100%", label: "Of agent charges matched to the task that caused them" },
  { value: "1", label: "Ledger across every bank, card, and agent" },
];

function BuiltFor() {
  const [i, setI] = useState(0);
  const step = STEPS[i];
  return (
    <section className="bg-[#eeeeee]">
      <div className={FRAME}>
        {/* the page opens here: room for the nav above the headline */}
        <div className="relative px-[clamp(20px,2.5vw,48px)] pt-[clamp(140px,9vw,200px)]">
          <div className="absolute bottom-0 left-[clamp(20px,2.5vw,48px)] top-[clamp(140px,9vw,190px)] hidden w-px bg-black/10 min-[800px]:block" />

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: EASE, delay: 0.05 }}
            className="mx-auto max-w-[1100px] text-center text-[clamp(34px,4vw,76px)] font-medium leading-[1.06] tracking-[-2.5px] text-ink"
          >
            Built for how your team spends
            <br />
            <span className="text-ink/45">
              A financial manager for your budgets, vendors, and agents.
            </span>
          </motion.h1>

          <div className="mt-[clamp(56px,6.5vw,124px)] grid gap-12 min-[1000px]:grid-cols-[minmax(0,420px)_1fr] min-[1000px]:gap-8">
            {/* the tab rail */}
            <div className="pl-[clamp(0px,1.6vw,30px)]">
              <ul className="flex flex-col gap-[clamp(14px,1.2vw,22px)]">
                {STEPS.map((s, k) => (
                  <li key={s.tab} className="relative">
                    {k === i && (
                      <motion.span
                        layoutId="builtMark"
                        className="absolute top-1/2 h-[26px] w-[3px] -translate-y-1/2 bg-ink"
                        style={{ left: "calc(-1 * clamp(1px,1.65vw,31px))" }}
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => setI(k)}
                      className={`${MONO} text-[clamp(11px,0.8vw,15px)] transition-colors`}
                      style={{ color: k === i ? INK : "rgba(10,10,10,0.4)" }}
                    >
                      0{k + 1}&nbsp;&nbsp;{s.tab}
                    </button>
                  </li>
                ))}
              </ul>
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8, transition: { duration: 0.15 } }}
                  transition={{ duration: 0.3, ease: EASE }}
                  className="mt-[clamp(48px,5.8vw,112px)]"
                >
                  <h3 className="text-[clamp(22px,1.5vw,28px)] font-medium tracking-[-0.6px] text-ink">
                    {step.title}
                  </h3>
                  <p className="mt-[clamp(24px,2.6vw,50px)] max-w-[330px] text-[clamp(15px,1vw,19px)] leading-[1.4] text-ink">
                    {step.body}
                  </p>
                  <div className="mt-[clamp(28px,2.9vw,56px)]">
                    <ArrowButton href="/product" tone="light">Explore the platform</ArrowButton>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* the scene, in Amigo's fan graphic's place */}
            <div className="flex items-center justify-center" style={SCENE_VARS}>
              <div className="w-full max-w-[640px]">
                <AgentScene scene={step.scene} />
              </div>
            </div>
          </div>

          {/* three ruled stats */}
          <div className="mt-[clamp(72px,8vw,160px)] grid gap-10 pb-[clamp(72px,8vw,160px)] pl-[clamp(0px,1.6vw,30px)] min-[800px]:grid-cols-3 min-[800px]:gap-0">
            {BUILT_STATS.map((s) => (
              <motion.div
                key={s.label}
                {...up}
                className="border-l border-black/10 pl-6 min-[800px]:pr-8"
              >
                <p className="font-numeral text-[clamp(30px,2.2vw,42px)] font-medium leading-none tracking-[-1.5px] text-ink">
                  {s.value}
                </p>
                <p className="mt-3 max-w-[260px] text-[clamp(13px,0.85vw,16px)] leading-[1.4] text-sub">
                  {s.label}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* 9. Set up in days                                                   */
/* ------------------------------------------------------------------ */

const SETUP = [
  ["Connect your banks", "Plaid or Teller, in minutes. Every agent card shows up in one ledger."],
  ["Set caps and budgets", "Per agent, per vendor, per team. Payle enforces them from the first charge."],
  ["Invite Payle to Slack", "Approvals, questions, and the month-end draft, where the team already is."],
];

function SetUp() {
  return (
    <section className="overflow-x-clip bg-[#eeeeee]">
      <div className={FRAME}>
        <div className={`${INNER} pt-[clamp(72px,7.5vw,146px)]`}>
          <div className="grid gap-12 pb-[clamp(56px,6vw,116px)] min-[1000px]:grid-cols-[minmax(0,560px)_1fr] min-[1000px]:gap-[clamp(40px,4vw,80px)]">
            <div>
              <motion.h2
                {...up}
                className="text-[clamp(30px,2.9vw,56px)] font-medium leading-[1.06] tracking-[-1.8px] text-ink"
              >
                Set up in days, not quarters.
              </motion.h2>
              <motion.p {...up} className="mt-[clamp(28px,2.6vw,50px)] max-w-[440px] text-[clamp(15px,1vw,19px)] leading-[1.45] text-ink">
                Payle runs on the Payloat infrastructure your agents already
                spend through. There is no data migration, and nothing to
                install on the agents themselves.
              </motion.p>
              <motion.div {...up} className="mt-[clamp(24px,2.4vw,46px)]">
                <ArrowButton href="/integration" tone="light">See the integration</ArrowButton>
              </motion.div>
            </div>
            <motion.div
              {...up}
              className="relative border border-black/[0.08] text-white"
              style={{ backgroundColor: GREEN, minHeight: "clamp(360px,37.5vw,720px)" }}
            >
              <Rule pos="top" />
              <Rule pos="bottom" />
              <Cross pos="top-left" />
              <Cross pos="bottom-right" />
              {/* the steps as ruled rows; the card grows with them, the
                  min height keeps Amigo's 1120x720 proportion */}
              <ol className="flex h-full flex-col">
                {SETUP.map(([t, b], k) => (
                  <li key={t} className="flex flex-1 gap-[clamp(16px,1.5vw,28px)] border-t border-white/20 px-[clamp(24px,2.5vw,48px)] py-[clamp(20px,2.2vw,40px)] first:border-t-0">
                    <span className={`${MONO} pt-1.5 text-white/60`}>0{k + 1}</span>
                    <div>
                      <p className="text-[clamp(20px,1.6vw,30px)] font-medium tracking-[-0.8px]">{t}</p>
                      <p className="mt-2 max-w-[420px] text-[clamp(14px,0.95vw,18px)] leading-[1.4] text-white/70">{b}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </motion.div>
          </div>
          <p className={`${MONO} pb-[clamp(16px,1.6vw,30px)] text-ink`}>Runs on the banks you already use</p>
        </div>
        <div className="border-y border-black/[0.08]">
          <div className={`${INNER} grid grid-cols-2 min-[800px]:grid-cols-4`}>
            {[
              { src: "/logos/banks/chase.jpg", alt: "Chase" },
              { src: "/logos/banks/citi.png", alt: "Citi" },
              { src: "/logos/banks/wellsfargo.png", alt: "Wells Fargo" },
              { src: "/logos/banks/mercury.png", alt: "Mercury" },
            ].map((l) => (
              <div key={l.alt} className="flex h-[clamp(72px,5.6vw,108px)] items-center justify-center border-l border-black/[0.08] first:border-l-0">
                <Image src={l.src} alt={l.alt} width={140} height={40} className="h-[clamp(20px,1.6vw,30px)] w-auto opacity-70 grayscale" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* 10. Guides                                                          */
/* ------------------------------------------------------------------ */

const GUIDES: {
  tag: string;
  title: string;
  sub: string;
  photo?: string;
  ui: "approve" | "cap" | "close";
}[] = [
  {
    tag: "Playbook",
    title: "Why agent spend needs a manager, not a dashboard",
    sub: "Dashboards show you what happened. Payle decides what happens next, inside the caps you set.",
    photo: "/guides/chart.jpg",
    ui: "approve",
  },
  {
    tag: "How to",
    title: "Setting caps that agents actually respect",
    sub: "Per vendor, per task, per month. The three caps every finance team should set on day one.",
    photo: "/guides/coin.jpg",
    ui: "cap",
  },
  {
    tag: "Close",
    title: "Closing the month when agents did the buying",
    sub: "Receipts, categories, and the report, drafted by Payle before your team opens the books.",
    ui: "close",
  },
];

/* Mercury's cover anatomy: a photo (or flat gray) ground with a white UI
   card floating low in the frame and bleeding off its bottom edge */
function GuideCover({ g }: { g: (typeof GUIDES)[number] }) {
  const onPhoto = Boolean(g.photo);
  return (
    <div
      className="relative overflow-hidden border border-black/[0.08]"
      style={{ aspectRatio: "558 / 740", backgroundColor: "#eeeeee" }}
    >
      {g.photo && (
        <Image
          src={g.photo}
          alt=""
          fill
          sizes="(min-width: 900px) 33vw, 100vw"
          className="object-cover"
        />
      )}
      <span
        className={`${CAPS} absolute left-[26px] top-[26px] rounded-[6px] px-4 py-2.5 text-[11px] font-medium backdrop-blur-md`}
        style={{
          backgroundColor: onPhoto ? "rgba(10,10,10,0.45)" : INK,
          color: "#ffffff",
        }}
      >
        {g.tag}
      </span>

      {/* the UI card, inset like Mercury's and clipped at the foot, on the
          ruled grid: square, hairline edge, rules running past it and
          crosshairs at two corners */}
      <div className="absolute inset-x-[clamp(20px,11%,60px)] top-[clamp(120px,32%,236px)] border border-black/[0.12] bg-white p-[clamp(20px,6.5%,36px)] text-ink shadow-[0_24px_60px_rgba(10,10,10,0.25)]">
        <span className={`pointer-events-none absolute -left-6 -right-6 -top-px h-px ${onPhoto ? "bg-white/30" : "bg-black/[0.08]"}`} />
        <span className={`pointer-events-none absolute -bottom-px -left-6 -right-6 h-px ${onPhoto ? "bg-white/30" : "bg-black/[0.08]"}`} />
        <CoverCross pos="top-left" light={onPhoto} />
        <CoverCross pos="bottom-right" light={onPhoto} />
        <UiCard kind={g.ui} />
      </div>
    </div>
  );
}

/* the crosshair on a cover: white over a photo, dark over gray */
function CoverCross({ pos, light }: { pos: "top-left" | "bottom-right"; light: boolean }) {
  const at = pos === "top-left" ? "-left-[7px] -top-[7px]" : "-bottom-[7px] -right-[7px]";
  const c = light ? "bg-white/70" : "bg-black/40";
  return (
    <span className={`pointer-events-none absolute z-10 h-[13px] w-[13px] ${at}`} aria-hidden>
      <span className={`absolute left-1/2 top-0 h-full w-px -translate-x-1/2 ${c}`} />
      <span className={`absolute left-0 top-1/2 h-px w-full -translate-y-1/2 ${c}`} />
    </span>
  );
}

function UiCard({ kind }: { kind: "approve" | "cap" | "close" }) {
  if (kind === "approve") {
    return (
      <>
        <p className="text-[clamp(14px,1.1vw,18px)] font-medium tracking-[-0.3px]">Approve a charge</p>
        <p className="font-numeral mt-3 text-[clamp(28px,2.6vw,44px)] font-medium leading-none tracking-[-1.5px]">
          <span className="mr-1 align-top text-[0.55em] text-sub">$</span>2,500.00
        </p>
        <div className="mt-3 h-px bg-black/10" />
        <Field label="Agent" value="Research agent" sub="OpenAI · $500 of cap left" />
        <Field label="Task" value="Q3 market brief" sub="Requested 2:14 PM" />
        <div className="mt-5 flex gap-2.5">
          <span className="flex h-10 flex-1 items-center justify-center rounded-full bg-mist text-[13px] font-medium">Back</span>
          <span className="flex h-10 flex-1 items-center justify-center rounded-full text-[13px] font-medium text-white" style={{ backgroundColor: INK }}>Approve</span>
        </div>
      </>
    );
  }
  if (kind === "cap") {
    return (
      <>
        <p className="text-[clamp(14px,1.1vw,18px)] font-medium tracking-[-0.3px]">Set a monthly cap</p>
        <p className="font-numeral mt-3 text-[clamp(28px,2.6vw,44px)] font-medium leading-none tracking-[-1.5px]">
          <span className="mr-1 align-top text-[0.55em] text-sub">$</span>3,000.00
        </p>
        <div className="mt-3 h-px bg-black/10" />
        <Field label="Applies to" value="Research agent" sub="OpenAI, Anthropic" />
        <Field label="Alert at" value="80% of cap" sub="$2,400.00" />
        <div className="mt-5 flex items-center justify-between">
          <span className="text-[13px]">Block charges over the cap</span>
          <span className="relative h-6 w-11 rounded-full" style={{ backgroundColor: "#9fe870" }}>
            <span className="absolute right-0.5 top-0.5 h-5 w-5 rounded-full bg-white" />
          </span>
        </div>
      </>
    );
  }
  return (
    <>
      <p className="text-[clamp(14px,1.1vw,18px)] font-medium tracking-[-0.3px]">Close July</p>
      <p className="font-numeral mt-3 text-[clamp(28px,2.6vw,44px)] font-medium leading-none tracking-[-1.5px]">
        <span className="mr-1 align-top text-[0.55em] text-sub">$</span>2,350.00
      </p>
      <div className="mt-3 h-px bg-black/10" />
      <ul className="mt-4 flex flex-col gap-3 text-[13px]">
        {[
          ["142 charges matched to a task", true],
          ["Categories set by Payle", true],
          ["2 receipts still missing", false],
        ].map(([t, done]) => (
          <li key={String(t)} className="flex items-center gap-2.5">
            <span className="flex h-5 w-5 items-center justify-center rounded-full" style={{ backgroundColor: done ? "#9fe870" : "#eeeeee" }}>
              {done && (
                <svg width="10" height="10" viewBox="0 0 16 16" fill="none" aria-hidden>
                  <path d="M3 8.5 6.5 12 13 4.5" stroke={INK} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </span>
            {t}
          </li>
        ))}
      </ul>
      <div className="mt-5 flex gap-2.5">
        <span className="flex h-10 flex-1 items-center justify-center rounded-full bg-mist text-[13px] font-medium">Review</span>
        <span className="flex h-10 flex-1 items-center justify-center rounded-full text-[13px] font-medium text-white" style={{ backgroundColor: INK }}>Send report</span>
      </div>
    </>
  );
}

function Field({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="mt-4">
      <p className="text-[11px] text-sub">{label}</p>
      <div className="mt-1.5 flex items-center justify-between border border-black/10 px-3 py-2.5">
        <div>
          <p className="text-[13px] font-medium leading-tight">{value}</p>
          <p className="mt-0.5 text-[11px] text-sub">{sub}</p>
        </div>
        <svg width="10" height="10" viewBox="0 0 16 16" fill="none" aria-hidden>
          <path d="M3 5.5 8 10.5l5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
}

function Guides() {
  return (
    <section className="overflow-x-clip bg-[#eeeeee]">
      <div className={`${FRAME} border-t border-black/[0.08]`}>
        {/* the section on the ruled grid: a framed column, the head as a
            cell, the filters as a ruled row, the three guides as cells */}
        <div className={`${INNER} py-[clamp(56px,6vw,116px)]`}>
          {/* the column is a share of the viewport, 1600px at 1920, so it
              keeps its proportion as the screen narrows; the guides go
              vertical under 800px */}
          <div className="relative mx-auto w-[min(1600px,84vw)] border-x border-black/[0.08]">
            <Rule pos="top" />
            <Rule pos="bottom" />
            <Cross pos="top-left" />
            <Cross pos="bottom-right" />
            <div className="border-y border-black/[0.08] px-6 py-[clamp(40px,4.5vw,72px)]">
              <motion.h2
                {...up}
                className="text-center text-[clamp(34px,3.75vw,72px)] font-medium leading-[1.05] tracking-[-2.5px] text-ink"
              >
                Guides for finance teams.
              </motion.h2>
              <motion.p {...up} className="mx-auto mt-[clamp(20px,2vw,38px)] max-w-[600px] text-center text-[clamp(16px,1.15vw,22px)] leading-[1.4] text-ink">
                How teams plan, approve, and close when agents are doing the
                buying.
              </motion.p>
            </div>
            <div className="grid grid-cols-4 border-b border-black/[0.08] text-[clamp(13px,0.95vw,18px)]">
              {["All guides", "Playbooks", "How to", "Close"].map((f, i) => (
                <span key={f} className={`flex h-12 items-center justify-center border-l border-black/[0.08] first:border-l-0 ${i === 0 ? "bg-white text-ink" : "text-sub"}`}>
                  {f}
                </span>
              ))}
            </div>
          <div className="grid min-[800px]:grid-cols-3">
            {GUIDES.map((g, k) => (
              <motion.article
                key={g.title}
                {...up}
                transition={{ ...up.transition, delay: k * 0.08 }}
                className="border-t border-black/[0.08] p-[clamp(16px,1.6vw,31px)] min-[800px]:border-l min-[800px]:border-t-0 min-[800px]:first:border-l-0"
              >
                <GuideCover g={g} />
                <h3 className="mt-[clamp(28px,2.9vw,56px)] text-[clamp(22px,1.65vw,32px)] font-medium leading-[1.15] tracking-[-0.8px] text-ink">
                  {g.title}
                </h3>
                <p className="mt-[clamp(20px,2.2vw,42px)] text-[clamp(14px,0.95vw,18px)] leading-[1.45] text-ink/70">{g.sub}</p>
                <p className="mt-[clamp(16px,1.7vw,32px)] flex items-center gap-2.5 text-[clamp(13px,0.85vw,16px)] text-sub">
                  <Image
                    src="/payloat-mark-tile.svg"
                    alt=""
                    width={24}
                    height={24}
                    className="h-6 w-6 rounded-full"
                  />
                  Payloat team
                </p>
              </motion.article>
            ))}
          </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* 11. CTA card                                                        */
/* ------------------------------------------------------------------ */

function Cta() {
  return (
    <section style={{ backgroundColor: GREEN }}>
      {/* on the green so it runs straight into the footer; the card is
          green too, with white type and a white pill */}
      <div className={`${FRAME} border-white/10`}>
        <div className="px-[clamp(20px,10.4vw,200px)] pb-[clamp(40px,3.3vw,64px)] pt-[clamp(40px,3.6vw,70px)]">
          <motion.div
            {...up}
            className="flex flex-col items-center justify-center rounded-[34px] px-6 text-center text-white"
            style={{ backgroundColor: GREEN, minHeight: "clamp(360px,33vw,640px)" }}
          >
            <h2 className="max-w-[820px] text-[clamp(30px,3vw,58px)] font-medium leading-[1.08] tracking-[-1.8px]" style={{ textWrap: "balance" }}>
              The financial manager your agents report to.
            </h2>
            <div className="mt-[clamp(28px,3vw,58px)]">
              <ArrowButton href="/contact" tone="pale">
                Book a demo
              </ArrowButton>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Shared                                                              */
/* ------------------------------------------------------------------ */

