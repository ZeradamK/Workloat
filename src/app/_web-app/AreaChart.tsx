"use client";

import { useId } from "react";

/**
 * The web-app's chart: a smooth blue line over a fading gradient fill,
 * y-axis labels on the right edge, x labels underneath — the Origin-style
 * area chart. Pure SVG, data in via props, nothing baked in.
 */

const BLUE = "#4477f6";

function short(v: number): string {
  if (v >= 1000) return `$${(v / 1000).toFixed(v >= 10000 ? 0 : 1)}K`;
  return `$${Math.round(v)}`;
}

export default function AreaChart({
  daily,
  xLabels,
  className = "",
}: {
  daily: number[];
  xLabels: string[];
  className?: string;
}) {
  const gid = useId().replace(/:/g, "");
  const max = Math.max(...daily, 1);

  /* plot into a 100×44 box; the line hugs [2, 42] vertically */
  const n = Math.max(daily.length - 1, 1);
  const pts = daily.map((v, i) => [
    (i / n) * 100,
    42 - (v / max) * 38,
  ]);
  let d = `M ${pts[0][0]},${pts[0][1]}`;
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1];
    const [x1, y1] = pts[i];
    const mx = (x0 + x1) / 2;
    d += ` C ${mx},${y0} ${mx},${y1} ${x1},${y1}`;
  }
  const area = `${d} L 100,44 L 0,44 Z`;

  return (
    <div className={className}>
      <div className="relative h-[calc(100%-22px)] pr-11">
        <svg
          className="h-full w-full"
          viewBox="0 0 100 44"
          preserveAspectRatio="none"
          aria-hidden
        >
          <defs>
            <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={BLUE} stopOpacity="0.26" />
              <stop offset="100%" stopColor={BLUE} stopOpacity="0" />
            </linearGradient>
          </defs>
          {/* dashed guide lines at the label heights */}
          {[4, 23, 42].map((y) => (
            <line
              key={y}
              x1="0"
              y1={y}
              x2="100"
              y2={y}
              stroke="#e4e4e7"
              strokeWidth="1"
              strokeDasharray="3 4"
              vectorEffect="non-scaling-stroke"
            />
          ))}
          <path d={area} fill={`url(#${gid})`} />
          <path
            d={d}
            fill="none"
            stroke={BLUE}
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </svg>
        {/* right-edge y labels, Origin style */}
        <div className="absolute bottom-0 right-0 top-0 flex w-10 flex-col justify-between py-0.5 text-right">
          {[max, max / 2, 0].map((v, i) => (
            <span key={i} className="font-numeral text-[10px] text-sub">
              {short(v)}
            </span>
          ))}
        </div>
      </div>
      <div className="mt-2 flex justify-between pr-11">
        {xLabels.map((l, i) => (
          <span key={`${l}${i}`} className="font-numeral text-[10px] text-sub">
            {l}
          </span>
        ))}
      </div>
    </div>
  );
}
