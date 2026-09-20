"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import NavDock from "@/components/NavDock";
import FooterSection from "@/components/FooterSection";
import MarketsSection from "@/components/MarketsSection";
import { ArrowButton } from "@/components/EnterpriseBlocks";
import AgentScene, { type SceneKey } from "@/components/AgentScenes";

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

/* the canvas's ground and the scene colors for it */
const CANVAS_BG = "#eeeeee";

/* white rising in alpha along a smoothstep curve, so the fade shows no
   edge at either end */
const FADE_TO_WHITE = `linear-gradient(to bottom, ${[
  [0, 0], [8, 1], [16, 4], [24, 9], [32, 17], [40, 27], [48, 39], [56, 52],
  [64, 65], [72, 77], [80, 87], [88, 94], [94, 98], [100, 100],
]
  .map(([at, w]) => `color-mix(in srgb, #ffffff ${w}%, #eeeeee) ${at}%`)
  .join(", ")})`;

/* the site's ruled grid: hairlines, rules running past the frame, and a
   crosshair where a rule meets a rail */
const RAIL = "border-black/[0.08]";
function Rule({ pos }: { pos: "top" | "bottom" }) {
  return <span className={`pointer-events-none absolute -left-6 -right-6 h-px bg-black/[0.08] ${pos === "top" ? "-top-px" : "-bottom-px"}`} />;
}
function Cross({ pos }: { pos: "top-left" | "bottom-right" }) {
  const at = pos === "top-left" ? "-left-[7px] -top-[7px]" : "-bottom-[7px] -right-[7px]";
  return (
    <span className={`pointer-events-none absolute z-10 h-[13px] w-[13px] ${at}`} aria-hidden>
      <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-black/40" />
      <span className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-black/40" />
    </span>
  );
}
const CANVAS_VARS = {
  "--sc-fg": "#0a0a0a",
  "--sc-muted": "rgba(10,10,10,0.6)",
  "--sc-line": "rgba(10,10,10,0.3)",
  "--sc-fill": "rgba(10,10,10,0.06)",
  "--sc-track": "rgba(10,10,10,0.1)",
  "--sc-chip-bg": "#ffffff",
  "--sc-chip-border": "rgba(10,10,10,0.12)",
  "--sc-chip-on-bg": "#0a0a0a",
  "--sc-chip-on-fg": "#ffffff",
  "--sc-card-bg": "#ffffff",
  "--sc-card-fg": "#0a0a0a",
  "--sc-card-muted": "#706e68",
  "--sc-icon": "none",
} as React.CSSProperties;

export default function ProductPage() {
  const canvasRef = useRef<HTMLDivElement>(null);

  return (
    <main className="bg-white">
      <NavDock />

      {/* the hero on #eeeeee, in the enterprise hero's type */}
      <section className="relative overflow-hidden" style={{ backgroundColor: "#eeeeee" }}>
        {/* the ground eases into white toward the markets grid */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[clamp(220px,24vw,460px)]" style={{ background: FADE_TO_WHITE }} />
        <div className="relative mx-auto max-w-[1200px] px-6 pb-[clamp(72px,9vw,140px)] pt-[180px]">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: EASE, delay: 0.05 }}
            className="mx-auto max-w-[900px] text-center text-[clamp(48px,5vw,96px)] font-medium leading-[0.98] tracking-[-3px] text-ink"
            style={{ textWrap: "balance" }}
          >
            The one ledger for every agent&apos;s spend.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: EASE, delay: 0.12 }}
            className="mx-auto mt-[clamp(28px,3.5vw,64px)] max-w-[640px] text-center text-[clamp(18px,1.5vw,28px)] leading-[1.6] text-ink"
          >
            Tell us what your agents may buy. We&apos;ll record the rest.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: EASE, delay: 0.18 }}
            className="mt-[clamp(28px,3.5vw,64px)] flex justify-center"
          >
            <ArrowButton href="/signup" tone="white">
              Get started
            </ArrowButton>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.24 }}
            className="mt-[clamp(40px,5vw,72px)]"
          >
            <DefineBlock canvasRef={canvasRef} />
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
      <section className="overflow-x-clip px-6 pt-[clamp(72px,9vw,140px)]" style={{ backgroundColor: GREEN_INK }}>
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
            className="relative w-full max-w-[400px] border border-white/15 bg-white min-[900px]:justify-self-end"
          >
            {/* the grid's rules and crosshairs, white on the green */}
            <span className="pointer-events-none absolute -left-6 -right-6 -top-px h-px bg-white/15" />
            <span className="pointer-events-none absolute -bottom-px -left-6 -right-6 h-px bg-white/15" />
            <GreenCross pos="top-left" />
            <GreenCross pos="bottom-right" />
            <div className="p-6 text-ink">
              <p className="text-[14px]" style={{ color: "#454745" }}>
                The agent may place up to
              </p>
              <div className="mt-2.5 flex h-[60px] items-center justify-between gap-3 px-4" style={{ border: "1px solid #0a0a0a" }}>
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
              <div className="mt-2.5 flex h-[60px] items-center justify-between gap-3 px-4" style={{ border: "1px solid #0a0a0a" }}>
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

/* the crosshair in white, for the card on the green */
function GreenCross({ pos }: { pos: "top-left" | "bottom-right" }) {
  const at = pos === "top-left" ? "-left-[7px] -top-[7px]" : "-bottom-[7px] -right-[7px]";
  return (
    <span className={`pointer-events-none absolute z-10 h-[13px] w-[13px] ${at}`} aria-hidden>
      <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-white/60" />
      <span className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-white/60" />
    </span>
  );
}

/* ---------- the Define block ---------- */

/* one tab per stage of an investing agent's work; each carries the copy
   at the canvas's top left and names the scene drawn beside it */
const TABS = [
  {
    label: "Mandate",
    scene: "mandate" as SceneKey,
    copy: "What the agent is for: the tickers it may touch, the horizon, the risk it can take, and how far it may drift before it rebalances.",
  },
  {
    label: "Caps",
    scene: "caps" as SceneKey,
    copy: "How much it may place: per order, per day, per month, and per ticker, with who approves an exception and who gets told.",
  },
  {
    label: "Orders",
    scene: "orders" as SceneKey,
    copy: "Every order the agent places, from the moment it intends to trade to the fill, the partials, the cancels, and the receipt.",
  },
  {
    label: "Confirmations",
    scene: "confirmations" as SceneKey,
    copy: "The broker's confirmations lined up against what the agent recorded, so the mismatches and the missing ones are a short list.",
  },
  {
    label: "Reporting",
    scene: "reporting" as SceneKey,
    copy: "The position as it stands, cost basis, and the month's result, by agent and by ticker, ready before the statement lands.",
  },
] as const;

function DefineBlock({ canvasRef }: { canvasRef: React.RefObject<HTMLDivElement | null> }) {
  const [tab, setTab] = useState(0);
  const t = TABS[tab];
  return (
    <div className={`relative border bg-white ${RAIL}`}>
      <Rule pos="top" />
      <Rule pos="bottom" />
      <Cross pos="top-left" />
      <Cross pos="bottom-right" />

      {/* the head: two ruled cells, the two-tone headline left, the
          paragraph and button right */}
      <div className="grid min-[900px]:grid-cols-[1.2fr_1fr]">
        <h2 className="p-6 text-[clamp(32px,3.6vw,52px)] font-medium leading-[1.08] tracking-[-1.6px] min-[900px]:p-10">
          <span className="block text-ink">Control</span>
          <span className="block text-[#8a8883]">every order an investing agent places</span>
        </h2>
        <div className={`border-t p-6 ${RAIL} min-[900px]:border-l min-[900px]:border-t-0 min-[900px]:p-10`}>
          <p className="text-[16px] leading-[1.55] text-ink">
            Payloat gives an investing agent a mandate, a cap, and a ledger. Every order it places
            is recorded with the task behind it, matched to the broker&apos;s confirmation, and rolled
            into a position you can read before the statement lands.
          </p>
          <div className="mt-6">
            <ArrowButton href="/integration" tone="light">
              See the API
            </ArrowButton>
          </div>
        </div>
      </div>

      {/* the tabs, a ruled row of cells */}
      <div className={`grid grid-cols-5 border-t ${RAIL}`}>
        {TABS.map((x, i) => (
          <button
            key={x.label}
            type="button"
            onClick={() => setTab(i)}
            className={`h-12 border-l text-[clamp(12px,1vw,16px)] transition-colors first:border-l-0 ${RAIL} ${i === tab ? "bg-[#eeeeee] text-ink" : "text-[#8a8883] hover:text-ink"}`}
          >
            {x.label}
          </button>
        ))}
      </div>

      {/* the canvas cell: the copy top left, the graph right */}
      <div ref={canvasRef} className={`relative overflow-hidden border-t p-6 text-ink ${RAIL} min-[900px]:p-8`} style={{ backgroundColor: CANVAS_BG, ...CANVAS_VARS }}>
        <div className="grid gap-10 min-[900px]:grid-cols-[1fr_1.3fr] min-[900px]:items-center">
          <AnimatePresence mode="wait" initial={false}>
            <motion.p
              key={t.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: EASE }}
              className="max-w-[360px] self-start text-[15px] leading-[1.55] text-ink/80"
            >
              {t.copy}
            </motion.p>
          </AnimatePresence>
          <AgentScene scene={t.scene} />
        </div>
      </div>
    </div>
  );
}
