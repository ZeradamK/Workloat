"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
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
 *  5. Team and agents side by side, a ledger table with copy and three
 *     checks (Mews ledger-report section).
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


/* sample rows, labeled as such on the table; per company in the product */
const ROWS = [
  { when: "Today, 9:12", who: "Procurement agent", kind: "agent", merchant: "WebstaurantStore", task: "Restock deli paper", amount: "$216.50", status: "Over cap", tone: "amber" },
  { when: "Today, 8:40", who: "Maya C.", kind: "team", merchant: "Instacart", task: "Card ••4412", amount: "$142.10", status: "Receipt missing", tone: "amber" },
  { when: "Yesterday", who: "Software agent", kind: "agent", merchant: "OpenAI", task: "API usage, September", amount: "$2,500.00", status: "Matched", tone: "green" },
  { when: "Yesterday", who: "Travel agent", kind: "agent", merchant: "United", task: "Austin, 2 nights", amount: "$486.00", status: "Matched", tone: "green" },
  { when: "Sep 8", who: "Dani R.", kind: "team", merchant: "Sysco", task: "Card ••0917", amount: "$1,204.16", status: "Matched", tone: "green" },
  { when: "Sep 8", who: "Ops agent", kind: "agent", merchant: "Vercel", task: "Hosting, Pro seats", amount: "$350.00", status: "Matched", tone: "green" },
] as const;



/* the hero's ground continues this far under the next section, fading to
   white by its paragraph; the phone frame fades out over the same stretch
   instead of being cut */
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
  /* the dock runs light while the hero's blue is under it and eases to
     dark as the next section comes up */
  const heroRef = useRef<HTMLElement>(null);
  const litRef = useRef(false);
  useEffect(() => {
    const onScroll = () => {
      const r = heroRef.current?.getBoundingClientRect();
      if (!r) return;
      /* dark once the tail's midpoint, where the blue is half gone, passes
         under the dock; the next section's head arrives right after */
      const blueBottom = r.bottom - parseFloat(TAIL) * 0.5;
      const lit = blueBottom > 68;
      if (lit !== litRef.current) {
        litRef.current = lit;
        animate(productLight, lit ? 1 : 0, { duration: 0.3, ease: "easeOut" });
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      productLight.set(0);
    };
  }, []);

  return (
    <main className="bg-white">
      <NavDock forceDark logoLightSrc="/payloat-app-icon-light.png" />

      {/* 1. hero, on Revolut's anatomy: a full-bleed ground, the headline in
          bold caps, a line of copy and a black pill, and an outlined phone
          frame with the month's figure and the charges that make it up.
          The frame sits below the headline, beside the copy on desktop and
          under the button on phones, and runs down into the ground's fade.
          On load, two charges slide in like notifications and the figure
          counts them in. The ground is the brand gradient until a photo lands. */}
      <section ref={heroRef} className="relative overflow-hidden" style={{ backgroundColor: "#0a1fd2", paddingBottom: TAIL }}>
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
                  className="inline-flex h-12 items-center rounded-full bg-[#0a0a0a] px-6 text-[15px] font-medium text-white transition-transform hover:scale-[1.03] active:scale-[0.97]"
                >
                  Connect a bank
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

      {/* 3. connected banks */}
      <section className="mx-auto max-w-[1200px] px-6 py-[clamp(56px,7vw,112px)]">
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

      {/* 5. team and agents side by side */}
      <section className="mx-auto max-w-[1200px] px-6 py-[clamp(56px,7vw,112px)]">
        <div className="rounded-[30px] bg-[#0a0a0a] p-6 text-white min-[900px]:p-12">
          {/* the pitch on top, the table full width beneath it */}
          <div className="grid gap-8 min-[900px]:grid-cols-[1fr_1.1fr] min-[900px]:items-start min-[900px]:gap-14">
            <div>
              <motion.h2 {...up} className="text-[clamp(28px,3vw,40px)] font-bold leading-[1.1] tracking-[-1.2px]">
                Team and agents, side by side.
              </motion.h2>
            </div>
            <div>
              <motion.ul {...up} className="mt-6 flex flex-col gap-3 text-[15px] leading-[1.5] text-white/80">
                {[
                  "A card swipe by a person and a purchase by an agent sit in the same rows.",
                  "Agent rows carry the task and the cap. Team rows carry the card and the receipt.",
                  "Anything over cap or missing a receipt rises to the top of the month.",
                ].map((t) => (
                  <li key={t} className="flex gap-3">
                    <span className="mt-[3px] flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border border-white/40">
                      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" aria-hidden>
                        <path d="m5 12.5 4.5 4.5L19 7.5" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                    {t}
                  </li>
                ))}
              </motion.ul>
              <motion.div {...up} className="mt-8">
                <Link
                  href="/product#agent-purchases"
                  className="inline-flex h-11 items-center rounded-full bg-white px-5 text-[13px] font-semibold tracking-[-0.3px] text-ink transition-transform hover:scale-[1.03] active:scale-[0.97]"
                >
                  See a purchase up close
                </Link>
              </motion.div>
            </div>
          </div>
          <div className="mt-10">
            <motion.div {...up} className="overflow-x-auto rounded-[16px] bg-white text-ink">
              <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid rgba(10,10,10,0.08)" }}>
                <p className="text-[14px] font-semibold">September · Sample data</p>
                <p className="text-[12px] text-sub">Team and agents</p>
              </div>
              <table className="w-full min-w-[560px] border-collapse text-left text-[12px]">
                <thead>
                  <tr className="text-[11px] text-sub">
                    {["When", "By", "Merchant", "Task or card", "Amount", "Status"].map((h) => (
                      <th key={h} className="px-3 py-2 font-medium first:pl-5 last:pr-5" style={{ borderBottom: "1px solid rgba(10,10,10,0.08)" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ROWS.map((r, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid rgba(10,10,10,0.06)" }}>
                      <td className="whitespace-nowrap py-3 pl-5 pr-3 text-sub">{r.when}</td>
                      <td className="whitespace-nowrap px-3 py-3">
                        <span className="flex items-center gap-2 font-semibold">
                          <span
                            className="flex h-[22px] w-[22px] items-center justify-center rounded-[6px] text-[10px] font-bold"
                            style={{ backgroundColor: r.kind === "agent" ? "#0a0a0a" : "#eeeeee", color: r.kind === "agent" ? "#ffffff" : "#0a0a0a" }}
                          >
                            {r.kind === "agent" ? "A" : r.who[0]}
                          </span>
                          {r.who}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-3">{r.merchant}</td>
                      <td className="px-3 py-3 text-sub">{r.task}</td>
                      <td className="font-numeral whitespace-nowrap px-3 py-3 tabular-nums">{r.amount}</td>
                      <td className="whitespace-nowrap py-3 pl-3 pr-5">
                        <span
                          className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold"
                          style={{ border: "1px solid rgba(10,10,10,0.1)", color: r.tone === "green" ? "#1e9e56" : "#c77d00" }}
                        >
                          <span className="h-[6px] w-[6px] rounded-full" style={{ backgroundColor: r.tone === "green" ? "#1e9e56" : "#c77d00" }} />
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          </div>
        </div>
      </section>

      <FooterSection />
    </main>
  );
}
