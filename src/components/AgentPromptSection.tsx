"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";

/**
 * The agent act on black, on Retool's hero anatomy measured at 1920px: a
 * centered headline, then a 730px prompt card whose 1px border carries a
 * shine in the cream-to-orange gradient, with the Loat's chips
 * bottom-left and a cream pill bottom-right, and a "talk with us" line.
 * Open black, no rails or rules, easing into the #eeeeee below at its
 * foot. Workloat's type throughout. (The logo strip that followed it, and
 * the hairline grid, came off on 2026-10-07.)
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

export default function AgentPromptSection() {
  return (
    <section className="text-white" style={{ backgroundColor: "#0a0a0a" }} data-nav-clear>
      <div className="mx-auto max-w-[1726px]">
        {/* headline block */}
        <div className="px-6 pb-[clamp(40px,3.3vw,64px)] pt-[clamp(72px,7.8vw,150px)]">
          <motion.h2
            {...up}
            className="mx-auto max-w-[900px] text-center text-[clamp(36px,4.6vw,88px)] font-normal leading-[1.02] tracking-[-2.5px]"
            style={{ textWrap: "balance" }}
          >
            Tell your Loat
            <br />
            what to do.
          </motion.h2>
        </div>

        {/* the prompt card */}
        <div className="px-6 pb-[clamp(40px,4vw,80px)] pt-[clamp(8px,1vw,20px)]">
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
              <PromptTyper />
              <div className="mt-auto flex items-end justify-between pt-8">
                {/* the Loat it goes to, and that it answers by email */}
                <div className="flex items-center gap-1">
                  {/* the W, on the same ground as the mail button beside it */}
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/[0.07]" aria-label="Workloat">
                    <svg width="19" height="14" viewBox="248 348 757 553" fill="rgba(255,255,255,0.85)" aria-hidden>
                      <path d="M248 348H408V684H543V529H711V684H846V348H1005V517H937V800H873V901H698V708H556V901H381V800H316V517H248Z" />
                    </svg>
                  </span>
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/[0.07]">
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <rect x="3" y="5" width="18" height="14" rx="2.5" stroke="rgba(255,255,255,0.6)" strokeWidth="1.6" />
                      <path d="m4 7 8 6 8-6" stroke="rgba(255,255,255,0.6)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </div>
                <Link
                  href="/signup"
                  className="inline-flex h-[52px] items-center rounded-full px-7 text-[15px] font-medium text-ink transition-transform hover:scale-[1.03] active:scale-[0.97]"
                  style={{ backgroundColor: "#e9e2cf" }}
                >
                  Get started
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

      {/* the black eases into the #eeeeee of the Slack act below, on an
          eased ramp of stops so it never bands or reads as a cut. The nav
          runs clear over the whole section (data-nav-clear) and turns its
          type dark where the ramp passes mid grey */}
      <div
        aria-hidden
        data-nav-fade="dark-light"
        data-nav-flip="0.62"
        className="h-[clamp(160px,16vw,320px)]"
        style={{
          background:
            "linear-gradient(180deg, #0a0a0a 0%, #0e0e0e 10%, #1a1a1a 22%, #303030 35%, #545454 50%, #848484 65%, #b4b4b4 79%, #d9d9d9 91%, #eeeeee 100%)",
        }}
      />
    </section>
  );
}

/* ---------- what you ask your Loat, typed out: four workflows on a loop ---------- */

const WORKFLOWS = [
  "Schedule a technical screen with @Priya next week and send me the invite to approve.",
  "Read @Q3-vendor-contract.pdf and tell me which renewals land before December.",
  "Every Friday, email @Finance a summary of what each team spent that week.",
  "Follow up with the candidates who haven't replied in three days, and tell me who answers.",
];

/**
 * Types each request, holds it to be read, erases it quickly, and moves to
 * the next; @mentions stay underlined while they type. Runs only while the
 * card is on screen; with reduced motion it shows the first request.
 */
function PromptTyper() {
  const [text, setText] = useState(WORKFLOWS[0]);
  const [live, setLive] = useState(false);
  const ref = useRef<HTMLParagraphElement>(null);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let alive = true, visible = false, running = false;
    const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
    const play = async () => {
      if (running) return;
      running = true;
      setLive(true);
      let i = 0;
      while (alive && visible) {
        const w = WORKFLOWS[i % WORKFLOWS.length];
        for (let n = 1; n <= w.length && alive; n++) { setText(w.slice(0, n)); await wait(w[n - 1] === " " ? 48 : 26); }
        await wait(2200);
        for (let n = w.length; n >= 0 && alive; n -= 3) { setText(w.slice(0, Math.max(0, n))); await wait(9); }
        await wait(380);
        i++;
      }
      running = false;
    };
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) play(); }, { threshold: 0.4 });
    if (ref.current) io.observe(ref.current);
    return () => { alive = false; io.disconnect(); };
  }, []);
  // reserve the tallest request's height so the card never jumps as text types
  return (
    <p ref={ref} className="relative max-w-[640px] text-[clamp(16px,1.05vw,20px)] leading-[1.5] text-white/85">
      <span className="invisible" aria-hidden>{WORKFLOWS.reduce((a, b) => (b.length > a.length ? b : a))}</span>
      <span className="absolute inset-0" aria-label={WORKFLOWS[0]}>
        {text.split(/(@[\w.-]+)/).map((part, k) =>
          part.startsWith("@") ? <span key={k} className="underline decoration-white/40 underline-offset-4">{part}</span> : <span key={k}>{part}</span>,
        )}
        {live && <span className="ml-[1px] inline-block h-[1.05em] w-[2px] translate-y-[0.18em] animate-pulse bg-white/80" aria-hidden />}
      </span>
    </p>
  );
}
