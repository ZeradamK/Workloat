"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { animate, motion, useInView, useReducedMotion } from "motion/react";

/**
 * Spend mix, on Goldsand's "Earn more" comparison anatomy: copy on the
 * left, three columns on the right separated by hairlines, an icon
 * cluster at the top of each, a bar rising from the bottom with its share
 * inside, a label beneath. The two smaller bars are gray, the big one is
 * black. All three start filling together; the small one is done
 * in under a second, the middle one in under two, the big one lands at
 * three seconds. Under the copy, the banks and cards the ledger reads from.
 */

const EASE = [0.25, 0.6, 0.2, 1] as const;

const up = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.55, ease: EASE },
} as const;

/* sample shares of one month of agent spend; per company in the product */
const BARS = [
  { label: "Hosting & tools", pct: 10, height: 18, duration: 0.9, icons: ["/logos/aws.svg", "/logos/vercel.svg"], big: false },
  { label: "Cards & fees", pct: 20, height: 42, duration: 1.8, icons: ["/logos/brex.svg", "/logos/stripe.png"], big: false },
  { label: "AI usage", pct: 70, height: 100, duration: 3, icons: ["/logos/openai.svg", "/logos/claude.svg"], big: true },
] as const;

const BANKS = [
  { name: "Chase", src: "/logos/banks/chase.jpg" },
  { name: "Wells Fargo", src: "/logos/banks/wellsfargo.png" },
  { name: "Citi", src: "/logos/banks/citi.png" },
  { name: "Mercury", src: "/logos/banks/mercury.png" },
  { name: "Brex", src: "/logos/brex.svg" },
] as const;

export default function SpendMixSection({
  title = "Every bank, every agent, one place.",
  body = "Your banks' books and your agents' spending history sit side by side, with the team's own spend alongside them. One place shows where every dollar went and which agent sent it.",
}: {
  /** the headline and paragraph, overridable where the section is reused */
  title?: string;
  body?: string;
}) {
  const chartRef = useRef<HTMLDivElement>(null);
  const inView = useInView(chartRef, { once: true, amount: 0.5 });
  const reduced = useReducedMotion() ?? false;
  const on = inView || reduced;

  return (
    <section className="mx-auto max-w-[1200px] px-6 py-[clamp(72px,9vw,140px)]">
      <div className="grid gap-14 min-[900px]:grid-cols-[1fr_1.25fr] min-[900px]:gap-16">
        {/* the copy */}
        <div>
          <motion.h2 {...up} className="max-w-[440px] text-[clamp(32px,3.8vw,52px)] font-bold leading-[1.08] tracking-[-1.5px] text-ink" style={{ textWrap: "balance" }}>
            {title}
          </motion.h2>
          <motion.p {...up} className="mt-5 max-w-[420px] text-[16px] leading-[1.55] text-sub">
            {body}
          </motion.p>
          <motion.div {...up} className="mt-8">
            <div className="flex items-center">
              {BANKS.map((b, i) => (
                <span
                  key={b.name}
                  className="flex h-[56px] w-[56px] items-center justify-center overflow-hidden rounded-[14px] border border-black/10 bg-white"
                  style={{ marginLeft: i === 0 ? 0 : -8, zIndex: i }}
                >
                  <Image src={b.src} alt={b.name} width={35} height={35} className="h-[35px] w-[35px] rounded-[7px] object-contain" unoptimized />
                </span>
              ))}
            </div>
            <p className="mt-3 text-[13px] text-sub">Reads from your banks and cards. Agents write in through the API.</p>
          </motion.div>
        </div>

        {/* the chart */}
        <div ref={chartRef} className="grid grid-cols-3">
          {BARS.map((bar, i) => (
            <div
              key={bar.label}
              className={`flex flex-col px-3 min-[900px]:px-5 ${i > 0 ? "border-l border-black/[0.08]" : ""}`}
            >
              {/* the icon cluster */}
              <div className="flex items-center">
                {bar.icons.map((src, j) => (
                  <span
                    key={src}
                    className="flex h-[56px] w-[56px] items-center justify-center rounded-[14px] border border-black/10 bg-white"
                    style={{ marginLeft: j === 0 ? 0 : -16, zIndex: j }}
                  >
                    <Image src={src} alt="" width={35} height={35} className="h-[35px] w-[35px] rounded-[7px] object-contain" />
                  </span>
                ))}
              </div>

              {/* the bar's track, the bar rises from its bottom */}
              <div className="relative mt-6 h-[clamp(300px,34vw,440px)]">
                <motion.div
                  className={`absolute inset-x-0 bottom-0 flex items-end overflow-hidden rounded-[18px] px-4 pb-4 ${bar.big ? "text-white" : "text-[#b4b4b4]"}`}
                  style={{
                    background: bar.big
                      ? "linear-gradient(180deg,#1c1c1c 0%,#0a0a0a 100%)"
                      : "#eeeeee",
                  }}
                  initial={false}
                  animate={{ height: on ? `${bar.height}%` : "0%" }}
                  transition={{ duration: bar.duration, ease: [0.2, 0.7, 0.2, 1] }}
                >
                  <span className="font-numeral text-[clamp(28px,3.4vw,44px)] font-semibold leading-none tracking-[-1px] tabular-nums">
                    <Count to={bar.pct} duration={bar.duration} on={on} />%
                  </span>
                </motion.div>
              </div>

              <p className="mt-4 text-[14px] text-sub">{bar.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* counts from 0 to `to` over the bar's own fill time */
function Count({ to, duration, on }: { to: number; duration: number; on: boolean }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!on) return;
    const c = animate(0, to, { duration, ease: [0.2, 0.7, 0.2, 1], onUpdate: (x) => setV(Math.round(x)) });
    return () => c.stop();
  }, [on, to, duration]);
  return <>{v}</>;
}
