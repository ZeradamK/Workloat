"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  animate,
  motion,
  useMotionValueEvent,
  useScroll,
  useSpring,
} from "motion/react";
import InsightsChart from "./tracker/InsightsChart";
import { money } from "./tracker/money";
import { splitsDark } from "./introProgress";

/**
 * DORMANT (2026-07-25): the subscription section, pulled from the home page
 * for now and saved for later use. Re-enable by importing SubscriptionSection
 * in src/app/page.tsx and rendering it where a feature act belongs (it
 * writes the `splitsDark` nav signal, so the dock dips dark while it is on
 * screen and MarketsSection flips it back light).
 *
 * Alternating feature splits, scroll-choreographed:
 *   Arrival: the nav dips to its dark theme while this section is on screen.
 *   Row 1: copy in → CTA slide-fades → canvas fades in → the spend graph
 *   grows from $0 through 41 / 110 / 180 / 210 as you scroll → the
 *   notification bars slide in.
 *   Row 2: the black box slides up → the card stack slides down from
 *   inside it → the paragraph inks in word by word (goal-section style).
 */

/* cumulative series whose stage indices land exactly on the $ steps */
const GROW_DAILY = [
  0, 9, 17, 25, 33, 41, 55, 69, 83, 97, 110, 124, 138, 152, 166, 180, 188,
  195, 202, 210,
];
const STAGE_IDX = [0, 5, 10, 15, 19]; /* $0, $41, $110, $180, $210 */
const SUBS_X_LABELS = ["Jul 01", "Jul 07", "Jul 13", "Jul 20"];

const ROSTER = [
  { name: "Adobe", logo: "/logos/adobe.webp", sub: "Monthly · Jul 02", amount: 49.99 },
  { name: "Netflix", logo: "/logos/netflix.webp", sub: "Monthly · Jul 08", amount: 15.49 },
  { name: "Spotify", logo: "/logos/spotify.webp", sub: "Monthly · Jul 12", amount: 11.99 },
  { name: "DoorDash", logo: "/logos/doordash.webp", sub: "Monthly · Jul 15", amount: 9.99 },
];
const ROSTER_TOTAL = ROSTER.reduce((s, r) => s + r.amount, 0);

const P2_TEXT =
  "Connect the cards your agents spend on and watch every charge match its ledger entry.";
const P2_WORDS = P2_TEXT.split(" ");

const SPRING = { type: "spring", stiffness: 260, damping: 28 } as const;

