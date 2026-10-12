"use client";

import { useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { mono } from "./monoFont";
import { WHEREVER_HTML } from "./wherever-you-work.html";
import "./FinanceRows.css";

/**
 * The finance teams page's third section, on Intercom's "Deliver tailored
 * experiences across every channel" anatomy: a two-tone headline, then
 * three stacked panels with corner squares.
 *
 *   1. Ask Sona anywhere (light panel): title left, paragraph and a
 *      link with the channels' marks under it, and the lighthouse ink
 *      drawing on the right (messages flying in on its beam).
 *   2. A live record for every vendor (deeper panel, dot field): the
 *      Workloat app's vendor thread with its details panel laid over it
 *      on the left, centred title and paragraph on the right.
 *   3. Apps and integrations (light panel): title, paragraph and link,
 *      and a grid of the tools' and vendors' logos in their own colours.
 *
 * Everything shown is something Workloat does today: Sona answers by
 * email, in Slack, by text and in the app; she keeps each vendor's
 * charges, invoices and approvals; she works in the tools the home page
 * lists. The vendor and figures are examples.
 */

const EASE = [0.25, 0.6, 0.2, 1] as const;
const MAYA = WHEREVER_HTML.match(/<svg(?:(?!<\/svg>)[\s\S])*#f28c28[\s\S]*?<\/svg>/)?.[0] ?? "";

const rise = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.55, ease: EASE },
} as const;

export default function FinanceRows() {
  return (
    <section className="fr" style={{ "--fr-mono": mono.style.fontFamily } as React.CSSProperties}>
      <div className="fr-wrap">
        <motion.h2 className="fr-head" {...rise}>
          <span>Keep every dollar in view</span>
          <br />
          across every tool you use
        </motion.h2>

        {/* 1. ask anywhere */}
        <motion.article className="fr-row fr-row--light" {...rise}>
          <Squares />
          <h3 className="fr-title">Ask Sona anywhere</h3>
          <div className="fr-copy">
            <p className="fr-body">
              Send Sona invoices, receipts and questions by email, in Slack, by text or in the app. Every request lands in one place, and every answer comes back where you asked, so your team never chases a number across tools.
            </p>
            <Link href="/#how-loats-work" className="fr-link">Learn more</Link>
            <ul className="fr-channels" aria-label="Where you can reach Sona">
              <li title="Email"><svg viewBox="0 0 24 24" aria-hidden><rect x="3" y="5" width="18" height="14" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1.8" /><path d="m4 7 8 6 8-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg></li>
              <li title="Slack">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logos/tools/slack.svg" alt="" className="fr-channels__logo" />
              </li>
              <li title="Text"><svg viewBox="0 0 24 24" aria-hidden><path d="M12 4c4.7 0 8.5 3.1 8.5 7s-3.8 7-8.5 7c-.9 0-1.8-.1-2.6-.3L5 19.5l1.2-3.4C4.8 14.8 3.5 13 3.5 11c0-3.9 3.8-7 8.5-7Z" fill="currentColor" /></svg></li>
              <li title="The Workloat app"><svg viewBox="249 348 757 553" aria-hidden><path fill="currentColor" d="M249 348H409V684H543V530H712V684H846V348H1006V517H939V800H873V901H699V708H556V901H382V800H316V517H249Z" /></svg></li>
            </ul>
          </div>
          <div className="fr-art" aria-hidden>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/landing/finance/lighthouse.png" alt="" className="fr-ink" />
          </div>
        </motion.article>

        {/* 2. the live record */}
        <motion.article className="fr-row fr-row--deep" {...rise}>
          <Squares dark />
          <div className="fr-dots" aria-hidden />
          <div className="fr-ui" aria-hidden><Fit w={640} h={660}><Record /></Fit></div>
          <div className="fr-center">
            <h3 className="fr-title">A live record for every vendor</h3>
            <p className="fr-body">
              Every vendor, card and team has a live record, with its charges, invoices, contracts and approvals, giving <u>Sona</u> and your finance team the full picture before any money moves.
            </p>
          </div>
        </motion.article>

        {/* 3. apps and integrations */}
        <motion.article className="fr-row fr-row--light fr-row--apps" {...rise}>
          <Squares />
          <h3 className="fr-title">Apps and integrations</h3>
          <div className="fr-copy">
            <p className="fr-body">
              Sona works in the tools your team already uses, from Gmail and Slack to Google Sheets and Drive, and reads the charges from the vendors your company pays, all quick to connect.
            </p>
            <Link href="/contact#sales" className="fr-link">Learn more</Link>
          </div>
          <ul className="fr-logos" aria-label="Tools Sona works with">
            {LOGOS.map((l) => (
              <li key={l.alt} title={l.alt}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={l.src} alt={l.alt} style={{ height: l.h }} />
              </li>
            ))}
          </ul>
        </motion.article>
      </div>
    </section>
  );
}

