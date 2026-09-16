"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, animate, motion, useMotionValue } from "motion/react";
import NavDock from "@/components/NavDock";
import FooterSection from "@/components/FooterSection";
import InsightsChart from "@/components/tracker/InsightsChart";
import AgentScene, { type SceneKey } from "@/components/AgentScenes";
import { money } from "@/components/tracker/money";

/**
 * Financial teams page, on Amigo's full-page anatomy (measured from the
 * 1920px capture) with Payloat's type and palette. Payle is the financial
 * manager agent that runs on Payloat infrastructure.
 *
 *   1. Hero: five-line headline left, ruled paragraph, pill; a wide dark
 *      card right with the team → Payle → agents flow and a scrolling
 *      list of finance tasks. "Trusted by" caps + a ruled logo strip.
 *   2. Stats band on the green: three ruled columns.
 *   3. Statement on the green, full width, then the green fades to white.
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

/* green → white along a smoothstep curve, so neither end shows an edge */
const FADE = `linear-gradient(to bottom, ${[
  [0, 0], [8, 1], [16, 4], [24, 9], [32, 17], [40, 27], [48, 39], [56, 52],
  [64, 65], [72, 77], [80, 87], [88, 94], [94, 98], [100, 100],
]
  .map(([at, w]) => `color-mix(in srgb, #ffffff ${w}%, #163300) ${at}%`)
  .join(", ")})`;

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

const DAILY = [
  0, 85, 85, 210, 210, 340, 340, 495, 640, 640, 820, 980, 980, 1210, 1385,
  1500, 1500, 1830, 2100, 2350,
];
const X_LABELS = ["Jul 01", "Jul 07", "Jul 13", "Jul 20"];

export default function FinanceTeamsPage() {
  return (
    <main className="bg-white">
      <NavDock forceDark />

      <Hero />
      <StatsBand />
      <Statement />
      <Workflows />
      <Playbook />
      <Security />
      <BuiltFor />
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
/* 1. Hero                                                             */
/* ------------------------------------------------------------------ */

const TASKS = [
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
const TASK_H = 34; /* one row of the list at 1920 (27.5px text, 34 leading) */
const TASK_MS = 1400;

function Hero() {
  const [active, setActive] = useState(10);
  useEffect(() => {
    const id = setInterval(
      () => setActive((a) => (a + 1) % TASKS.length),
      TASK_MS,
    );
    return () => clearInterval(id);
  }, []);

  return (
    <section className="pt-[clamp(120px,9vw,170px)]">
      <div className={FRAME}>
        <div className={`${INNER} pb-[clamp(40px,3.5vw,64px)] pt-[clamp(48px,5vw,96px)]`}>
          <div className="grid gap-12 min-[1000px]:grid-cols-[minmax(0,644px)_minmax(0,1152px)] min-[1000px]:items-start min-[1000px]:gap-[clamp(40px,3.2vw,62px)]">
            {/* left: headline, ruled paragraph, pill */}
            <div>
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, ease: EASE, delay: 0.05 }}
                className="text-[clamp(40px,4.5vw,86px)] font-medium leading-[0.96] tracking-[-2.5px] text-ink"
              >
                The finance
                <br />
                agent that
                <br />
                watches every
                <br />
                dollar your
                <br />
                agents spend.
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, ease: EASE, delay: 0.12 }}
                className="mt-[clamp(40px,4.5vw,86px)] max-w-[540px] border-l-[3px] border-black/10 pl-7 text-[clamp(18px,1.35vw,26px)] leading-[1.3] tracking-[-0.3px] text-ink"
              >
                Payle plans budgets, approves agent charges, and closes the
                month, so your team can focus on the customer.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, ease: EASE, delay: 0.18 }}
                className="mt-[clamp(28px,2.6vw,50px)] pl-[31px]"
              >
                <Pill href="/contact" dark>
                  Book a demo
                </Pill>
              </motion.div>
            </div>

            {/* right: the flow card */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: EASE, delay: 0.2 }}
              className="relative mt-[clamp(0px,3.7vw,72px)] overflow-hidden rounded-[16px] text-white"
              style={{ backgroundColor: INK, aspectRatio: "1152 / 548" }}
            >
              {/* the cream-to-black gradient where Amigo's photo sits,
                  pulled down so the white type reads on its light end */}
              <Image
                src="/product-hero-gradient.jpg"
                alt=""
                fill
                sizes="(min-width: 1000px) 60vw, 100vw"
                className="object-cover"
              />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(to right, rgba(10,10,10,0.72), rgba(10,10,10,0.5) 45%, rgba(10,10,10,0.35))",
                }}
              />
              {/* the flow: team → Payle → task → agents */}
              <div className="absolute inset-y-0 left-[5.2%] right-[3.5%] flex items-center">
                {/* the outer nodes step out under 700px so the card keeps
                    Payle and the list */}
                <span className="hidden min-[700px]:contents">
                  <Node label="Your finance team" avatar="team" />
                  <Arrow />
                </span>
                <Node label="Payle" avatar="payle" />
                <Arrow />
                {/* the task list, centered on the active row */}
                <div
                  className="relative h-full w-[clamp(180px,26%,300px)] shrink-0 overflow-hidden"
                  style={{
                    maskImage:
                      "linear-gradient(to bottom, transparent, black 18%, black 82%, transparent)",
                    WebkitMaskImage:
                      "linear-gradient(to bottom, transparent, black 18%, black 82%, transparent)",
                  }}
                >
                  <motion.ul
                    className="absolute left-0 top-1/2 w-full"
                    animate={{ y: -(active + 0.5) * TASK_H }}
                    transition={{ type: "spring", stiffness: 120, damping: 24 }}
                  >
                    {TASKS.map((t, i) => (
                      <li
                        key={t}
                        className="whitespace-nowrap text-[clamp(15px,1.4vw,27px)] tracking-[-0.4px] transition-colors duration-500"
                        style={{
                          height: TASK_H,
                          lineHeight: `${TASK_H}px`,
                          color:
                            i === active
                              ? "#ffffff"
                              : "rgba(255,255,255,0.42)",
                        }}
                      >
                        {t}
                      </li>
                    ))}
                  </motion.ul>
                </div>
                <span className="hidden min-[700px]:contents">
                  <Arrow />
                  <Node label="Your agents" avatar="agents" />
                </span>
              </div>
            </motion.div>
          </div>

          {/* trusted by */}
          <p className={`${MONO} mt-[clamp(48px,6vw,112px)] text-ink`}>
            Trusted by finance teams on
          </p>
        </div>

        {/* the ruled logo strip */}
        <div className="border-t border-black/[0.08]">
          <div className={`${INNER} grid grid-cols-3 min-[800px]:grid-cols-6`}>
            {[
              { src: "/logos/banks/chase.jpg", alt: "Chase" },
              { src: "/logos/banks/mercury.png", alt: "Mercury" },
              { src: "/logos/brex.svg", alt: "Brex" },
              { src: "/logos/stripe.svg", alt: "Stripe" },
              { src: "/logos/banks/citi.png", alt: "Citi" },
              { src: "/logos/banks/wellsfargo.png", alt: "Wells Fargo" },
            ].map((l) => (
              <div
                key={l.alt}
                className="flex h-[clamp(72px,5.6vw,108px)] items-center justify-center"
              >
                <Image
                  src={l.src}
                  alt={l.alt}
                  width={140}
                  height={40}
                  className="h-[clamp(20px,1.6vw,30px)] w-auto opacity-70 grayscale"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Node({
  label,
  avatar,
}: {
  label: string;
  avatar: "team" | "payle" | "agents";
}) {
  const size = "h-[clamp(22px,1.6vw,32px)] w-[clamp(22px,1.6vw,32px)]";
  return (
    <div className="flex shrink-0 items-center gap-2.5">
      {/* the team has no mark, only its bold label; Payle wears the
          Payloat mark, which is Payle's mark too */}
      {avatar === "payle" && (
        <span className={`${size} flex items-center justify-center rounded-full bg-white`}>
          <Image
            src="/payloat-icon-dark.svg"
            alt=""
            width={18}
            height={18}
            className="h-[62%] w-[62%]"
          />
        </span>
      )}
      {avatar === "agents" && (
        <span
          className={`${size} flex items-center justify-center overflow-hidden rounded-full`}
          style={{ backgroundColor: "rgba(255,255,255,0.14)" }}
        >
          <svg width="55%" height="55%" viewBox="0 0 16 16" fill="none" aria-hidden>
            <rect x="2" y="2" width="5" height="5" rx="1.2" fill="#ffffff" opacity="0.9" />
            <rect x="9" y="2" width="5" height="5" rx="1.2" fill="#ffffff" opacity="0.9" />
            <rect x="2" y="9" width="5" height="5" rx="1.2" fill="#ffffff" opacity="0.9" />
            <rect x="9" y="9" width="5" height="5" rx="1.2" fill="#ffffff" opacity="0.9" />
          </svg>
        </span>
      )}
      <span
        className={`${MONO} whitespace-nowrap text-[clamp(8px,0.6vw,11px)] ${avatar === "team" ? "font-bold text-white" : "text-white/90"}`}
      >
        {label}
      </span>
    </div>
  );
}

function Arrow() {
  return (
    <span className="mx-[clamp(10px,2.4vw,48px)] flex flex-1 items-center">
      <span className="h-px flex-1 bg-white/25" />
      <svg width="8" height="8" viewBox="0 0 8 8" fill="none" aria-hidden>
        <path d="M1 4h6M4.5 1.5 7 4 4.5 6.5" stroke="rgba(255,255,255,0.45)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* 2. Stats band                                                       */
/* ------------------------------------------------------------------ */

const STATS = [
  { label: "Payle watches agent charges", value: "24/7" },
  { label: "To approve a charge under cap", value: "<1s" },
  { label: "Spent past a cap Payle did not approve", value: "$0" },
];

function StatsBand() {
  return (
    <section style={{ backgroundColor: GREEN }}>
      <div className={`${FRAME} border-white/10`}>
        <div className={`${INNER} py-[clamp(48px,5.7vw,110px)]`}>
          <div className="grid border-y border-white/25 min-[800px]:grid-cols-3">
            {STATS.map((s, i) => (
              <motion.div
                key={s.label}
                {...up}
                transition={{ ...up.transition, delay: i * 0.08 }}
                className="flex flex-col items-center px-6 pb-[clamp(56px,5.5vw,106px)] pt-[clamp(8px,0.7vw,14px)] text-center text-white min-[800px]:border-l min-[800px]:border-white/25 min-[800px]:first:border-l-0"
              >
                <span className="text-[clamp(14px,0.95vw,18px)] leading-[1.3] text-white/90">
                  {s.label}
                </span>
                <span className="font-numeral mt-[clamp(28px,3vw,58px)] text-[clamp(64px,6.4vw,124px)] font-medium leading-none tracking-[-4px]">
                  {s.value}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* 3. Statement card, then the green fades to white                    */
/* ------------------------------------------------------------------ */

function Statement() {
  return (
    <section style={{ backgroundColor: GREEN }}>
      {/* the statement lies on the green itself, full width, then the
          green fades to white toward the workflows */}
      <div className={`${FRAME} border-white/10`}>
        <motion.div
          {...up}
          className="relative grid gap-10 px-[clamp(24px,5.7vw,110px)] pb-[clamp(56px,8vw,160px)] pt-[clamp(24px,5vw,96px)] text-white min-[900px]:grid-cols-[clamp(120px,22%,444px)_1fr]"
        >
          {/* the Payloat mark, which is Payle's mark too, in white */}
          <Image
            src="/payloat-icon-dark.svg"
            alt="Payloat"
            width={56}
            height={56}
            className="h-[clamp(36px,3vw,56px)] w-auto self-start invert"
          />
          <div className="max-w-[1000px]">
            <p className="text-[clamp(22px,2vw,38px)] leading-[1.15] tracking-[-1px]">
              &ldquo;The expensive mistakes in finance are the ones nobody
              saw coming. Payle sees every agent charge the moment it
              lands, so the team decides before the money moves, and spends
              its time on the customer instead of the spreadsheet.&rdquo;
            </p>
            <p className="mt-[clamp(32px,4.5vw,86px)] text-[clamp(15px,0.95vw,18px)] leading-[1.45]">
              Payle
              <br />
              <span className="text-white/70">
                Financial manager agent, running on Payloat infrastructure
              </span>
            </p>
          </div>
          {/* the little pager Amigo shows at the right edge */}
          <div className="absolute right-[clamp(16px,3.5vw,66px)] top-1/2 hidden -translate-y-1/2 flex-col items-center gap-2 min-[900px]:flex">
            <span className="h-5 w-[3px] rounded-full bg-white" />
            <span className="h-[3px] w-[3px] rounded-full bg-white/60" />
            <span className="h-[3px] w-[3px] rounded-full bg-white/60" />
          </div>
        </motion.div>
      </div>
      {/* an eased fade: a plain two-stop gradient shows a visible line
          where the flat green meets it, so the stops follow a smooth
          curve and the band is tall */}
      <div className="h-[clamp(260px,28vw,540px)]" style={{ background: FADE }} />
    </section>
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
const STEP = CARD_W + CARD_GAP;

function Workflows() {
  const [index, setIndex] = useState(0);
  const max = WORKFLOWS.length - 1;
  /* the track's x: the arrows animate it, a drag moves it live and then
     snaps to the nearest card by position and fling */
  const x = useMotionValue(0);
  const go = (i: number) => {
    const next = Math.min(max, Math.max(0, i));
    setIndex(next);
    animate(x, -next * STEP, { type: "spring", stiffness: 140, damping: 26 });
  };
  return (
    <section className="overflow-hidden pb-[clamp(72px,7vw,140px)] pt-[clamp(40px,4.4vw,84px)]">
      <motion.h2
        {...up}
        className="px-6 text-center text-[clamp(32px,3.3vw,64px)] font-medium leading-[1.05] tracking-[-2px] text-ink"
      >
        Workflows built for finance teams.
      </motion.h2>

      {/* the track: 452x630 cards with 22px gaps at 1920, centered so
          a card bleeds on both edges like Amigo's; drag it or use the
          arrows */}
      <div className="mt-[clamp(40px,4.3vw,84px)] flex justify-center">
        <motion.div
          className="flex cursor-grab gap-[22px] active:cursor-grabbing"
          style={{ x }}
          drag="x"
          dragConstraints={{ left: -max * STEP, right: 0 }}
          dragElastic={0.12}
          dragMomentum={false}
          onDragEnd={(_, info) => {
            const fling = info.velocity.x;
            const at = -x.get() / STEP;
            const target =
              Math.abs(fling) > 400 ? (fling < 0 ? Math.ceil(at) : Math.floor(at)) : Math.round(at);
            go(target);
          }}
        >
          {WORKFLOWS.map((w) => (
            <WorkflowCard key={w.label} {...w} />
          ))}
        </motion.div>
      </div>

      <div className="mt-[clamp(40px,4.5vw,86px)] flex justify-center gap-[22px]">
        <button
          type="button"
          aria-label="Previous"
          onClick={() => go(index - 1)}
          className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-mist text-ink transition-transform hover:scale-105 disabled:opacity-40"
          disabled={index === 0}
        >
          <ArrowIcon dir="left" />
        </button>
        <button
          type="button"
          aria-label="Next"
          onClick={() => go(index + 1)}
          className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-mist text-ink transition-transform hover:scale-105 disabled:opacity-40"
          disabled={index === max}
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
}: (typeof WORKFLOWS)[number]) {
  const bg = canvas === "mist" ? "#eeeeee" : canvas === "ink" ? INK : GREEN;
  const dark = canvas !== "mist";
  return (
    <div
      className="relative shrink-0 overflow-hidden rounded-[24px]"
      style={{ width: CARD_W, height: 630, backgroundColor: bg }}
    >
      <div className="absolute inset-x-[36px] top-[44px]">
        <Figure kind={figure} dark={dark} />
      </div>
      <span
        className="absolute left-1/2 top-1/2 flex h-[50px] -translate-x-1/2 -translate-y-1/2 items-center rounded-[10px] px-[26px] text-[18px] text-white backdrop-blur-md"
        style={{ backgroundColor: dark ? "rgba(255,255,255,0.18)" : "rgba(10,10,10,0.55)" }}
      >
        {label}
      </span>
      <span
        className={`${MONO} absolute bottom-[26px] left-[36px] text-[10px]`}
        style={{ color: dark ? "rgba(255,255,255,0.45)" : "rgba(10,10,10,0.45)" }}
      >
        Sample data
      </span>
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
            <div className="mt-2 h-[6px] rounded-full" style={{ backgroundColor: track }}>
              <motion.div
                className="h-full rounded-full"
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
      <div className="rounded-[16px] p-4" style={{ backgroundColor: card }}>
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
          <span className="rounded-full px-3 py-1 text-[12px] font-medium" style={{ backgroundColor: "#9fe870", color: INK }}>
            Approved
          </span>
          <span className="rounded-full px-3 py-1 text-[12px] font-medium" style={{ backgroundColor: track, color: fg }}>
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
              className="flex h-5 w-5 items-center justify-center rounded-full"
              style={{ backgroundColor: i < 3 ? "#9fe870" : track }}
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
          <div key={name} className="flex items-center gap-3 rounded-[14px] px-3 py-2.5" style={{ backgroundColor: card }}>
            <span className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-white">
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
    <div className="rounded-[16px] p-4" style={{ backgroundColor: card }}>
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
              <Pill href="/product" ghost>
                Explore the platform
              </Pill>
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
                  className="max-w-[560px] rounded-[16px] bg-white p-5 text-ink"
                >
                  <div className="flex items-start gap-3">
                    <Image
                      src="/zeradam.jpg"
                      alt=""
                      width={32}
                      height={32}
                      className="mt-0.5 h-8 w-8 shrink-0 rounded-[8px] object-cover"
                    />
                    <div>
                      <p className="text-[13px] font-semibold">Zeradam</p>
                      <p className="mt-0.5 text-[15px] leading-[1.4]">{play.ask}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-start gap-3">
                    <Image
                      src="/payloat-app-icon-blacktile.png"
                      alt=""
                      width={32}
                      height={32}
                      className="mt-0.5 h-8 w-8 shrink-0 rounded-[8px]"
                    />
                    <div className="flex-1">
                      <p className="text-[13px] font-semibold">
                        Payle <span className="ml-1 rounded-[4px] bg-mist px-1.5 py-px text-[10px] font-medium text-sub">APP</span>
                      </p>
                      <p className="mt-0.5 text-[15px] leading-[1.4]">{play.reply}</p>
                      <div className="mt-3 h-[6px] rounded-full bg-mist">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ backgroundColor: INK }}
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
    <section className="bg-white">
      <div className={FRAME}>
        <div className="relative px-[clamp(20px,2.5vw,48px)] pt-[clamp(96px,10vw,200px)]">
          <div className="absolute bottom-0 left-[clamp(20px,2.5vw,48px)] top-[clamp(96px,10vw,200px)] hidden w-px bg-black/10 min-[800px]:block" />

          <motion.h2
            {...up}
            className="mx-auto max-w-[1100px] text-center text-[clamp(34px,4vw,76px)] font-medium leading-[1.06] tracking-[-2.5px] text-ink"
          >
            Built for how your team spends
            <br />
            <span className="text-ink/45">
              A financial manager for your budgets, vendors, and agents.
            </span>
          </motion.h2>

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
                    <Pill href="/product">Explore the platform</Pill>
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
    <section className="bg-white">
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
                <Pill href="/integration">See the integration</Pill>
              </motion.div>
            </div>
            <motion.div
              {...up}
              className="relative rounded-[24px] p-[clamp(24px,2.5vw,48px)] text-white"
              style={{ backgroundColor: GREEN, minHeight: "clamp(360px,37.5vw,720px)" }}
            >
              {/* the card grows with its steps; the min height keeps
                  Amigo's 1120x720 proportion when the steps are short */}
              <ol className="flex h-full flex-col justify-between gap-[clamp(20px,2vw,40px)]">
                {SETUP.map(([t, b], k) => (
                  <li key={t} className="flex gap-[clamp(16px,1.5vw,28px)] border-t border-white/20 pt-[clamp(14px,1.4vw,26px)] first:border-t-0 first:pt-0">
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
      className="relative overflow-hidden rounded-[24px]"
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
      <span
        className={`${CAPS} absolute right-[26px] top-[36px] text-[10px]`}
        style={{ color: onPhoto ? "rgba(255,255,255,0.7)" : "rgba(10,10,10,0.45)" }}
      >
        Sample data
      </span>

      {/* the UI card, inset like Mercury's and clipped at the foot */}
      <div className="absolute inset-x-[clamp(20px,11%,60px)] top-[clamp(120px,32%,236px)] rounded-[12px] bg-white p-[clamp(20px,6.5%,36px)] text-ink shadow-[0_24px_60px_rgba(10,10,10,0.25)]">
        <UiCard kind={g.ui} />
      </div>
    </div>
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
      <div className="mt-1.5 flex items-center justify-between rounded-[8px] border border-black/10 px-3 py-2.5">
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
    <section className="bg-white">
      <div className={`${FRAME} border-t border-black/[0.08]`}>
        <div className={`${INNER} pt-[clamp(56px,6vw,116px)]`}>
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
          <div className="mt-[clamp(56px,7vw,136px)] flex gap-8 text-[clamp(15px,0.95vw,18px)]">
            <span className="text-ink">All guides</span>
            <span className="text-sub">Playbooks</span>
            <span className="text-sub">How to</span>
            <span className="text-sub">Close</span>
          </div>
          <div className="mt-[clamp(32px,3.5vw,68px)] grid gap-12 pb-[clamp(56px,6vw,116px)] min-[900px]:grid-cols-3 min-[900px]:gap-0">
            {GUIDES.map((g, k) => (
              <motion.article
                key={g.title}
                {...up}
                transition={{ ...up.transition, delay: k * 0.08 }}
                className="min-[900px]:border-l min-[900px]:border-black/[0.08] min-[900px]:px-[clamp(16px,1.6vw,31px)] min-[900px]:first:border-l-0 min-[900px]:first:pl-0 min-[900px]:last:pr-0"
              >
                <GuideCover g={g} />
                <h3 className="mt-[clamp(28px,2.9vw,56px)] text-[clamp(22px,1.65vw,32px)] font-medium leading-[1.15] tracking-[-0.8px] text-ink">
                  {g.title}
                </h3>
                <p className="mt-[clamp(20px,2.2vw,42px)] text-[clamp(14px,0.95vw,18px)] leading-[1.45] text-ink/70">{g.sub}</p>
                <p className="mt-[clamp(16px,1.7vw,32px)] flex items-center gap-2.5 text-[clamp(13px,0.85vw,16px)] text-sub">
                  <Image
                    src="/payloat-app-icon-blacktile.png"
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
              <Pill href="/contact" light>
                Book a demo
              </Pill>
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

function Pill({
  href,
  children,
  dark = false,
  light = false,
  ghost = false,
}: {
  href: string;
  children: React.ReactNode;
  /** black pill, white text */
  dark?: boolean;
  /** white pill, ink text */
  light?: boolean;
  /** translucent white pill on dark grounds */
  ghost?: boolean;
}) {
  const cls = dark
    ? "bg-[#0a0a0a] text-white"
    : light
      ? "bg-white text-ink"
      : ghost
        ? "bg-white/15 text-white"
        : "bg-mist text-ink";
  return (
    <Link
      href={href}
      className={`inline-flex h-12 items-center rounded-full px-6 text-[15px] font-medium transition-transform hover:scale-[1.03] active:scale-[0.97] ${cls}`}
    >
      {children}
    </Link>
  );
}
