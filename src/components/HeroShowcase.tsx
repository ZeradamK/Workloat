"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  motion,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import PurchaseTrackerCard from "./tracker/PurchaseTrackerCard";
import SubscriptionTrackerCard from "./tracker/SubscriptionTrackerCard";
import InsightsChart from "./tracker/InsightsChart";
import { money } from "./tracker/money";
import { heroT } from "./introProgress";

/**
 * The pinned hero act (200vh). The section never moves; only the middle
 * column parallaxes, at constant size, sliding up UNDER the nav bar. The
 * zone above the nav bar's top line (page top → nav top) is a hidden
 * region: blocks clip there and never appear above the nav. When half of
 * the active block has slid under the nav, it zip-vanishes in 200ms.
 *   Block 1: Purchase Tracker
 *   Block 2: the wallet + spending column (iOS Card tab anatomy)
 */

const HERO_DAILY = [
  0, 85, 85, 210, 210, 340, 340, 495, 640, 640, 820, 980, 980, 1210, 1385,
  1500, 1500, 1830, 2100, 2350,
];
/* cumulative subscription spend, ending at $210 for July */
const SUBS_DAILY = [
  0, 13, 13, 30, 30, 62, 62, 79, 79, 105, 105, 118, 130, 130, 155, 155, 172,
  186, 198, 210,
];
const HERO_X_LABELS = ["Jul 01", "Jul 07", "Jul 13", "Jul 20"];

/* Yearly activity: thin bars, gray year, current month (July) in ink with
   the lime dot beneath — the app's exact treatment. */
const YEARLY = [0.5, 0.62, 0.42, 0.7, 0.55, 0.78, 1, 0.66, 0.58, 0.72, 0.48, 0.64];
const CURRENT_MONTH = 6;

const NAV_TOP = 20; /* the nav bar's top tip line */
const NAV_BOTTOM = 68; /* nav top + its 48px height */
const COL_W = 320; /* center column width (350 - 30), matches the dock */

