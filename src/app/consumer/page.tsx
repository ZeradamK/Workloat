"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import NavDock from "@/components/NavDock";
import FooterSection from "@/components/FooterSection";
import InsightsChart from "@/components/tracker/InsightsChart";

/**
 * Consumer page (the former features page, ElevenLabs anatomy, user refs). Section 1: eyebrow +
 * split headline/paragraph + Learn more, then two cards — gradient chat
 * canvas (refund conversation) and analytics card. Section 2: centered
 * headline + segmented toggle + masonry of feature cards (placeholder
 * canvases until imagery is supplied). Responsive ease-in gaps between
 * every block.
 */

const EASE = [0.25, 0.6, 0.2, 1] as const;

const up = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.55, ease: EASE },
} as const;

const DAILY = [
  0, 85, 85, 210, 210, 340, 340, 495, 640, 640, 820, 980, 980, 1210, 1385,
  1500, 1500, 1830, 2100, 2350,
];
const X_LABELS = ["Jul 01", "Jul 07", "Jul 13", "Jul 20"];

/* the site's ruled grid: a rule running 24px past the rails, and the
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

export default function ConsumerPage() {
  return (
    <main className="bg-[#eeeeee]">
      <NavDock forceDark />

      <section className="mx-auto max-w-[1200px] overflow-x-clip px-6 pb-[clamp(96px,11vw,176px)] pt-[180px]">
        {/* ---- section 1: split header + chat / analytics cards ---- */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="text-[15px] text-sub"
        >
          Payloat Ledger Features
        </motion.p>

        {/* the hero on the site's ruled grid: a framed column with the
            headline and copy as two cells, then the two cards as cells */}
        <div className="relative mt-4 border-x border-black/[0.08]">
          {/* head row */}
          <div className="relative grid border-y border-black/[0.08] min-[900px]:grid-cols-[3fr_2fr]">
            <Rule pos="top" />
            <Cross pos="top-left" />
            <div className="p-6 min-[900px]:p-10">
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, ease: EASE, delay: 0.05 }}
                className="text-[clamp(34px,4.2vw,58px)] font-medium leading-[1.08] tracking-[-2px] text-ink"
              >
                Record, match, and summarize,
                <br />
                all in one place
              </motion.h1>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, ease: EASE, delay: 0.12 }}
              >
                <Link
                  href="/product"
                  className="mt-8 inline-flex h-12 items-center rounded-full bg-[#0a0a0a] px-6 text-[15px] font-medium text-white transition-transform hover:scale-[1.03] active:scale-[0.97]"
                >
                  Learn more
                </Link>
              </motion.div>
            </div>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: EASE, delay: 0.1 }}
              className="border-t border-black/[0.08] p-6 text-[17px] leading-[1.5] text-ink min-[900px]:border-l min-[900px]:border-t-0 min-[900px]:p-10"
            >
              Payloat Ledger records what your agents buy, matches every
              receipt, and turns agent spend into a summary you can act on.
            </motion.p>
          </div>

          {/* the cards row */}
          <div className="relative grid border-b border-black/[0.08] min-[900px]:grid-cols-[3fr_2fr]">
            <Rule pos="bottom" />
            <Cross pos="bottom-right" />

            {/* chat cell: a refund, followed to the end */}
            <motion.div
              {...up}
              className="relative flex h-[560px] items-center justify-center overflow-hidden min-[900px]:h-[640px]"
            >
              <Image
                src="/payloat-card-gradient.png"
                alt=""
                fill
                sizes="(min-width: 900px) 690px, 100vw"
                className="object-cover"
              />
              <div className="relative flex w-[min(380px,84%)] -translate-y-6 flex-col gap-3">
                <span className="self-end rounded-full border border-solid border-white/70 px-5 py-3 text-[15px] text-white">
                  What did Procurement buy this week?
                </span>
                <span className="max-w-[300px] self-start rounded-[22px] bg-white px-5 py-3 text-[15px] leading-snug text-ink">
                  Four orders, $891.34 total. One went over its cap.
                </span>
                <span className="self-end rounded-full border border-solid border-white/70 px-5 py-3 text-[15px] text-white">
                  Which one?
                </span>
                <span className="max-w-[300px] self-start rounded-[22px] bg-white px-5 py-3 text-[15px] leading-snug text-ink">
                  WebstaurantStore, $96.50 against an $80 cap. Receipt matched.
                </span>
                <span className="flex w-fit items-center gap-2.5 self-start rounded-full bg-white py-2 pl-2 pr-5 text-[15px] font-medium text-ink">
                  <Image
                    src="/payloat-mark-tile.svg"
                    alt=""
                    width={26}
                    height={26}
                    className="h-[26px] w-[26px] rounded-[7px]"
                  />
                  Summary ready
                </span>
              </div>
              <div className="absolute bottom-7 left-7 right-7">
                <p className="text-[15px] text-white/70">Agent summaries</p>
                <p className="mt-1 max-w-[460px] text-[16px] leading-[1.4] text-white">
                  Ask about any agent and get the purchases, receipts, and issues
                  behind the number.
                </p>
              </div>
            </motion.div>

            {/* analytics cell: the spend overview panel as an inner cell */}
            <motion.div
              {...up}
              transition={{ ...up.transition, delay: 0.08 }}
              className="flex h-[560px] flex-col border-t border-black/[0.08] p-7 min-[900px]:h-[640px] min-[900px]:border-l min-[900px]:border-t-0"
              style={{ backgroundColor: "#eeeeee" }}
            >
              <div className="border border-black/[0.08] bg-white p-6">
                <p className="text-[15px] font-semibold text-ink">
                  Agent spend overview
                </p>
                <p className="font-numeral mt-1 text-[26px] font-bold tracking-[-0.5px] text-ink">
                  $2,350
                </p>
                <InsightsChart
                  daily={DAILY}
                  xLabels={X_LABELS}
                  className="mt-3 h-[170px]"
                />
              </div>
              <div className="mt-auto">
                <p className="text-[15px] text-sub">Insights</p>
                <p className="mt-1 max-w-[400px] text-[16px] leading-[1.4] text-ink">
                  Measure the month at a glance: spend by agent, renewals ahead,
                  and receipts still missing.
                </p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* ---- section 3: the everyday stack (Klarna anatomy) — pinned
                act, image layers slide over each other while the right
                tab list advances in sync ---- */}
        <div id="everyday">
          <EverydayStack />
        </div>
      </section>

      <FooterSection />
    </main>
  );
}

