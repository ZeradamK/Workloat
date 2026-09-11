"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useInView, useReducedMotion } from "motion/react";
import NavDock from "@/components/NavDock";
import FooterSection from "@/components/FooterSection";
import PhoneMock, { screenWidth as phoneScreenWidth } from "@/components/PhoneMock";
import { productLight } from "@/components/introProgress";

/**
 * Meet Payloat: the agent that keeps your other agents on budget. Origin's
 * page language (near-black ground, quiet uppercase eyebrows, tall cards
 * on soft gradients, one warm off-white section), set in SF Pro. Draft
 * with more sections than it needs so they can be cut. In order:
 *
 *  1. Ask anything: the mark, the headline, a prompt box that types the
 *     questions people ask Payloat (Origin "Ask anything").
 *  2. How it works: three tall cards, watch, nudge, answer (Origin "How
 *     it works").
 *  3. Tap into your ledger: two overlapping cards, the 30-day spend and
 *     Payloat's written read of it (Origin "Tap into your portfolio").
 *  4. Keep your agents honest: the phone between four points, on the
 *     off-white ground (Origin "Let AI power up your investment game").
 *  5. For your agents, too: an agent asks Payloat before it buys.
 *  6. Closing call to action.
 */

const EASE = [0.25, 0.6, 0.2, 1] as const;

const up = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.55, ease: EASE },
} as const;

const INK = "#0a0a0a";
const GROUND = "#0e0e0e";
const CARD = "#151515";
const LINE = "rgba(255,255,255,0.1)";

/* the questions the prompt box types, one after another */
const QUESTIONS = [
  "Where did Procurement go over its cap?",
  "Which subscriptions renew this week?",
  "What did the Travel agent book for Austin?",
  "How much have our agents spent this month?",
];

const EYEBROW = "text-[11px] font-semibold uppercase tracking-[0.14em]";