export default function HeroShowcase() {
  const ref = useRef<HTMLDivElement>(null);
  const [vh, setVh] = useState(900);
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
  const [zip0, setZip0] = useState(false);
  const [trackerLive, setTrackerLive] = useState(false);

  useEffect(() => {
    const measure = () => setVh(window.innerHeight);
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });
  const t = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 26,
    mass: 0.3,
  });

  const EXIT_DIST = vh * 0.78;

  /* block 0 (the wallet column) rests slightly low, then slides up under
     the nav at constant size */
  const y0 = useTransform(t, [0, 1], [30, -EXIT_DIST]);

  /* zip-vanish (200ms) once half the block has entered under the nav bar;
     the tracker's roll-up animations arm as its slide approaches */
  useMotionValueEvent(t, "change", (v) => {
    if (!isDesktop.current) return; /* hidden act must not stomp heroT */
    const threshold = (vh / 2 - NAV_BOTTOM) / EXIT_DIST;
    setZip0(v > threshold);
    setTrackerLive(v > 0.15);
    heroT.set(v); /* NavDock syncs its surface color to the slides */
  });

  /* block 1 (the tracker column) rolls up into place. It starts deep and
     travels faster than block 0 so a clear vertical gap (>= 150px) holds
     between the two sets the whole time both are on screen. */
  const y1 = useTransform(t, [0, 1], [vh * 1.28, 30]);
  const o1 = useTransform(t, [0.08, 0.5], [0, 1]);

  /* side texts crossfade in place with the slides — no sliding */
  const textAO = useTransform(t, [0.3, 0.5], [1, 0]);
  const textBO = useTransform(t, [0.52, 0.72], [0, 1]);
  const textAPE = useTransform(textAO, (v) => (v > 0.5 ? "auto" : "none"));
  const textBPE = useTransform(textBO, (v) => (v > 0.5 ? "auto" : "none"));

  return (
    <>
      <MobileHero />
      <div ref={ref} className="relative hidden h-[200vh] min-[800px]:block">
      <div className="sticky top-0 h-screen overflow-hidden bg-background">
        {/* left headline, slide 1 — fades in place */}
        <motion.div
          className="absolute left-0 top-1/2 hidden w-[calc(50%-160px)] -translate-y-1/2 justify-center min-[800px]:flex"
          style={{ opacity: textAO, pointerEvents: textAPE }}
        >
          <h1 className="w-max text-[clamp(22px,3.2vw,52px)] font-normal leading-[0.95] tracking-[-1.5px] text-ink">
            See every dollar
            <br />
            your agents spend
          </h1>
        </motion.div>

        {/* left headline, slide 2 — same exact position */}
        <motion.div
          className="absolute left-0 top-1/2 hidden w-[calc(50%-160px)] -translate-y-1/2 justify-center min-[800px]:flex"
          style={{ opacity: textBO, pointerEvents: textBPE }}
        >
          <h2 className="w-max text-[clamp(22px,3.2vw,52px)] font-normal leading-[0.95] tracking-[-1.5px] text-ink">
            Know what was bought
            <br />
            and what it was for
          </h2>
        </motion.div>

        {/* right description, slide 1 — fades in place */}
        <motion.div
          className="absolute right-0 top-1/2 hidden w-[calc(50%-160px)] -translate-y-1/2 justify-center min-[800px]:flex"
          style={{ opacity: textAO, pointerEvents: textAPE }}
        >
          <p className="w-[85%] max-w-[300px] text-pretty text-[17px] leading-[1.2] text-ink">
            Every purchase, subscription, order, and receipt your agents
            record, in one ledger
          </p>
        </motion.div>

        {/* right description, slide 2 — same exact position, with CTA */}
        <motion.div
          className="absolute right-0 top-1/2 hidden w-[calc(50%-160px)] -translate-y-1/2 justify-center min-[800px]:flex"
          style={{ opacity: textBO, pointerEvents: textBPE }}
        >
          <div className="flex w-[85%] max-w-[300px] flex-col items-start gap-5">
            <p className="text-pretty text-[17px] leading-[1.2] text-ink">
              Every agent purchase in one view. Payloat Ledger totals what
              each agent spent this month, shows the task it was given, and
              flags anything over its cap.
            </p>
            <Link
              href="/purchases"
              className="group flex h-11 items-center gap-1.5 rounded-full bg-[#eeeeee] px-5 text-[13px] font-semibold tracking-[-0.5px] text-ink transition-transform hover:scale-[1.03] active:scale-[0.97]"
            >
              Learn more
              <svg
                width="11"
                height="11"
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden
                className="transition-transform duration-200 ease-out group-hover:translate-x-[3px]"
              >
                <path
                  d="M2.5 8h11m0 0L8.8 3.3M13.5 8l-4.7 4.7"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
          </div>
        </motion.div>

        {/* the parallax layer: everything above the nav's top line is a
            hidden region — blocks slide under the nav, never above it */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{ clipPath: `inset(${NAV_TOP}px 0 0 0)` }}
        >
          {/* block 0: the wallet + spending column (first slide) */}
          <motion.div
            className="pointer-events-none absolute inset-0 flex items-center justify-center"
            style={{ y: y0 }}
            animate={{ opacity: zip0 ? 0 : 1 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <div
              className="pointer-events-auto w-full"
              style={{ maxWidth: COL_W }}
            >
              <WalletSpendBlock />
            </div>
          </motion.div>

          {/* block 1: Purchase Tracker + Subscriptions (second slide) */}
          <motion.div
            className="pointer-events-none absolute inset-0 flex items-center justify-center"
            style={{ y: y1, opacity: o1 }}
          >
            <div
              className="pointer-events-auto flex w-full flex-col gap-2.5"
              style={{ maxWidth: COL_W }}
            >
              <PurchaseTrackerCard
                countUp={trackerLive}
                tone="dark"
                bgImage="/product-hero-gradient.jpg"
                purchasesBlack
                href="/purchases"
                purchases={42}
                spend={2350}
                purchasesChange={8}
                spendChange={14}
                daily={HERO_DAILY}
                xLabels={HERO_X_LABELS}
              />
              {/* the iOS home's subscriptions card, exact anatomy */}
              <SubscriptionTrackerCard
                fluid
                tone="dark"
                href="/purchases"
                spend={210}
                daily={SUBS_DAILY}
                xLabels={HERO_X_LABELS}
                drawIn={trackerLive}
              />
            </div>
          </motion.div>
        </div>
      </div>
      </div>
    </>
  );
}

/* ---- Mobile hero (<800px): the pinned act unstacks into a Cash App
        style column, headline then graphic then copy, per screen. The
        subscriptions card is intentionally absent here. ---- */

function MobileHero() {
  const ref = useRef<HTMLDivElement>(null);
  const [trackerLive, setTrackerLive] = useState(false);
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
    offset: ["start 0.6", "end 0.75"],
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
    <div ref={ref} className="px-6 pb-20 pt-[120px] min-[800px]:hidden">
      {/* screen 1: headline over the wallet act + expense boxes */}
      <motion.h1
        {...up}
        className="text-center text-[clamp(30px,9vw,40px)] font-normal leading-[1.0] tracking-[-1.5px] text-ink"
      >
        See every dollar
        <br />
        your agents spend
      </motion.h1>
      <motion.div {...up} className="mx-auto mt-9 w-full max-w-[340px]">
        <WalletStack open />
        <div className="mt-2.5 flex items-stretch gap-2.5">
          <div className="flex flex-1 flex-col gap-2.5">
            <CardExpenses />
            <YearlyActivity />
          </div>
          <div className="flex flex-1">
            <PaymentDue />
          </div>
        </div>
      </motion.div>
      <motion.p
        {...up}
        className="mx-auto mt-9 max-w-[300px] text-center text-[17px] leading-[1.25] text-ink"
      >
        Every purchase, subscription, order, and receipt your agents record,
        in one ledger
      </motion.p>
      <motion.div {...up} className="mx-auto mt-9 w-full max-w-[340px]">
        <TotalSpending />
      </motion.div>

      {/* responsive breather before the second screen */}
      <div className="h-[clamp(80px,20vw,150px)]" />

      {/* screen 2: headline, tracker, copy + CTA */}
      <motion.h2
        {...up}
        className="text-center text-[clamp(30px,9vw,40px)] font-normal leading-[1.0] tracking-[-1.5px] text-ink"
      >
        Know what was bought
        <br />
        and what it was for
      </motion.h2>
      <motion.div
        {...up}
        onViewportEnter={() => setTrackerLive(true)}
        className="mx-auto mt-9 w-full max-w-[340px]"
      >
        <PurchaseTrackerCard
          countUp={trackerLive}
          tone="dark"
          bgImage="/product-hero-gradient.jpg"
          purchasesBlack
          href="/purchases"
          purchases={42}
          spend={2350}
          purchasesChange={8}
          spendChange={14}
          daily={HERO_DAILY}
          xLabels={HERO_X_LABELS}
        />
      </motion.div>
      <motion.div
        {...up}
        className="mx-auto mt-9 flex max-w-[300px] flex-col items-center gap-5"
      >
        <p className="text-center text-[17px] leading-[1.25] text-ink">
          Every agent purchase in one view. Payloat Ledger totals what each
          agent spent this month, shows the task it was given, and flags
          anything over its cap.
        </p>
        <Link
          href="/purchases"
          className="group flex h-11 items-center gap-1.5 rounded-full bg-[#eeeeee] px-5 text-[13px] font-semibold tracking-[-0.5px] text-ink transition-transform hover:scale-[1.03] active:scale-[0.97]"
        >
          Learn more
          <svg
            width="11"
            height="11"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden
            className="transition-transform duration-200 ease-out group-hover:translate-x-[3px]"
          >
            <path
              d="M2.5 8h11m0 0L8.8 3.3M13.5 8l-4.7 4.7"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Link>
      </motion.div>
    </div>
  );
}

