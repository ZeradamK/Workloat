"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { geist, mono, roboto } from "./monoFont";
import { INBOX_HTML, NOTE_HTML, RECORD_HTML } from "./hero-tabs.html";
import HowLoatsWork from "./HowLoatsWork";
import "./hero-tabs.generated.css";
import "./HeroTabs.css";

/**
 * The product tour from the "Workloat · Hero tabs" design: four tabs over
 * one stage, each a view of Workloat on its own backdrop. The tabs
 * advance every 8 seconds with a progress line, pause while the pointer
 * is on the stage, and switch on click or with the arrow keys.
 *
 * Tab 1 is the Workloat web app's home, rebuilt from the app's own code
 * (Rail, chat sidebar, wordmark, pill input) in its light theme, with a
 * typewriter cycling requests through the input. Tabs 2 to 4 (Inbox,
 * Approvals, Record) keep the design's own styles. At 500 and under,
 * tabs 1 and 2 swap the scaled desktop views for phone layouts drawn at
 * true size (AppPhone, InboxPhone). Every view is a picture: aria-hidden
 * and not interactive.
 */

const DWELL = 8000;

const TABS = [
  { id: "chat", label: "Chat with your Loats", w: 1194, h: 754 },
  { id: "inbox", label: "Every Loat has an inbox", w: 1040, h: 600 },
  { id: "review", label: "Your Loats keep you in the loop", w: 1300, h: 860 },
  { id: "record", label: "A record of every action", w: 900, h: 410 },
] as const;

const PLACEHOLDER = "Ask Alfred to schedule, follow up, or find out";
const LINES = [
  "Schedule a technical screen with Priya next week and send me the invite to approve.",
  "Summarize this contract and flag anything that renews automatically.",
  "Email every candidate who hasn't replied in three days.",
];

/* the web app's icons (frame.tsx Icon, 1.6 stroke on a 24 grid) */
function Ico({ name, size }: { name: "chat" | "approvals" | "bot" | "people" | "connections" | "dashboard" | "new" | "search" | "panel" | "filter"; size: number }) {
  const p = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
  switch (name) {
    case "chat": return <svg {...p}><path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v8a2.5 2.5 0 0 1-2.5 2.5H9l-4 3v-3.2A2.5 2.5 0 0 1 4 14.5Z" /></svg>;
    case "approvals": return <svg {...p}><path d="M9 12.5 11 14.5 15.5 10" /><rect x="3.5" y="3.5" width="17" height="17" rx="3.5" /></svg>;
    case "bot": return <svg width={size} height={size} viewBox="28 28 344 344" fill="currentColor" aria-hidden><path d="M145 78H255V180H362V322H247V195H153V322H38V180H145Z" /></svg>;
    case "people": return <svg {...p}><circle cx="9" cy="8" r="3.2" /><path d="M3.5 19.5c.9-3 3-4.6 5.5-4.6s4.6 1.6 5.5 4.6" /><path d="M16 5.2a3.2 3.2 0 0 1 0 5.9M17.5 14.9c1.6.6 2.6 2.2 3 4.6" /></svg>;
    case "connections": return <svg {...p}><path d="M10.5 13.5a4 4 0 0 0 6 .4l2.3-2.3a4 4 0 1 0-5.7-5.7l-1.2 1.2" /><path d="M13.5 10.5a4 4 0 0 0-6-.4l-2.3 2.3a4 4 0 1 0 5.7 5.7l1.2-1.2" /></svg>;
    case "dashboard": return <svg width={size} height={size} viewBox="-48 -48 608 608" fill="currentColor" aria-hidden><circle cx="113" cy="113" r="113" /><circle cx="399" cy="113" r="113" /><circle cx="113" cy="399" r="113" /><circle cx="399" cy="399" r="113" /></svg>;
    case "new": return <svg width={size} height={size} viewBox="-0.5 -0.5 24 24" fill="currentColor" aria-hidden><path d="M21.289.98l.59.59c.813.814.69 2.257-.277 3.223L9.435 16.96l-3.942 1.442c-.495.182-.977-.054-1.075-.525a.928.928 0 0 1 .045-.51l1.47-3.976L18.066 1.257c.967-.966 2.41-1.09 3.223-.276zM8.904 2.19a1 1 0 1 1 0 2h-4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4a1 1 0 0 1 2 0v4a4 4 0 0 1-4 4h-12a4 4 0 0 1-4-4v-12a4 4 0 0 1 4-4h4z" /></svg>;
    case "search": return <svg {...p} strokeWidth={2}><path d="M16.6725 16.6412L21 21M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z" /></svg>;
    case "panel": return <svg {...p}><rect x="3.5" y="4.5" width="17" height="15" rx="2.5" /><path d="M9.5 4.5v15" /></svg>;
    case "filter": return <svg {...p}><path d="M4 7h16M7 12h10M10 17h4" /></svg>;
  }
}