export default function SubscriptionSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const row1Ref = useRef<HTMLDivElement>(null);
  const row2Ref = useRef<HTMLDivElement>(null);
  const [p1, setP1] = useState(0);
  const [p2, setP2] = useState(0);

  /* nav zips dark (~180ms) once the section arrives */
  const { scrollYProgress: secP } = useScroll({
    target: sectionRef,
    offset: ["start 0.95", "start 0.45"],
  });
  const darkOn = useRef(false);
  useMotionValueEvent(secP, "change", (v) => {
    const target = v > 0.5;
    if (target !== darkOn.current) {
      darkOn.current = target;
      animate(splitsDark, target ? 1 : 0, { duration: 0.18, ease: "easeOut" });
    }
  });

  const { scrollYProgress: r1 } = useScroll({
    target: row1Ref,
    offset: ["start 0.95", "end 0.65"],
  });
  const s1 = useSpring(r1, { stiffness: 120, damping: 26, mass: 0.3 });
  useMotionValueEvent(s1, "change", (v) => setP1(v));

  const { scrollYProgress: r2 } = useScroll({
    target: row2Ref,
    offset: ["start 0.95", "end 0.7"],
  });
  const s2 = useSpring(r2, { stiffness: 120, damping: 26, mass: 0.3 });
  useMotionValueEvent(s2, "change", (v) => setP2(v));

  /* row 1 stages */
  const copyIn = p1 > 0.05;
  const ctaIn = p1 > 0.18;
  const canvasIn = p1 > 0.3;
  const stage = p1 > 0.8 ? 4 : p1 > 0.68 ? 3 : p1 > 0.55 ? 2 : p1 > 0.42 ? 1 : 0;
  const barsIn = p1 > 0.88;

  /* the graph zips smoothly to each stage target: an animated index
     sweeps the line and rolls the number through the series */
  const [idx, setIdx] = useState(0);
  const idxRef = useRef(0);
  useEffect(() => {
    const controls = animate(idxRef.current, STAGE_IDX[stage], {
      duration: 0.55,
      ease: [0.22, 0.9, 0.3, 1],
      onUpdate: (v) => {
        idxRef.current = v;
        setIdx(v);
      },
    });
    return () => controls.stop();
  }, [stage]);
  const todayIdx = Math.round(idx);
  const lo = Math.floor(idx);
  const hi = Math.min(lo + 1, GROW_DAILY.length - 1);
  const spendVal = Math.round(
    GROW_DAILY[lo] + (GROW_DAILY[hi] - GROW_DAILY[lo]) * (idx - lo),
  );

  /* row 2: one scroll notch triggers the full timed cascade */
  const row2On = p2 > 0.12;

  return (
    <section ref={sectionRef} className="mx-auto max-w-[1200px] px-6 py-28">
      {/* ---- Row 1: subscriptions, canvas right ---- */}
      <div ref={row1Ref} className="grid grid-cols-12 items-center gap-6">
        <div className="col-span-12 min-[900px]:col-span-4 min-[900px]:pl-[60px]">
          <motion.div
            initial={false}
            animate={copyIn ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
            transition={SPRING}
          >
            <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-sub">
              Subscriptions
            </p>
            <p className="mt-4 w-[380px] max-w-none text-[26px] font-medium leading-[1.3] tracking-[-0.5px] text-ink">
              Every subscription an agent holds, counted, totaled and watched
              from its first charge.
            </p>
          </motion.div>
          <motion.div
            initial={false}
            animate={ctaIn ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
            transition={SPRING}
          >
            <a
              href="#"
              className="mt-8 inline-flex h-11 items-center rounded-full border border-solid border-black bg-white px-5 text-[13px] font-semibold tracking-[-0.5px] text-ink transition-transform hover:scale-[1.03] active:scale-[0.97]"
            >
              See agent subscriptions
            </a>
          </motion.div>
        </div>

        <div className="col-span-12 min-[900px]:col-span-8 min-[900px]:col-start-5">
          <motion.div
            initial={false}
            animate={canvasIn ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="relative h-[390px] overflow-hidden rounded-[32px] min-[900px]:ml-auto min-[900px]:mr-[80px] min-[900px]:w-[calc(100%-200px)]"
            style={{ backgroundColor: "#eeeeee" }}
          >
            <div className="no-scrollbar h-full overflow-y-auto px-6 py-6">
              <div className="mx-auto flex w-[300px] flex-col gap-2">
                {/* Subscriptions spend card — grows with scroll */}
                <div className="rounded-[24px] bg-white p-[18px]">
                  <div className="flex items-start justify-between">
                    <span className="text-[15px] text-sub">
                      Subscriptions spend
                    </span>
                    <span className="flex items-center gap-1 rounded-full bg-[#eeeeee] px-2.5 py-1 text-[12px] font-semibold text-ink">
                      Jul 2026
                      <svg
                        width="8"
                        height="8"
                        viewBox="0 0 16 16"
                        fill="none"
                        aria-hidden
                      >
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
                  <p className="font-numeral mt-1 text-[34px] font-bold tracking-[-1px] text-ink">
                    {money(spendVal)}
                  </p>
                  <InsightsChart
                    daily={GROW_DAILY}
                    todayIndex={todayIdx}
                    xLabels={SUBS_X_LABELS}
                    className="mt-4 h-[120px]"
                  />
                </div>

                {/* Your subscriptions roster — slides in once the graph
                    reaches $210 */}
                <div>
                  <motion.div
                    initial={false}
                    animate={
                      barsIn ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }
                    }
                    transition={SPRING}
                    className="flex items-baseline justify-between px-1.5 pb-2.5"
                  >
                    <span className="text-[16px] font-semibold text-ink">
                      Agent subscriptions
                    </span>
                    <span className="font-numeral text-[15px] font-semibold text-sub">
                      {money(ROSTER_TOTAL)}/mo
                    </span>
                  </motion.div>
                  <div className="flex flex-col gap-1.5">
                    {ROSTER.map((r, i) => (
                      <motion.div
                        key={r.name}
                        initial={false}
                        animate={
                          barsIn ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }
                        }
                        transition={{ ...SPRING, delay: barsIn ? i * 0.09 : 0 }}
                        className="flex items-center gap-3 rounded-[18px] bg-white py-[6px] pl-[6px] pr-2.5"
                      >
                        <span className="flex h-[43px] w-[43px] shrink-0 items-center justify-center rounded-[11px] bg-[#eeeeee]">
                          <Image
                            src={r.logo}
                            alt={r.name}
                            width={54}
                            height={54}
                            className="h-[27px] w-[27px] rounded-[5px] object-contain"
                          />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-[16px] font-semibold text-ink">
                            {r.name}
                          </span>
                          <span className="block text-[13px] leading-snug text-sub">
                            {r.sub}
                          </span>
                        </span>
                        <span className="text-[17px] font-semibold tracking-[-0.43px] text-ink">
                          {money(r.amount)}
                        </span>
                        <svg
                          width="11"
                          height="11"
                          viewBox="0 0 16 16"
                          fill="none"
                          aria-hidden
                          className="shrink-0 text-sub"
                        >
                          <path
                            d="m5.5 3 5 5-5 5"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ---- Row 2: the Workloat card, canvas left ---- */}
      <div ref={row2Ref} className="mt-[40px] grid grid-cols-12 items-center gap-6">
        <div className="order-2 col-span-12 min-[900px]:order-1 min-[900px]:col-span-7">
          {/* the black box slides up... */}
          <motion.div
            initial={false}
            animate={row2On ? { opacity: 1, y: 0 } : { opacity: 0, y: 90 }}
            transition={SPRING}
            className="relative flex h-[360px] items-center justify-center overflow-hidden rounded-[32px] min-[900px]:w-[calc(100%-100px)]"
          >
            {/* the canvas now wears the card's blue gradient */}
            <Image
              src="/card-gradient.png"
              alt=""
              fill
              sizes="900px"
              className="object-cover"
            />
            {/* ...then the stack slides down from inside it */}
            <motion.div
              initial={false}
              animate={row2On ? { y: 0 } : { y: -480 }}
              transition={{
                type: "spring",
                stiffness: 150,
                damping: 24,
                delay: row2On ? 0.22 : 0,
              }}
              className="relative z-10 w-[300px] rounded-[24px] p-2.5"
              style={{ backgroundColor: "#eeeeee" }}
            >
              <div
                className="flex h-8 items-center justify-between rounded-[12px] px-4"
                style={{ backgroundColor: "#f5f5f4" }}
              >
                <span className="text-[11px] font-medium text-sub">
                  Inactive
                </span>
                <span className="text-[11px] font-extrabold italic tracking-[-0.5px] text-ink opacity-35">
                  VISA
                </span>
              </div>
              <div
                className="mt-2 flex h-8 items-center justify-between rounded-[12px] px-4"
                style={{ backgroundColor: "#e4e4e2" }}
              >
                <span className="font-numeral text-[11px] text-ink">
                  •••• 1458
                </span>
                <span className="text-[11px] font-extrabold italic tracking-[-0.5px] text-ink opacity-35">
                  VISA
                </span>
              </div>
              <div
                className="relative mt-2 h-[187px] overflow-hidden rounded-[14px]"
                style={{ backgroundColor: "#0d0d0d" }}
              >
                {/* matte grain */}
                <div
                  className="absolute inset-0 opacity-[0.55] mix-blend-overlay"
                  style={{
                    backgroundImage:
                      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E\")",
                  }}
                />
                <div className="absolute inset-x-0 top-0 flex items-center justify-between px-4 pt-4">
                  <span className="font-numeral text-[11px] text-white">
                    •••• 3346
                  </span>
                  <span className="text-[11px] font-extrabold italic tracking-[-0.5px] text-white opacity-95">
                    VISA
                  </span>
                </div>
                <span className="absolute bottom-3.5 left-4 text-[38px] font-bold leading-none tracking-[-1.5px] text-white">
                  Workloat
                </span>
              </div>
            </motion.div>
          </motion.div>
        </div>

        <div className="order-1 col-span-12 min-[900px]:order-2 min-[900px]:col-span-4 min-[900px]:col-start-8">
          <motion.p
            initial={false}
            animate={row2On ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="text-[10px] font-medium uppercase tracking-[0.08em] text-sub"
          >
            Card feeds
          </motion.p>
          {/* word-by-word ink reveal, goal-section style */}
          <p className="mt-4 max-w-[440px] text-[26px] font-medium leading-[1.3] tracking-[-0.5px]">
            {P2_WORDS.map((word, i) => (
              <span
                key={i}
                className="transition-colors duration-100"
                style={{
                  color: row2On ? "#0a0a0a" : "#eeeeee",
                  transitionDelay: row2On ? `${0.45 + i * 0.04}s` : "0s",
                }}
              >
                {word}
                {i < P2_WORDS.length - 1 ? " " : ""}
              </span>
            ))}
          </p>
          <motion.div
            initial={false}
            animate={row2On ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
            transition={{ ...SPRING, delay: row2On ? 1.15 : 0 }}
          >
            <a
              href="#"
              className="mt-8 inline-flex h-11 items-center rounded-full border border-solid border-black bg-white px-5 text-[13px] font-semibold tracking-[-0.5px] text-ink transition-transform hover:scale-[1.03] active:scale-[0.97]"
            >
              Connect a card
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
