"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { mono } from "./monoFont";
import { WHEREVER_HTML } from "./wherever-you-work.html";
import { NOTE_HTML } from "./hero-tabs.html";
import "./FinanceReach.css";

/**
 * The finance teams page's last section, on Intercom's "integrates with
 * your entire tech stack" anatomy: the headline and two paragraphs on the
 * left, a square panel on a grey grain ground on the right.
 *
 * The panel is a 15 second loop of five 3 second steps, one for each way
 * to reach your Loats: email, text, the Workloat app on your computer,
 * the app on your phone, and every Loat from anywhere. In each step the
 * pointer moves to that option in the menu, the field above types it,
 * and a card fades in showing that channel at work, in the site's paper
 * card (the ledger's #fbfaf6, a hairline, 6px corners). It starts when
 * the panel scrolls into view and holds while it is off screen; with
 * reduced motion it rests on the first step.
 *
 * Everything shown is something Workloat does today. The vendor and the
 * figures are examples.
 */

const MAYA = WHEREVER_HTML.match(/<svg(?:(?!<\/svg>)[\s\S])*#f28c28[\s\S]*?<\/svg>/)?.[0] ?? "";
const ALFRED = NOTE_HTML.match(/<svg[\s\S]*?<\/svg>/)?.[0] ?? "";
const STEP_MS = 3000; // five steps, 15 seconds a loop
const CANVAS = 880;

type Opt = { key: string; label: string; field: string; icon: React.ReactNode };

const W_PATH = "M249 348H409V684H543V530H712V684H846V348H1006V517H939V800H873V901H699V708H556V901H382V800H316V517H249Z";

const OPTS: Opt[] = [
  {
    key: "email",
    label: "Approve a payment by email",
    field: "Email",
    // eslint-disable-next-line @next/next/no-img-element
    icon: <img src="/logos/tools/gmail.png" alt="" />,
  },
  {
    key: "text",
    label: "Ask for a budget by text",
    field: "Text",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden><rect width="24" height="24" rx="6" fill="#34C759" /><path d="M12 6.2c3.7 0 6.6 2.4 6.6 5.4s-2.9 5.4-6.6 5.4c-.7 0-1.4-.1-2-.3l-2.9 1.3.8-2.4C6.6 14.6 5.4 13.2 5.4 11.6 5.4 8.6 8.3 6.2 12 6.2Z" fill="#fff" /></svg>
    ),
  },
  {
    key: "desk",
    label: "Chat in the app on your computer",
    field: "Workloat app",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden><rect width="24" height="24" rx="6" fill="#1a1a1a" /><svg x="4.5" y="6.5" width="15" height="11" viewBox="249 348 757 553"><path fill="#fff" d={W_PATH} /></svg></svg>
    ),
  },
  {
    key: "phone",
    label: "Get approvals on your phone",
    field: "Phone",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden><rect x="6.5" y="2.5" width="11" height="19" rx="2.6" /><path d="M10.5 18.5h3" /></svg>
    ),
  },
  {
    key: "all",
    label: "Manage every Loat from anywhere",
    field: "Anywhere",
    icon: (
      <svg viewBox="28 28 344 344" fill="currentColor" aria-hidden><path d="M145 78H255V180H362V322H247V195H153V322H38V180H145Z" /></svg>
    ),
  },
];

export default function FinanceReach() {
  return (
    <section className="frc" style={{ "--frc-mono": mono.style.fontFamily } as React.CSSProperties}>
      <div className="frc-wrap">
        <div className="frc-copy">
          <h2 className="frc-title">Reach your Loats from everywhere you work</h2>
          <p className="frc-body">
            Sona and every Loat answer <u>by email, by text and in Slack</u>, and in the Workloat app on your computer and your phone, so every feature is one message away, wherever you are.
          </p>
          <p className="frc-body">
            Approve a payment from your inbox, ask for a budget by text, or check on every Loat from your phone. Your team manages its Loats from one place, through the{" "}
            <Link href="/signup">Workloat app</Link>.
          </p>
        </div>
        <Stage />
      </div>
    </section>
  );
}

/* the square panel: its canvas scaled to the column, the loop running
   only while it is on screen */