/* ---- the everyday stack act ---- */

const STACK_FEATURES: {
  title: string;
  desc: string;
  bg: string;
  image?: string;
  dark?: boolean;
}[] = [
  {
    title: "Every agent purchase in one ledger",
    desc: "Intents, checkouts, and receipts flow into a single tracked list the moment an agent records them.",
    bg: "#a44ede",
    image: "/features-stack1.jpg",
  },
  {
    title: "Orders never go late quietly",
    desc: "Every order and trip carries its expected date, with a flag the day it passes.",
    bg: "#0a0a0a",
    image: "/features-stack2.jpg",
    dark: true,
  },
  {
    title: "Renewals seen coming",
    desc: "Subscriptions your agents hold are flagged before they charge, so nothing renews unnoticed.",
    bg: "#f0efed",
    image: "/features-stack3.jpg",
  },
  {
    title: "Receipts matched to the cent",
    desc: "Every receipt is checked against what the agent recorded, and the gaps are flagged.",
    bg: "#6aa5c8",
    image: "/features-stack4.jpg",
  },
  {
    title: "Caps under control",
    desc: "Every task carries a cap, so an agent that overspends is caught in the ledger, not on the statement.",
    bg: "#7a1230",
    image: "/features-stack5.jpg",
    dark: true,
  },
];

