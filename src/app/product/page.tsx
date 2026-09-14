"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import NavDock from "@/components/NavDock";
import FooterSection from "@/components/FooterSection";
import MarketsSection from "@/components/MarketsSection";

/**
 * Product page. The hero runs on the supplied cream-to-black gradient,
 * behind the nav too: a centered headline, one line, a soft pill, then a
 * white block on Amigo's "Define" anatomy (a two-tone headline left, the
 * paragraph and a soft button right, a row of tabs, and a dark canvas
 * whose graph of chips changes with the tab). Then the markets closer and
 * the investing section.
 */

const EASE = [0.25, 0.6, 0.2, 1] as const;

/* the investing section's palette, Wise's forest and lime */
const GREEN_INK = "#163300";
const LIME = "#9fe870";

export default function ProductPage() {
  return (
    <main className="bg-white">
      <NavDock forceDark logoSrc="/payloat-app-icon-blacktile.png" />

      {/* the hero on the gradient, which also sits behind the nav */}
      <section className="relative overflow-hidden" style={{ backgroundColor: "#0a0a0a" }}>
        <Image src="/product-hero-gradient.jpg" alt="" fill priority sizes="100vw" className="object-cover" />
        <div className="relative mx-auto max-w-[1200px] px-6 pb-[clamp(72px,9vw,140px)] pt-[170px]">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: EASE, delay: 0.05 }}
            className="mx-auto max-w-[900px] text-center text-[clamp(40px,5.6vw,80px)] font-medium leading-[1.04] tracking-[-2.5px] text-white"
            style={{ textWrap: "balance" }}
          >
            The one ledger for every agent&apos;s spend.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: EASE, delay: 0.12 }}
            className="mx-auto mt-8 max-w-[560px] text-center text-[17px] leading-[1.5] text-white/90"
          >
            Tell us what your agents may buy. We&apos;ll record the rest.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: EASE, delay: 0.18 }}
            className="mt-8 flex justify-center"
          >
            <a
              href="/signup"
              className="inline-flex h-12 items-center rounded-[12px] bg-white px-6 text-[15px] font-medium text-ink shadow-[0_1px_2px_rgba(10,10,10,0.12)] transition-transform hover:scale-[1.03] active:scale-[0.97]"
            >
              Get started
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.24 }}
            className="mt-[clamp(40px,5vw,72px)]"
          >
            <DefineBlock />
          </motion.div>
        </div>
      </section>

      {/* the home page's markets closer, on white */}
      <div className="bg-white">
        <MarketsSection />
      </div>

      {/* Investing with agents, on Wise's hero anatomy: a deep green ground,
          the headline in heavy lime caps, the copy in white with lime links
          and two small link columns; a white card on the right that works
          an investing agent's budget the way Wise's works a transfer, with
          a colored strip at its foot. */}
      <section className="px-6 pt-[clamp(72px,9vw,140px)]" style={{ backgroundColor: GREEN_INK }}>
        <div className="mx-auto grid max-w-[1200px] gap-12 min-[900px]:grid-cols-[1.15fr_1fr] min-[900px]:items-center min-[900px]:gap-12">
          <div>
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.55, ease: EASE }}
              className="text-[clamp(44px,5.6vw,80px)] font-black uppercase leading-[0.92] tracking-[-2.5px] text-white"
            >
              Investing
              <br />
              with
              <br />
              agents
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.55, ease: EASE, delay: 0.08 }}
              className="mt-10 max-w-[560px] text-[clamp(18px,1.6vw,24px)] leading-[1.4] text-white"
            >
              Give an investing agent a mandate and a cap. Payloat records every order it places,
              matches the confirmations, and shows you the position before the{" "}
              <a href="#" className="underline decoration-2 underline-offset-[6px]" style={{ color: LIME }}>
                statement lands
              </a>
              .
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.55, ease: EASE, delay: 0.16 }}
              className="mt-12 grid max-w-[520px] grid-cols-2 gap-8 text-[18px] leading-[1.35] text-white"
            >
              <div>
                Agents that trade for you
                <br />
                <a href="#" className="underline decoration-2 underline-offset-[6px]" style={{ color: LIME }}>
                  See how it works
                </a>
              </div>
              <div>
                Is the cap enforced?
                <br />
                <a href="#" className="underline decoration-2 underline-offset-[6px]" style={{ color: LIME }}>
                  Yes, here&apos;s how
                </a>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.1 }}
            className="relative w-full max-w-[400px] overflow-hidden rounded-[24px] bg-white pb-[14px] min-[900px]:justify-self-end"
          >
            <div className="p-6 text-ink">
              <p className="text-[14px]" style={{ color: "#454745" }}>
                The agent may place up to
              </p>
              <div className="mt-2.5 flex h-[60px] items-center justify-between gap-3 rounded-[10px] px-4" style={{ border: "1.5px solid #868685" }}>
                <span className="font-numeral text-[22px] font-semibold tabular-nums">5,000</span>
                <span className="flex shrink-0 items-center gap-1.5 text-[17px] font-semibold">
                  <span className="h-[20px] w-[20px] rounded-full" style={{ background: "conic-gradient(#b22234 0 33%, #ffffff 33% 66%, #3c3b6e 66%)" }} />
                  USD
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden><path d="M3 5.5 8 10.5l5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </span>
              </div>

              <div className="mt-5 flex flex-col gap-2.5 text-[13px]">
                {[
                  ["•", "3,240 USD", "Placed so far, 12 orders", false],
                  ["•", "12 of 12", "Confirmations matched", false],
                  ["−", "7.30 USD", "Brokerage and platform fees", false],
                  ["=", "1,752.70 USD", "Left on the cap", true],
                  ["×", "4 hours", "Confirmations usually arrive in", true],
                ].map(([mark, value, label, strong]) => (
                  <div key={String(label)} className="flex items-center gap-3" style={strong ? { borderTop: "1px solid #dedede", paddingTop: 10 } : undefined}>
                    <span className="flex h-[15px] w-[15px] shrink-0 items-center justify-center rounded-full text-[9px] font-bold" style={{ backgroundColor: mark === "•" ? "#e6e6e6" : "#0a0a0a", color: mark === "•" ? "#e6e6e6" : "#ffffff" }}>
                      {mark === "•" ? "" : mark}
                    </span>
                    <span className="font-numeral whitespace-nowrap font-semibold tabular-nums">{value}</span>
                    <span className="ml-auto text-right leading-[1.3]" style={{ color: "#454745" }}>
                      {label}
                    </span>
                  </div>
                ))}
              </div>

              <p className="mt-6 text-[14px]" style={{ color: "#454745" }}>
                The agent can still place
              </p>
              <div className="mt-2.5 flex h-[60px] items-center justify-between gap-3 rounded-[10px] px-4" style={{ border: "1.5px solid #868685" }}>
                <span className="font-numeral text-[22px] font-semibold tabular-nums">1,752.70</span>
                <span className="flex shrink-0 items-center gap-1.5 text-[17px] font-semibold">
                  <span className="h-[20px] w-[20px] rounded-full" style={{ background: "conic-gradient(#b22234 0 33%, #ffffff 33% 66%, #3c3b6e 66%)" }} />
                  USD
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden><path d="M3 5.5 8 10.5l5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </span>
              </div>

              <p className="mt-5 text-[13px] leading-[1.5]" style={{ color: "#454745" }}>
                Every order carries the <span className="font-semibold text-ink">task behind it</span>
                <br />
                Over the cap, the agent is <span className="font-semibold text-ink">stopped, not warned</span>
              </p>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <a href="#" className="flex h-[48px] items-center justify-center rounded-full text-[14px] font-semibold text-ink" style={{ border: "1.5px solid #0a0a0a" }}>
                  Sample ledger
                </a>
                <a href="/signup" className="flex h-[48px] items-center justify-center rounded-full text-[14px] font-semibold text-ink" style={{ backgroundColor: LIME }}>
                  Get started
                </a>
              </div>
            </div>
            {/* the colored strip at the card's foot */}
            <div className="absolute inset-x-0 bottom-0 h-[14px] overflow-hidden">
              <Image src="/slack-gradient.jpg" alt="" fill sizes="600px" className="object-cover" style={{ filter: "hue-rotate(140deg) saturate(1.4)" }} />
            </div>
          </motion.div>
        </div>
      </section>

      {/* the footer on the same green, in white */}
      <div style={{ backgroundColor: GREEN_INK }}>
        <FooterSection tone="light" />
      </div>
    </main>
  );
}

