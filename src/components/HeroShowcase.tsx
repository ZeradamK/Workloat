"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, useMotionValueEvent, useScroll } from "motion/react";
import InsightsChart from "./tracker/InsightsChart";
import { money } from "./tracker/money";
import { heroT } from "./introProgress";

/**
 * The hero: one still screen on #eeeeee. The headline sits left, the
 * wallet + spending column (iOS Card tab anatomy) sits center. The act
 * writes heroT as it scrolls out so the nav dock moves to its light
 * surface once the hero is gone.
 */

const HERO_DAILY = [
  0, 85, 85, 210, 210, 340, 340, 495, 640, 640, 820, 980, 980, 1210, 1385,
  1500, 1500, 1830, 2100, 2350,
];
const HERO_X_LABELS = ["Jul 01", "Jul 07", "Jul 13", "Jul 20"];

/* Yearly activity: thin bars, gray year, current month (July) in ink with
   the lime dot beneath — the app's exact treatment. */
const YEARLY = [0.5, 0.62, 0.42, 0.7, 0.55, 0.78, 1, 0.66, 0.58, 0.72, 0.48, 0.64];
const CURRENT_MONTH = 6;

const COL_W = 320; /* center column width (350 - 30), matches the dock */

/* the ground, shared with the goal act that follows */
const HERO_GROUND = "#eeeeee";

export default function HeroShowcase() {
  const ref = useRef<HTMLDivElement>(null);
  /* only the visible breakpoint's act may write the shared heroT signal */
  const isDesktop = useRef(true);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 800px)");
    const update = () => {
      isDesktop.current = mq.matches;
    };
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  /* 0 while the hero fills the viewport, 1 once it has scrolled away */
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    if (!isDesktop.current) return; /* hidden act must not stomp heroT */
    heroT.set(v);
  });

  return (
    <>
      <MobileHero />
      <div
        ref={ref}
        className="relative hidden min-h-screen min-[800px]:block"
        style={{ backgroundColor: HERO_GROUND }}
      >
        {/* left headline */}
        <div className="absolute left-0 top-1/2 flex w-[calc(50%-160px)] -translate-y-1/2 justify-center">
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.25, 0.6, 0.2, 1] }}
            className="w-max text-[clamp(22px,3.2vw,52px)] font-normal leading-[0.95] tracking-[-1.5px] text-ink"
          >
            See every dollar
            <br />
            your agents spend
          </motion.h1>
        </div>

        {/* right description */}
        <div className="absolute right-0 top-1/2 flex w-[calc(50%-160px)] -translate-y-1/2 justify-center">
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.25, 0.6, 0.2, 1], delay: 0.05 }}
            className="w-[85%] max-w-[300px] text-pretty text-[17px] leading-[1.2] text-ink"
          >
            Every purchase, subscription, order, and receipt your agents
            record, in one ledger
          </motion.p>
        </div>

        {/* the wallet + spending column, centered under the dock */}
        <div className="flex min-h-screen items-center justify-center pb-10 pt-[100px]">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.25, 0.6, 0.2, 1], delay: 0.1 }}
            className="w-full"
            style={{ maxWidth: COL_W }}
          >
            <WalletSpendBlock />
          </motion.div>
        </div>
      </div>
    </>
  );
}

/* ---- Mobile hero (<800px): headline then the wallet act and the
        spending tiles, on the same ground. ---- */

function MobileHero() {
  const ref = useRef<HTMLDivElement>(null);
  const isMobile = useRef(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 799px)");
    const update = () => {
      isMobile.current = mq.matches;
    };
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    if (!isMobile.current) return; /* hidden act must not stomp heroT */
    heroT.set(v);
  });

  const up = {
    initial: { opacity: 0, y: 40 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-60px" },
    transition: { duration: 0.5, ease: [0.25, 0.6, 0.2, 1] },
  } as const;

  return (
    <div
      ref={ref}
      className="px-6 pb-20 pt-[120px] min-[800px]:hidden"
      style={{ backgroundColor: HERO_GROUND }}
    >
      <motion.h1
        {...up}
        className="text-center text-[clamp(30px,9vw,40px)] font-normal leading-[1.0] tracking-[-1.5px] text-ink"
      >
        See every dollar
        <br />
        your agents spend
      </motion.h1>
      <motion.p
        {...up}
        className="mx-auto mt-6 max-w-[300px] text-center text-[17px] leading-[1.25] text-ink"
      >
        Every purchase, subscription, order, and receipt your agents record,
        in one ledger
      </motion.p>
      <motion.div {...up} className="mx-auto mt-9 w-full max-w-[340px]">
        <WalletSpendBlock />
      </motion.div>
    </div>
  );
}

