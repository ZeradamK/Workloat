"use client";

import { useRef } from "react";
import {
  animate,
  motion,
  useMotionValueEvent,
  useScroll,
} from "motion/react";
import { marketsLight } from "./introProgress";
import StockChart from "./StockChart";

/**
 * Markets closer on Vercel's grid anatomy: a ruled frame with rails,
 * the headline centered inside, then two square cells between rules
 * that run past the rails with crosshairs at the corners. Card 1 rides the saved ShaderGradient animation and
 * pitches market pings; card 2 is black with a giant white $0 for
 * commission-free stock buying. APIs come later; features are flagged
 * as planned in the footnote.
 */

export default function MarketsSection() {
  const sectionRef = useRef<HTMLElement>(null);

  /* nav zips back to its light surface (~180ms) when this section arrives */
  const { scrollYProgress: secP } = useScroll({
    target: sectionRef,
    offset: ["start 0.6", "start 0.5"],
  });
  const lightOn = useRef(false);
  useMotionValueEvent(secP, "change", (v) => {
    const target = v > 0.5;
    if (target !== lightOn.current) {
      lightOn.current = target;
      animate(marketsLight, target ? 1 : 0, { duration: 0.18, ease: "easeOut" });
    }
  });

  return (
    <section ref={sectionRef} className="px-6 py-[clamp(96px,15.6vw,300px)]">
      <motion.div
        initial={{ opacity: 0, y: 70 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.18 }}
        transition={{ type: "spring", stiffness: 120, damping: 24 }}
        className="relative mx-auto max-w-[1200px] border-x border-black/[0.08]"
      >
        {/* headline, centered inside the rails */}
        <h2 className="px-6 py-[clamp(40px,4.5vw,72px)] text-center text-[clamp(28px,3vw,40px)] font-medium tracking-[-1px] text-ink">
          Get answers from your agents fast
        </h2>

        {/* the grid: two square cells between two rules that run a little
            past the rails, with crosshairs at the corners */}
        <div className="relative">
          <Rule pos="top" />
          <Rule pos="bottom" />
          <Cross pos="top-left" />
          <Cross pos="bottom-right" />

          <div className="grid min-[900px]:grid-cols-2">
            {/* ---- Cell 1: market pings with the live chart ---- */}
            <div className="relative flex min-h-[540px] flex-col overflow-hidden bg-white p-8">
              <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-ink">
                  Alerts
                </p>
                <h3 className="mt-4 max-w-[380px] text-[30px] font-medium leading-[1.2] tracking-[-1.5px] text-ink">
                  Get a ping when an agent goes past its cap
                </h3>
                <span className="mt-7 inline-flex h-11 select-none items-center rounded-full bg-[#0a0a0a] px-5 text-[13px] font-semibold tracking-[-0.5px] text-white">
                  Set up cap alerts
                </span>
              </div>

              {/* live market chart, bleeding inside the cell */}
              <div className="-mx-8 -mb-8 mt-[50px]">
                <StockChart />
              </div>
            </div>

            {/* ---- Cell 2: commission-free stocks, white $0 on black ---- */}
            <div
              className="flex min-h-[540px] flex-col border-t border-black/[0.08] p-8 min-[900px]:border-l min-[900px]:border-t-0"
              style={{ backgroundColor: "#1e1e1e" }}
            >
              <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-white/85">
                Agents
              </p>
              <h3 className="mt-4 max-w-[380px] text-[30px] font-medium leading-[1.2] tracking-[-1.5px] text-white">
                Agents write to the ledger at no cost per event
              </h3>
              <span className="mt-7 inline-flex h-11 w-fit select-none items-center rounded-full bg-white px-5 text-[13px] font-semibold tracking-[-0.5px] text-ink">
                Start free
              </span>
              <span className="font-numeral mt-auto text-[clamp(120px,12vw,180px)] font-bold leading-[0.9] tracking-[-8px] text-white">
                $0
              </span>
            </div>
          </div>
        </div>

        <p className="px-6 py-[clamp(28px,3vw,48px)] text-center text-[12px] leading-relaxed text-sub">
          Cap alerts and the free tier are planned features and are not
          available yet. Numbers shown are illustrative. Nothing here is
          financial advice.
        </p>
      </motion.div>
    </section>
  );
}

/* a hairline that runs 24px past the rails on both sides */
function Rule({ pos }: { pos: "top" | "bottom" }) {
  return (
    <div
      className={`pointer-events-none absolute -left-6 -right-6 h-px bg-black/[0.08] ${pos === "top" ? "top-0" : "bottom-0"}`}
    />
  );
}

/* Vercel's small crosshair where a rule meets a rail */
function Cross({ pos }: { pos: "top-left" | "bottom-right" }) {
  const at = pos === "top-left" ? "-left-[6px] -top-[6px]" : "-bottom-[6px] -right-[6px]";
  return (
    <span className={`pointer-events-none absolute z-10 h-[13px] w-[13px] ${at}`} aria-hidden>
      <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-black/40" />
      <span className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-black/40" />
    </span>
  );
}