/** Tab 1: the web app's home, as the app draws it (light theme). */
function AppHome({ typed }: { typed: string | null }) {
  return (
    <div className="wa">
      <nav className="wa-rail">
        <span className="wa-logo">
          <svg width="24" height="18" viewBox="248 348 757 553" fill="currentColor" aria-hidden><path d="M248 348H408V684H543V529H711V684H846V348H1005V517H937V800H873V901H698V708H556V901H381V800H316V517H248Z" /></svg>
        </span>
        <span className="wa-tile on"><Ico name="chat" size={20} /></span>
        <span className="wa-tile"><Ico name="approvals" size={20} /><i className="wa-badge" /></span>
        <span className="wa-tile"><Ico name="bot" size={20} /></span>
        <span className="wa-tile"><Ico name="people" size={20} /></span>
        <span className="wa-tile"><Ico name="connections" size={20} /></span>
        <span className="wa-sep" />
        <span className="wa-tile"><Ico name="dashboard" size={19} /></span>
        <span className="wa-avatar">Z</span>
      </nav>

      <aside className="wa-side">
        <div className="wa-side__top">
          <b>Workloat</b>
          <span className="wa-btn"><Ico name="search" size={18} /></span>
          <span className="wa-btn"><Ico name="panel" size={18} /></span>
        </div>
        <div className="wa-nav">
          <div className="wa-row on"><span className="wa-row__icon"><Ico name="new" size={17} /></span>New chat</div>
          <div className="wa-row"><span className="wa-you"><Ico name="bot" size={14} /></span>Your Loat</div>
        </div>
        <div className="wa-recents">
          <p>Recents</p>
          <span className="wa-filter"><Ico name="filter" size={15} /></span>
        </div>
        <div className="wa-list">
          <div className="wa-chat"><span>Technical screen next week</span><i /></div>
          <div className="wa-chat"><span>Vendor contract renewals</span></div>
        </div>
      </aside>

      <main className="wa-main">
        <div className="wa-home">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="wa-wordmark" src="/landing/tabs/app-wordmark-dark.png" alt="" width={186} height={30} />
          <div className="wa-pill">
            <span className="wa-clip">
              <svg width="25" height="25" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M4.666,19.63a6.765,6.765,0,0,1-.148-9.713l6.8-6.8a4.845,4.845,0,1,1,6.852,6.851l-6.8,6.8a2.992,2.992,0,0,1-4.132,0,2.927,2.927,0,0,1,0-4.133L12.673,7.2a1,1,0,0,1,1.414,1.414L8.65,14.049a.925.925,0,0,0,0,1.3.945.945,0,0,0,1.3,0l6.8-6.8a2.845,2.845,0,0,0-4.023-4.023l-6.8,6.8a4.766,4.766,0,0,0,.1,6.843,4.93,4.93,0,0,0,6.807-.273l7.984-7.984a1,1,0,1,1,1.414,1.414l-7.984,7.984A7.122,7.122,0,0,1,9.223,21.4,6.607,6.607,0,0,1,4.666,19.63Z" /></svg>
            </span>
            <span className={`wa-text ${typed !== null ? "typed" : ""}`}>
              {typed !== null ? <>{typed}<span className="wa-caret" /></> : PLACEHOLDER}
            </span>
            <span className="wa-right">
              <span className="wa-loat">Alfred<svg width="11" height="11" viewBox="0 0 16 16" fill="none" aria-hidden><path d="m4 6 4 4 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg></span>
              <span className="wa-voice">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  {[[3, 6], [7, 12], [11, 18], [15, 12], [19, 6]].map(([x, h]) => <rect key={x} x={x} y={12 - h / 2} width="2" height={h} rx="1" />)}
                </svg>
              </span>
              <span className={`wa-send ${typed ? "ready" : ""}`}>
                <svg width="22" height="22" viewBox="0 0 16 16" fill="none" aria-hidden><path d="M8 13V3M4 7l4-4 4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </span>
            </span>
          </div>
          <div className="wa-hint" />
        </div>
      </main>
    </div>
  );
}