/* ---- The iOS Card tab column: wallet sheet, then Card Expenses +
        Yearly activity stacked left with Payment due full-height right,
        then Total spending — the app's exact anatomy ---- */

/* the grid's small crosshair where a rule meets a rail */
function GridCross({ pos }: { pos: "top-left" | "bottom-right" }) {
  const at = pos === "top-left" ? "-left-[7px] -top-[7px]" : "-bottom-[7px] -right-[7px]";
  return (
    <span className={`pointer-events-none absolute z-10 h-[13px] w-[13px] ${at}`} aria-hidden>
      <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-black/40" />
      <span className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-black/40" />
    </span>
  );
}

function WalletSpendBlock() {
  return (
    <div className="flex w-full flex-col gap-2.5">
      <WalletStack open />
      {/* the spend tiles and the total, on the site's ruled grid: one
          framed block, cells sharing hairlines, rules running past the
          frame with crosshairs at two corners */}
      <div className="relative mt-1.5 border border-black/[0.12]">
        <span className="pointer-events-none absolute -left-6 -right-6 -top-px h-px bg-black/[0.12]" />
        <span className="pointer-events-none absolute -bottom-px -left-6 -right-6 h-px bg-black/[0.12]" />
        <GridCross pos="top-left" />
        <GridCross pos="bottom-right" />
        <div className="grid grid-cols-2">
          <div className="flex flex-col">
            <CardExpenses />
            <YearlyActivity />
          </div>
          <div className="flex border-l border-black/[0.12]">
            <PaymentDue />
          </div>
        </div>
        <div className="border-t border-black/[0.12]">
          <TotalSpending />
        </div>
      </div>
    </div>
  );
}

function Visa({ tone = "gray" }: { tone?: "gray" | "ink" | "white" }) {
  return (
    <span
      className="text-[11px] font-extrabold italic tracking-[-0.5px]"
      style={{
        color: tone === "white" ? "#ffffff" : "#0a0a0a",
        opacity: tone === "gray" ? 0.35 : 0.95,
      }}
    >
      VISA
    </span>
  );
}

/* the iOS card-stack motion: open card = 187pt hero, closed = 60pt strip,
   ease(0.3, 0.9, 0.3, 1) x 0.7s */
const STACK_EASE = { duration: 0.7, ease: [0.3, 0.9, 0.3, 1] } as const;
const CARD_OPEN = 187;
const CARD_CLOSED = 60;
const CYCLE_MS = 1800;

