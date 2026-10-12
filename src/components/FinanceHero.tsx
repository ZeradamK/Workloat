"use client";

import { useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { roboto } from "./monoFont";
import { WHEREVER_HTML } from "./wherever-you-work.html";
import "./HeroStory.css";
import "./FinanceHero.css";

/**
 * The finance teams page's hero, on Intercom's omnichannel hero anatomy:
 * a two-line headline set large and tight, the home hero's paragraph, a
 * black button and an outlined one, then a wide panel on a painted sky
 * with the product laid over it.
 *
 * In the panel, two windows overlap the way Intercom's do: Sona's mailbox
 * in a Gmail-style window, an invoice from a vendor and her reply, and on
 * its right edge your phone, the home hero's iMessage screen (HeroStory's
 * design) in the meeting card's frosted frame, where Sona checks with you
 * before she pays it. The vendor is shown as an example.
 *
 * The panel is drawn on a fixed 1560 x 1000 canvas and scaled to its
 * width. Under 800px the mailbox is left out and the phone stands alone.
 */

const EASE = [0.25, 0.6, 0.2, 1] as const;

const PX = {
  Sona: WHEREVER_HTML.match(/<svg(?:(?!<\/svg>)[\s\S])*#f28c28[\s\S]*?<\/svg>/)?.[0] ?? "",
};
function Px({ who }: { who: keyof typeof PX }) {
  return <span className="fh-px" dangerouslySetInnerHTML={{ __html: PX[who] }} />;
}

/* the canvas the panel's contents are drawn on */
const CANVAS = { desktop: { w: 1560, h: 1000 }, mobile: { w: 470, h: 930 } };

export default function FinanceHero() {
  return (
    <section className="fh bg-[#eeeeee]" style={{ "--fh-roboto": roboto.style.fontFamily } as React.CSSProperties}>
      <div className="fh-copy">
        <motion.h1 className="fh-title" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, ease: EASE, delay: 0.05 }}>
          Meet your finance Loat
          <br />
          wherever you work
        </motion.h1>
        <motion.p className="fh-lede" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, ease: EASE, delay: 0.12 }}>
          Sona keeps every budget, pays invoices inside them, and checks with you before any money moves. Ask her by email, in Slack, or by text, and the answer comes back in the same place.
        </motion.p>
        <motion.div className="fh-actions" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, ease: EASE, delay: 0.18 }}>
          <Link href="/signup" className="fh-btn fh-btn--go">Get started</Link>
          <Link href="/contact" className="fh-btn">Book a demo</Link>
        </motion.div>
      </div>

      <motion.div className="fh-stage-wrap" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: EASE, delay: 0.25 }}>
        <span className="fh-tick fh-tick--tl" aria-hidden />
        <span className="fh-tick fh-tick--tr" aria-hidden />
        <span className="fh-tick fh-tick--bl" aria-hidden />
        <span className="fh-tick fh-tick--br" aria-hidden />
        <div className="fh-stage hidden min-[800px]:block" role="img" aria-label="Sona's mailbox, with an invoice from Vibe.co and her reply, and your phone where Sona texts you before she pays it">
          <Canvas layout="desktop" />
        </div>
        <div className="fh-stage fh-stage--phone min-[800px]:hidden" role="img" aria-label="Your phone, where Sona texts you before she pays an invoice">
          <Canvas layout="mobile" />
        </div>
      </motion.div>
    </section>
  );
}

/* the panel's contents on their fixed canvas, scaled to the stage */
function Canvas({ layout }: { layout: "desktop" | "mobile" }) {
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
    <div ref={box} className="relative w-full" style={{ height: c.h * z }}>
      <div className="fh-canvas" style={{ width: c.w, height: c.h, transform: `scale(${z})` }}>
        {layout === "desktop" && <Mailbox />}
        <Phone layout={layout} />
      </div>
    </div>
  );
}

