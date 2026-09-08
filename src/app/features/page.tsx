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
 * Features page (ElevenLabs anatomy, user refs). Section 1: eyebrow +
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

export default function FeaturesPage() {
  return (
    <main className="bg-white">
      <NavDock forceDark />

      <section className="mx-auto max-w-[1200px] px-6 pb-[clamp(96px,11vw,176px)] pt-[170px]">
        {/* ---- section 1: split header + chat / analytics cards ---- */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="text-[15px] text-sub"
        >
          Payloat Features
        </motion.p>

        <div className="mt-4 grid gap-8 min-[900px]:grid-cols-[3fr_2fr] min-[900px]:gap-16">
          <div>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: EASE, delay: 0.05 }}
              className="text-[clamp(34px,4.2vw,58px)] font-medium leading-[1.08] tracking-[-2px] text-ink"
            >
              Track, request, and recover,
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
            className="max-w-[440px] text-[17px] leading-[1.5] text-ink min-[900px]:mt-2"
          >
            Payloat reads your receipts, follows your refunds, and turns every
            purchase into insight you can act on.
          </motion.p>
        </div>

        <div className="mt-[clamp(48px,6vw,90px)] grid gap-5 min-[900px]:grid-cols-[3fr_2fr]">
          {/* chat canvas: a refund, followed to the end */}
          <motion.div
            {...up}
            className="relative flex h-[560px] items-center justify-center overflow-hidden rounded-[24px] min-[900px]:h-[640px]"
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
                Can I get a refund?
              </span>
              <span className="max-w-[300px] self-start rounded-[22px] bg-white px-5 py-3 text-[15px] leading-snug text-ink">
                Sure. Can you share your order number please?
              </span>
              <span className="self-end rounded-full border border-solid border-white/70 px-5 py-3 text-[15px] text-white">
                It&apos;s PL4543490
              </span>
              <span className="max-w-[300px] self-start rounded-[22px] bg-white px-5 py-3 text-[15px] leading-snug text-ink">
                Thank you. I have started the refund request.
              </span>
              <span className="flex w-fit items-center gap-2.5 self-start rounded-full bg-white py-2 pl-2 pr-5 text-[15px] font-medium text-ink">
                <Image
                  src="/payloat-app-icon-v2.png"
                  alt=""
                  width={26}
                  height={26}
                  className="h-[26px] w-[26px] rounded-[7px]"
                />
                Refund landed
              </span>
            </div>
            <div className="absolute bottom-7 left-7 right-7">
              <p className="text-[15px] text-white/70">Refund requests</p>
              <p className="mt-1 max-w-[460px] text-[16px] leading-[1.4] text-white">
                Payloat follows a refund from the first ask to the day the
                money lands back on your card.
              </p>
            </div>
          </motion.div>

          {/* analytics card: the spend overview panel */}
          <motion.div
            {...up}
            transition={{ ...up.transition, delay: 0.08 }}
            className="flex h-[560px] flex-col rounded-[24px] p-7 min-[900px]:h-[640px]"
            style={{ backgroundColor: "#eeeeee" }}
          >
            <div className="rounded-[20px] bg-white p-6">
              <p className="text-[15px] font-semibold text-ink">
                Spend overview
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
                Measure your month at a glance, spending, renewals, and money
                on its way back.
              </p>
            </div>
          </motion.div>
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
    title: "Every purchase in one inbox",
    desc: "Receipts, orders, and charges flow into a single tracked list the moment they land.",
    bg: "#a44ede",
    image: "/features-stack1.jpg",
  },
  {
    title: "Returns never expire quietly",
    desc: "Every return window is counted down, with a warning before the last day.",
    bg: "#0a0a0a",
    image: "/features-stack2.jpg",
    dark: true,
  },
  {
    title: "Renewals seen coming",
    desc: "Subscriptions are flagged a day before they charge, so nothing renews unnoticed.",
    bg: "#f0efed",
    image: "/features-stack3.jpg",
  },
  {
    title: "Refunds followed home",
    desc: "A refund is tracked from the first request to the day it lands back on your card.",
    bg: "#6aa5c8",
    image: "/features-stack4.jpg",
  },
  {
    title: "BNPL under control",
    desc: "Installments lined up in one view, so the next hit never surprises you.",
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
        <div className="sticky top-0 flex h-screen flex-col justify-center">
          <h2 className="text-center text-[clamp(30px,3.8vw,54px)] font-medium leading-[1.1] tracking-[-1.5px] text-ink">
            Your everyday money inbox
          </h2>
          <p className="mx-auto mt-4 max-w-[520px] text-center text-[16px] leading-[1.5] text-sub">
            Payments, renewals, returns, and refunds, all watched in one
            place.
          </p>

          <div className="mx-auto mt-10 grid w-full max-w-[1040px] grid-cols-2 items-center gap-16 px-6">
            {/* the layer deck: each stage slides up over the previous */}
            <div className="relative h-[min(720px,78vh)] overflow-hidden rounded-[24px]">
              {STACK_FEATURES.map((sf, i) => (
                <DeckLayer key={sf.title} sf={sf} i={i} t={t} />
              ))}
            </div>

            {/* the tab list: active title inks in and opens its copy;
                stays vertically centered against the deck */}
            <div className="self-center">
              {STACK_FEATURES.map((sf, i) => (
                <div key={sf.title} className="py-2.5">
                  <p
                    className={`text-[clamp(26px,2.6vw,40px)] font-semibold leading-[1.08] tracking-[-1.5px] transition-colors duration-200 ${
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
                        <p className="max-w-[380px] pt-2 text-[16px] leading-[1.5] text-ink">
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

      {/* mobile: the same story as a stacked list */}
      <div className="mt-[clamp(96px,11vw,176px)] min-[900px]:hidden">
        <h2 className="text-center text-[clamp(30px,8vw,40px)] font-medium leading-[1.1] tracking-[-1.5px] text-ink">
          Your everyday money inbox
        </h2>
        <p className="mx-auto mt-4 max-w-[420px] text-center text-[16px] leading-[1.5] text-sub">
          Payments, renewals, returns, and refunds, all watched in one place.
        </p>
        <div className="mt-10 flex flex-col gap-10">
          {STACK_FEATURES.map((sf) => (
            <div key={sf.title}>
              <div
                className="relative h-[300px] overflow-hidden rounded-[24px]"
                style={{ backgroundColor: sf.bg }}
              >
                {sf.image && (
                  <Image
                    src={sf.image}
                    alt=""
                    fill
                    sizes="100vw"
                    className="object-cover"
                  />
                )}
              </div>
              <p className="mt-4 text-[24px] font-semibold tracking-[-1px] text-ink">
                {sf.title}
              </p>
              <p className="mt-1.5 text-[15px] leading-[1.5] text-sub">
                {sf.desc}
              </p>
            </div>
          ))}
        </div>
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
      className="absolute inset-0 overflow-hidden rounded-[24px]"
      style={{ y, backgroundColor: sf.bg }}
    >
      {sf.image && (
        <Image src={sf.image} alt="" fill sizes="520px" className="object-cover" />
      )}
    </motion.div>
  );
}