const ALFRED = NOTE_HTML.match(/<svg[\s\S]*?<\/svg>/)?.[0] ?? "";
const Px = ({ className }: { className: string }) => <span className={className} dangerouslySetInnerHTML={{ __html: ALFRED }} />;

/** Tab 1 on a phone (500 and under): the same home laid out for an
 *  iPhone, at true size. The menu, the open Loat and a new chat on top,
 *  Alfred's note as a banner, the wordmark, and the composer held to the
 *  bottom with the request wrapping over its lines and the buttons below. */
function AppPhone({ typed }: { typed: string | null }) {
  return (
    <div className="wph">
      <div className="wph-bar">
        <span className="wph-btn">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden><path d="M4 8.5h16M4 15.5h10" /></svg>
        </span>
        <b className="wph-title">Alfred<svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden><path d="m4 6 4 4 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg></b>
        <span className="wph-btn"><Ico name="new" size={19} /></span>
      </div>
      <div className="wph-body">
        <div className="wph-note">
          <div className="wph-note__head"><Px className="wph-px" /><b>Alfred</b><span>by email · now</span></div>
          <p>Priya confirmed Tuesday at 2 PM. I sent the invite with a Meet link and added her CV to your notes.</p>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="wph-wordmark" src="/landing/tabs/app-wordmark-dark.png" alt="" width={150} height={24} />
      </div>
      <div className="wph-pill">
        <span className={`wph-text ${typed !== null ? "typed" : ""}`}>
          {typed !== null ? <>{typed}<span className="wa-caret" /></> : "Ask Alfred anything"}
        </span>
        <div className="wph-row">
          <span className="wph-clip">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden><path d="M12 5v14M5 12h14" /></svg>
          </span>
          <span className="wph-voice">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              {[[3, 6], [7, 12], [11, 18], [15, 12], [19, 6]].map(([x, h]) => <rect key={x} x={x} y={12 - h / 2} width="2" height={h} rx="1" />)}
            </svg>
          </span>
          <span className={`wph-send ${typed ? "ready" : ""}`}>
            <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden><path d="M8 13V3M4 7l4-4 4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </span>
        </div>
      </div>
    </div>
  );
}

/** Tab 2 on a phone: Alfred's inbox opened on the thread, as a mail app
 *  shows it on an iPhone, on the ledger's paper. */
