"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";

/**
 * The agent act on black, on Retool's hero anatomy measured at 1920px:
 * hairline rails 97px in from each edge, a centered three-line headline,
 * a rule, then a 730px prompt card whose 1px border carries a shine in
 * the cream-to-orange gradient, with vendor chips bottom-left and a cream
 * pill bottom-right; a "talk with us" line; a rule. The six-cell logo
 * strip is exported on its own so the page can lay it on the gradient
 * that follows. Payloat's type throughout.
 */

const EASE = [0.25, 0.6, 0.2, 1] as const;

const up = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.55, ease: EASE },
} as const;

/* the shine: the attached gradient's cream and orange, running along
   the card's top edge and dying out down the sides */
const SHINE =
  "linear-gradient(90deg, rgba(255,255,255,0.06) 0%, #e9d6b0 28%, #e3641f 52%, #a3200c 68%, rgba(255,255,255,0.06) 100%)";

const LOGOS = [
  { src: "/logos/openai.svg", alt: "OpenAI" },
  { src: "/logos/aws.svg", alt: "AWS" },
  { src: "/logos/stripe-wordmark.svg", alt: "Stripe" },
  /* a wide, low wordmark: capped shorter so it sits in the same optical
     band as the compact marks */
  { src: "/logos/oracle.svg", alt: "Oracle", low: true },
  { src: "/logos/brex.svg", alt: "Brex" },
  { src: "/logos/claude.svg", alt: "Claude" },
];

export default function AgentPromptSection() {
  return (
    <section className="text-white" style={{ backgroundColor: "#0a0a0a" }}>
      {/* the rails: 97px in at 1920 */}
      <div className="mx-auto max-w-[1726px] border-x border-white/10">
        {/* headline block: 150px down to the rule at 443 */}
        <div className="px-6 pb-[clamp(40px,3.3vw,64px)] pt-[clamp(72px,7.8vw,150px)]">
          <motion.h2
            {...up}
            className="mx-auto max-w-[900px] text-center text-[clamp(36px,4.6vw,88px)] font-normal leading-[1.02] tracking-[-2.5px]"
            style={{ textWrap: "balance" }}
          >
            Tell your agents
            <br />
            what they may buy.
            <br />
            Payloat keeps the ledger.
          </motion.h2>
        </div>

        {/* the prompt card between two rules */}
        <div className="border-y border-white/10 px-6 pb-[clamp(40px,3.5vw,68px)] pt-[clamp(32px,2.7vw,52px)]">
          <motion.div {...up} className="relative mx-auto w-full max-w-[730px]">
            {/* a soft glow riding the top edge */}
            <div
              className="pointer-events-none absolute inset-x-[8%] top-0 h-[2px]"
              style={{ background: SHINE, filter: "blur(7px)", opacity: 0.85 }}
            />

            {/* the card: its 1px border is the shine, painted in the
                border box and darkened toward the foot so it lives at the
                top edge and dies down the sides */}
            <div
              className="relative flex min-h-[clamp(200px,12.6vw,242px)] flex-col rounded-[10px] p-[clamp(16px,1.1vw,20px)]"
              style={{
                border: "1px solid transparent",
                background: `linear-gradient(#111111, #111111) padding-box, linear-gradient(180deg, rgba(17,17,17,0) 0%, rgba(17,17,17,0.7) 28%, rgba(17,17,17,0.92) 100%) border-box, ${SHINE} border-box, rgba(255,255,255,0.12) border-box`,
              }}
            >
              <p className="max-w-[640px] text-[clamp(16px,1.05vw,20px)] leading-[1.5] text-white/85">
                Let my research agent spend up to $3,000 a month on{" "}
                <span className="underline decoration-white/40 underline-offset-4">@OpenAI</span>{" "}
                and{" "}
                <span className="underline decoration-white/40 underline-offset-4">@AWS</span>,
                and hold anything over $500 for my approval
              </p>
              <div className="mt-auto flex items-end justify-between pt-8">
                {/* vendor chips */}
                <div className="flex items-center gap-1">
                  <span className="flex items-center rounded-full bg-white/[0.07] p-[3px]">
                    <Chip src="/logos/openai.svg" alt="OpenAI" />
                    <Chip src="/logos/aws.svg" alt="AWS" className="-ml-2" />
                  </span>
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/[0.07]">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                      <path d="M2 4h3l6 8h3M2 12h3l1.5-2M11 4h3" stroke="rgba(255,255,255,0.6)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M12.5 2.5 14 4l-1.5 1.5M12.5 10.5 14 12l-1.5 1.5" stroke="rgba(255,255,255,0.6)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </div>
                <Link
                  href="/signup"
                  className="inline-flex h-[52px] items-center rounded-full px-7 text-[15px] font-medium text-ink transition-transform hover:scale-[1.03] active:scale-[0.97]"
                  style={{ backgroundColor: "#e9e2cf" }}
                >
                  Start tracking
                </Link>
              </div>
            </div>
          </motion.div>

          <p className="mt-[clamp(24px,1.9vw,36px)] text-center text-[clamp(15px,1.05vw,20px)] text-white/55">
            Talk with us and{" "}
            <Link href="/contact" className="text-white/80 underline decoration-white/30 underline-offset-[6px]">
              book a demo
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}

/** The six-cell logo strip that follows the act, inside the same rails.
    On the black it reads as a ruled strip; the light overlay per cell
    keeps the cells from vanishing into the ground. */
export function AgentLogoStrip() {
  return (
    <div className="mx-auto max-w-[1726px] border-x border-white/10">
      <div className="grid grid-cols-3 border-b border-white/10 min-[800px]:grid-cols-6">
        {LOGOS.map((l) => (
          <div
            key={l.alt}
            className="flex h-[clamp(72px,6vw,116px)] items-center justify-center border-l border-white/10 first:border-l-0"
            style={{ backgroundColor: "rgba(255,255,255,0.03)" }}
          >
            <Image
              src={l.src}
              alt={l.alt}
              width={120}
              height={36}
              className={`w-auto opacity-85 brightness-0 invert ${"low" in l && l.low ? "h-[clamp(10px,0.85vw,16px)]" : "h-[clamp(18px,1.5vw,28px)]"}`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function Chip({ src, alt, className = "" }: { src: string; alt: string; className?: string }) {
  return (
    <span className={`flex h-[38px] w-[38px] items-center justify-center rounded-full bg-white ${className}`}>
      <Image src={src} alt={alt} width={18} height={18} className="h-[18px] w-[18px]" />
    </span>
  );
}
