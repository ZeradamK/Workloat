"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { mono } from "./monoFont";
import "./EnterpriseNative.css";

/**
 * Loats native to the enterprise, on Vercel's "Build agents on
 * infrastructure that thinks like them": a headline, then a faded document
 * with a company's mark on a square tile at its corner, a Loat chat laid
 * over it, and on the right a line about that company and a short list.
 *
 * Every 4.5 seconds the company changes, everything crossfading together:
 * its mark, the document, what its Loat offers to do, and the line on the
 * right, each written for what that company does. These are examples of
 * the kind of company Workloat builds for, not customers, and the line
 * says so ("for a company like"). The loop runs only while the section is
 * on screen; with reduced motion it rests on the first.
 *
 * The panel is drawn on a fixed 1180 x 600 canvas scaled to its column
 * (the chat alone, 680 x 600, on a phone).
 */

type Company = {
  name: string;
  logo: string;
  fill?: boolean; // a mark that comes on its own square ground fills the tile
  doc: string;
  asks: [string, string, string];
  line: string; // after "For a company like {name},"
};

const COMPANIES: Company[] = [
  {
    name: "Stripe", logo: "/logos/stripe.svg", fill: true,
    doc: "Payout reconciliation",
    asks: ["Reconcile yesterday's payouts", "Flag disputes over $1,000", "Draft the refund policy update"],
    line: "a Loat lives inside every payout, dispute and ledger entry it already runs.",
  },
  {
    name: "Salesforce", logo: "/logos/salesforce.png",
    doc: "Q4 pipeline review",
    asks: ["Summarize at-risk renewals", "Update the forecast from this week's calls", "Draft follow-ups for stalled deals"],
    line: "a Loat works inside the accounts, pipeline and forecasts its teams already keep.",
  },
  {
    name: "DoorDash", logo: "/logos/doordash.webp", fill: true,
    doc: "Merchant onboarding",
    asks: ["Check new merchants' documents", "Find orders delayed over 30 minutes", "Draft this week's merchant update"],
    line: "a Loat knows every merchant, order and delivery zone in the systems it already has.",
  },
  {
    name: "Spotify", logo: "/logos/spotify.webp", fill: true,
    doc: "Royalty statement · October",
    asks: ["Reconcile label royalties", "Flag tracks with missing rights", "Draft the artist payout report"],
    line: "a Loat understands every royalty, rights holder and payout behind the catalog.",
  },
  {
    name: "Deloitte", logo: "/logos/deloitte.png",
    doc: "Client engagement plan",
    asks: ["Staff the audit team for next quarter", "Summarize the client's filings", "Draft the engagement letter"],
    line: "a Loat follows every engagement, filing and review the firm already runs.",
  },
];

const FEATURES = ["Native to your stack", "Your data, your cloud", "Loats you own", "Every layer understood"];
const STEP = 4500;
const EASE = [0.25, 0.6, 0.2, 1] as const;

/* `lead`: the section opens the page (the enterprise page), so it leaves
   room for the nav, rises in on load and carries the page's h1 */
export default function EnterpriseNative({ lead = false }: { lead?: boolean }) {
  const root = useRef<HTMLElement>(null);
  const [at, setAt] = useState(0);

  useEffect(() => {
    const el = root.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let timer = 0;
    const io = new IntersectionObserver(([e]) => {
      window.clearInterval(timer);
      if (e.isIntersecting) timer = window.setInterval(() => setAt((n) => (n + 1) % COMPANIES.length), STEP);
    }, { threshold: 0.25 });
    io.observe(el);
    return () => { window.clearInterval(timer); io.disconnect(); };
  }, []);

  const c = COMPANIES[at];
  return (
    <section ref={root} className={`en${lead ? " en--lead" : ""}`} style={{ "--en-mono": mono.style.fontFamily } as React.CSSProperties}>
      <motion.div
        className="en-head"
        initial={{ opacity: 0, y: 30 }}
        {...(lead ? { animate: { opacity: 1, y: 0 } } : { whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: "-80px" } })}
        transition={{ duration: 0.6, ease: EASE }}
      >
        {lead ? (
          <h1 className="en-title">Build Loats into the infrastructure your company already runs</h1>
        ) : (
          <h2 className="en-title">Build Loats into the infrastructure your company already runs</h2>
        )}
        <p className="en-body">
          Workloat builds Loats natively into the systems an enterprise already runs, on its own infrastructure. The company owns its data and its Loats, and each one understands every layer of the business it was built for.
        </p>
      </motion.div>

      <div className="en-row">
        <Stage c={c} at={at} layout="desktop" />
        <Stage c={c} at={at} layout="mobile" />
        <div className="en-side">
          <p className="en-line" aria-live="polite">
            <span key={at} className="en-fade">
              <span className="en-name">For a company like {c.name},</span> {c.line}
            </span>
          </p>
          <p className="en-flabel">Built in</p>
          <ul className="en-features">
            {FEATURES.map((f) => <li key={f}>{f}</li>)}
          </ul>
        </div>
      </div>
    </section>
  );
}