function WalletStack({ open }: { open: boolean }) {
  /* loop: each card takes its turn fully open, constantly */
  const [active, setActive] = useState(0);
  useEffect(() => {
    if (!open) return;
    const id = setInterval(() => setActive((a) => (a + 1) % 3), CYCLE_MS);
    return () => clearInterval(id);
  }, [open]);

  /* the middle card folds a touch shorter so its art shows no white edge */
  const h = (i: number) =>
    open && active === i ? CARD_OPEN : i === 1 ? 52 : CARD_CLOSED;
  const lit = (i: number) => open && active === i;

  return (
    <div>
      {/* card 1: Apple Pay — number top-left, VISA top-right, logo
          bottom-left (the Payloat logotype position) */}
      <motion.div
        className="relative overflow-hidden rounded-[14px]"
        style={{ backgroundColor: "#f5f5f4" }}
        initial={false}
        animate={{ height: h(0) }}
        transition={STACK_EASE}
      >
        <div className="flex items-center justify-between px-4 pt-4">
          <span className="font-numeral text-[11px] text-ink">•••• 1458</span>
          <Visa />
        </div>
        {/* engraved on the card, trimmed to the glyph and placed with the
            Payloat logotype's exact padding (left 16 / bottom 14 when open);
            top-anchored so the fold's upward clip covers it mechanically */}
        <div className="absolute left-4 top-[133px]">
          <Image
            src="/apple-pay-trim.png"
            alt="Apple Pay"
            width={97}
            height={40}
            className="h-[40px] w-auto mix-blend-multiply"
          />
        </div>
      </motion.div>
      {/* card 2: Apple Card — number top-left, WHITE VISA top-right */}
      <motion.div
        className="relative mt-2 overflow-hidden rounded-[14px] bg-white"
        initial={false}
        animate={{ height: h(1) }}
        transition={STACK_EASE}
      >
        {/* top-anchored art: the Apple icon sits framed in the top-left
            corner when folded, full card face when open */}
        <div className="absolute inset-0">
          <Image
            src="/apple-card-crop.png"
            alt="Apple Card"
            fill
            sizes="320px"
            className="scale-[1.04] object-cover"
            style={{ objectPosition: "50% -8px" }}
          />
        </div>
        <div className="absolute inset-x-0 top-0 flex items-center justify-end px-4 pt-4">
          <Visa tone="white" />
        </div>
      </motion.div>
      {/* card 3: Payloat */}
      <motion.div
        className="relative mt-2 overflow-hidden rounded-[14px]"
        style={{ backgroundColor: "#0a0a0a" }}
        initial={false}
        animate={{ height: h(2) }}
        transition={STACK_EASE}
      >
        <div className="relative flex items-center justify-between px-4 pt-4">
          <span className="font-numeral text-[11px] text-white">•••• 3346</span>
          <Visa tone="white" />
        </div>
        <motion.span
          className="absolute bottom-3.5 left-4 text-[38px] font-bold leading-none tracking-[-1.5px] text-white"
          initial={false}
          animate={{ opacity: lit(2) ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        >
          Payloat
        </motion.span>
      </motion.div>
    </div>
  );
}

function CardExpenses() {
  return (
    <div className="flex flex-1 flex-col bg-white p-3">
      <span className="text-[11px] font-medium text-sub">Agent spend</span>
      <span className="font-numeral mt-1 text-[21px] font-semibold tracking-[-0.5px] text-ink">
        {money(1240.6)}
      </span>
    </div>
  );
}

function PaymentDue() {
  return (
    <div className="flex w-full flex-col bg-white p-3">
      <span className="text-[11px] font-medium text-sub">Renewing soon</span>
      <span className="font-numeral mt-1 text-[21px] font-semibold tracking-[-0.5px] text-ink">
        $120
      </span>
      <div className="mt-2 flex flex-col gap-1 pb-[10px]">
        <div className="flex items-center justify-between">
          <span className="text-[12px] text-ink">Adobe</span>
          <span className="font-numeral text-[12px] text-ink">$49.99</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[12px] text-ink">Spotify</span>
          <span className="font-numeral text-[12px] text-ink">$11.99</span>
        </div>
      </div>
      {/* white pill, the app's Pay Early treatment */}
      <button
        type="button"
        className="mt-auto h-9 w-full border border-black/[0.12] bg-mist text-[12px] font-semibold text-ink"
      >
        See plans
      </button>
    </div>
  );
}

function YearlyActivity() {
  return (
    <div className="flex flex-1 flex-col border-t border-black/[0.12] bg-white p-3">
      <span className="text-[11px] font-medium text-sub">Yearly activity</span>
      <div className="mt-2 flex flex-1 items-end justify-between">
        {YEARLY.map((v, i) => (
          <div key={i} className="flex h-full flex-col items-center justify-end gap-[3px]">
            <div
              className="w-[5px] rounded-full"
              style={{
                height: `${v * 82}%`,
                backgroundColor: i === CURRENT_MONTH ? "#0a0a0a" : "#dcdcda",
              }}
            />
            <div
              className="h-[5px] w-[5px] rounded-full"
              style={{
                backgroundColor:
                  i === CURRENT_MONTH ? "#d9f268" : "transparent",
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function TotalSpending() {
  return (
    <div className="p-3" style={{ backgroundColor: "#0a0a0a" }}>
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium text-white/60">
          Total agent spend
        </span>
        <span className="flex items-center gap-1 bg-white px-2.5 py-1 text-[11px] font-semibold text-ink">
          Jul 2026
          <svg width="8" height="8" viewBox="0 0 16 16" fill="none" aria-hidden>
            <path
              d="M3 5.5 8 10.5l5-5"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </div>
      <p className="font-numeral mt-1 text-[22px] font-bold tracking-[-0.5px] text-white">
        {money(2350)}
      </p>
      <InsightsChart
        daily={HERO_DAILY}
        xLabels={HERO_X_LABELS}
        tone="dark"
        className="mt-1.5 h-[128px]"
      />
    </div>
  );
}