export default function AgentPage() {
  /* the dock sits over a black ground here, so it runs light */
  useEffect(() => {
    productLight.set(1);
    return () => productLight.set(0);
  }, []);

  return (
    <main style={{ backgroundColor: GROUND, color: "#ffffff" }}>
      <NavDock forceDark />

      {/* 1. ask anything */}
      <section className="mx-auto max-w-[1200px] px-6 pb-[clamp(72px,9vw,140px)] pt-[150px]">
        <div className="mx-auto flex max-w-[720px] flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: EASE }}
          >
            <Image src="/payloat-app-icon-v2.png" alt="" width={44} height={44} className="h-[44px] w-[44px] rounded-[11px]" />
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE, delay: 0.05 }}
            className={`mt-8 ${EYEBROW} text-white/50`}
          >
            Meet Payloat
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: EASE, delay: 0.1 }}
            className="mt-4 text-[clamp(40px,5.6vw,80px)] font-bold leading-[1.02] tracking-[-2.5px]"
            style={{ textWrap: "balance" }}
          >
            The agent that keeps your agents on budget.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: EASE, delay: 0.18 }}
            className="mt-6 max-w-[520px] text-[clamp(16px,1.3vw,19px)] leading-[1.5] text-white/65"
          >
            Payloat is an agent of its own. It reads every purchase your other agents make,
            matches the receipts, watches the caps, and answers when anyone asks.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: EASE, delay: 0.26 }}
            className="mt-10 w-full max-w-[560px]"
          >
            <Prompt />
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-3"
          >
            <Link
              href="/signup"
              className="inline-flex h-11 items-center rounded-full bg-white px-5 text-[13px] font-semibold tracking-[-0.3px] text-ink transition-transform hover:scale-[1.03] active:scale-[0.97]"
            >
              Get started
            </Link>
            <Link
              href="/#slack"
              className="inline-flex h-11 items-center rounded-full border border-white/25 px-5 text-[13px] font-semibold tracking-[-0.3px] text-white transition-transform hover:scale-[1.03] active:scale-[0.97]"
            >
              See it in Slack
            </Link>
          </motion.div>
        </div>
      </section>

      {/* 2. how it works */}
      <section className="mx-auto max-w-[1200px] px-6 py-[clamp(56px,7vw,112px)]">
        <div className="mx-auto max-w-[560px] text-center">
          <motion.h2 {...up} className="text-[clamp(32px,3.8vw,52px)] font-bold leading-[1.06] tracking-[-1.5px]">
            How it works
          </motion.h2>
          <motion.p {...up} className="mt-4 text-[15px] leading-[1.55] text-white/60">
            Give every agent a key. Payloat watches what they buy, nudges before something goes
            wrong, and answers the moment someone asks.
          </motion.p>
        </div>
        <div className="mt-12 grid gap-4 min-[800px]:grid-cols-3">
          <TallCard hue={0} title="Watch" body="Every purchase lands with the task behind it, the cap it was allowed, and the receipt when it comes.">
            <div className="rounded-[14px] p-4" style={{ backgroundColor: "rgba(10,10,10,0.72)", border: `1px solid ${LINE}` }}>
              <p className={`${EYEBROW} text-white/50`}>Today</p>
              <ul className="mt-3 flex flex-col gap-3 text-[13px]">
                {[
                  ["Procurement", "WebstaurantStore", "$216.50", "Intent"],
                  ["Travel", "United", "$486.00", "Paid"],
                  ["Software", "OpenAI", "$2,500.00", "Receipt"],
                ].map(([who, m, amt, st]) => (
                  <li key={m} className="flex items-center justify-between gap-3">
                    <span>
                      <span className="font-semibold">{m}</span>
                      <span className="block text-[11px] text-white/50">{who} agent</span>
                    </span>
                    <span className="text-right">
                      <span className="font-numeral block tabular-nums">{amt}</span>
                      <span className="block text-[11px] text-white/50">{st}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </TallCard>
          <TallCard hue={120} title="Nudge" body="Before a cap breaks or a renewal lands, Payloat says so, to the agent and to whoever owns it.">
            <div className="rounded-[14px] p-4" style={{ backgroundColor: "rgba(10,10,10,0.72)", border: `1px solid ${LINE}` }}>
              <p className={`${EYEBROW} text-white/50`}>Needs a look</p>
              <ul className="mt-3 flex flex-col gap-3 text-[13px]">
                {[
                  "Procurement is $16.50 over its cap",
                  "Instacart receipt missing, 3 days",
                  "Vercel renews Friday, $350",
                ].map((t) => (
                  <li key={t} className="flex items-center justify-between gap-3">
                    <span>{t}</span>
                    <span className="h-[14px] w-[14px] shrink-0 rounded-[4px] border border-white/40" />
                  </li>
                ))}
              </ul>
            </div>
          </TallCard>
          <TallCard hue={210} title="Answer" body="Ask in Slack, in the app, or from another agent. Payloat answers with the number and the rows behind it.">
            <div className="flex flex-col gap-3">
              <div className="ml-auto max-w-[85%] rounded-[14px] px-4 py-3 text-[13px]" style={{ backgroundColor: "rgba(255,255,255,0.92)", color: INK }}>
                Which subscriptions renew this week?
              </div>
              <div className="rounded-[14px] px-4 py-3 text-[13px] text-white/85" style={{ backgroundColor: "rgba(10,10,10,0.72)", border: `1px solid ${LINE}` }}>
                Three: Vercel on Friday ($350), Claude on Saturday ($4,000), Stripe on Monday ($600). All under cap.
              </div>
              <div className="flex items-center justify-between rounded-full px-4 py-2.5 text-[12px] text-white/40" style={{ backgroundColor: "rgba(10,10,10,0.72)", border: `1px solid ${LINE}` }}>
                Ask a follow-up…
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/15">
                  <ArrowUp />
                </span>
              </div>
            </div>
          </TallCard>
        </div>
      </section>

      {/* 3. tap into your ledger */}
      <section className="mx-auto max-w-[1200px] px-6 py-[clamp(56px,7vw,112px)]">
        <div className="mx-auto max-w-[560px] text-center">
          <motion.h2 {...up} className="text-[clamp(32px,3.8vw,52px)] font-bold leading-[1.06] tracking-[-1.5px]">
            Tap into your ledger
          </motion.h2>
          <motion.p {...up} className="mt-4 text-[15px] leading-[1.55] text-white/60">
            Payloat turns a question into an answer you can check, grounded in the same rows your
            agents wrote, and delivered in seconds.
          </motion.p>
        </div>
        <div className="relative mx-auto mt-12 h-[520px] max-w-[760px] min-[700px]:h-[440px]">
          <motion.div
            {...up}
            className="absolute left-0 top-[220px] w-[min(100%,360px)] rounded-[16px] p-5 min-[700px]:top-[150px]"
            style={{ backgroundColor: CARD, border: `1px solid ${LINE}`, boxShadow: "0 30px 80px rgba(0,0,0,0.5)" }}
          >
            <p className={`${EYEBROW} text-white/50`}>Agent spend, last 30 days</p>
            <p className="font-numeral mt-3 flex items-baseline gap-2 text-[28px] font-semibold tracking-[-1px] tabular-nums">
              $9,190 <span className="text-[13px] font-medium text-[#3ddc97]">33% of caps</span>
            </p>
            <Spark />
          </motion.div>
          <motion.div
            {...up}
            transition={{ ...up.transition, delay: 0.12 }}
            className="absolute right-0 top-0 w-[min(100%,400px)] rounded-[16px] p-5 min-[700px]:top-[0px]"
            style={{ backgroundColor: CARD, border: `1px solid ${LINE}`, boxShadow: "0 30px 80px rgba(0,0,0,0.5)" }}
          >
            <p className={`${EYEBROW} text-white/50`}>Payloat</p>
            <div className="mt-3 rounded-[12px] p-3" style={{ backgroundColor: "rgba(255,255,255,0.05)", border: `1px solid ${LINE}` }}>
              <p className={`${EYEBROW} text-white/40`}>September so far</p>
              <p className="font-numeral mt-1 flex items-baseline gap-2 text-[20px] font-semibold tabular-nums">
                $9,190 <span className="text-[12px] font-medium text-[#3ddc97]">17 agents</span>
              </p>
            </div>
            <p className="mt-3 text-[13px] leading-[1.5] text-white/80">
              Spend is a third of the way through the caps with two thirds of the month gone, so the
              run rate is fine. Three things stand out.
            </p>
            <ul className="mt-2 flex flex-col gap-2 text-[12px] leading-[1.5] text-white/65">
              <li>
                <span className="font-semibold text-white/85">Procurement ran hot.</span> $16.50 over
                its cap at WebstaurantStore on the 9th. Restock deli paper.
              </li>
              <li>
                <span className="font-semibold text-white/85">Software &amp; seats is at 95%.</span>{" "}
                Claude renews Saturday for $4,000 and would take it over.
              </li>
              <li>
                <span className="font-semibold text-white/85">One receipt is missing.</span> Instacart,
                $142.10, three days old.
              </li>
            </ul>
          </motion.div>
        </div>
        <motion.p {...up} className="mx-auto mt-10 max-w-[520px] text-center text-[13px] leading-[1.5] text-white/45">
          Payloat reads the same ledger your agents write to. Every answer names the rows it came from.
        </motion.p>
      </section>

      {/* 4. keep your agents honest, on the off-white ground */}
      <section className="mx-auto max-w-[1200px] px-6 py-[clamp(24px,4vw,56px)]">
        <div className="rounded-[30px] px-6 pb-0 pt-14 text-ink min-[900px]:px-12 min-[900px]:pt-20" style={{ backgroundColor: "#f4f3ef" }}>
          <div className="mx-auto max-w-[640px] text-center">
            <motion.p {...up} className={`${EYEBROW} text-sub`}>
              For owners and managers
            </motion.p>
            <motion.h2 {...up} className="mt-4 text-[clamp(30px,3.6vw,50px)] font-bold leading-[1.06] tracking-[-1.5px]">
              Let Payloat keep your agents honest.
            </motion.h2>
            <motion.p {...up} className="mt-4 text-[15px] leading-[1.55] text-sub">
              Have a question about what an agent bought? Ask Payloat, the agent that never buys
              anything itself.
            </motion.p>
          </div>
          <div className="relative mt-10 grid items-end gap-8 min-[900px]:mt-14 min-[900px]:grid-cols-[1fr_auto_1fr] min-[900px]:gap-12">
            <div className="flex flex-col gap-10 min-[900px]:pb-24">
              <Point label="Visibility across agents" body="Connect every agent's key and see every purchase in one ledger, alongside the team's cards." />
              <Point label="Nudges before the charge" body="Renewals, caps, and missing receipts come up before they cost anything." />
            </div>
            <motion.div {...up} className="mx-auto w-[min(70%,300px)] min-[900px]:w-[300px]">
              <ScreenPhone />
            </motion.div>
            <div className="flex flex-col gap-10 min-[900px]:pb-24">
              <Point label="Caps, watched" body="Each agent's cap is checked on every purchase. Over it, the row is flagged and the owner knows." />
              <Point label="Receipts, matched" body="Bank charges and receipts pair up on their own. Anything unmatched is a short list, not a search." />
            </div>
          </div>
        </div>
      </section>

      {/* 5. for your agents, too */}
      <section className="mx-auto max-w-[1200px] px-6 py-[clamp(56px,7vw,112px)]">
        <div className="grid gap-10 min-[900px]:grid-cols-2 min-[900px]:items-center min-[900px]:gap-16">
          <div>
            <motion.p {...up} className={`${EYEBROW} text-white/50`}>
              For your agents, too
            </motion.p>
            <motion.h2 {...up} className="mt-4 text-[clamp(30px,3.6vw,50px)] font-bold leading-[1.06] tracking-[-1.5px]">
              An agent that other agents can ask.
            </motion.h2>
            <motion.p {...up} className="mt-4 max-w-[440px] text-[15px] leading-[1.55] text-white/60">
              Before an agent buys, it can ask Payloat what it already bought, what its cap has left,
              and whether a receipt is still open. Same key, same ledger, one call.
            </motion.p>
            <motion.div {...up} className="mt-8">
              <Link
                href="/product#agent-purchases"
                className="inline-flex h-11 items-center rounded-full border border-white/25 px-5 text-[13px] font-semibold tracking-[-0.3px] text-white transition-transform hover:scale-[1.03] active:scale-[0.97]"
              >
                How a purchase is recorded
              </Link>
            </motion.div>
          </div>
          <motion.div {...up} className="rounded-[20px] p-5" style={{ backgroundColor: CARD, border: `1px solid ${LINE}` }}>
            <p className={`${EYEBROW} text-white/50`}>Procurement agent · Payloat</p>
            <div className="mt-4 flex flex-col gap-3">
              <div className="ml-auto max-w-[85%] rounded-[14px] px-4 py-3 text-[13px]" style={{ backgroundColor: "rgba(255,255,255,0.92)", color: INK }}>
                Have I already bought deli paper this month, and what is left on my cap?
              </div>
              <div className="max-w-[92%] rounded-[14px] px-4 py-3 text-[13px] leading-[1.5] text-white/85" style={{ backgroundColor: "rgba(255,255,255,0.06)", border: `1px solid ${LINE}` }}>
                Yes. September 3, $118.20 at WebstaurantStore, delivered September 5, receipt matched.
                Your cap is $5,000 and $880 is left. A $216.50 restock fits.
              </div>
              <div className="max-w-[92%] rounded-[14px] px-4 py-3 text-[12px] leading-[1.5] text-white/45" style={{ backgroundColor: "rgba(255,255,255,0.03)", border: `1px solid ${LINE}` }}>
                Rows: pur_7f2a… (Sep 3), cap_proc_sep. Answered in 0.4s.
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 6. closing */}
      <section className="mx-auto max-w-[1200px] px-6 pb-[clamp(72px,9vw,140px)] pt-4">
        <motion.div {...up} className="rounded-[30px] px-8 py-14 text-center min-[900px]:py-20" style={{ backgroundColor: CARD, border: `1px solid ${LINE}` }}>
          <Image src="/payloat-app-icon-v2.png" alt="" width={40} height={40} className="mx-auto h-[40px] w-[40px] rounded-[10px]" />
          <h2 className="mx-auto mt-6 max-w-[640px] text-[clamp(30px,3.6vw,50px)] font-bold leading-[1.06] tracking-[-1.5px]" style={{ textWrap: "balance" }}>
            Put Payloat on the team.
          </h2>
          <p className="mx-auto mt-4 max-w-[460px] text-[15px] leading-[1.5] text-white/60">
            Give one agent a key today and ask Payloat what it bought by Friday.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/signup"
              className="inline-flex h-12 items-center rounded-full bg-white px-6 text-[14px] font-semibold tracking-[-0.3px] text-ink transition-transform hover:scale-[1.03] active:scale-[0.97]"
            >
              Get started
            </Link>
            <Link
              href="/contact#sales"
              className="inline-flex h-12 items-center rounded-full border border-white/25 px-6 text-[14px] font-semibold tracking-[-0.3px] text-white transition-transform hover:scale-[1.03] active:scale-[0.97]"
            >
              Talk to us
            </Link>
          </div>
        </motion.div>
      </section>

      {/* the footer keeps its light ground under the dark page */}
      <div className="mt-2 rounded-t-[30px] bg-white text-ink">
        <FooterSection />
      </div>
    </main>
  );
}