function Stage() {
  const box = useRef<HTMLDivElement>(null);
  const [z, setZ] = useState(1);
  const [step, setStep] = useState(0);
  const [typed, setTyped] = useState(OPTS[0].field);

  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    const fit = () => setZ(el.clientWidth / CANVAS);
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const el = box.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let alive = true, visible = false, running = false;
    const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
    const play = async () => {
      if (running) return;
      running = true;
      let i = 0;
      while (alive && visible) {
        setStep(i);
        const word = OPTS[i].field;
        setTyped("");
        await wait(380); // the pointer reaches the option, then the field fills
        for (let k = 1; k <= word.length && alive; k++) { setTyped(word.slice(0, k)); await wait(45); }
        await wait(STEP_MS - 380 - word.length * 45);
        i = (i + 1) % OPTS.length;
      }
      running = false;
    };
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) play(); }, { threshold: 0.35 });
    io.observe(el);
    return () => { alive = false; io.disconnect(); };
  }, []);

  return (
    <div ref={box} className="frc-stage" style={{ height: CANVAS * z }} role="img" aria-label="Five ways to reach your Loats, shown one after another: approve a payment by email, ask for a budget by text, chat in the Workloat app on your computer, get approvals on your phone, and manage every Loat from anywhere.">
      <span className="frc-sq frc-sq--tl" aria-hidden /><span className="frc-sq frc-sq--tr" aria-hidden />
      <span className="frc-sq frc-sq--bl" aria-hidden /><span className="frc-sq frc-sq--br" aria-hidden />
      <div className="frc-canvas" style={{ transform: `scale(${z})` }} aria-hidden>
        {/* the task card, with its numbered steps */}
        <div className="frc-task">
          <div className="frc-line">
            <span className="frc-n">1.</span>
            <b>Ask Sona</b>
            <span className="frc-from">From</span>
            <span className="frc-field">
              <i className="frc-caret" />
              {typed ? <span className="frc-typed">{typed}</span> : <span className="frc-ph">Select where you are…</span>}
            </span>
          </div>
          <div className="frc-line frc-line--dim"><span className="frc-n">2.</span></div>
          <div className="frc-line frc-line--dim frc-line--3"><span className="frc-n">3.</span></div>
        </div>

        {/* the menu of places to reach her */}
        <div className="frc-menu">
          {OPTS.map((o, i) => (
            <div key={o.key} className={`frc-opt${i === step ? " is-on" : ""}`}>
              <span className="frc-opt__ic">{o.icon}</span>
              {o.label}
            </div>
          ))}
          <div className="frc-menu__foot"><span className="frc-opt__ic">+</span>Connect another channel</div>
          <svg className="frc-hand" viewBox="0 0 24 24" style={{ transform: `translate(0, ${step * 72}px)` }}>
            <path d="M9 11.5V4.8a1.6 1.6 0 0 1 3.2 0v5.4m0-1.4a1.6 1.6 0 0 1 3.2 0v1.6m0-.6a1.6 1.6 0 0 1 3.2 0v1.4m0 0a1.6 1.6 0 0 1 3.2 0v3.6c0 3.8-2.6 6.6-6.4 6.6h-1.6c-2.2 0-3.6-1-4.8-2.6L5 15.2a1.7 1.7 0 0 1 2.6-2.1L9 14.6" fill="#fff" stroke="#111" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        {/* the channel at work, one card per step, fading in */}
        <div className="frc-cards">
          <Card on={step === 0}><EmailCard /></Card>
          <Card on={step === 1}><TextCard /></Card>
          <Card on={step === 2}><DeskCard /></Card>
          <Card on={step === 3}><PhoneCard /></Card>
          <Card on={step === 4}><AllCard /></Card>
        </div>
      </div>
    </div>
  );
}

function Card({ on, children }: { on: boolean; children: React.ReactNode }) {
  return <div className={`frc-card${on ? " is-on" : ""}`}>{children}</div>;
}

const Px = ({ svg }: { svg: string }) => <span className="frc-px" dangerouslySetInnerHTML={{ __html: svg }} />;

/* 1. email: Sona's message in your inbox, answered with YES */
function EmailCard() {
  return (
    <div className="frc-mail">
      <div className="frc-mail__top">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logos/tools/gmail.png" alt="" />
        <b>Inbox</b>
        <span>9:43 AM</span>
      </div>
      <div className="frc-mail__row">
        <Px svg={MAYA} />
        <div>
          <b>Sona · Re: Invoice VB-2041</b>
          <p>Vibe.co&apos;s invoice is $4,800 and fits the marketing budget. Reply YES and I&apos;ll pay it today.</p>
        </div>
      </div>
      <div className="frc-mail__reply"><span>YES</span><em>Sent · Paid at 9:44 AM</em></div>
    </div>
  );
}

/* 2. text: a quick question by SMS */
function TextCard() {
  return (
    <div className="frc-sms">
      <div className="frc-sms__who"><Px svg={MAYA} />Sona · Workloat</div>
      <div className="frc-bub frc-bub--me">How much is left in marketing this month?</div>
      <div className="frc-bub">$6,200 of $30,000. Two invoices land Friday for $1,850.</div>
    </div>
  );
}

/* 3. the app on your computer: the composer, mid request */
function DeskCard() {
  return (
    <div className="frc-desk">
      <div className="frc-desk__bar"><i /><i /><i /><span>Workloat</span></div>
      <div className="frc-desk__body">
        <div className="frc-desk__rail">
          <svg viewBox="249 348 757 553" aria-hidden><path fill="#1a1a1a" d={W_PATH} /></svg>
          <i className="is-on" /><i /><i />
        </div>
        <div className="frc-desk__main">
          <div className="frc-pill">Summarize this week&apos;s spend by team and send it to Finance<span className="frc-pill__send">↑</span></div>
        </div>
      </div>
    </div>
  );
}

/* 4. your phone: an approval on the lock screen */
function PhoneCard() {
  return (
    <div className="frc-phone">
      <div className="frc-phone__time">9:41</div>
      <div className="frc-note">
        <div className="frc-note__head"><Px svg={MAYA} /><b>Sona</b><span>now</span></div>
        <p><b>Approval needed</b><br />Pay Vibe.co $4,800 for the October campaign?</p>
        <div className="frc-note__btns"><span className="is-go">Approve</span><span>Hold</span></div>
      </div>
    </div>
  );
}

/* 5. every Loat, from anywhere */
function AllCard() {
  return (
    <div className="frc-all">
      <div className="frc-all__head"><b>Your Loats</b><span>3 working</span></div>
      <div className="frc-loat"><Px svg={MAYA} /><div><b>Sona</b><small>Finance · paid Vibe.co</small></div><em className="is-done">Done</em></div>
      <div className="frc-loat"><Px svg={ALFRED} /><div><b>Alfred</b><small>Recruiting · booking a screen</small></div><em className="is-wait">Waiting for you</em></div>
      <div className="frc-loat"><span className="frc-ini">S</span><div><b>Scout</b><small>Sourcing · 12 candidates found</small></div><em>Working</em></div>
    </div>
  );
}
