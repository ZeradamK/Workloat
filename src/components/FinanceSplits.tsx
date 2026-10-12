"use client";

import { useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { mono } from "./monoFont";
import { WHEREVER_HTML } from "./wherever-you-work.html";
import "./FinanceSplits.css";

/**
 * Two cards after the finance teams hero, on Intercom's paired feature
 * cards: a framed panel (corner squares, a field of dots fading out) with
 * the product in it, then a title, a paragraph and a link.
 *
 * Both stay on what Workloat does today:
 *   1. Approvals with the evidence: Sona asks before she pays an invoice
 *      over the limit you set, with what she checked (the order, the
 *      budget left), you approve, and the step goes in the ledger.
 *   2. Budgets: this month's spend by team (Sona's By team view) as a
 *      treemap, and her warning before a budget runs low, with the offer
 *      to hold new orders for your OK.
 *
 * Each panel is drawn on a fixed 770 x 725 canvas scaled to its column.
 * The invoice and the figures are examples.
 */

const EASE = [0.25, 0.6, 0.2, 1] as const;
const MAYA = WHEREVER_HTML.match(/<svg(?:(?!<\/svg>)[\s\S])*#f28c28[\s\S]*?<\/svg>/)?.[0] ?? "";
const CANVAS = { w: 770, h: 725 };

/* `spaced`: room above too, for a page where the cards follow another
   section rather than the hero (the home page) */
export default function FinanceSplits({ spaced = false }: { spaced?: boolean }) {
  return (
    <section className={`fs${spaced ? " fs--spaced" : ""}`} style={{ "--fs-mono": mono.style.fontFamily } as React.CSSProperties}>
      <div className="fs-grid">
        <Card
          title="Every approval comes with the evidence"
          body={
            <>
              <u>Sona</u> checks each charge against its order and its budget before she asks, so you approve with the facts in front of you, in Slack, by email, by text or in the app. Every step lands in the ledger.
            </>
          }
        >
          <Handoff />
        </Card>
        <Card
          title="Every budget, tracked as you spend"
          body={
            <>
              <u>Sona</u> keeps the running total for every team and vendor, so you see where the money goes, and she tells you before a budget runs low, not after.
            </>
          }
          link={{ label: "Learn more", href: "/#how-loats-work" }}
        >
          <Explorer />
        </Card>
      </div>
    </section>
  );
}

function Card({ title, body, link, children }: { title: string; body: React.ReactNode; link?: { label: string; href: string }; children: React.ReactNode }) {
  return (
    <motion.article
      className="fs-card"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.55, ease: EASE }}
    >
      <Panel>{children}</Panel>
      <h3 className="fs-title">{title}</h3>
      <p className="fs-body">{body}</p>
      {link && <Link href={link.href} className="fs-link">{link.label}</Link>}
    </motion.article>
  );
}

/* the framed panel: corner squares, a field of dots, the canvas scaled to fit */
function Panel({ children }: { children: React.ReactNode }) {
  const box = useRef<HTMLDivElement>(null);
  const [z, setZ] = useState(1);
  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    const fit = () => setZ(el.clientWidth / CANVAS.w);
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return (
    <div ref={box} className="fs-panel" style={{ height: CANVAS.h * z }} role="img" aria-hidden>
      <span className="fs-sq fs-sq--tl" /><span className="fs-sq fs-sq--tr" /><span className="fs-sq fs-sq--bl" /><span className="fs-sq fs-sq--br" />
      <div className="fs-canvas" style={{ width: CANVAS.w, height: CANVAS.h, transform: `scale(${z})` }}>
        {children}
      </div>
    </div>
  );
}

/* the bubbles rise in one after another as the panel comes into view */
const rise = (i: number) => ({
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.5, ease: EASE, delay: 0.25 + i * 0.35 },
});

