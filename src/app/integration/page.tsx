"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { AnimatePresence, animate, motion } from "motion/react";
import NavDock from "@/components/NavDock";
import FooterSection from "@/components/FooterSection";
import SpendMixSection from "@/components/SpendMixSection";
import { ArrowButton } from "@/components/EnterpriseBlocks";

/**
 * The integration page: "Every bank, every agent, one place." A draft with more
 * sections than it needs so they can be cut or reworked. In order:
 *
 *  1. Hero, headline and two calls to action (Monarch "sync all your bank
 *     accounts in one place" anatomy, copy only).
 *  2. The spend mix, the home page's three-bar section, reused as is.
 *  3. Connected banks, a tile grid (Wise "choose from these banks").
 */

const EASE = [0.25, 0.6, 0.2, 1] as const;

const up = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.55, ease: EASE },
} as const;

/* the grid's small crosshair where a rule meets a rail */
function GridCross({ pos, light = false }: { pos: "top-left" | "bottom-right"; light?: boolean }) {
  const at = pos === "top-left" ? "-left-[7px] -top-[7px]" : "-bottom-[7px] -right-[7px]";
  const c = light ? "bg-white/50" : "bg-black/40";
  return (
    <span className={`pointer-events-none absolute z-10 h-[13px] w-[13px] ${at}`} aria-hidden>
      <span className={`absolute left-1/2 top-0 h-full w-px -translate-x-1/2 ${c}`} />
      <span className={`absolute left-0 top-1/2 h-px w-full -translate-y-1/2 ${c}`} />
    </span>
  );
}

const BANKS = [
  { name: "Chase", src: "/logos/banks/chase.jpg" },
  { name: "Wells Fargo", src: "/logos/banks/wellsfargo.png" },
  { name: "Citi", src: "/logos/banks/citi.png" },
  { name: "Mercury", src: "/logos/banks/mercury.png" },
  { name: "Brex", src: "/logos/brex.svg" },
  { name: "Stripe", src: "/logos/stripe.png" },
] as const;





/* the hero's ground continues this far under the next section, fading to
   white by its paragraph; the phone frame fades out over the same stretch
   instead of being cut */
/* the return to blue above the footer: white for the first stretch under
   the banks' caption, then a slow ease into the gradient */
/* the hero's room under the cell, which the cell's rails run through */
const HERO_PB = "clamp(48px,5vw,96px)";

/* the strip under the hero, in the home page's design */
const STRIP = [
  { src: "/logos/banks/chase.jpg", alt: "Chase", tile: true },
  { src: "/logos/banks/mercury.png", alt: "Mercury", tile: true },
  { src: "/logos/brex.svg", alt: "Brex" },
  { src: "/logos/banks/capitalone.svg", alt: "Capital One", low: true },
  { src: "/logos/banks/citi.png", alt: "Citi", tile: true },
] as { src: string; alt: string; tile?: boolean; low?: boolean }[];

/* the charges that slide into the frame on load, newest on top, and the
   figure the month starts from before they land */
const START = 6090;
const CHARGES = [
  { at: 0.9, name: "OpenAI", logo: "/logos/openai.svg", time: "Today, 11:28", agent: "Software agent", amount: 2500 },
  { at: 2.1, name: "Stripe", logo: "/logos/stripe.png", time: "Today, 11:31", agent: "Ops agent", amount: 600 },
] as const;

/* the month's figure: starts at what was there and counts each charge in
   as its notice lands */