/* ---- The iOS Card tab column: wallet sheet, then Card Expenses +
        Yearly activity stacked left with Payment due full-height right,
        then Total spending — the app's exact anatomy ---- */

function WalletSpendBlock() {
  return (
    <div className="flex w-full flex-col gap-2.5">
      <WalletStack open />
      <div className="flex items-stretch gap-2.5">
        <div className="flex flex-1 flex-col gap-2.5">
          <CardExpenses />
          <YearlyActivity />
        </div>
        <div className="flex flex-1">
          <PaymentDue />
        </div>
      </div>
      <TotalSpending />
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
    <div className="rounded-[24px] p-2.5" style={{ backgroundColor: "#eeeeee" }}>
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
        style={{ backgroundColor: "#d9f268" }}
        initial={false}
        animate={{ height: h(2) }}
        transition={STACK_EASE}
      >
        <div className="flex items-center justify-between px-4 pt-4">
          <span className="font-numeral text-[11px] text-ink">•••• 3346</span>
          <Visa tone="ink" />
        </div>
        <motion.span
          className="absolute bottom-3.5 left-4 text-[38px] font-bold leading-none tracking-[-1.5px] text-ink"
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
    <div className="flex flex-1 flex-col rounded-[18px] bg-mist p-3">
      <span className="text-[11px] font-medium text-sub">Agent spend</span>
      <span className="font-numeral mt-1 text-[21px] font-semibold tracking-[-0.5px] text-ink">
        {money(1240.6)}
      </span>
    </div>
  );
}

function PaymentDue() {
  return (
    <div className="flex w-full flex-col rounded-[18px] bg-mist p-3">
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
        className="mt-auto h-9 w-full rounded-full bg-white text-[12px] font-semibold text-ink"
      >
        See plans
      </button>
    </div>
  );
}

function YearlyActivity() {
  return (
    <div className="flex flex-1 flex-col rounded-[18px] bg-mist p-3">
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
    <div className="rounded-[18px] p-3" style={{ backgroundColor: "#0a0a0a" }}>
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium text-white/60">
          Total agent spend
        </span>
        <span className="flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-ink">
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