const LOGOS = [
  { src: "/logos/tools/gmail.png", alt: "Gmail", h: 26 },
  { src: "/logos/tools/slack.svg", alt: "Slack", h: 28 },
  { src: "/logos/tools/google-sheets.png", alt: "Google Sheets", h: 30 },
  { src: "/logos/tools/google-drive.png", alt: "Google Drive", h: 26 },
  { src: "/logos/tools/google-docs.png", alt: "Google Docs", h: 30 },
  { src: "/logos/tools/google-calendar.png", alt: "Google Calendar", h: 28 },
  { src: "/logos/tools/macos-files.png", alt: "Files", h: 26 },
  { src: "/logos/stripe-wordmark-color.svg", alt: "Stripe", h: 22 },
  { src: "/logos/brex.svg", alt: "Brex", h: 20 },
  { src: "/logos/aws-color.svg", alt: "AWS", h: 24 },
  { src: "/logos/openai.svg", alt: "OpenAI", h: 26 },
  { src: "/logos/claude.svg", alt: "Claude", h: 26 },
];

/* the panel's four corner squares */
function Squares({ dark = false }: { dark?: boolean }) {
  const c = `fr-sq${dark ? " fr-sq--dark" : ""}`;
  return (
    <>
      <span className={`${c} fr-sq--tl`} aria-hidden /><span className={`${c} fr-sq--tr`} aria-hidden />
      <span className={`${c} fr-sq--bl`} aria-hidden /><span className={`${c} fr-sq--br`} aria-hidden />
    </>
  );
}

/* a fixed canvas scaled to its box's width */
function Fit({ w, h, children }: { w: number; h: number; children: React.ReactNode }) {
  const box = useRef<HTMLDivElement>(null);
  const [z, setZ] = useState(1);
  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    const fit = () => setZ(Math.min(1, el.clientWidth / w));
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, [w]);
  return (
    <div ref={box} className="fr-fit" style={{ height: h * z }}>
      <div style={{ width: w, height: h, transform: `scale(${z})`, transformOrigin: "0 0" }}>{children}</div>
    </div>
  );
}

/* ---------- the live record: a vendor thread and its details ---------- */
export function Record() {
  return (
    <div className="fr-rec">
      <div className="fr-thread">
        <div className="fr-thread__top"><b>Vibe.co</b><span>☆ ··· ✉</span></div>
        <div className="fr-tmsg">
          <p>Hi, please find attached invoice VB-2041 for your October CTV campaign, $4,800.00, due October 20.</p>
          <small>✉ 8:55 AM</small>
        </div>
        <p className="fr-tnote">Sona matched this invoice to the October order</p>
        <div className="fr-tmsg fr-tmsg--out">
          <p>Thanks for sending invoice VB-2041. It matches the October order, and it fits the marketing budget for this month.</p>
          <p>Payment is queued for approval today, well before October 20.</p>
        </div>
        <div className="fr-tmsg">
          <p>Great, thanks for confirming.</p>
          <small>✉ 9:12 AM</small>
        </div>
        <div className="fr-thread__reply"><b>Reply ▾</b><span>Reply to Vibe.co</span></div>
      </div>

      <div className="fr-panel">
        <div className="fr-panel__tabs"><b>Details</b><span>Sona</span><i>✕</i></div>
        <div className="fr-panel__kv"><span>Owner</span><b><i className="fr-panel__face" />Jenny</b></div>
        <div className="fr-panel__kv"><span>Team</span><b>Marketing</b></div>
        <div className="fr-panel__row">Contract <em>Monthly · renews Nov 1</em><i>›</i></div>
        <div className="fr-panel__row">Budget <em>$1,400 left</em><i>›</i></div>
        <div className="fr-panel__row is-open">Recent charges<i>⌄</i></div>
        <ul className="fr-panel__time">
          <li><span>Oct 20</span>VB-2041 · $4,800.00</li>
          <li><span>Sep 18</span>VB-1987 · $4,200.00</li>
          <li><span>Aug 19</span>VB-1932 · $3,900.00</li>
        </ul>
        <div className="fr-panel__row">Notes<i>›</i></div>
        <div className="fr-panel__row is-open">Recent approvals<i>⌄</i></div>
        <div className="fr-panel__card">
          <span className="fr-panel__ava" dangerouslySetInnerHTML={{ __html: MAYA }} />
          <div><b>Pay VB-2041</b><small>Approved by Zeradam · 9:44 AM</small></div>
          <em>Paid</em>
        </div>
        <div className="fr-panel__row">Tags<i>›</i></div>
      </div>
    </div>
  );
}
