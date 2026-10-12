"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { mono } from "./monoFont";
import { WHEREVER_HTML } from "./wherever-you-work.html";
import "./FinanceProcedures.css";

/**
 * The finance teams page's Procedures section, on Intercom's "trained to
 * understand your business deeply" anatomy: a headline and three
 * paragraphs, then a wide panel on a deeper ground with faint policy text
 * at its edges. In the panel, a procedure card (the steps the Loat follows
 * when an invoice is over its limit, an IF and ELSE, and the connector
 * picker open on step A) with the Loat's chat laid over its right edge,
 * running that procedure with you.
 *
 * The copy speaks of your finance Loat; the chat shows one named Sona,
 * as an example. The picker only
 * offers tools the site already shows. The vendor and figures are
 * examples. The card and the chat rise in when the panel scrolls into
 * view; on a phone the chat stands alone.
 */

const EASE = [0.25, 0.6, 0.2, 1] as const;
const MAYA = WHEREVER_HTML.match(/<svg(?:(?!<\/svg>)[\s\S])*#f28c28[\s\S]*?<\/svg>/)?.[0] ?? "";
const CANVAS = { desktop: { w: 1560, h: 990 }, mobile: { w: 440, h: 760 } };

const rise = (delay: number) => ({
  initial: { opacity: 0, y: 26 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.6, ease: EASE, delay },
});

const POLICY =
  "Invoices over two thousand dollars need the budget owner. Hold any payment that would take a team past its monthly budget. Match every invoice to an order before it is paid. Vendors on the approved list may be paid on the due date. Renewals are flagged thirty days ahead. Card charges are matched to receipts within a day. Refunds are logged against the original charge. The month closes on the third working day. ";

export default function FinanceProcedures() {
  return (
    <section className="fp" style={{ "--fp-mono": mono.style.fontFamily } as React.CSSProperties}>
      <div className="fp-policy fp-policy--top" aria-hidden>{POLICY.repeat(3)}</div>
      <div className="fp-policy fp-policy--side" aria-hidden>{POLICY.repeat(4)}</div>
      <div className="fp-wrap">
        <div className="fp-copy">
          <h2 className="fp-title">Your finance Loat is trained to understand your finances deeply</h2>
          <p className="fp-body">
            Your finance Loat is <u>trained</u> on your budgets, approval limits, vendor policies and the way your team closes the month. That lets it reason about a problem and carry out long, multi-step workflows through <u>Procedures</u>.
          </p>
          <p className="fp-body">
            It writes like your best finance lead, because it learns your tone, your vendors and anything else you want to teach it.
          </p>
          <p className="fp-body">It works 24 hours a day, every day, and checks with you before any money moves.</p>
        </div>

        <Panel layout="desktop" />
        <Panel layout="mobile" />
      </div>
    </section>
  );
}

function Panel({ layout }: { layout: "desktop" | "mobile" }) {
  const box = useRef<HTMLDivElement>(null);
  const [z, setZ] = useState(1);
  const c = CANVAS[layout];
  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    const fit = () => setZ(el.clientWidth / c.w);
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, [c.w]);
  return (
    <div
      ref={box}
      className={`fp-panel fp-panel--${layout}`}
      style={{ height: c.h * z }}
      role="img"
      aria-label="A procedure for an invoice over its limit: match it to its order, check the budget, then hold the payment and send it for approval, or pay it and log it. Beside it, your finance Loat, here named Sona, follows that procedure in a chat with you."
    >
      <span className="fp-sq fp-sq--tl" aria-hidden /><span className="fp-sq fp-sq--tr" aria-hidden />
      <span className="fp-sq fp-sq--bl" aria-hidden /><span className="fp-sq fp-sq--br" aria-hidden />
      <div className="fp-canvas" style={{ width: c.w, height: c.h, transform: `scale(${z})` }} aria-hidden>
        {layout === "desktop" && <Procedure />}
        <Chat layout={layout} />
      </div>
    </div>
  );
}

/* ---------- the procedure ---------- */
const Use = ({ name }: { name: string }) => (
  <span className="fp-chip">
    <svg viewBox="0 0 24 24" aria-hidden><path d="M8.5 15.5 5 12l3.5-3.5M15.5 8.5 19 12l-3.5 3.5M13.5 6l-3 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
    <b>Use</b> {name}<i>⋮</i>
  </span>
);