/* ---------- Sona's mailbox, in a Gmail-style window ---------- */
function Mailbox() {
  return (
    <div className="fh-mail">
      <div className="fh-mail__top">
        <span className="fh-mail__menu" aria-hidden><i /><i /><i /></span>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logos/tools/gmail.png" alt="" className="fh-mail__logo" />
        <b className="fh-mail__brand">Mail</b>
        <span className="fh-mail__search">
          <svg viewBox="0 0 20 20" aria-hidden><circle cx="8.5" cy="8.5" r="5.5" fill="none" stroke="currentColor" strokeWidth="1.7" /><path d="m13 13 4 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>
          Search mail
        </span>
        <span className="fh-mail__icons" aria-hidden>
          <svg viewBox="0 0 20 20"><circle cx="10" cy="10" r="7.5" fill="none" stroke="currentColor" strokeWidth="1.5" /><path d="M8 8a2 2 0 1 1 2.6 1.9c-.4.2-.6.5-.6.9v.7M10 13.6v.1" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
          <svg viewBox="0 0 20 20"><circle cx="10" cy="10" r="2.6" fill="none" stroke="currentColor" strokeWidth="1.5" /><path d="M10 2.5v2M10 15.5v2M2.5 10h2M15.5 10h2M4.7 4.7l1.4 1.4M13.9 13.9l1.4 1.4M4.7 15.3l1.4-1.4M13.9 6.1l1.4-1.4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
          <span className="fh-mail__ava"><Px who="Sona" /></span>
        </span>
      </div>
      <div className="fh-mail__body">
        <aside className="fh-mail__side">
          <span className="fh-mail__compose">
            <svg viewBox="0 0 20 20" aria-hidden><path d="M10 3.5v13M3.5 10h13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
            Compose
          </span>
          <span className="fh-mail__nav is-on">Inbox<b>1</b></span>
          <span className="fh-mail__nav">Starred</span>
          <span className="fh-mail__nav">Invoices</span>
          <span className="fh-mail__nav">Sent</span>
        </aside>
        <div className="fh-mail__read">
          <div className="fh-mail__tools" aria-hidden>
            <span>←</span><span className="fh-mail__count">1 to 50 of 1,204</span>
          </div>
          <h3 className="fh-mail__subject">Invoice VB-2041 for October <span>Inbox</span></h3>

          <div className="fh-msg">
            <span className="fh-msg__ava fh-msg__ava--ini">V</span>
            <div>
              <div className="fh-msg__head"><b>Vibe.co</b><small>&lt;billing@vibe.co&gt;</small><time>8:55 AM</time></div>
              <div className="fh-msg__to">to Sona</div>
              <p>Hi, please find attached invoice VB-2041 for your October CTV campaign, $4,800.00, due October 20.</p>
              <div className="fh-attach"><span>PDF</span>VB-2041.pdf</div>
            </div>
          </div>

          <div className="fh-msg">
            <span className="fh-msg__ava"><Px who="Sona" /></span>
            <div>
              <div className="fh-msg__head"><b>Sona from Workloat</b><small>&lt;sona_workloat@workloat.com&gt;</small><time>9:03 AM</time></div>
              <div className="fh-msg__to">to Vibe.co</div>
              <p>Hi Vibe team,</p>
              <p>Thanks for sending invoice VB-2041. It matches the October order, and it fits the marketing budget for this month.</p>
              <p>Payment is queued for approval today, well before October 20. I&apos;ll send the remittance as soon as it goes out.</p>
              <p className="fh-msg__sig">Sona<br />Financial manager Loat · Workloat</p>
            </div>
          </div>

          <div className="fh-help">
            <b>Waiting for your approval</b>
            <p>Reply YES to Sona&apos;s text, or approve it in <u>Workloat</u>.</p>
          </div>
          <p className="fh-powered">Powered by <b>Workloat</b></p>
          <div className="fh-mail__reply" aria-hidden>
            <span>↩ Reply</span><span>↪ Forward</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- your phone: the home hero's iMessage screen ---------- */
const STATUS = (
  <div className="status"><span>9:43</span><span className="ic">
    <svg width="19" height="12" viewBox="0 0 19 12"><rect x="0" y="8" width="3" height="4" rx="1" fill="#000" /><rect x="5" y="5.5" width="3" height="6.5" rx="1" fill="#000" /><rect x="10" y="3" width="3" height="9" rx="1" fill="#000" /><rect x="15" y="0" width="3" height="12" rx="1" fill="#000" /></svg>
    <svg width="27" height="13" viewBox="0 0 27 13"><rect x=".5" y=".5" width="23" height="12" rx="3.8" fill="none" stroke="#000" opacity=".4" /><rect x="2" y="2" width="20" height="9" rx="2.5" fill="#000" /><path d="M25 4.5v4c.8-.3 1.3-1.1 1.3-2s-.5-1.7-1.3-2Z" fill="#000" opacity=".45" /></svg>
  </span></div>
);

export function Phone({ layout }: { layout: "desktop" | "mobile" }) {
  return (
    <div className={`hs fh-phone fh-phone--${layout}`}>
      <div className="fh-phone__fit">
        <div className="screen">
          {STATUS}
          <header className="im-head">
            <span className="im-back"><svg viewBox="0 0 12 20"><path d="M10 2 2 10l8 8" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" /></svg><span>2</span></span>
            <span className="im-who">
              <span className="im-ava"><Px who="Sona" /></span>
              <span className="im-name">Sona · Workloat<svg viewBox="0 0 6 10"><path d="m1 1 4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg></span>
            </span>
            <span className="im-cam"><svg viewBox="0 0 26 18"><rect x="1" y="2" width="16" height="14" rx="4" fill="none" stroke="currentColor" strokeWidth="1.8" /><path d="m18 7 6-3.5v11L18 11" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /></svg></span>
          </header>
          <div className="im-thread">
            <div className="im-day"><b>Today</b> 9:43 AM</div>
            <div className="row them first"><div className="bubble">Vibe&apos;s October invoice came in at $4,800. Marketing has $6,200 left this month, so it fits.</div></div>
            <div className="row them"><div className="bubble tail">Want me to pay it today?</div></div>
            <div className="row them">
              <div className="card">
                <div className="card__top"><span className="card__cal"><b>OCT</b><span>20</span></span><div><strong>Vibe.co · $4,800.00</strong><small>Invoice VB-2041 · Marketing</small></div></div>
                <div className="card__bottom">Payment queued · waiting for you</div>
              </div>
            </div>
            <div className="row me first"><div className="bubble tail">Yes, please pay it. Thanks Sona.</div><div className="receipt"><b>Read</b> 9:44 AM</div></div>
            <div className="row them first"><div className="bubble tail">Paid and matched to the invoice. Marketing has $1,400 left for October.</div></div>
          </div>
          <div className="im-input">
            <span className="im-plus"><svg viewBox="0 0 14 14"><path d="M7 1.5v11M1.5 7h11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg></span>
            <span className="im-field">
              <span className="im-text ph">iMessage</span>
              <span className="im-mic"><svg viewBox="0 0 16 16"><rect x="5.5" y="1.5" width="5" height="8.5" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1.5" /><path d="M3 7.5a5 5 0 0 0 10 0M8 12.5v2.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg></span>
            </span>
            <span className="home-ind" />
          </div>
        </div>
      </div>
    </div>
  );
}