/* ---------- the Define block ---------- */

/* one tab per stage of an investing agent's work; each carries the copy
   at the canvas's top left and the six chips around the agent */
const TABS = [
  {
    label: "Mandate",
    copy: "What the agent is for: the tickers it may touch, the horizon, the risk it can take, and how far it may drift before it rebalances.",
    chips: ["SCOPE", "TICKERS", "HORIZON", "RISK", "REBALANCE", "LIMITS"],
  },
  {
    label: "Caps",
    copy: "How much it may place: per order, per day, per month, and per ticker, with who approves an exception and who gets told.",
    chips: ["PER ORDER", "PER DAY", "PER MONTH", "BY TICKER", "APPROVALS", "ALERTS"],
  },
  {
    label: "Orders",
    copy: "Every order the agent places, from the moment it intends to trade to the fill, the partials, the cancels, and the receipt.",
    chips: ["INTENT", "CHECKOUT", "FILL", "PARTIAL", "CANCEL", "RECEIPT"],
  },
  {
    label: "Confirmations",
    copy: "The broker's confirmations lined up against what the agent recorded, so the mismatches and the missing ones are a short list.",
    chips: ["MATCHED", "MISSING", "MISMATCH", "LATE", "DUPLICATE", "RESOLVED"],
  },
  {
    label: "Reporting",
    copy: "The position as it stands, cost basis, and the month's result, by agent and by ticker, ready before the statement lands.",
    chips: ["POSITION", "COST BASIS", "P&L", "BY AGENT", "BY TICKER", "EXPORT"],
  },
] as const;