/* ---------- pieces ---------- */

/* the prompt box: types each question, holds, clears, types the next */
function Prompt() {
  const [text, setText] = useState("");
  const reduced = useReducedMotion() ?? false;
  useEffect(() => {
    if (reduced) {
      setText(QUESTIONS[0]);
      return;
    }
    let i = 0;
    let n = 0;
    let dir: "type" | "hold" | "clear" = "type";
    let t = 0;
    const step = () => {
      const q = QUESTIONS[i];
      if (dir === "type") {
        n += 1;
        setText(q.slice(0, n));
        if (n >= q.length) {
          dir = "hold";
          t = window.setTimeout(step, 1800);
          return;
        }
        t = window.setTimeout(step, 34 + Math.random() * 50 + (q[n - 1] === " " ? 40 : 0));
      } else if (dir === "hold") {
        dir = "clear";
        t = window.setTimeout(step, 0);
      } else {
        n = Math.max(0, n - 3);
        setText(q.slice(0, n));
        if (n === 0) {
          dir = "type";
          i = (i + 1) % QUESTIONS.length;
          t = window.setTimeout(step, 350);
          return;
        }
        t = window.setTimeout(step, 18);
      }
    };
    t = window.setTimeout(step, 600);
    return () => window.clearTimeout(t);
  }, [reduced]);
  return (
    <div className="flex h-[60px] items-center gap-3 rounded-[16px] pl-5 pr-2" style={{ backgroundColor: CARD, border: `1px solid ${LINE}`, boxShadow: "0 20px 60px rgba(0,0,0,0.45)" }}>
      <p className="min-w-0 flex-1 truncate text-left text-[16px] text-white/90">
        {text}
        {!reduced && <span className="ml-px inline-block h-[18px] w-[2px] translate-y-[3px] animate-pulse bg-white/80" />}
      </p>
      <span className="flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-full bg-white text-ink">
        <ArrowUp />
      </span>
    </div>
  );
}

