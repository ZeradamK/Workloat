"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";

/**
 * The finance teams page's hero, shared so the home page runs the same
 * design with its own copy. Amigo's anatomy measured at 1920px: a
 * five-line headline left with a ruled paragraph and a pill, a wide dark
 * card right on the darkened cream-to-black gradient carrying the flow
 * "from → agent → task → to" with a self-scrolling task list, then the
 * caps label and a ruled logo strip.
 */

const EASE = [0.25, 0.6, 0.2, 1] as const;
const INK = "#0a0a0a";

const up = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
} as const;

const FRAME = "mx-auto max-w-[1860px] border-x border-black/[0.08]";
const INNER = "px-[clamp(20px,1.7vw,32px)]";
const MONO = "font-numeral text-[12px] uppercase tracking-[1.8px]";

const TASK_H = 34; /* one row of the list at 1920 (27.5px text, 34 leading) */
const TASK_MS = 1400;

export type Logo = { src: string; alt: string };

export default function FlowHero({
  lines,
  body,
  cta,
  tasks,
  from,
  agent,
  to,
  trustedLabel,
  logos,
  first = false,
}: {
  /** the headline, one entry per line */
  lines: string[];
  body: string;
  cta: { label: string; href: string };
  /** the scrolling list in the card */
  tasks: string[];
  /** the flow's three labels */
  from: string;
  agent: string;
  to: string;
  /** the caps line above the logo strip */
  trustedLabel: string;
  logos: Logo[];
  /** true when the section opens the page under the nav */
  first?: boolean;
}) {
  const [active, setActive] = useState(Math.floor(tasks.length / 2));
  useEffect(() => {
    const id = setInterval(
      () => setActive((a) => (a + 1) % tasks.length),
      TASK_MS,
    );
    return () => clearInterval(id);
  }, [tasks.length]);

  return (
    <section className={first ? "pt-[clamp(120px,9vw,170px)]" : "pt-[clamp(32px,5vw,80px)]"}>
      <div className={FRAME}>
        <div className={`${INNER} pb-[clamp(40px,3.5vw,64px)] pt-[clamp(48px,5vw,96px)]`}>
          <div className="grid gap-12 min-[1000px]:grid-cols-[minmax(0,644px)_minmax(0,1152px)] min-[1000px]:items-start min-[1000px]:gap-[clamp(40px,3.2vw,62px)]">
            {/* left: headline, ruled paragraph, pill */}
            <div>
              <motion.h2
                {...up}
                transition={{ duration: 0.55, ease: EASE, delay: 0.05 }}
                className="text-[clamp(40px,4.5vw,86px)] font-medium leading-[0.96] tracking-[-2.5px] text-ink"
              >
                {lines.map((l, i) => (
                  <span key={l}>
                    {i > 0 && <br />}
                    {l}
                  </span>
                ))}
              </motion.h2>
              <motion.p
                {...up}
                transition={{ duration: 0.55, ease: EASE, delay: 0.12 }}
                className="mt-[clamp(40px,4.5vw,86px)] max-w-[540px] border-l-[3px] border-black/10 pl-7 text-[clamp(18px,1.35vw,26px)] leading-[1.3] tracking-[-0.3px] text-ink"
              >
                {body}
              </motion.p>
              <motion.div
                {...up}
                transition={{ duration: 0.55, ease: EASE, delay: 0.18 }}
                className="mt-[clamp(28px,2.6vw,50px)] pl-[31px]"
              >
                <Link
                  href={cta.href}
                  className="inline-flex h-12 items-center rounded-full bg-[#0a0a0a] px-6 text-[15px] font-medium text-white transition-transform hover:scale-[1.03] active:scale-[0.97]"
                >
                  {cta.label}
                </Link>
              </motion.div>
            </div>

            {/* right: the flow card */}
            <motion.div
              {...up}
              initial={{ opacity: 0, y: 40 }}
              transition={{ duration: 0.6, ease: EASE, delay: 0.2 }}
              className="relative mt-[clamp(0px,3.7vw,72px)] overflow-hidden rounded-[16px] text-white"
              style={{ backgroundColor: INK, aspectRatio: "1152 / 548" }}
            >
              {/* the cream-to-black gradient, pulled down so the white
                  type reads on its light end */}
              <Image
                src="/product-hero-gradient.jpg"
                alt=""
                fill
                sizes="(min-width: 1000px) 60vw, 100vw"
                className="object-cover"
              />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(to right, rgba(10,10,10,0.72), rgba(10,10,10,0.5) 45%, rgba(10,10,10,0.35))",
                }}
              />
              <div className="absolute inset-y-0 left-[5.2%] right-[3.5%] flex items-center">
                {/* the outer nodes step out under 700px so the card keeps
                    the agent and the list */}
                <span className="hidden min-[700px]:contents">
                  <Node label={from} kind="from" />
                  <Arrow />
                </span>
                <Node label={agent} kind="agent" />
                <Arrow />
                <div
                  className="relative h-full w-[clamp(180px,26%,300px)] shrink-0 overflow-hidden"
                  style={{
                    maskImage:
                      "linear-gradient(to bottom, transparent, black 18%, black 82%, transparent)",
                    WebkitMaskImage:
                      "linear-gradient(to bottom, transparent, black 18%, black 82%, transparent)",
                  }}
                >
                  <motion.ul
                    className="absolute left-0 top-1/2 w-full"
                    animate={{ y: -(active + 0.5) * TASK_H }}
                    transition={{ type: "spring", stiffness: 120, damping: 24 }}
                  >
                    {tasks.map((t, i) => (
                      <li
                        key={t}
                        className="whitespace-nowrap text-[clamp(15px,1.4vw,27px)] tracking-[-0.4px] transition-colors duration-500"
                        style={{
                          height: TASK_H,
                          lineHeight: `${TASK_H}px`,
                          color: i === active ? "#ffffff" : "rgba(255,255,255,0.42)",
                        }}
                      >
                        {t}
                      </li>
                    ))}
                  </motion.ul>
                </div>
                <span className="hidden min-[700px]:contents">
                  <Arrow />
                  <Node label={to} kind="to" />
                </span>
              </div>
            </motion.div>
          </div>

          <p className={`${MONO} mt-[clamp(48px,6vw,112px)] text-ink`}>{trustedLabel}</p>
        </div>

        {/* the ruled logo strip */}
        <div className="border-t border-black/[0.08]">
          <div className={`${INNER} grid grid-cols-3 min-[800px]:grid-cols-6`}>
            {logos.map((l) => (
              <div
                key={l.alt}
                className="flex h-[clamp(72px,5.6vw,108px)] items-center justify-center"
              >
                <Image
                  src={l.src}
                  alt={l.alt}
                  width={140}
                  height={40}
                  className="h-[clamp(20px,1.6vw,30px)] w-auto opacity-70 grayscale"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Node({ label, kind }: { label: string; kind: "from" | "agent" | "to" }) {
  const size = "h-[clamp(22px,1.6vw,32px)] w-[clamp(22px,1.6vw,32px)]";
  return (
    <div className="flex shrink-0 items-center gap-2.5">
      {/* the sender has no mark, only its bold label; the agent wears
          the Payloat mark */}
      {kind === "agent" && (
        <span className={`${size} flex items-center justify-center rounded-full bg-white`}>
          <Image
            src="/payloat-icon-dark.svg"
            alt=""
            width={18}
            height={18}
            className="h-[62%] w-[62%]"
          />
        </span>
      )}
      {kind === "to" && (
        <span
          className={`${size} flex items-center justify-center overflow-hidden rounded-full`}
          style={{ backgroundColor: "rgba(255,255,255,0.14)" }}
        >
          <svg width="55%" height="55%" viewBox="0 0 16 16" fill="none" aria-hidden>
            <rect x="2" y="2" width="5" height="5" rx="1.2" fill="#ffffff" opacity="0.9" />
            <rect x="9" y="2" width="5" height="5" rx="1.2" fill="#ffffff" opacity="0.9" />
            <rect x="2" y="9" width="5" height="5" rx="1.2" fill="#ffffff" opacity="0.9" />
            <rect x="9" y="9" width="5" height="5" rx="1.2" fill="#ffffff" opacity="0.9" />
          </svg>
        </span>
      )}
      <span
        className={`${MONO} whitespace-nowrap text-[clamp(8px,0.6vw,11px)] ${kind === "from" ? "font-bold text-white" : "text-white/90"}`}
      >
        {label}
      </span>
    </div>
  );
}

function Arrow() {
  return (
    <span className="mx-[clamp(10px,2.4vw,48px)] flex flex-1 items-center">
      <span className="h-px flex-1 bg-white/25" />
      <svg width="8" height="8" viewBox="0 0 8 8" fill="none" aria-hidden>
        <path d="M1 4h6M4.5 1.5 7 4 4.5 6.5" stroke="rgba(255,255,255,0.45)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}
