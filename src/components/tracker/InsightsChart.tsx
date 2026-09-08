"use client";

import { useId, useLayoutEffect, useRef, useState } from "react";
import { motion } from "motion/react";

/**
 * Web port of the iOS app's InsightsChart (Views/PurchaseTracker.swift):
 * hatched-area cumulative line chart. Round-thirds y labels on the left,
 * evenly spread day labels below, 45° hatching clipped to the area, and a
 * 2px ink line that simply ends at today. All data arrives via props;
 * nothing is baked in.
 */

const LABEL_W = 32;
const XLABEL_H = 26;
const RIGHT_INSET = 7;
const TOP = 8;

const TONES = {
  light: {
    line: "#14171f",
    area: "rgba(20,23,31,0.05)",
    hatch: "rgba(20,23,31,0.14)",
    label: "rgba(20,23,31,0.55)",
  },
  dark: {
    line: "#ffffff",
    area: "rgba(255,255,255,0.07)",
    hatch: "rgba(255,255,255,0.18)",
    label: "rgba(255,255,255,0.6)",
  },
} as const;

/** Ceiling divisible by 3 with a friendly step (same algorithm as iOS). */
function maxValueFor(daily: number[]): number {
  const peak = Math.max(0, ...daily);
  if (peak <= 0) return 30;
  const raw = peak / 3;
  const magnitude = Math.pow(10, Math.floor(Math.log10(raw)));
  const unit =
    [1, 1.2, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10]
      .map((u) => u * magnitude)
      .find((u) => u >= raw) ?? raw;
  return unit * 3;
}

export default function InsightsChart({
  daily,
  todayIndex = daily.length - 1,
  xLabels,
  drawIn = false,
  tone = "light",
  className = "",
}: {
  daily: number[];
  todayIndex?: number;
  xLabels: string[];
  /** Animate the whole plot sweeping left to right on mount. */
  drawIn?: boolean;
  /** "light" = ink on light cards (default); "dark" = white on dark cards. */
  tone?: "light" | "dark";
  className?: string;
}) {
  const palette = TONES[tone];
  const ref = useRef<HTMLDivElement>(null);
  const clipId = useId();
  const sweepId = useId();
  const [dims, setDims] = useState<{ w: number; h: number } | null>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setDims({ w: width, h: height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const maxValue = maxValueFor(daily);

  let plot: React.ReactNode = null;
  let yLabels: React.ReactNode = null;

  if (dims) {
    const plotW = Math.max(0, dims.w - LABEL_W);
    const plotH = Math.max(0, dims.h - XLABEL_H);
    const w = plotW - RIGHT_INSET;
    const h = plotH;
    const n = daily.length;
    const clamped = Math.min(Math.max(todayIndex, 0), n - 1);

    yLabels = [0, 1, 2, 3].map((i) => (
      <span
        key={i}
        className="font-numeral absolute text-[11px]"
        style={{
          color: palette.label,
          left: 12,
          top: TOP + ((plotH - TOP) * i) / 3,
          transform: "translate(-50%, -50%)",
        }}
      >
        {Math.round((maxValue * (3 - i)) / 3)}
      </span>
    ));

    if (n > 1 && clamped >= 1) {
      const point = (i: number) => ({
        x: (w * i) / (n - 1),
        y: h - (daily[i] / maxValue) * (h - TOP),
      });

      let lineD = `M ${point(0).x} ${point(0).y}`;
      for (let i = 1; i <= clamped; i++) {
        lineD += ` L ${point(i).x} ${point(i).y}`;
      }
      const end = point(clamped);
      const areaD = `${lineD} L ${end.x} ${h} L 0 ${h} Z`;

      // 45° hatching, same geometry as the iOS Canvas: lines from (x, h)
      // to (x + h, 0), stepping 7px, clipped to the area under the line.
      const hatches: string[] = [];
      for (let x = -h; x < end.x; x += 7) {
        hatches.push(`M ${x} ${h} L ${x + h} 0`);
      }

      plot = (
        <svg
          width={plotW}
          height={plotH}
          className="absolute"
          style={{ left: LABEL_W, top: 0 }}
          aria-hidden
        >
          <defs>
            <clipPath id={clipId}>
              <path d={areaD} />
            </clipPath>
            {/* left-to-right reveal for the whole plot */}
            <clipPath id={sweepId}>
              {drawIn ? (
                <motion.rect
                  x="0"
                  y="0"
                  height={plotH}
                  initial={{ width: 0 }}
                  animate={{ width: plotW }}
                  transition={{
                    duration: 1.8,
                    ease: [0.65, 0, 0.35, 1],
                    delay: 0.4,
                  }}
                />
              ) : (
                <rect x="0" y="0" width={plotW} height={plotH} />
              )}
            </clipPath>
          </defs>
          <g clipPath={`url(#${sweepId})`}>
            <path d={areaD} fill={palette.area} />
            <path
              d={hatches.join(" ")}
              stroke={palette.hatch}
              strokeWidth="1"
              fill="none"
              clipPath={`url(#${clipId})`}
            />
            <path
              d={lineD}
              stroke={palette.line}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </g>
        </svg>
      );
    }
  }

  return (
    <div ref={ref} className={`relative ${className}`}>
      {yLabels}
      {plot}
      {dims && (
        <div
          className="absolute flex"
          style={{
            left: LABEL_W,
            top: dims.h - XLABEL_H + 12,
            width: dims.w - LABEL_W,
          }}
        >
          {xLabels.map((label) => (
            <span
              key={label}
              className="font-numeral flex-1 text-center text-[11px]"
              style={{ color: palette.label }}
            >
              {label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