function Procedure() {
  return (
    <motion.div className="fp-proc" {...rise(0.05)}>
      <div className="fp-proc__head">Procedure: Invoice over its limit</div>
      <div className="fp-proc__body">
        <div className="fp-step fp-step--faded">
          <span className="fp-n">3.</span>
          <p>Match the invoice to its order. <Use name="Read invoice" /> Find the order it bills for and confirm the amount and the due date.</p>
        </div>

        <h4 className="fp-sub">Check the budget and route the approval</h4>

        <div className="fp-step">
          <span className="fp-n">4.</span>
          <p>
            <span className="fp-chip"><svg viewBox="0 0 24 24" aria-hidden><path d="m8 8-4 4 4 4M16 8l4 4-4 4M13.5 5l-3 14" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" /></svg><b>Run code</b> check_spend_limit<i>⋮</i></span>
            Decide if the invoice is above the team&apos;s approval limit.
          </p>
        </div>

        <div className="fp-step">
          <span className="fp-n">4.</span>
          <div className="fp-branch">
            <div className="fp-if"><span className="fp-if__ic">↦</span><b>IF</b><i>⋮</i></div>
            <div className="fp-code"><span className="v">over_limit</span> is <span className="k">True</span><span className="fp-code__ic">‹›</span></div>
            <div className="fp-sub-step">
              <span className="fp-l">A.</span>
              <p>Hold the payment and tell the owner why. <span className="fp-use">Use <i className="fp-caret" /><span>Select connector…</span></span></p>
            </div>
            <div className="fp-sub-step">
              <span className="fp-l">B.</span>
              <p><Use name="Send for approval" /> to the budget owner, with the invoice, the order and what the budget has left.</p>
            </div>
            <div className="fp-if fp-else"><span className="fp-if__ic">↳</span><b>ELSE</b></div>
            <div className="fp-sub-step">
              <span className="fp-l">A.</span>
              <p>Pay the invoice and log it in the ledger.</p>
            </div>
          </div>
        </div>
      </div>

      <motion.div className="fp-menu" {...rise(0.45)}>
        <div className="fp-opt is-on">
          <span className="fp-opt__ic"><svg viewBox="0 0 24 24" aria-hidden><rect x="7" y="5.5" width="3" height="13" rx="1" fill="currentColor" /><rect x="14" y="5.5" width="3" height="13" rx="1" fill="currentColor" /></svg></span>
          Hold payment
          <svg className="fp-hand" viewBox="0 0 24 24" aria-hidden><path d="M9 11.5V4.8a1.6 1.6 0 0 1 3.2 0v5.4m0-1.4a1.6 1.6 0 0 1 3.2 0v1.6m0-.6a1.6 1.6 0 0 1 3.2 0v1.4m0 0a1.6 1.6 0 0 1 3.2 0v3.6c0 3.8-2.6 6.6-6.4 6.6h-1.6c-2.2 0-3.6-1-4.8-2.6L5 15.2a1.7 1.7 0 0 1 2.6-2.1L9 14.6" fill="#fff" stroke="#111" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <div className="fp-opt"><span className="fp-opt__ic"><img src="/logos/tools/google-sheets.png" alt="" /></span>Get budget in Google Sheets</div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <div className="fp-opt"><span className="fp-opt__ic"><img src="/logos/stripe.svg" alt="" /></span>Pay in Stripe</div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <div className="fp-opt"><span className="fp-opt__ic"><img src="/logos/tools/slack.svg" alt="" /></span>Notify the owner in Slack</div>
        <div className="fp-opt fp-opt--fade"><span className="fp-opt__ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden><rect x="4" y="4" width="16" height="16" rx="2" /><path d="M8 9h8M8 12.5h8M8 16h5" /></svg></span>Log to the ledger</div>
        <div className="fp-menu__foot"><span className="fp-opt__ic">+</span>Create new connector</div>
      </motion.div>
    </motion.div>
  );
}

/* ---------- the finance Loat's chat (named Sona here), running the procedure ---------- */
function Chat({ layout }: { layout: "desktop" | "mobile" }) {
  return (
    <motion.div className={`fp-chat fp-chat--${layout}`} {...rise(0.25)}>
      <div className="fp-chat__head">
        <span className="fp-chat__back">‹</span>
        <span className="fp-chat__ava" dangerouslySetInnerHTML={{ __html: MAYA }} />
        <b>Sona</b>
        <span className="fp-chat__icons">··· <i>×</i></span>
      </div>
      <div className="fp-chat__thread">
        <div className="fp-b fp-b--them">To check it against the budget, I need the invoice. Could you forward it, or tell me the vendor?</div>
        <div className="fp-b fp-b--me">It&apos;s Vibe.co, invoice VB-2041 for $4,800</div>
        <div className="fp-b fp-b--them">Got it, thanks. I matched it to the October order. It&apos;s $4,800, above the $2,000 limit for marketing, so I&apos;ve held the payment. Should I send it to Zeradam to approve?</div>
        <div className="fp-b fp-b--me">Yes, send it to him</div>
        <div className="fp-b fp-b--them">Done. Zeradam has it with the invoice, the order and the budget left, and it&apos;s logged in the ledger. I&apos;ll pay it as soon as he approves, well before October 20.</div>
        <div className="fp-chat__meta">Sona · Just now</div>
      </div>
    </motion.div>
  );
}
