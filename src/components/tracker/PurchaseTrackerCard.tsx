"use client";

import { useEffect, useState } from "react";
import { animate, motion } from "motion/react";
import InsightsChart from "./InsightsChart";
import { money } from "./money";

/**
 * Web port of the iOS home's PurchaseTrackerCard
 * (Payloat/Views/PurchaseTracker.swift): mist card r32, two-tone
 * "Purchase / Tracker" title with staggered slide-in, white action circle,
 * lime + white stat cards with change pills, hatched cumulative chart,
 * SEE ALL INSIGHTS link. State-driven: every value arrives via props.
 */

const CARD_INK = "#14171f";
const STAT_LIME = "#d9f268";
const MIST = "#eeeeee";

/* SwiftUI spring(response: 0.7, dampingFraction: 0.9) */
const ENTRANCE = { type: "spring", stiffness: 81, damping: 16 } as const;

export default function PurchaseTrackerCard({
  purchases,
  spend,
  purchasesChange = null,
  spendChange = null,
  daily,
  todayIndex,
  xLabels,
  countUp = false,
  tone = "light",
  href,
  className = "",
}: {
  purchases: number;
  spend: number;
  /** Percent change vs last month; null hides the pill (no baseline). */
  purchasesChange?: number | null;
  spendChange?: number | null;
  daily: number[];
  todayIndex?: number;
  xLabels: string[];
  /** Roll the numbers up from 0 and sweep the chart in on mount. */
  countUp?: boolean;
  /** "dark": black card, light title/chart/CTA; stat boxes stay as-is. */
  tone?: "light" | "dark";
  /** omit to render the CTAs as non-links */
  href?: string;
  className?: string;
}) {
  const dark = tone === "dark";
  const [shownPurchases, setShownPurchases] = useState(countUp ? 0 : purchases);
  const [shownSpend, setShownSpend] = useState(countUp ? 0 : spend);

  useEffect(() => {
    if (!countUp) {
      setShownPurchases(purchases);
      setShownSpend(spend);
      return;
    }
    const rollEase = [0.22, 0.9, 0.3, 1] as const;
    const a = animate(0, purchases, {
      duration: 1.4,
      delay: 0.35,
      ease: rollEase,
      onUpdate: (v) => setShownPurchases(Math.round(v)),
    });
    const b = animate(0, spend, {
      duration: 1.6,
      delay: 0.35,
      ease: rollEase,
      onUpdate: (v) => setShownSpend(Math.round(v)),
    });
    return () => {
      a.stop();
      b.stop();
    };
  }, [countUp, purchases, spend]);
  return (
    <div
      className={`w-full rounded-[24px] p-3 ${className}`}
      style={{ backgroundColor: dark ? "#0a0a0a" : MIST }}
    >
      {/* Title row */}
      <div className="flex items-start justify-between pl-1 pt-1">
        <h3
          className="text-[30px] font-medium leading-[29px] tracking-[-0.5px]"
          style={{ color: dark ? "#ffffff" : CARD_INK }}
        >
          <motion.span
            className="block"
            initial={{ x: 60, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={ENTRANCE}
          >
            Purchase
          </motion.span>
          <motion.span
            className="block"
            style={{ color: dark ? "#eeeeee" : "rgba(20,23,31,0.35)" }}
            initial={{ x: 90, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ ...ENTRANCE, delay: 0.06 }}
          >
            Tracker
          </motion.span>
        </h3>
        {href ? (
          <a
            href={href}
            aria-label="See all insights"
            className="flex h-12 w-12 items-center justify-center rounded-full bg-white transition-transform hover:scale-105"
          >
            <ArrowUpRight />
          </a>
        ) : (
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white">
            <ArrowUpRight />
          </span>
        )}
      </div>

      {/* Stat cards */}
      <div className="mt-4 flex h-[152px] gap-2.5">
        <StatCard
          label="PURCHASES"
          number={String(shownPurchases)}
          change={purchasesChange}
          lime
        />
        <StatCard
          label="SPEND"
          number={money(shownSpend)}
          change={spendChange}
          lime={false}
        />
      </div>

      {/* Chart */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={ENTRANCE}
      >
        <InsightsChart
          daily={daily}
          todayIndex={todayIndex}
          xLabels={xLabels}
          drawIn={countUp}
          tone={tone}
          className="mt-3 h-[176px]"
        />
      </motion.div>

      {/* CTA */}
      <div className="mt-3 flex justify-end pb-1 pr-1">
        <CtaWrap
          href={href}
          className="flex items-center gap-2.5 text-[12px] font-bold tracking-[-1px] transition-opacity hover:opacity-60"
          style={{ color: dark ? "#ffffff" : CARD_INK }}
        >
          SEE ALL INSIGHTS
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden>
            <path
              d="M2.5 8h11m0 0L8.8 3.3M13.5 8l-4.7 4.7"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </CtaWrap>
      </div>
    </div>
  );
}

function StatCard({
  label,
  number,
  change,
  lime,
}: {
  label: string;
  number: string;
  change: number | null;
  lime: boolean;
}) {
  return (
    <div
      className="flex flex-1 flex-col items-center justify-center gap-3 rounded-[24px]"
      style={{ backgroundColor: lime ? STAT_LIME : "#ffffff" }}
    >
      <span
        className="text-[11px] font-medium tracking-[1.5px]"
        style={{ color: CARD_INK }}
      >
        {label}
      </span>
      <span
        className="font-numeral text-[25px] font-semibold tracking-[-1px]"
        style={{ color: CARD_INK }}
      >
        {number}
      </span>
      {change !== null && (
        <span
          className="flex items-center gap-1.5 rounded-full py-[5px] pl-[5px] pr-3"
          style={{
            backgroundColor: lime ? "rgba(255,255,255,0.75)" : "#f0f1ec",
          }}
        >
          <span className="flex h-[18px] w-[18px] items-center justify-center rounded-full bg-white">
            <svg
              width="9"
              height="9"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden
              style={{
                transform: change >= 0 ? undefined : "rotate(180deg)",
              }}
            >
              <path
                d="M8 13.5v-11m0 0L3.3 7.2M8 2.5l4.7 4.7"
                stroke={CARD_INK}
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <span
            className="font-numeral text-[12px] font-medium"
            style={{ color: CARD_INK }}
          >
            {Math.abs(change)}%
          </span>
        </span>
      )}
    </div>
  );
}

function ArrowUpRight() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M4 12 12 4m0 0H5.3M12 4v6.7"
        stroke={CARD_INK}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* renders an anchor when a destination exists, a static span otherwise */
function CtaWrap({
  href,
  className,
  style,
  children,
}: {
  href?: string;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}) {
  return href ? (
    <a href={href} className={className} style={style}>
      {children}
    </a>
  ) : (
    <span className={className} style={style}>
      {children}
    </span>
  );
}