const W_PATH = "M249 348H409V684H543V530H712V684H846V348H1006V517H939V800H873V901H699V708H556V901H382V800H316V517H249Z";
const ASK_ICONS = [
  <svg key="a" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M4 12a8 8 0 0 1 13.7-5.6M20 12a8 8 0 0 1-13.7 5.6M17.7 3.5v3h-3M6.3 20.5v-3h3" /></svg>,
  <svg key="b" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden><circle cx="10.5" cy="10.5" r="6" /><path d="m15 15 5 5M10.5 8v5M8 10.5h5" /></svg>,
  <svg key="c" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden><circle cx="12" cy="12" r="8.5" /><path d="m8.5 12.2 2.4 2.4 4.6-4.8" /></svg>,
];

function Stage({ c, at, layout }: { c: Company; at: number; layout: "desktop" | "mobile" }) {
  const box = useRef<HTMLDivElement>(null);
  const [z, setZ] = useState(1);
  const W = layout === "desktop" ? 1180 : 680, H = 600;
  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    const fit = () => setZ(Math.min(1, el.clientWidth / W));
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, [W]);
  return (
    <div ref={box} className={`en-stage en-stage--${layout}`} style={{ height: H * z }} aria-hidden>
      <div className="en-canvas" style={{ width: W, height: H, transform: `scale(${z})` }}>
        {layout === "desktop" && (
          <>
            <div className="en-doc">
              <p key={`d${at}`} className="en-doc__title en-fade">{c.doc}</p>
            </div>
            {/* the tile sits outside the document, whose fade would clip it */}
            <span key={`t${at}`} className={`en-tile en-fade${c.fill ? " en-tile--fill" : ""}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={c.logo} alt="" />
            </span>
          </>
        )}
        <div className={`en-chat en-chat--${layout}`}>
          <div className="en-chat__top">
            <span>New Loat chat <i>⌄</i></span>
            <span className="en-chat__ic">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 4H6.5A2.5 2.5 0 0 0 4 6.5v11A2.5 2.5 0 0 0 6.5 20h11a2.5 2.5 0 0 0 2.5-2.5V12M18.5 3.5l2 2L13 13l-3 1 1-3Z" /></svg>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="3.5" y="5" width="17" height="14" rx="2.5" /><rect x="12" y="12" width="6" height="4.5" rx="1" fill="currentColor" /></svg>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M6 6l12 12M18 6 6 18" /></svg>
            </span>
          </div>
          <div className="en-chat__body">
            <span className="en-ava"><svg viewBox="249 348 757 553"><path fill="#1a1a1a" d={W_PATH} /></svg></span>
            <h3>How can I help you today?</h3>
            <ul key={`a${at}`} className="en-asks en-fade">
              {c.asks.map((a, k) => <li key={a}>{ASK_ICONS[k]}{a}</li>)}
            </ul>
            <div className="en-compose">
              <div className="en-compose__chips">
                <span className="en-chip en-chip--at">@</span>
                <span key={`c${at}`} className="en-chip en-fade">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"><path d="M7 3.5h7l4 4V20a.5.5 0 0 1-.5.5h-10A1.5 1.5 0 0 1 6 19V5A1.5 1.5 0 0 1 7 3.5ZM14 3.5V8h4.5M9 12h6M9 15.5h6" /></svg>
                  {c.doc}
                </span>
              </div>
              <p>Ask, search, or make anything…</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
