"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, animate, motion } from "motion/react";
import NavDock from "@/components/NavDock";
import FooterSection from "@/components/FooterSection";
import SpendMixSection from "@/components/SpendMixSection";
import { productLight } from "@/components/introProgress";

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
const LEAD = "520px";
const LEAD_FADE = "linear-gradient(to bottom, #ffffff 0%, rgba(255,255,255,0.98) 14%, rgba(255,255,255,0.85) 34%, rgba(255,255,255,0.5) 58%, rgba(255,255,255,0.15) 82%, rgba(255,255,255,0) 100%)";

const TAIL = "420px";
/* the next section's head starts this far above the tail's end, on the
   last, near-white stretch of the fade */
const GAP = "110px";
/* the frame's outline is gone well before the next section's head: solid
   through its upper half, then a progressive ramp that reaches nothing at
   82%, leaving the lowest stretch fully clear */
const FRAME_FADE = "linear-gradient(to bottom, #000 0%, #000 50%, rgba(0,0,0,0.7) 62%, rgba(0,0,0,0.35) 72%, rgba(0,0,0,0.1) 79%, transparent 82%, transparent 100%)";
const GROUND_FADE = "linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,0.15) 20%, rgba(255,255,255,0.5) 42%, rgba(255,255,255,0.85) 62%, rgba(255,255,255,0.98) 82%, #ffffff 100%)";


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
    <div className="absolute inset-x-6 top-[33%] flex flex-col gap-3">
      <AnimatePresence initial={false}>
        {list.map((c) => (
          <motion.div
            key={c.name}
            layout
            initial={{ opacity: 0, y: 28, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="flex items-center gap-4 rounded-[20px] bg-white p-3 pr-5"
          >
            <span className="flex h-[56px] w-[56px] shrink-0 items-center justify-center rounded-full bg-[#eeeeee]">
              <Image src={c.logo} alt="" width={28} height={28} className="h-[28px] w-[28px] rounded-[6px] object-contain" />
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
  /* the dock runs light (#eeeeee) the whole way down this page */
  useEffect(() => {
    productLight.set(1);
    return () => productLight.set(0);
  }, []);

  return (
    <main className="bg-white">
      <NavDock forceDark logoLightSrc="/payloat-app-icon-blacktile.png" />

      {/* 1. hero, on Revolut's anatomy: a full-bleed ground, the headline in
          bold caps, a line of copy and a black pill, and an outlined phone
          frame with the month's figure and the charges that make it up.
          The frame sits below the headline, beside the copy on desktop and
          under the button on phones, and runs down into the ground's fade.
          On load, two charges slide in like notifications and the figure
          counts them in. The ground is the brand gradient until a photo lands. */}
      <section className="relative overflow-hidden" style={{ backgroundColor: "#0a1fd2", paddingBottom: TAIL }}>
        <Image src="/slack-gradient.jpg" alt="" fill priority sizes="100vw" className="object-cover" />
        {/* the ground runs on under the next section's head and fades to white there */}
        <div className="absolute inset-x-0 bottom-0" style={{ height: TAIL, background: GROUND_FADE }} />
        <div className="relative mx-auto max-w-[1200px] px-6 pt-[150px] min-[900px]:pt-[170px]">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: EASE }}
            className="mx-auto max-w-[900px] text-center text-[clamp(44px,7vw,104px)] font-black uppercase leading-[0.96] tracking-[-2px] text-white min-[900px]:mx-0 min-[900px]:text-left"
          >
            Every bank,
            <br />
            every agent
          </motion.h1>

          <div className="mt-8 grid gap-12 min-[900px]:grid-cols-2 min-[900px]:items-start min-[900px]:gap-10">
            {/* the copy: centered on phones, left on desktop */}
            <div className="relative z-10 text-center min-[900px]:text-left">
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, ease: EASE, delay: 0.1 }}
                className="mx-auto max-w-[440px] text-[clamp(17px,1.4vw,20px)] leading-[1.45] text-white/90 min-[900px]:mx-0"
              >
                Chase, Mercury, Brex, or any bank through Teller and Plaid. Connect once, and every
                charge lands beside the agent that made it.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, ease: EASE, delay: 0.18 }}
                className="mt-8"
              >
                <Link
                  href="/signup"
                  className="group inline-flex h-12 items-center gap-1.5 rounded-full bg-white px-6 text-[15px] font-medium text-ink transition-transform hover:scale-[1.03] active:scale-[0.97]"
                >
                  Connect a bank
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 16 16"
                    fill="none"
                    aria-hidden
                    className="transition-transform duration-200 ease-out group-hover:translate-x-[3px]"
                  >
                    <path d="M2.5 8h11m0 0L8.8 3.3M13.5 8l-4.7 4.7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
              </motion.div>
            </div>

            {/* the phone frame: under the button on phones, beside the copy
                on desktop, running down into the fade */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: EASE, delay: 0.2 }}
              className="relative mx-auto mb-[-120px] h-[640px] w-[min(92%,380px)] min-[900px]:mx-0 min-[900px]:mb-[-300px] min-[900px]:h-[760px] min-[900px]:w-[min(100%,540px)] min-[900px]:justify-self-end"
              style={{ maskImage: FRAME_FADE, WebkitMaskImage: FRAME_FADE }}
            >
              <div className="absolute inset-x-0 top-0 h-[200%] rounded-[36px]" style={{ border: "2px solid rgba(255,255,255,0.55)" }} />
              <div className="absolute inset-x-0 top-[9%] flex flex-col items-center text-white">
                <p className="text-[18px] font-medium text-white/90">Agent spend</p>
                <p className="font-numeral mt-1 text-[clamp(48px,5vw,72px)] font-bold leading-none tracking-[-2px] tabular-nums">
                  <Counted />
                </p>
                <span className="mt-5 rounded-full bg-white px-7 py-3 text-[18px] font-medium text-ink">Agents</span>
              </div>
              <Notices />
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2. the spend mix, pulled up onto the hero's fading tail */}
      <div className="relative" style={{ marginTop: `calc(-1 * (${TAIL} - ${GAP}))` }}>
      <SpendMixSection
        title="Where the month went, by team."
        body="Agent charges grouped the way you would ask about them: the tools they run on, the cards and fees they touch, and the AI they burn. Every bar opens to the purchases behind it."
      />
      </div>

      {/* 3. connected banks; the page's ground begins turning blue again
          right under its last line */}
      <section className="mx-auto max-w-[1200px] px-6 pb-0 pt-[clamp(56px,7vw,112px)]">
        <motion.p {...up} className="text-center text-[15px] text-sub">
          Reads from the banks and cards you already use
        </motion.p>
        <motion.div {...up} className="mx-auto mt-8 grid max-w-[900px] grid-cols-2 gap-3 min-[640px]:grid-cols-3">
          {BANKS.map((b) => (
            <div key={b.name} className="flex h-[96px] items-center justify-center gap-3 rounded-[16px] border border-black/10 bg-white">
              <span className="flex h-[43px] w-[43px] items-center justify-center rounded-[11px] border border-black/10 bg-white">
                <Image src={b.src} alt="" width={27} height={27} className="h-[27px] w-[27px] rounded-[5px] object-contain" unoptimized />
              </span>
              <span className="text-[15px] font-semibold text-ink">{b.name}</span>
            </div>
          ))}
        </motion.div>
        <motion.p {...up} className="mt-6 text-center text-[13px] text-sub">
          Any US bank through Teller or Plaid. Cards from Brex, Ramp, and Mercury by statement.
        </motion.p>
      </section>

      {/* the ground loops back to the blue for the footer: the gradient
          returns under the banks' last line and the type goes white */}
      <div className="relative overflow-hidden" style={{ backgroundColor: "#0a1fd2" }}>
        <Image src="/slack-gradient.jpg" alt="" fill sizes="100vw" className="object-cover object-bottom" />
        <div className="absolute inset-x-0 top-0" style={{ height: LEAD, background: LEAD_FADE }} />
        <div className="relative" style={{ paddingTop: `calc(${LEAD} - 96px)` }}>
          <FooterSection tone="light" />
        </div>
      </div>
    </main>
  );
}