function ArrowUp() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 19V5M5 12l7-7 7 7" />
    </svg>
  );
}

/* a tall card on the brand gradient, hue shifted per card, content near
   the middle and the caption at the bottom */
function TallCard({ hue, title, body, children }: { hue: number; title: string; body: string; children: React.ReactNode }) {
  return (
    <motion.div {...up} className="relative flex min-h-[520px] flex-col overflow-hidden rounded-[20px] p-5">
      <Image src="/slack-gradient.jpg" alt="" fill sizes="400px" className="object-cover" style={{ filter: `hue-rotate(${hue}deg) saturate(0.9) brightness(0.7)` }} />
      <div className="absolute inset-0" style={{ background: "linear-gradient(180deg,rgba(0,0,0,0.05) 0%,rgba(0,0,0,0.55) 100%)" }} />
      <div className="relative my-auto py-6">{children}</div>
      <div className="relative">
        <p className="text-[15px] font-semibold">{title}</p>
        <p className="mt-1 text-[13px] leading-[1.5] text-white/70">{body}</p>
      </div>
    </motion.div>
  );
}

/* the 30-day line, drawn in on view */
function Spark() {
  const ref = useRef<SVGSVGElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const pts = [0, 6, 9, 14, 20, 24, 31, 36, 40, 48, 55, 58, 66, 70, 78, 84, 90, 100].map((v, i, a) => [(i / (a.length - 1)) * 300, 80 - (v / 100) * 64] as const);
  const d = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
  return (
    <svg ref={ref} viewBox="0 0 300 90" className="mt-4 block w-full" aria-hidden>
      <motion.path d={`${d} L300 90 L0 90 Z`} fill="rgba(61,220,151,0.12)" initial={false} animate={{ opacity: inView ? 1 : 0 }} transition={{ duration: 0.6, delay: 0.6 }} />
      <motion.path d={d} fill="none" stroke="#3ddc97" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" initial={false} animate={{ pathLength: inView ? 1 : 0 }} transition={{ duration: 1.2, ease: EASE }} />
    </svg>
  );
}

