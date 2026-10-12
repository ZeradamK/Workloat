"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { mono } from "./monoFont";
import { WHEREVER_HTML } from "./wherever-you-work.html";
import "./EnterpriseFlow.css";

/**
 * Build, launch, iterate: the enterprise page's second section, on
 * Voiceflow's three panels. Each is a tall picture with a working card in
 * it, captioned underneath with an icon, a bold verb and a line.
 *
 *   Build: a Loat's workflow on a canvas (Run, Publish), its steps in two
 *     cards joined by lines, on the model the company chose.
 *   Launch: Sona answering in the chat, with a link card and a question
 *     being typed.
 *   Iterate: the Loat's approvals over time, and three figures.
 *
 * Each panel plays when it scrolls into view and again each time it comes
 * back: Build's cards and lines draw in, Launch's bubbles arrive one by one
 * and the question types, Iterate's line draws and its figures count up.
 * With reduced motion they rest on their last frame. The figures and the
 * workflow are examples.
 */

const SONA = WHEREVER_HTML.match(/<svg(?:(?!<\/svg>)[\s\S])*#f28c28[\s\S]*?<\/svg>/)?.[0] ?? "";
const PANEL = { w: 528, h: 607 };

/* `run` flips true each time the panel comes into view, and back to false
   when it leaves (always true with reduced motion) */
function useInView<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [run, setRun] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setRun(true); return; }
    const io = new IntersectionObserver(([e]) => setRun(e.isIntersecting), { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return { ref, run };
}

export default function EnterpriseFlow() {
  return (
    <section className="ef" style={{ "--ef-mono": mono.style.fontFamily } as React.CSSProperties}>
      <div className="ef-grid">
        <Col
          icon={<svg viewBox="0 0 24 24" aria-hidden><rect x="3" y="3" width="7" height="18" rx="1" fill="currentColor" /><rect x="12" y="3" width="9" height="8" rx="1" fill="currentColor" /><rect x="12" y="13" width="9" height="8" rx="1" fill="currentColor" opacity=".45" /></svg>}
          verb="Build."
          line="Design Loats around the workflows your company already runs, on the model you choose."
          bg="ef-pic--build"
        >
          {() => <Build />}
        </Col>
        <Col
          icon={<svg viewBox="0 0 24 24" aria-hidden><path d="M12 3.5c5 0 9 3.4 9 7.6s-4 7.6-9 7.6c-1 0-2-.1-2.9-.4L4.5 20.5l1.3-3.6C4 15.5 3 13.4 3 11.1 3 6.9 7 3.5 12 3.5Z" fill="currentColor" /></svg>}
          verb="Launch."
          line="Put Loats to work in email, Slack and the app, inside your stack, with nothing leaving your walls."
          bg="ef-pic--launch"
        >
          {(run) => <Launch run={run} />}
        </Col>
        <Col
          icon={<svg viewBox="0 0 24 24" aria-hidden><rect x="3" y="12" width="4" height="9" rx="1" fill="currentColor" /><rect x="10" y="6" width="4" height="15" rx="1" fill="currentColor" /><rect x="17" y="9" width="4" height="12" rx="1" fill="currentColor" opacity=".45" /></svg>}
          verb="Iterate."
          line="Improve every Loat from its ledger, and change models as you grow, with no rebuilds."
          bg="ef-pic--iterate"
        >
          {(run) => <Iterate run={run} />}
        </Col>
      </div>
    </section>
  );
}

function Col({ icon, verb, line, bg, children }: { icon: React.ReactNode; verb: string; line: string; bg: string; children: (run: boolean) => React.ReactNode }) {
  const { ref, run } = useInView<HTMLDivElement>();
  const [z, setZ] = useState(1);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fit = () => setZ(el.clientWidth / PANEL.w);
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return (
    <article className="ef-col">
      <div ref={ref} className={`ef-pic ${bg}${run ? " is-run" : ""}`} style={{ height: PANEL.h * z }} aria-hidden>
        <div className="ef-canvas" style={{ transform: `scale(${z})` }}>{children(run)}</div>
      </div>
      <p className="ef-cap">
        <span className="ef-cap__ic">{icon}</span>
        <span><b>{verb}</b> {line}</span>
      </p>
    </article>
  );
}

/* ---------- Build: a workflow canvas ---------- */
function Build() {
  return (
    <div className="ef-build">
      <div className="ef-board">
        <div className="ef-board__bar">
          <span className="ef-btn"><svg viewBox="0 0 16 16"><path d="M5 3.5v9l7-4.5Z" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" /></svg>Run</span>
          <span className="ef-btn ef-btn--go"><svg viewBox="0 0 16 16"><path d="M8 2v3M8 11v3M2 8h3M11 8h3M4 4l2 2M10 10l2 2M4 12l2-2M10 6l2-2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" /></svg>Publish</span>
        </div>
        <svg className="ef-wires" viewBox="0 0 470 520">
          <path className="ef-wire" d="M58 160 H96 V130 H186" pathLength={1} />
          <path className="ef-wire" d="M58 160 H96 V340 H186" pathLength={1} style={{ animationDelay: ".55s" }} />
        </svg>
        <div className="ef-node ef-node--stub">
          <p>Invoice in</p><p>Finance Loat</p><p>Check budget</p><p>Ask the owner</p>
        </div>
        <div className="ef-node ef-node--a" style={{ animationDelay: ".15s" }}>
          <p className="ef-node__head"><i />Invoice received</p>
          <div className="ef-node__row"><b>Finance Loat · Sona</b><span className="ef-model">Your model</span></div>
          {/* eslint-disable @next/next/no-img-element */}
          <div className="ef-chips"><span><img src="/logos/tools/gmail.png" alt="" />Read invoice</span><span><img src="/logos/tools/google-sheets.png" alt="" />Check budget</span></div>
          <div className="ef-node__row">Match to the order</div>
          <div className="ef-node__row">Pay inside the budget</div>
        </div>
        <div className="ef-node ef-node--b" style={{ animationDelay: ".5s" }}>
          <p className="ef-node__head"><i />Over the limit</p>
          <div className="ef-node__row"><b>Approval route</b><span className="ef-model">Your model</span></div>
          <div className="ef-chips"><span><img src="/logos/tools/slack.svg" alt="" />Ask in Slack</span><span>✉ Email the owner</span></div>
          {/* eslint-enable @next/next/no-img-element */}
          <div className="ef-node__row">Log to the ledger</div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Launch: Sona in the chat ---------- */
const ASK = "How much is left in marketing this month?";
const ANSWER = "Marketing has $6,200 left of $30,000 this month. Two invoices land Friday for $1,850.";

/* `converse` (the sign up page's scene): the question is sent once typed,
   and Sona answers it, the thread scrolling up as it grows; `onDone` fires
   once her answer is in. Without it, the enterprise panel as designed. */
export function Launch({ run, converse = false, onDone }: { run: boolean; converse?: boolean; onDone?: () => void }) {
  const [n, setN] = useState(0);
  const [phase, setPhase] = useState<"ask" | "sent" | "dots" | "answered">("ask");
  const done = useRef(onDone);
  done.current = onDone;
  useEffect(() => {
    setPhase("ask");
    if (!run) { setN(0); return; }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setN(ASK.length);
      if (converse) { setPhase("answered"); done.current?.(); }
      return;
    }
    const timers: number[] = [];
    const later = (fn: () => void, ms: number) => timers.push(window.setTimeout(fn, ms));
    let k = 0;
    const tick = () => {
      k++; setN(k);
      if (k < ASK.length) later(tick, 38 + Math.random() * 40);
      else if (converse) {
        later(() => { setPhase("sent"); setN(0); }, 650);
        later(() => setPhase("dots"), 1150);
        later(() => setPhase("answered"), 2500);
        later(() => done.current?.(), 2700);
      }
    };
    later(tick, 2300);
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [run, converse]);
  const sent = phase !== "ask";
  return (
    <div className={`ef-launch${converse ? " ef-launch--talk" : ""}`}>
      <div className="ef-glass">
        <div className="ef-thread">
          <div className="ef-msg" style={{ animationDelay: ".2s" }}>
            <span className="ef-ava" dangerouslySetInnerHTML={{ __html: SONA }} />
            <div className="ef-bub">Hi, I&apos;m Sona, your finance Loat. Here&apos;s where October stands.</div>
          </div>
          <div className="ef-msg" style={{ animationDelay: ".9s" }}>
            <span className="ef-ava" dangerouslySetInnerHTML={{ __html: SONA }} />
            <div className="ef-bub">
              Every team is inside its budget except procurement, at 91%.
              <div className="ef-link">
                <span className="ef-link__pic" />
                <span><b>Budget review · October</b><small>Workloat ledger</small></span>
              </div>
            </div>
          </div>
          {converse && sent && <div className="ef-me">{ASK}</div>}
          {converse && phase === "dots" && (
            <div className="ef-msg ef-msg--now">
              <span className="ef-ava" dangerouslySetInnerHTML={{ __html: SONA }} />
              <div className="ef-bub ef-dots"><i /><i /><i /></div>
            </div>
          )}
          {converse && phase === "answered" && (
            <div className="ef-msg ef-msg--now">
              <span className="ef-ava" dangerouslySetInnerHTML={{ __html: SONA }} />
              <div className="ef-bub">{ANSWER}</div>
            </div>
          )}
        </div>
        <div className="ef-ask">
          <span>{n ? ASK.slice(0, n) : <em>Ask Sona anything…</em>}{n > 0 && n < ASK.length && <i className="ef-caret" />}</span>
          <svg className="ef-mic" viewBox="0 0 16 16"><rect x="5.5" y="1.5" width="5" height="8.5" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1.3" /><path d="M3 7.5a5 5 0 0 0 10 0M8 12.5v2.5" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" /></svg>
          <span className={`ef-send${n >= ASK.length ? " is-lit" : ""}`}>↑</span>
        </div>
      </div>
    </div>
  );
}

/* ---------- Iterate: approvals over time ---------- */
function useCount(to: number, run: boolean, ms = 1400, delay = 600) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!run) { setV(0); return; }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setV(to); return; }
    let raf = 0, t0 = 0;
    const id = window.setTimeout(() => {
      const step = (t: number) => { if (!t0) t0 = t; const p = Math.min(1, (t - t0) / ms); setV(to * (1 - Math.pow(1 - p, 3))); if (p < 1) raf = requestAnimationFrame(step); };
      raf = requestAnimationFrame(step);
    }, delay);
    return () => { window.clearTimeout(id); cancelAnimationFrame(raf); };
  }, [to, run, ms, delay]);
  return v;
}
function Iterate({ run }: { run: boolean }) {
  const pass = useCount(84, run);
  const logs = useCount(1.6, run);
  const mins = useCount(4, run);
  const ys = [40, 40, 54, 54, 54, 70, 70, 68, 68, 80, 80];
  const X = (i: number) => 70 + i * 34, Y = (v: number) => 300 - (v - 40) * 5.2;
  const d = ys.map((v, i) => `${i ? "L" : "M"}${X(i)},${Y(v)}`).join(" ");
  return (
    <div className="ef-iterate">
      <div className="ef-chart">
        <span className="ef-chip"><svg viewBox="0 0 16 16"><path d="M3 13V8M8 13V3M13 13V6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>Approvals</span>
        <svg viewBox="0 0 440 320" className="ef-plot">
          {[80, 70, 60, 50, 40].map((v) => (
            <g key={v}>
              <text x="22" y={Y(v) + 4} className="ef-axis">{v}%</text>
              <line x1="62" x2="440" y1={Y(v)} y2={Y(v)} className="ef-gridline" />
            </g>
          ))}
          <path d={`${d} L${X(ys.length - 1)},300 L70,300 Z`} className="ef-area" />
          <path d={d} pathLength={1} className="ef-line" />
        </svg>
        <div className="ef-stats">
          <div><small>Handled, no person</small><b className="ef-good">{Math.round(pass)}%</b></div>
          <div><small>Actions logged</small><b>{logs.toFixed(1)}k</b></div>
          <div><small>Avg. approval</small><b>{Math.round(mins)} min</b></div>
        </div>
      </div>
    </div>
  );
}
