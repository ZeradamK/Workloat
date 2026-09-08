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
 * Markets closer (Cash App two-card anatomy): headline over two tall
 * rounded cards. Card 1 rides the saved ShaderGradient animation and
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
    <section ref={sectionRef} className="mx-auto max-w-[1200px] px-6 pb-28 pt-8">
      <motion.div
        initial={{ opacity: 0, y: 70 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ amount: 0.18 }}
        transition={{ type: "spring", stiffness: 120, damping: 24 }}
      >
      <h2 className="text-[clamp(28px,3vw,40px)] font-medium tracking-[-1px] text-ink">
        Get insights from markets fast
      </h2>

      <div className="mt-8 grid gap-6 min-[900px]:grid-cols-2">
        {/* ---- Card 1: market pings with the live chart ---- */}
        <div className="relative flex min-h-[540px] flex-col overflow-hidden rounded-[32px] border-[0.8px] border-solid border-black bg-white p-8">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-ink">
              Markets
            </p>
            <h3 className="mt-4 max-w-[380px] text-[30px] font-medium leading-[1.2] tracking-[-1.5px] text-ink">
              Get a ping when a market is worth a look
            </h3>
            <span className="mt-7 inline-flex h-11 select-none items-center rounded-full bg-[#0a0a0a] px-5 text-[13px] font-semibold tracking-[-0.5px] text-white">
              Set up market pings
            </span>
          </div>

          {/* live market chart, bleeding inside the card */}
          <div className="-mx-8 -mb-8 mt-[50px]">
            <StockChart />
          </div>
        </div>

        {/* ---- Card 2: commission-free stocks, white $0 on black ---- */}
        <div
          className="flex min-h-[540px] flex-col rounded-[32px] p-8"
          style={{ backgroundColor: "#0a0a0a" }}
        >
          <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-white/85">
            Stocks
          </p>
          <h3 className="mt-4 max-w-[380px] text-[30px] font-medium leading-[1.2] tracking-[-1.5px] text-white">
            Buy stocks with no commission fees
          </h3>
          <span className="mt-7 inline-flex h-11 w-fit select-none items-center rounded-full bg-white px-5 text-[13px] font-semibold tracking-[-0.5px] text-ink">
            Start investing
          </span>
          <span className="font-numeral mt-auto text-[clamp(120px,12vw,180px)] font-bold leading-[0.9] tracking-[-8px] text-white">
            $0
          </span>
        </div>
      </div>

      <p className="mx-auto mt-10 max-w-[760px] text-[12px] leading-relaxed text-sub">
        Market insights and stock trading are planned features and are not
        available yet. Investing involves risk; you may lose money. Nothing
        here is investment advice.
      </p>
      </motion.div>
    </section>
  );
}