function InboxPhone() {
  return (
    <div className="wph wph--mail">
      <div className="wph-bar">
        <span className="wph-back">
          <svg width="12" height="20" viewBox="0 0 12 20" fill="none" aria-hidden><path d="M10 2 2 10l8 8" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          Inbox
        </span>
        <span className="wph-box"><Px className="wph-px wph-px--round" /><span><b>Alfred</b><small>alfred_workloat@workloat.com</small></span></span>
      </div>
      <div className="wph-mail">
        <h4>Re: Technical screen next week</h4>
        <div className="wph-msg">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/landing/anywhere/ddd827596c.jpg" alt="" />
          <div>
            <div className="wph-who"><b>Zeradam</b><span>9:02 AM</span></div>
            <div className="wph-to">to Alfred</div>
            <p>Alfred, can you set up a technical screen with Priya next week? Send me the invite to approve before it goes out.</p>
          </div>
        </div>
        <div className="wph-msg">
          <Px className="wph-px wph-px--round wph-px--40" />
          <div>
            <div className="wph-who"><b>Alfred</b><span>9:41 AM</span></div>
            <div className="wph-to">to Zeradam, Priya</div>
            <p>Priya picked Tuesday at 2 PM, and it works for your calendar too. I&apos;ve added a Google Meet link.</p>
            <div className="wph-invite">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/landing/anywhere/b232e3d48a.png" alt="" />
              <div><b>Technical screen with Priya</b><span>Tue, Oct 13 · 2:00 to 2:45 PM</span></div>
            </div>
          </div>
        </div>
      </div>
      <div className="wph-reply">Reply to Alfred</div>
    </div>
  );
}

