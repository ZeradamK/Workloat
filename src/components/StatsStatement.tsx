"use client";

import Image from "next/image";
import { motion } from "motion/react";

/**
 * The green stats-and-statement act from the finance teams page, shared
 * so the home page runs the same design: a band of three ruled columns
 * on the investing green, a full-width statement with the Payloat mark,
 * then the green easing into the next section's ground along a smoothstep
 * fade so it lands with no seam.
 */

const EASE = [0.25, 0.6, 0.2, 1] as const;
const GREEN = "#163300";

const up = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.55, ease: EASE },
} as const;

/* the page frame: 30px rails at 1920 with 1px hairlines, content at +32 */
const FRAME = "mx-auto max-w-[1860px] border-x border-white/10";
const INNER = "px-[clamp(20px,1.7vw,32px)]";

/* green → the next ground along a smoothstep curve, so neither end shows
   an edge */
const STOPS = [
  [0, 0], [8, 1], [16, 4], [24, 9], [32, 17], [40, 27], [48, 39], [56, 52],
  [64, 65], [72, 77], [80, 87], [88, 94], [94, 98], [100, 100],
];
const fadeTo = (to: string) =>
  `linear-gradient(to bottom, ${STOPS.map(([at, w]) => `color-mix(in srgb, ${to} ${w}%, ${GREEN}) ${at}%`).join(", ")})`;
/* over an image ground the fade is the next ground rising in alpha */
const fadeOver = (to: string) =>
  `linear-gradient(to bottom, ${STOPS.map(([at, w]) => `color-mix(in srgb, ${to} ${w}%, transparent) ${at}%`).join(", ")})`;

export type Stat = { label: string; value: string };

export default function StatsStatement({
  stats,
  quote,
  name,
  role,
  to = "#ffffff",
  image,
}: {
  /** three columns: a short label above a large figure */
  stats: Stat[];
  /** the statement, set in quotes */
  quote: string;
  /** who is speaking, and their line */
  name: string;
  role: string;
  /** the ground the green fades into at the foot (the next section's) */
  to?: string;
  /** an image ground in place of the green, with a dark wash on its
      light side so the white type reads */
  image?: string;
}) {
  return (
    <section className="relative" style={{ backgroundColor: GREEN }}>
      {image && (
        <>
          <Image src={image} alt="" fill sizes="100vw" className="object-cover" />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to right, rgba(10,10,10,0.55), rgba(10,10,10,0.35) 45%, rgba(10,10,10,0.15))",
            }}
          />
        </>
      )}
      {/* the stats band */}
      <div className={`relative ${FRAME}`}>
        <div className={`${INNER} py-[clamp(48px,5.7vw,110px)]`}>
          <div className="grid border-y border-white/25 min-[800px]:grid-cols-3">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                {...up}
                transition={{ ...up.transition, delay: i * 0.08 }}
                className="flex flex-col items-center px-6 pb-[clamp(56px,5.5vw,106px)] pt-[clamp(8px,0.7vw,14px)] text-center text-white min-[800px]:border-l min-[800px]:border-white/25 min-[800px]:first:border-l-0"
              >
                <span className="text-[clamp(14px,0.95vw,18px)] leading-[1.3] text-white/90">
                  {s.label}
                </span>
                <span className="font-numeral mt-[clamp(28px,3vw,58px)] text-[clamp(64px,6.4vw,124px)] font-medium leading-none tracking-[-4px]">
                  {s.value}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* the statement, full width on the ground */}
      <div className={`relative ${FRAME}`}>
        <motion.div
          {...up}
          className="relative grid gap-10 px-[clamp(24px,5.7vw,110px)] pb-[clamp(56px,8vw,160px)] pt-[clamp(24px,5vw,96px)] text-white min-[900px]:grid-cols-[clamp(120px,22%,444px)_1fr]"
        >
          <Image
            src="/payloat-icon-dark.svg"
            alt="Payloat"
            width={56}
            height={56}
            className="h-[clamp(36px,3vw,56px)] w-auto self-start invert"
          />
          <div className="max-w-[1000px]">
            <p className="text-[clamp(22px,2vw,38px)] leading-[1.15] tracking-[-1px]">
              &ldquo;{quote}&rdquo;
            </p>
            <p className="mt-[clamp(32px,4.5vw,86px)] text-[clamp(15px,0.95vw,18px)] leading-[1.45]">
              {name}
              <br />
              <span className="text-white/70">{role}</span>
            </p>
          </div>
          {/* the little pager at the right edge */}
          <div className="absolute right-[clamp(16px,3.5vw,66px)] top-1/2 hidden -translate-y-1/2 flex-col items-center gap-2 min-[900px]:flex">
            <span className="h-5 w-[3px] rounded-full bg-white" />
            <span className="h-[3px] w-[3px] rounded-full bg-white/60" />
            <span className="h-[3px] w-[3px] rounded-full bg-white/60" />
          </div>
        </motion.div>
      </div>

      {/* the eased fade into white */}
      <div className="relative h-[clamp(260px,28vw,540px)]" style={{ background: image ? fadeOver(to) : fadeTo(to) }} />
    </section>
  );
}