function Counted() {
  const [v, setV] = useState(START);
  useEffect(() => {
    const timers: number[] = [];
    let total = START;
    CHARGES.forEach((c) => {
      timers.push(
        window.setTimeout(() => {
          const from = total;
          total += c.amount;
          animate(from, total, { duration: 0.7, ease: EASE, onUpdate: (x) => setV(Math.round(x)) });
        }, c.at * 1000 + 250),
      );
    });
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, []);
  return <>${v.toLocaleString("en-US")}</>;
}

/* the notices: each slides up and fades in on its cue, the newest on top */
function Notices() {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    const timers = CHARGES.map((c, i) => window.setTimeout(() => setShown(i + 1), c.at * 1000));
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, []);
  const list = CHARGES.slice(0, shown).slice().reverse();
  return (
    <div className="absolute inset-x-6 top-[40%] flex flex-col gap-3">
      <AnimatePresence initial={false}>
        {list.map((c) => (
          <motion.div
            key={c.name}
            layout
            initial={{ opacity: 0, y: 28, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="flex items-center gap-4 border border-black/[0.12] bg-white p-3 pr-5"
          >
            <span className="flex h-[56px] w-[56px] shrink-0 items-center justify-center bg-[#eeeeee]">
              <Image src={c.logo} alt="" width={28} height={28} className="h-[28px] w-[28px] object-contain" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[18px] font-semibold leading-tight text-ink min-[900px]:text-[20px]">{c.name}</span>
              <span className="block truncate text-[13px] text-sub min-[900px]:text-[16px]">
                {c.time}
                <span className="hidden min-[900px]:inline"> · {c.agent}</span>
              </span>
            </span>
            <span className="font-numeral text-[18px] font-semibold tabular-nums text-ink min-[900px]:text-[20px]">${c.amount.toLocaleString("en-US")}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export default function LedgerPage() {
  return (
    <main className="bg-white">
      <NavDock />

      {/* 1. hero on the enterprise page's anatomy, on black: the headline,
          a paragraph, and the split button left; a ruled cell right with
          the month's figure and the charges that slide in on load. The
          cell's rails run down behind the bank strip beneath. */}
      <section className="relative overflow-x-clip text-white" style={{ backgroundColor: "#0a0a0a" }}>
        <div className="relative mx-auto grid max-w-[1200px] gap-12 px-6 pt-[150px] min-[900px]:grid-cols-[1.1fr_1fr] min-[900px]:items-center min-[900px]:gap-10 min-[900px]:pt-[200px]" style={{ paddingBottom: HERO_PB }}>
          <div className="text-center min-[900px]:text-left">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: EASE, delay: 0.05 }}
              className="mx-auto max-w-[640px] text-[clamp(48px,5vw,96px)] font-medium leading-[0.98] tracking-[-3px] min-[900px]:mx-0"
            >
              Every bank,
              <br />
              every agent
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: EASE, delay: 0.12 }}
              className="mx-auto mt-[clamp(28px,3.5vw,64px)] max-w-[560px] text-[clamp(18px,1.5vw,28px)] leading-[1.6] text-white/90 min-[900px]:mx-0"
            >
              Chase, Mercury, Brex, or any bank through Teller and Plaid. Connect once, and every
              charge lands beside the agent that made it.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: EASE, delay: 0.18 }}
              className="mt-[clamp(28px,3.5vw,64px)] flex justify-center min-[900px]:justify-start"
            >
              <ArrowButton href="/signup" tone="pale">Connect a bank</ArrowButton>
            </motion.div>
          </div>

          {/* the ruled cell: square, hairline edges, rules running past it,
              crosshairs, and its rails dropping to the strip below */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.2 }}
            className="relative mx-auto h-[560px] w-[min(92%,380px)] border border-white/15 min-[900px]:mx-0 min-[900px]:h-[600px] min-[900px]:w-[min(100%,460px)] min-[900px]:justify-self-end"
          >
            <span className="pointer-events-none absolute -left-6 -right-6 -top-px h-px bg-white/15" />
            <span className="pointer-events-none absolute -bottom-px -left-6 -right-6 h-px bg-white/15" />
            <span className="pointer-events-none absolute -left-px top-0 w-px bg-white/15" style={{ bottom: `calc(-1 * ${HERO_PB})` }} />
            <span className="pointer-events-none absolute -right-px top-0 w-px bg-white/15" style={{ bottom: `calc(-1 * ${HERO_PB})` }} />
            <GridCross pos="top-left" light />
            <GridCross pos="bottom-right" light />
            <div className="absolute inset-x-0 top-[9%] flex flex-col items-center">
              <p className="text-[18px] font-medium text-white/70">Agent spend</p>
              <p className="font-numeral mt-1 text-[clamp(48px,5vw,72px)] font-bold leading-none tracking-[-2px] tabular-nums">
                <Counted />
              </p>
              <span className="mt-5 bg-white px-7 py-3 text-[18px] font-medium text-ink">Agents</span>
            </div>
            <Notices />
          </motion.div>
        </div>

        {/* the bank strip, in the home page's design: blocked cells on one
            row, the marks in their own colors or as white silhouettes */}
        <div className="grid grid-cols-5 border-y border-white/10">
          {STRIP.map((l) => (
            <div
              key={l.alt}
              className="flex h-[clamp(52px,5.6vw,108px)] items-center justify-center border-l border-white/10 first:border-l-0"
              style={{ backgroundColor: "rgba(255,255,255,0.03)" }}
            >
              <Image
                src={l.src}
                alt={l.alt}
                width={140}
                height={40}
                className={l.tile ? "h-[clamp(20px,2vw,36px)] w-auto rounded-[22%]" : l.low ? "h-[clamp(10px,0.85vw,16px)] w-auto opacity-85 brightness-0 invert" : "h-[clamp(14px,1.5vw,28px)] w-auto opacity-85 brightness-0 invert"}
                unoptimized
              />
            </div>
          ))}
        </div>
      </section>

      {/* 2. the spend mix, on black */}
      <SpendMixSection
        tone="dark"
        title="Where the month went, by team."
        body="Agent charges grouped the way you would ask about them: the tools they run on, the cards and fees they touch, and the AI they burn. Every bar opens to the purchases behind it."
      />

      {/* 3. connected banks, on the same black, in the ruled grid */}
      <section className="overflow-x-clip px-6 pb-[clamp(56px,7vw,112px)] pt-[clamp(32px,5vw,80px)]" style={{ backgroundColor: "#0a0a0a" }}>
        {/* no outer frame: only the hairlines between the bank cells */}
        <motion.div {...up} className="relative mx-auto max-w-[900px]">
          <p className="px-6 py-5 text-center text-[15px] text-white/70">
            Reads from the banks and cards you already use
          </p>
          <div className="grid grid-cols-2 min-[640px]:grid-cols-3">
            {BANKS.map((b, i) => (
              <div
                key={b.name}
                className={[
                  "flex h-[96px] items-center justify-center gap-3 border-white/15",
                  /* two across on phones, three across from 640px; the
                     hairlines follow the column count */
                  i % 2 === 1 ? "border-l" : "",
                  i >= 2 ? "border-t" : "",
                  i % 3 === 0 ? "min-[640px]:border-l-0" : "min-[640px]:border-l",
                  i >= 3 ? "min-[640px]:border-t" : "min-[640px]:border-t-0",
                ].join(" ")}
              >
                <span className="flex h-[43px] w-[43px] items-center justify-center border border-white/15 bg-white">
                  <Image src={b.src} alt="" width={27} height={27} className="h-[27px] w-[27px] object-contain" unoptimized />
                </span>
                <span className="text-[15px] font-semibold text-white">{b.name}</span>
              </div>
            ))}
          </div>
          <p className="px-6 py-4 text-center text-[13px] text-white/70">
            Any US bank through Teller or Plaid. Cards from Brex, Ramp, and Mercury by statement.
          </p>
        </motion.div>
      </section>

      {/* 4. the footer on the same black */}
      <div style={{ backgroundColor: "#0a0a0a" }}>
        <FooterSection tone="light" />
      </div>
    </main>
  );
}