function Point({ label, body }: { label: string; body: string }) {
  return (
    <motion.div {...up}>
      <p className={`${EYEBROW} text-ink`}>{label}</p>
      <p className="mt-2 max-w-[280px] text-[14px] leading-[1.5] text-sub">{body}</p>
    </motion.div>
  );
}

/* the phone: the brand gradient with the clock, cropped by the section's
   bottom the way Origin crops theirs */
function ScreenPhone() {
  const ref = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(300);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setW(el.clientWidth));
    ro.observe(el);
    setW(el.clientWidth);
    return () => ro.disconnect();
  }, []);
  return (
    <div ref={ref} className="w-full overflow-hidden" style={{ height: (909 / 430) * w * 0.62 }}>
      <PhoneMock width={w} frame="titanium" screenBg="#0a1fd2">
        <div className="absolute inset-0 overflow-hidden" style={{ width: phoneScreenWidth(w) }}>
          <Image src="/slack-gradient.jpg" alt="" fill sizes="400px" className="object-cover" />
          <p className="font-numeral absolute inset-x-0 top-[22%] text-center text-[clamp(40px,14vw,64px)] font-medium tracking-[-1px] text-white/95" style={{ fontSize: w * 0.19 }}>
            9:41
          </p>
        </div>
      </PhoneMock>
    </div>
  );
}
