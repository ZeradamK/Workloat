"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { animate, motion } from "motion/react";
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
 *  4. How it fills in, three steps beside a curl call (Notion and
 *     Customer.io developer sections).
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

const STEPS = [
  {
    n: "1",
    title: "Connect the banks and cards",
    body: "Chase, Mercury, Brex, and the rest, through Teller or Plaid. The ledger reads every charge as it lands.",
  },
  {
    n: "2",
    title: "Give each agent a key",
    body: "One key per agent, with a cap. The agent posts an intent before it buys, a checkout when it pays, and the receipt after.",
  },
  {
    n: "3",
    title: "Read one ledger",
    body: "Bank charges and agent purchases match up on their own. What did not match is the short list you look at.",
  },
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
const FRAME_FADE = "linear-gradient(to bottom, #000 0%, #000 66%, rgba(0,0,0,0.5) 82%, rgba(0,0,0,0.12) 94%, transparent 100%)";
const GROUND_FADE = "linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,0.15) 20%, rgba(255,255,255,0.5) 42%, rgba(255,255,255,0.85) 62%, rgba(255,255,255,0.98) 82%, #ffffff 100%)";

const CURL = `curl -X POST https://api.payloat.com/ledger/record \\
  -H "Authorization: Bearer pl_live_7f2a…" \\
  -H "Content-Type: application/json" \\
  -d '{
    "type": "intent",
    "merchant": "WebstaurantStore",
    "task": "Restock deli paper",
    "amount": 216.50,
    "cap": 200.00
  }'`;

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
      <NavDock forceDark />

      {/* 1. hero, on Revolut's anatomy: a full-bleed ground, the headline in
          bold caps at the left, a line of copy and a black pill, and an
          outlined phone frame over the image with the month's figure at
          its center and a charge card at its foot, cut by the section's
          bottom edge. The ground is the brand gradient until a photo lands. */}
      <section ref={heroRef} className="relative overflow-hidden" style={{ backgroundColor: "#0a1fd2", paddingBottom: TAIL }}>
        <Image src="/slack-gradient.jpg" alt="" fill priority sizes="100vw" className="object-cover" />
        {/* the ground runs on under the next section's head and fades to white there */}
        <div className="absolute inset-x-0 bottom-0" style={{ height: TAIL, background: GROUND_FADE }} />
        <div className="relative mx-auto grid max-w-[1200px] px-6 pt-[150px] min-[900px]:min-h-[100vh] min-[900px]:grid-cols-[1fr_1fr] min-[900px]:pt-[170px]">
          {/* the copy, over the frame on desktop */}
          <div className="relative z-10 min-[900px]:col-span-2">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: EASE }}
              className="max-w-[900px] text-[clamp(44px,7vw,104px)] font-black uppercase leading-[0.96] tracking-[-2px] text-white"
            >
              Every bank,
              <br />
              every agent
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: EASE, delay: 0.1 }}
              className="mt-8 max-w-[440px] text-[clamp(17px,1.4vw,20px)] leading-[1.45] text-white/90"
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

          {/* the phone frame: an outline over the ground, the figure at its
              center, the charge card at its foot */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.2 }}
            className="relative mx-auto mt-12 h-[600px] w-[min(92%,380px)] min-[900px]:absolute min-[900px]:mt-0 min-[900px]:h-[calc(100vh-260px)] min-[900px]:min-h-[560px] min-[900px]:w-[min(40vw,540px)] min-[900px]:-translate-x-[10%] min-[900px]:left-1/2"
            style={{ bottom: "40px", maskImage: FRAME_FADE, WebkitMaskImage: FRAME_FADE }}
          >
            <div className="absolute inset-x-0 top-0 h-[200%] rounded-[36px]" style={{ border: "2px solid rgba(255,255,255,0.55)" }} />
            <div className="absolute inset-x-0 top-[16%] flex flex-col items-center text-white">
              <p className="text-[18px] font-medium text-white/90">Agent spend</p>
              <p className="font-numeral mt-1 text-[clamp(48px,5vw,72px)] font-bold leading-none tracking-[-2px] tabular-nums">$9,190</p>
              <span className="mt-5 rounded-full bg-white px-7 py-3 text-[18px] font-medium text-ink">Agents</span>
            </div>
            <div className="absolute inset-x-6 top-[49%] flex items-center gap-4 rounded-[20px] bg-white p-3 pr-5">
              <span className="flex h-[56px] w-[56px] shrink-0 items-center justify-center rounded-full bg-[#eeeeee]">
                <Image src="/logos/openai.svg" alt="" width={28} height={28} className="h-[28px] w-[28px] object-contain" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[18px] font-semibold leading-tight text-ink min-[900px]:text-[20px]">OpenAI</span>
                <span className="block truncate text-[14px] text-sub min-[900px]:text-[16px]">Today, 11:28 · Software agent</span>
              </span>
              <span className="font-numeral text-[20px] font-semibold tabular-nums text-ink">$2,500</span>
            </div>
          </motion.div>
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

      {/* 4. how it fills in */}
      <section className="mx-auto max-w-[1200px] px-6 py-[clamp(56px,7vw,112px)]">
        <div className="grid gap-12 min-[900px]:grid-cols-[1fr_1.1fr] min-[900px]:items-center min-[900px]:gap-16">
          <div>
            <motion.h2 {...up} className="text-[clamp(30px,3.4vw,46px)] font-bold leading-[1.1] tracking-[-1.5px] text-ink">
              How the ledger fills in.
            </motion.h2>
            <ol className="mt-8 flex flex-col gap-6">
              {STEPS.map((s) => (
                <motion.li key={s.n} {...up} className="flex gap-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#eeeeee] text-[13px] font-semibold text-ink">
                    {s.n}
                  </span>
                  <span>
                    <p className="text-[17px] font-semibold text-ink">{s.title}</p>
                    <p className="mt-1 max-w-[420px] text-[15px] leading-[1.5] text-sub">{s.body}</p>
                  </span>
                </motion.li>
              ))}
            </ol>
          </div>
          <motion.div {...up} className="overflow-hidden rounded-[20px] bg-[#0a0a0a] text-white">
            <div className="flex items-center gap-2 px-5 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
              <span className="h-[10px] w-[10px] rounded-full bg-white/20" />
              <span className="h-[10px] w-[10px] rounded-full bg-white/20" />
              <span className="h-[10px] w-[10px] rounded-full bg-white/20" />
              <span className="ml-2 text-[12px] text-white/50">One POST per event: intent, checkout, receipt, status, note</span>
            </div>
            <pre className="overflow-x-auto px-5 py-5 text-[13px] leading-[1.6] text-white/85" style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>
              {CURL}
            </pre>
          </motion.div>
        </div>
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
