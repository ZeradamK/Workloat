"use client";

import { motion } from "motion/react";
import InsightsChart from "./InsightsChart";
import { money } from "./money";

/**
 * Web port of the iOS home's SubscriptionTrackerCard
 * (Payloat/Views/PurchaseTracker.swift): compact 296×260 mist card with a
 * "Subscriptions" header, SPEND value, white action circle, and a short
 * wide cumulative chart. State-driven via props.
 */

const CARD_INK = "#14171f";
const MIST = "#eeeeee";

const ENTRANCE = { type: "spring", stiffness: 81, damping: 16 } as const;

export default function SubscriptionTrackerCard({
  spend,
  daily,
  todayIndex,
  xLabels,
  drawIn = false,
  fluid = false,
  href,
  className = "",
}: {
  spend: number;
  daily: number[];
  todayIndex?: number;
  xLabels: string[];
  /** Sweep the chart in on mount/arm (passed through to InsightsChart). */
  drawIn?: boolean;
  /** Stretch to the container's width (keeps the app's 260px height). */
  fluid?: boolean;
  href?: string;
  className?: string;
}) {
  return (
    <div
      className={`flex h-[260px] ${fluid ? "w-full" : "w-[296px]"} flex-col rounded-[24px] p-4 ${className}`}
      style={{ backgroundColor: MIST }}
    >
      <div className="flex items-start justify-between">
        <div>
          <h3
            className="text-[17px] font-semibold"
            style={{ color: CARD_INK }}
          >
            Subscriptions
          </h3>
          <p
            className="mt-1.5 text-[10px] font-medium tracking-[1.4px]"
            style={{ color: "rgba(20,23,31,0.5)" }}
          >
            SPEND
          </p>
          <p
            className="font-numeral text-[22px] font-semibold tracking-[-1px]"
            style={{ color: CARD_INK }}
          >
            {money(spend)}
          </p>
        </div>
        <a
          href={href ?? "/purchases"}
          aria-label="See subscriptions"
          className="flex h-[38px] w-[38px] items-center justify-center rounded-full bg-white transition-transform hover:scale-105"
        >
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden>
            <path
              d="M4 12 12 4m0 0H5.3M12 4v6.7"
              stroke={CARD_INK}
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </a>
      </div>

      <motion.div
        className="mt-2.5 flex-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={ENTRANCE}
      >
        <InsightsChart
          daily={daily}
          todayIndex={todayIndex}
          xLabels={xLabels}
          drawIn={drawIn}
          className="h-full"
        />
      </motion.div>
    </div>
  );
}