function EverydayStack() {
  const ref = useRef<HTMLDivElement>(null);
  /* React state is only the discrete active tab; the deck layers ride
     motion values directly, so scrolling never re-renders the tree */
  const [active, setActive] = useState(0);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });
  const t = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 26,
    mass: 0.3,
  });
  useMotionValueEvent(t, "change", (v) => {
    setActive(Math.min(4, Math.max(0, Math.round(v * 4))));
  });

  return (
    <>
      {/* pinned act (>=900px): 5 stages over 400vh */}
      <div
        ref={ref}
        className="relative mt-[clamp(96px,11vw,176px)] hidden h-[400vh] min-[900px]:block"
      >
        <div className="sticky top-0 flex h-screen flex-col justify-center px-6">
          {/* the act on the ruled grid: a framed column, the head as one
              cell, then the deck and the tab list as two cells */}
          <div className="relative mx-auto w-full max-w-[1040px] border-x border-black/[0.08]">
            <Rule pos="top" />
            <Rule pos="bottom" />
            <Cross pos="top-left" />
            <Cross pos="bottom-right" />

            <div className="border-y border-black/[0.08] px-6 py-[clamp(24px,3vh,40px)]">
              <h2 className="text-center text-[clamp(30px,3.8vw,54px)] font-medium leading-[1.1] tracking-[-1.5px] text-ink">
                Your agents&apos; spending, in one ledger
              </h2>
              <p className="mx-auto mt-4 max-w-[520px] text-center text-[16px] leading-[1.5] text-sub">
                Purchases, subscriptions, orders, and receipts, all recorded in
                one place.
              </p>
            </div>

            <div className="grid grid-cols-2">
              {/* the layer deck: each stage slides up over the previous */}
              <div className="relative h-[min(640px,66vh)] overflow-hidden">
                {STACK_FEATURES.map((sf, i) => (
                  <DeckLayer key={sf.title} sf={sf} i={i} t={t} />
                ))}
              </div>

              {/* the tab list: ruled rows; the active title inks in and
                  opens its copy */}
              <div className="flex flex-col justify-center border-l border-black/[0.08]">
                {STACK_FEATURES.map((sf, i) => (
                  <div key={sf.title} className="border-t border-black/[0.08] px-6 py-[clamp(10px,1.6vh,18px)] first:border-t-0">
                    <p
                      className={`text-[clamp(22px,2.2vw,34px)] font-semibold leading-[1.08] tracking-[-1.5px] transition-colors duration-200 ${
                        active === i ? "text-ink" : "text-[#b8b6b1]"
                      }`}
                    >
                      {sf.title}
                    </p>
                    <AnimatePresence initial={false}>
                      {active === i && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{
                            duration: 0.3,
                            ease: [0.3, 0.9, 0.3, 1],
                          }}
                          className="overflow-hidden"
                        >
                          <p className="max-w-[380px] pt-2 text-[15px] leading-[1.5] text-ink">
                            {sf.desc}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* mobile: the same story as a stacked list of cells */}
      <div className="relative mt-[clamp(96px,11vw,176px)] border-x border-black/[0.08] min-[900px]:hidden">
        <Rule pos="top" />
        <Rule pos="bottom" />
        <Cross pos="top-left" />
        <Cross pos="bottom-right" />
        <div className="border-y border-black/[0.08] px-5 py-8">
          <h2 className="text-center text-[clamp(30px,8vw,40px)] font-medium leading-[1.1] tracking-[-1.5px] text-ink">
            Your agents&apos; spending, in one ledger
          </h2>
          <p className="mx-auto mt-4 max-w-[420px] text-center text-[16px] leading-[1.5] text-sub">
            Purchases, subscriptions, orders, and receipts, all recorded in one place.
          </p>
        </div>
        {STACK_FEATURES.map((sf, i) => (
          <div key={sf.title} className={i > 0 ? "border-t border-black/[0.08]" : ""}>
            <div className="relative h-[300px] overflow-hidden" style={{ backgroundColor: sf.bg }}>
              {sf.image && (
                <Image src={sf.image} alt="" fill sizes="100vw" className="object-cover" />
              )}
            </div>
            <div className="border-t border-black/[0.08] px-5 py-5">
              <p className="text-[24px] font-semibold tracking-[-1px] text-ink">{sf.title}</p>
              <p className="mt-1.5 text-[15px] leading-[1.5] text-sub">{sf.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

/* One deck layer: slides up over its scroll window via a motion transform,
   no React re-render involved. */
function DeckLayer({
  sf,
  i,
  t,
}: {
  sf: (typeof STACK_FEATURES)[number];
  i: number;
  t: MotionValue<number>;
}) {
  const y = useTransform(
    t,
    i === 0 ? [0, 1] : [(i - 1) / 4, i / 4],
    i === 0 ? ["0%", "0%"] : ["106%", "0%"],
  );
  return (
    <motion.div
      className="absolute inset-0 overflow-hidden"
      style={{ y, backgroundColor: sf.bg }}
    >
      {sf.image && (
        <Image src={sf.image} alt="" fill sizes="520px" className="object-cover" />
      )}
    </motion.div>
  );
}