/* ---------- 1. Sona asks, with what she checked; you approve ---------- */
export function Handoff() {
  return (
    <>
      <div className="fs-dots fs-dots--map" />
      <motion.div className="fs-bubble fs-bubble--loat" {...rise(0)}>
        <div className="fs-who"><span className="fs-ava" dangerouslySetInnerHTML={{ __html: MAYA }} />Sona</div>
        <p>Vibe&apos;s October invoice is $4,800, above the $2,000 limit you set for marketing. Want me to pay it today?</p>
      </motion.div>
      <motion.div className="fs-bubble fs-bubble--summary" {...rise(1)}>
        <div className="fs-who"><span className="fs-tag">W</span>Evidence</div>
        <ul>
          <li>Invoice VB-2041 matches the October order, due Oct 20.</li>
          <li>Marketing has $6,200 left, and $1,400 after this payment.</li>
        </ul>
      </motion.div>
      <motion.div className="fs-bubble fs-bubble--person" {...rise(2)}>
        <div className="fs-who">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="fs-ava" src="/landing/anywhere/ddd827596c.jpg" alt="" />
          Zeradam from Finance
        </div>
        <p>Approved. Please pay it today and log it against October marketing.</p>
      </motion.div>
      <motion.div className="fs-ledger" {...rise(3)}>
        <span className="fs-ledger__t">9:44</span>
        <span className="fs-ledger__who"><span className="fs-ava" dangerouslySetInnerHTML={{ __html: MAYA }} />Sona</span>
        <span className="fs-ledger__what">Paid Vibe.co · approved by Zeradam</span>
        <span className="fs-ledger__tag">Executed</span>
      </motion.div>
    </>
  );
}

/* ---------- 2. Budgets by team, with Sona's warning ---------- */
const BLOCKS: { team: string; spent: string; used: string; area: string; tone: string; hot?: boolean }[] = [
  { team: "Marketing", spent: "$23,800", used: "79%", area: "a", tone: "#1e1e1e" },
  { team: "Engineering", spent: "$18,200", used: "61%", area: "b", tone: "#2f2f2f" },
  { team: "Procurement", spent: "$9,840", used: "91%", area: "c", tone: "#d4581a", hot: true },
  { team: "Software and seats", spent: "$6,120", used: "68%", area: "d", tone: "#4a4a4a" },
  { team: "Operations", spent: "$4,450", used: "52%", area: "e", tone: "#6a6a6a" },
  { team: "Travel", spent: "$2,760", used: "46%", area: "f", tone: "#bcbcb8" },
];

export function Explorer() {
  return (
    <>
      <div className="fs-win">
        <div className="fs-win__head">
          <span className="fs-win__icon" aria-hidden />
          <b>Budgets</b>
        </div>
        <div className="fs-win__bar">
          <span className="fs-chip">
            <svg viewBox="0 0 16 16" aria-hidden><rect x="2" y="3" width="12" height="11" rx="1.5" fill="currentColor" /><path d="M2 6.5h12" stroke="#fff" strokeWidth="1.2" /></svg>
            Oct 1 to Oct 31, 2026
          </span>
          <span className="fs-filter">+ filter</span>
          <span className="fs-chip fs-chip--sel"><i />By team ▾</span>
        </div>
        <p className="fs-win__label">6 teams · $65,170 spent this month</p>
        <div className="fs-map">
          {BLOCKS.map((b) => (
            <div key={b.team} className={`fs-block${b.hot ? " is-hot" : ""}`} style={{ gridArea: b.area, background: b.tone, color: b.tone === "#bcbcb8" ? "#1e1e1e" : "#fff" }}>
              <b>{b.team}</b>
              <span>{b.spent} spent</span>
              <span>{b.used} of budget</span>
            </div>
          ))}
        </div>
      </div>
      <motion.div className="fs-alert" {...rise(1)}>
        <div className="fs-who fs-who--alert"><span className="fs-ava" dangerouslySetInnerHTML={{ __html: MAYA }} />Sona · budget running low</div>
        <p>Procurement is at 91% with 22 days to go, so at this pace it runs out around October 14. Want me to hold new orders over $100 for your OK?</p>
      </motion.div>
    </>
  );
}