export default function HeroTabs() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  /* bumped when the pointer leaves the stage: the line and the timer start over, as the design's show(current) */
  const [cycle, setCycle] = useState(0);
  const [zoom, setZoom] = useState<number[]>(() => TABS.map(() => 1));
  const [box, setBox] = useState({ W: 0, H: 0, narrow: false });
  const [typed, setTyped] = useState<string | null>(null);
  const [reduced, setReduced] = useState(false);
  const stage = useRef<HTMLDivElement>(null);
  const section = useRef<HTMLElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => { setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches); }, []);

  /* scale each view to the stage (the design's fitApps) */
  useLayoutEffect(() => {
    const el = stage.current;
    if (!el) return;
    const fit = () => {
      const W = el.clientWidth, H = el.clientHeight;
      setZoom(TABS.map((t) => Math.min(1, (W * 0.84) / t.w, (H * 0.82) / t.h)));
      setBox({ W, H, narrow: window.matchMedia("(max-width: 760px)").matches });
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  /* advance every DWELL unless paused, hidden or reduced motion */
  useEffect(() => {
    if (reduced || paused) return;
    const id = window.setTimeout(() => setCurrent((c) => (c + 1) % TABS.length), DWELL);
    return () => window.clearTimeout(id);
  }, [current, paused, reduced, cycle]);
  useEffect(() => {
    const onVis = () => setPaused(document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  /* the typewriter in tab 1's input, only while the section is on screen */
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let alive = true, visible = false, running = false;
    const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
    const play = async () => {
      if (running) return;
      running = true;
      await wait(900);
      for (let li = 0; alive && visible; li = (li + 1) % LINES.length) {
        const text = LINES[li];
        for (let k = 0; k <= text.length && alive; k++) { setTyped(text.slice(0, k)); await wait(32 + Math.random() * 30); }
        await wait(1800);
        for (let k = text.length; k >= 0 && alive; k -= 4) { setTyped(text.slice(0, k)); await wait(10); }
        setTyped(null);
        await wait(900);
      }
      running = false;
    };
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) play(); }, { threshold: 0.1 });
    if (section.current) io.observe(section.current);
    return () => { alive = false; io.disconnect(); };
  }, []);

  /* where the tabs are a slider (760 and under), bring the open one into
     view, sideways only, so the page itself never jumps */
  useEffect(() => {
    const tab = tabRefs.current[current];
    const bar = tab?.parentElement;
    if (!tab || !bar || bar.scrollWidth <= bar.clientWidth) return;
    const left = bar.scrollLeft + tab.getBoundingClientRect().left - bar.getBoundingClientRect().left;
    bar.scrollTo({ left, behavior: reduced ? "auto" : "smooth" });
  }, [current, reduced]);

  const go = (i: number, focus = false) => {
    setCurrent(i);
    setCycle((c) => c + 1); // a click restarts the line and the timer, even on the open tab
    if (focus) tabRefs.current[i]?.focus();
  };

  const fitStyle = (i: number) => ({ zoom: zoom[i], position: "relative" as const });
  /* tab 3 fills the stage edge to edge: scaled so its content fits the
     height (or the width, on a narrow stage), then sized to the stage's
     own box so the panel meets every edge with no backdrop showing. At
     760 and under the cards stack at full size and the stage scrolls them. */
  const fill = (() => {
    if (box.narrow) return { position: "absolute" as const, inset: 0, overflowY: "auto" as const, pointerEvents: "auto" as const };
    const t = TABS[2];
    const z = box.W && box.H ? Math.min(1, box.H / t.h, box.W / t.w) : 1;
    return { zoom: z, position: "relative" as const, width: box.W ? box.W / z : undefined, height: box.H ? box.H / z : undefined };
  })();

  return (
    <div
      className="wht"
      style={{ "--wht-geist": geist.style.fontFamily, "--wht-mono": mono.style.fontFamily, "--wht-roboto": roboto.style.fontFamily, "--dwell": `${DWELL}ms` } as React.CSSProperties}
    >
      <section ref={section} id="how-loats-work" className="hero-tabs" aria-label="Workloat product tour">
        <div className="frame">
          <div className={`tabs ${paused ? "is-paused" : ""}`} role="tablist" aria-label="Product views">
            {TABS.map((t, i) => (
              <button
                key={t.id}
                ref={(el) => { tabRefs.current[i] = el; }}
                type="button"
                className="tab"
                role="tab"
                id={`tab-${t.id}`}
                aria-controls={`panel-${t.id}`}
                aria-selected={current === i}
                tabIndex={current === i ? 0 : -1}
                onClick={() => go(i)}
                onKeyDown={(e) => {
                  if (e.key === "ArrowRight") { e.preventDefault(); go((i + 1) % TABS.length, true); }
                  if (e.key === "ArrowLeft") { e.preventDefault(); go((i + TABS.length - 1) % TABS.length, true); }
                }}
              >
                {/* keyed on the active tab, so the progress line restarts each time it turns */}
                {!reduced && <span className="tab__bar" key={current === i ? `on-${current}-${cycle}` : "off"} />}
                {t.label}
              </button>
            ))}
          </div>

          <div className="stage" ref={stage} onMouseEnter={() => setPaused(true)} onMouseLeave={() => { setPaused(false); setCycle((c) => c + 1); }}>
            <div className={`panel ${current === 0 ? "is-on" : ""}`} id="panel-chat" role="tabpanel" aria-labelledby="tab-chat">
              <div className="fit" aria-hidden style={fitStyle(0)}>
                <div className="wglass"><AppHome typed={typed} /></div>
                <div style={{ display: "contents" }} dangerouslySetInnerHTML={{ __html: NOTE_HTML }} />
              </div>
              <div className="wph-wrap" aria-hidden><AppPhone typed={typed} /></div>
            </div>
            <div className={`panel ${current === 1 ? "is-on" : ""}`} id="panel-inbox" role="tabpanel" aria-labelledby="tab-inbox">
              <div className="fit" aria-hidden style={fitStyle(1)} dangerouslySetInnerHTML={{ __html: INBOX_HTML }} />
              <div className="wph-wrap" aria-hidden><InboxPhone /></div>
            </div>
            <div className={`panel ${current === 2 ? "is-on" : ""}`} id="panel-review" role="tabpanel" aria-labelledby="tab-review">
              <div
                className="fit"
                aria-hidden
                style={fill}
                // reading the stacked cards holds the tab: each scroll restarts its timer
                onScroll={box.narrow ? () => setCycle((c) => c + 1) : undefined}
              >
                <HowLoatsWork bare />
              </div>
            </div>
            <div className={`panel ${current === 3 ? "is-on" : ""}`} id="panel-record" role="tabpanel" aria-labelledby="tab-record">
              <div className="fit" aria-hidden style={fitStyle(3)} dangerouslySetInnerHTML={{ __html: RECORD_HTML }} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
