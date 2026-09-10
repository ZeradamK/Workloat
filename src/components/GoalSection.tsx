"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import {
  motion,
  useMotionValueEvent,
  useScroll,
  useSpring,
} from "motion/react";

/**
 * The goal section (pinned, 360vh). The headline renders complete but
 * faded #EEEEEE; scrolling inks each word to black in sequence (100ms
 * fill per word) while subscription charge-notice notifications pop in
 * one by one around it, top-left first. The notification anatomy follows
 * the iOS app's activity rows: logo circle, merchant, subline, amount on
 * the right. Once every word is solid and every notification is in, the
 * pin releases and the page scrolls on.
 */

const HEADLINE =
  "Agents buy quietly all day. Payloat Ledger shows you every purchase, with the task behind it, before the receipt lands.";
const WORDS = HEADLINE.split(" ");
/* words ink over this progress window */
const WORDS_FROM = 0.06;
const WORDS_SPAN = 0.56;

const NOTIFS = [
  {
    name: "OpenAI",
    logo: "/logos/openai.svg",
    amount: "$2,500.00",
    note: "API usage this month",
    pos: "left-[calc(50%-790px)] top-[12%]",
    at: 0.12,
  },
  {
    name: "Stripe",
    logo: "/logos/stripe.png",
    amount: "$600.00",
    note: "Platform fees, monthly",
    pos: "right-[calc(50%-776px)] top-[16%]",
    at: 0.26,
  },
  {
    name: "Vercel",
    logo: "/logos/vercel.svg",
    amount: "$350.00",
    note: "Hosting, Ops agent",
    pos: "left-[calc(50%-800px)] top-[38%]",
    at: 0.4,
  },
  {
    name: "Claude",
    logo: "/logos/claude.svg",
    amount: "$4,000.00",
    note: "Renews tomorrow",
    pos: "right-[calc(50%-800px)] top-[28%]",
    at: 0.54,
  },
  {
    name: "AWS",
    logo: "/logos/aws.svg",
    amount: "$850.00",
    note: "Storage, Ops agent",
    pos: "left-[calc(50%-770px)] top-[66%]",
    at: 0.68,
  },
  {
    name: "Brex",
    logo: "/logos/brex.svg",
    amount: "$12,480.00",
    note: "14 charges matched",
    pos: "right-[calc(50%-786px)] top-[76%]",
    at: 0.82,
  },
] as const;

export default function GoalSection() {
  const ref = useRef<HTMLDivElement>(null);
  /* discrete stages only — React re-renders when a word inks or a notice
     arrives, not on every scroll frame */
  const [wordsFilled, setWordsFilled] = useState(0);
  const [stage, setStage] = useState(0);

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
    let filled = 0;
    for (let i = 0; i < WORDS.length; i++) {
      if (v > WORDS_FROM + (i * WORDS_SPAN) / (WORDS.length - 1)) filled = i + 1;
    }
    setWordsFilled(filled);
    setStage(NOTIFS.filter((n) => v > n.at).length);
  });

  return (
    <div ref={ref} className="relative h-[360vh]">
      <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden bg-background">
        {/* the headline: every word fades from #EEEEEE to ink in turn */}
        <div className="relative">
        {/* below 1600px: one notice at a time, at least 80px ABOVE the
            headline; each new charge slides up in while the previous fades
            out */}
        <div className="absolute inset-x-0 bottom-[calc(100%+80px)] z-0 mx-auto h-[55px] w-[min(320px,calc(100vw-48px))] min-[1600px]:hidden">
          {NOTIFS.map((n, i) => {
            const arrived = i < stage;
            const passed = i < stage - 1;
            return (
              <motion.div
                key={n.name}
                initial={false}
                animate={
                  passed
                    ? { opacity: 0, y: -34 }
                    : arrived
                      ? { opacity: 1, y: 0 }
                      : { opacity: 0, y: 34 }
                }
                transition={{ type: "spring", stiffness: 320, damping: 26 }}
                className="absolute inset-x-0 top-0 flex items-center gap-3 rounded-[18px] py-[6px] pl-[6px] pr-2.5"
                style={{ backgroundColor: "#eeeeee" }}
              >
                <NotifInner n={n} />
              </motion.div>
            );
          })}
        </div>
        <h2 className="relative z-10 max-w-[860px] px-6 text-center text-[clamp(28px,4.1vw,59px)] font-semibold leading-[1.15] tracking-[-1.5px]">
          {WORDS.map((word, i) => {
            const filled = i < wordsFilled;
            return (
              <span
                key={i}
                className="transition-colors duration-100"
                style={{ color: filled ? "#0a0a0a" : "#eeeeee" }}
              >
                {word}
                {i < WORDS.length - 1 ? " " : ""}
              </span>
            );
          })}
        </h2>
        </div>

        {/* 1600px and up: the notices scattered in the gutters beside the
            headline's 860px box (never over it), appearing top-left first */}
        {NOTIFS.map((n, i) => (
          <div
            key={n.name}
            className={`absolute hidden min-[1600px]:block ${n.pos}`}
          >
            <motion.div
              initial={false}
              animate={
                i < stage
                  ? { opacity: 1, scale: 1, y: 0 }
                  : { opacity: 0, scale: 0.92, y: 14 }
              }
              transition={{ type: "spring", stiffness: 320, damping: 26 }}
              className="flex w-[320px] items-center gap-3 rounded-[18px] py-[6px] pl-[6px] pr-2.5"
              style={{ backgroundColor: "#eeeeee" }}
            >
              <NotifInner n={n} />
            </motion.div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* The activity-row anatomy shared by both layouts. */
function NotifInner({ n }: { n: (typeof NOTIFS)[number] }) {
  return (
    <>
      <span className="flex h-[43px] w-[43px] shrink-0 items-center justify-center rounded-[11px] bg-white">
        <Image
          src={n.logo}
          alt={n.name}
          width={54}
          height={54}
          className="h-[27px] w-[27px] rounded-[5px] object-contain"
        />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[16px] font-semibold text-ink">
          {n.name}
        </span>
        <span className="block text-[13px] leading-snug text-sub">
          {n.note}
        </span>
      </span>
      <span className="text-[17px] font-semibold tracking-[-0.43px] text-ink">
        {n.amount}
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
    </>
  );
}