function DefineBlock() {
  const [tab, setTab] = useState(0);
  const t = TABS[tab];
  return (
    <div className="rounded-[28px] bg-white p-6 min-[900px]:p-10">
      {/* the head: two-tone headline left, paragraph and button right */}
      <div className="grid gap-8 min-[900px]:grid-cols-[1.2fr_1fr] min-[900px]:gap-16">
        <h2 className="text-[clamp(32px,3.6vw,52px)] font-medium leading-[1.08] tracking-[-1.6px]">
          <span className="block text-ink">Control</span>
          <span className="block text-[#8a8883]">every order an investing agent places</span>
        </h2>
        <div>
          <p className="text-[16px] leading-[1.55] text-ink">
            Payloat gives an investing agent a mandate, a cap, and a ledger. Every order it places
            is recorded with the task behind it, matched to the broker&apos;s confirmation, and rolled
            into a position you can read before the statement lands.
          </p>
          <a
            href="/integration"
            className="mt-6 inline-flex h-11 items-center rounded-[10px] bg-[#f2f2f0] px-5 text-[14px] font-medium text-ink transition-transform hover:scale-[1.03] active:scale-[0.97]"
          >
            See the API
          </a>
        </div>
      </div>

      {/* the tabs */}
      <div className="mt-12 flex gap-6 overflow-x-auto text-[16px] min-[900px]:gap-8" style={{ scrollbarWidth: "none" }}>
        {TABS.map((x, i) => (
          <button
            key={x.label}
            type="button"
            onClick={() => setTab(i)}
            className={`shrink-0 pb-3 transition-colors ${i === tab ? "text-ink" : "text-[#8a8883] hover:text-ink"}`}
          >
            {x.label}
          </button>
        ))}
      </div>

      {/* the canvas: the copy top left, the graph right */}
      <div className="relative mt-4 overflow-hidden rounded-[22px] bg-[#0a0a0a] p-6 text-white min-[900px]:p-8">
        <div className="grid gap-10 min-[900px]:grid-cols-[1fr_1.3fr] min-[900px]:items-center">
          <AnimatePresence mode="wait" initial={false}>
            <motion.p
              key={t.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: EASE }}
              className="max-w-[360px] self-start text-[15px] leading-[1.55] text-white/80"
            >
              {t.copy}
            </motion.p>
          </AnimatePresence>
          <AgentGraph chips={t.chips} />
        </div>
      </div>
    </div>
  );
}

/* the six chips around the agent, on a slowly turning dotted ring; the
   set swaps with the tab, each chip popping in in turn */
const ANGLES = [-90, -30, 30, 90, 150, 210];

function AgentGraph({ chips }: { chips: readonly string[] }) {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[520px] scale-[0.78] min-[520px]:scale-100">
      <motion.svg
        viewBox="0 0 100 100"
        className="absolute inset-0 h-full w-full"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 90, ease: "linear" }}
        aria-hidden
      >
        <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="0.35" strokeDasharray="0.35 2.2" strokeLinecap="round" />
      </motion.svg>
      {/* the agent at the center */}
      <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-2">
        <Image src="/payloat-icon-dark.svg" alt="" width={34} height={34} className="h-[34px] w-[34px]" style={{ filter: "invert(1)" }} />
        <span className="text-[11px] font-medium tracking-[0.16em] text-white/85" style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>
          INVESTING AGENT
        </span>
      </div>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={chips.join("|")} className="absolute inset-0">
          {chips.map((c, i) => {
            const a = (ANGLES[i] * Math.PI) / 180;
            const x = 50 + 40 * Math.cos(a);
            const y = 50 + 40 * Math.sin(a);
            return (
              <motion.span
                key={c}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.35, ease: EASE, delay: i * 0.07 }}
                className="absolute flex -translate-x-1/2 -translate-y-1/2 items-center gap-3 whitespace-nowrap rounded-[10px] px-4 py-3 text-[11px] font-medium tracking-[0.14em] text-white"
                style={{ left: `${x}%`, top: `${y}%`, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", backgroundColor: "#1a1a1a", border: "1px solid rgba(255,255,255,0.14)" }}
              >
                {c}
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M12 20h9M16.5 3.5a2.1 2.1 0 1 1 3 3L7 19l-4 1 1-4L16.5 3.5Z" /></svg>
              </motion.span>
            );
          })}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
