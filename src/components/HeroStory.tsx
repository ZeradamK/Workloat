"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { lato, mono } from "./monoFont";
import { planTyping } from "./heroTyping";
import { NOTE_HTML } from "./hero-tabs.html";
import { WHEREVER_HTML } from "./wherever-you-work.html";
import "./HeroStory.css";

/**
 * The hero panel's story, over its looping video: three of Workloat's
 * primary workflows, one after another, each in the same three scenes.
 *
 * 1. Workloat's home: the wordmark and the web app's composer. You type
 *    the task to a Loat, at a quick typist's pace (heroTyping), and send it.
 * 2. The composer fades out and the Loat's inbox fades in, on the ledger
 *    card's paper: the email the task turned on, the reply or the draft
 *    that follows it, and the thing waiting for your approval.
 * 3. The inbox narrows to the left and your phone comes in on the right,
 *    in the meeting card's frosted frame, where the Loat checks with you
 *    before it acts; once you approve, the item in the inbox turns done.
 *    Each story talks to you somewhere different:
 *    - Alfred books a technical screen, by iMessage (the "Workloat ·
 *      Alfred by text" design);
 *    - Sona pays an invoice inside its budget in Slack's #finance. This
 *      story skips all three scenes: the #finance Slack window from the
 *      Wherever you work section fills the panel (1.1x on a computer; a
 *      taller, narrower window on a phone), you ask Sona there, and she
 *      answers there, with a spend graph in the Slack section's style
 *      (marketing so far, the invoice as a step, the budget line) and
 *      Approve and Hold under it;
 *    - Alfred stops a contract from renewing on its own, in the Workloat
 *      app's inbox, in its light theme, with an approval card.
 *    The phone is the iPhone 18 Pro's 402 by 874 points, scaled.
 *
 * The vendors are made up. Scenes 2 and 3 are drawn on a fixed 1360 by
 * 680 canvas scaled to the panel; on a phone (the hero's mobile layout)
 * the canvas is the phone alone (or the Slack window) and the inbox is
 * skipped. Plays only
 * while on screen; with reduced motion it rests on the end of the first
 * story.
 */

type Msg = { from: string; ini?: string; loat?: boolean; to: string; time: string; body: string; sig: string };

/* what happens on the phone, in order */
type Step =
  | { do: "dots"; ms: number } // the Loat is writing
  | { do: "them"; text: string; html?: string } // a message from the Loat (html: our own fixed markup under it)
  | { do: "card" } // the thing to approve
  | { do: "tap" } // you press its primary button
  | { do: "me"; text: string } // you type a reply and send it
  | { do: "other"; who: string; img: string; text: string } // a teammate in the channel (Slack)
  | { do: "done" } // the item in the inbox turns done
  | { do: "wait"; ms: number };

type Card = { kicker: string; title: string; fields: [string, string][]; primary: string; secondary: string; approved: string };
/* Slack's version of the card: a month's spend so far, what the payment
   adds, and the budget line, in the Slack section's SpendCard style */
type Graph = {
  month: string; // OCT
  days: number; // in the month
  soFar: number[]; // cumulative spend, $K, from day 0 to today
  add: number; // the payment, $K
  budget: number; // $K
  max: number; // top of the scale, $K
  left: [string, string]; // label, figure
  right: [string, string, string]; // label, figure, note
  primary: string;
  secondary: string;
  approved: string;
};

type Story = {
  loat: "Alfred" | "Sona";
  addr: string;
  task?: string; // typed into Workloat's composer in scene 1 (the Slack story asks in Slack instead)
  subject: string;
  first: Msg; // there when the inbox opens
  next: Msg; // slides in after it: the reply, or the Loat's own draft
  item: { mon: string; day: string; title: string; sub: string; waiting: string; done: string }; // in the inbox
  chat: { on: "imessage" | "slack" | "app"; clock: string; day: string; title?: string; card?: Card; graph?: Graph; steps: Step[] };
};

const STORIES: Story[] = [
  {
    loat: "Alfred",
    addr: "alfred_workloat@workloat.com",
    task: "Schedule a technical screen with Priya next week.",
    subject: "Technical screen next week",
    first: { from: "Alfred", loat: true, to: "to Priya Shah", time: "9:12 AM", body: "Hi Priya, thanks for your time so far. Zeradam would like a 45 minute technical screen with you next week. Would Tuesday at 2 PM, Wednesday at 11 AM or Thursday at 3 PM work?", sig: "Alfred, for Zeradam" },
    next: { from: "Priya Shah", ini: "PS", to: "to Alfred", time: "9:38 AM", body: "Hi Alfred, Tuesday at 2 PM works for me. Looking forward to it.", sig: "Priya" },
    item: { mon: "OCT", day: "13", title: "Technical screen with Priya", sub: "Tue, Oct 13 · 2:00 to 2:45 PM · Google Meet", waiting: "Invite draft · waiting for your approval", done: "Invite sent 9:42 AM" },
    chat: {
      on: "imessage",
      clock: "9:41",
      day: "9:41 AM",
      steps: [
        { do: "dots", ms: 1400 },
        { do: "them", text: "Priya replied to the screen you asked for. She picked Tuesday at 2 PM." },
        { do: "dots", ms: 1300 },
        { do: "them", text: "The invite with a Meet link is ready. Want me to send it?" },
        { do: "wait", ms: 450 },
        { do: "card" },
        { do: "wait", ms: 1500 },
        { do: "me", text: "Yes, please send it. Thanks." },
        { do: "dots", ms: 1300 },
        { do: "them", text: "Sent from alfred_workloat@workloat.com. I'll text you if she reschedules." },
        { do: "done" },
      ],
    },
  },
  {
    loat: "Sona",
    addr: "sona_workloat@workloat.com",
    subject: "Invoice NW-2041 for October",
    first: { from: "Northwind Media", ini: "NM", to: "to Sona", time: "8:55 AM", body: "Hi, please find attached invoice NW-2041 for October campaign services, $4,800.00, due October 20.", sig: "Accounts, Northwind Media" },
    next: { from: "Sona", loat: true, to: "to Northwind Media", time: "9:03 AM", body: "Thanks, received. It matches the October order, and payment is queued for approval today.", sig: "Sona, for Workloat Finance" },
    item: { mon: "OCT", day: "20", title: "Northwind Media · $4,800.00", sub: "Invoice NW-2041 · Marketing · due Oct 20", waiting: "Payment queued · waiting for approval", done: "Paid 9:44 AM" },
    chat: {
      on: "slack",
      clock: "9:43",
      day: "Today",
      title: "finance",
      graph: {
        month: "OCT",
        days: 31,
        soFar: [0, 2.1, 4, 6.8, 9.5, 11.2, 14.9, 17.6, 21, 23.8],
        add: 4.8,
        budget: 30,
        max: 31,
        left: ["Marketing · spent so far", "$23,800"],
        right: ["After NW-2041", "$28,600", "$1,400 left of $30,000"],
        primary: "Approve payment",
        secondary: "Hold",
        approved: "Approved by Zeradam · 9:44 AM",
      },
      steps: [
        { do: "me", text: "@Sona can you pay the Northwind invoice if marketing still has room this month?" },
        { do: "dots", ms: 1300 },
        { do: "them", text: "On it. Northwind's October invoice is $4,800 for campaign services, due Oct 20." },
        { do: "dots", ms: 1100 },
        { do: "them", text: "Marketing has $6,200 left this month, so it fits. @Zeradam, want me to pay it?" },
        { do: "wait", ms: 400 },
        { do: "card" },
        { do: "wait", ms: 1700 },
        { do: "tap" },
        { do: "done" },
        { do: "dots", ms: 1200 },
        { do: "them", text: "Paid and matched to invoice NW-2041. Marketing has $1,400 left for October." },
        { do: "wait", ms: 900 },
        { do: "other", who: "Jenny", img: "/landing/anywhere/bb8f97ba52.jpg", text: "Thanks @Sona. I'll update the campaign tracker." },
        { do: "wait", ms: 900 },
        { do: "me", text: "Thanks Sona. Please flag anything over $2,000 before month end." },
        { do: "dots", ms: 1200 },
        { do: "them", text: "Will do. I'll check every invoice against its budget before it's paid." },
      ],
    },
  },
  {
    loat: "Alfred",
    addr: "alfred_workloat@workloat.com",
    task: "Check which vendor contracts renew automatically this month.",
    subject: "Your annual plan renews November 1",
    first: { from: "Brightline Analytics", ini: "BA", to: "to Alfred", time: "8:30 AM", body: "Your annual plan renews automatically on November 1 at $18,000. To change or cancel, let us know before October 17.", sig: "Brightline Billing" },
    next: { from: "Alfred", loat: true, to: "to Brightline Analytics · draft", time: "9:58 AM", body: "Hi, please don't renew our annual plan on November 1. We'll be in touch if we want to continue month to month.", sig: "Alfred, for Zeradam" },
    item: { mon: "NOV", day: "1", title: "Brightline Analytics · annual plan", sub: "Renews Nov 1 · $18,000 a year · notice by Oct 17", waiting: "Notice draft · waiting for your approval", done: "Notice sent 10:06 AM" },
    chat: {
      on: "app",
      clock: "10:05",
      day: "10:05 AM",
      title: "Contracts renewing this month",
      card: {
        kicker: "Approval",
        title: "Non-renewal notice to Brightline Analytics",
        fields: [["To", "Brightline Billing"], ["Plan", "Annual · $18,000"], ["Notice due", "Oct 17"]],
        primary: "Approve and send",
        secondary: "Edit",
        approved: "Sent from alfred_workloat@workloat.com · 10:06 AM",
      },
      steps: [
        { do: "dots", ms: 1300 },
        {
          do: "them",
          text: "Two vendor contracts renew this month.",
          html: '<div class="ap-table"><div class="ap-tr"><b>Brightline Analytics</b><span>Nov 1 · $18,000 a year</span><em class="warn">Renews on its own</em></div><div class="ap-tr"><b>Fieldnote Cloud</b><span>Nov 12 · $240 a month</span><em>Monthly, no action</em></div></div>',
        },
        { do: "dots", ms: 1200 },
        { do: "them", text: "Brightline's notice is due by Oct 17. I drafted the non-renewal for you to approve." },
        { do: "wait", ms: 400 },
        { do: "card" },
        { do: "wait", ms: 1700 },
        { do: "tap" },
        { do: "done" },
        { do: "wait", ms: 900 },
        { do: "me", text: "Thanks Alfred. Keep Fieldnote as it is." },
        { do: "dots", ms: 1300 },
        { do: "them", text: "Noted. I'll check renewals again on November 1 and tell you before any notice is due." },
      ],
    },
  },
];

/* the canvas for scenes 2 and 3, and the phone on it */
const CANVAS = { desktop: { w: 1360, h: 680 }, mobile: { w: 296, h: 620 }, mobileSlack: { w: 380, h: 620 } };
const PHONE_SCALE = 600 / 874; // the 402 x 874 screen at 600 tall, in a 10 unit frame

type Phase = "input" | "mail" | "split" | "desk" | "out";
type Invite = "none" | "draft" | "sent";

/* the Loats' pixel portraits: Alfred's from his note in the product
   tour, Sona's from her messages in the Wherever you work section */
const PX = {
  Alfred: NOTE_HTML.match(/<svg[\s\S]*?<\/svg>/)?.[0] ?? "",
  Sona: WHEREVER_HTML.match(/<svg(?:(?!<\/svg>)[\s\S])*#f28c28[\s\S]*?<\/svg>/)?.[0] ?? "",
};
function LoatPx({ loat }: { loat: Story["loat"] }) {
  return <span className="hs-px" dangerouslySetInnerHTML={{ __html: PX[loat] }} />;
}
/* a message's sender: the Loat's portrait, or initials */
function Sender({ m, loat }: { m: Msg; loat: Story["loat"] }) {
  return m.loat ? <span className="hs-ava hs-ava--lg"><LoatPx loat={loat} /></span> : <span className="hs-ava hs-ava--lg hs-ava--ini">{m.ini}</span>;
}

function StatusBar({ clock }: { clock: string }) {
  return (
    <div className="status"><span>{clock}</span><span className="ic">
      <svg width="19" height="12" viewBox="0 0 19 12"><rect x="0" y="8" width="3" height="4" rx="1" fill="#000" /><rect x="5" y="5.5" width="3" height="6.5" rx="1" fill="#000" /><rect x="10" y="3" width="3" height="9" rx="1" fill="#000" /><rect x="15" y="0" width="3" height="12" rx="1" fill="#000" /></svg>
      <svg width="27" height="13" viewBox="0 0 27 13"><rect x=".5" y=".5" width="23" height="12" rx="3.8" fill="none" stroke="#000" opacity=".4" /><rect x="2" y="2" width="20" height="9" rx="2.5" fill="#000" /><path d="M25 4.5v4c.8-.3 1.3-1.1 1.3-2s-.5-1.7-1.3-2Z" fill="#000" opacity=".45" /></svg>
    </span></div>
  );
}

const BACK = <svg viewBox="0 0 12 20" aria-hidden><path d="M10 2 2 10l8 8" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" /></svg>;

export default function HeroStory({ layout }: { layout: "desktop" | "mobile" }) {
  const [phase, setPhase] = useState<Phase>("input");
  const [text, setText] = useState("");
  const [typing, setTyping] = useState(false);
  const [sending, setSending] = useState(false);
  const [at, setAt] = useState(0); // which story
  const [reply, setReply] = useState(false);
  const [invite, setInvite] = useState<Invite>("none");
  const [fit, setFit] = useState({ z: 1, x: 0, y: 0 });
  const root = useRef<HTMLDivElement>(null);
  const canvas = layout === "mobile" && STORIES[at].chat.on === "slack" ? CANVAS.mobileSlack : CANVAS[layout];

  /* scale the canvas to the panel, centred */
  useLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    const measure = () => {
      const W = el.clientWidth, H = el.clientHeight;
      const z = layout === "desktop" ? Math.min(W / canvas.w, H / canvas.h) : Math.min((W * 0.9) / canvas.w, (H * 0.92) / canvas.h);
      setFit({ z, x: (W - canvas.w * z) / 2, y: (H - canvas.h * z) / 2 });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [layout, canvas.w, canvas.h]);

  /* the story */
  useEffect(() => {
    const R = root.current;
    if (!R) return;
    let alive = true, visible = false, running = false;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const wait = (ms: number) => new Promise<void>((ok, stop) => setTimeout(() => (alive ? ok() : stop(new Error("unmounted"))), reduce ? 0 : ms));
    const el = (cls: string, html?: string) => { const d = document.createElement("div"); d.className = cls; if (html != null) d.innerHTML = html; return d; };
    const txt = (cls: string, t: string) => { const d = el(cls); d.textContent = t; return d; };

    /* each phone screen: its thread and its composer, written straight
       into the DOM as the iMessage design's own script does */
    const screen = (on: Story["chat"]["on"]) => {
      const S = R.querySelector<HTMLElement>(`.hs-screen[data-on="${on}"]`)!;
      return { S, T: S.querySelector<HTMLElement>("[data-thread]")!, F: S.querySelector<HTMLElement>("[data-field]")!, FT: S.querySelector<HTMLElement>("[data-ftext]")! };
    };
    /* Slack shows @names as mentions */
    const said = (cls: string, t: string) => {
      const d = el(cls);
      for (const part of t.split(/(@[A-Z][a-z]+)/)) {
        if (/^@[A-Z]/.test(part)) { const m = document.createElement("span"); m.className = "mention"; m.textContent = part; d.append(m); }
        else if (part) d.append(part);
      }
      return d;
    };

    let st = STORIES[0];
    let last: "me" | "them" | null = null; // who wrote the last message, to group a run
    let lastBubble: HTMLElement | null = null; // iMessage: the bubble wearing the tail
    let minute = 0; // the story's clock moves on a minute once you act

    const setField = (t: string) => {
      const { F, FT } = screen(st.chat.on);
      F.classList.toggle("has", !!t);
      FT.classList.toggle("ph", !t);
      FT.replaceChildren();
      if (t) { FT.append(t); FT.append(el("caret")); }
      else FT.textContent = FT.dataset.ph ?? "";
    };
    const typeReply = async (t: string) => {
      if (!reduce) for (let i = 1; i <= t.length; i++) { setField(t.slice(0, i)); await wait((42 + Math.random() * 50 + (t[i - 1] === " " ? 55 : 0)) / 1.5); }
      await wait(420);
      setField("");
    };
    const now = (m: number) => { const [h, mm] = st.chat.clock.split(":").map(Number); const t = h * 60 + mm + m; return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, "0")} AM`; };

    const reset = () => {
      const { T } = screen(st.chat.on);
      last = null; lastBubble = null; minute = 0;
      if (st.chat.on === "imessage") T.replaceChildren(el("im-day", `<b>Today</b> ${st.chat.day}`));
      if (st.chat.on === "slack") T.replaceChildren(el("sl-day", `<span>${st.chat.day}</span>`));
      if (st.chat.on === "app") T.replaceChildren();
      setField("");
    };

    const them = (text: string, html?: string) => {
      const { T } = screen(st.chat.on);
      if (st.chat.on === "imessage") {
        if (last === "them" && lastBubble) lastBubble.classList.remove("tail");
        const row = el(`row them${last !== "them" ? " first" : ""}`);
        lastBubble = txt("bubble tail", text);
        row.append(lastBubble); T.append(row);
      } else if (st.chat.on === "slack") {
        if (last !== "them") {
          const g = el("sl-msg", `<span class="sl-ava sl-ava--px">${PX.Sona}</span><div class="sl-body"><div class="sl-head"><b>Sona</b><i>APP</i><span>${now(minute)}</span></div></div>`);
          T.append(g);
        }
        T.querySelector<HTMLElement>(".sl-msg:last-child .sl-body")!.append(said("sl-text", text));
      } else {
        if (last !== "them") T.append(el("ap-msg", `<div class="ap-head"><span class="ap-ava">${PX.Alfred}</span><b>Alfred</b><span>${now(minute)}</span></div>`));
        const m = T.lastElementChild as HTMLElement;
        m.append(txt("ap-text", text));
        if (html) m.append(el("ap-extra", html));
      }
      last = "them";
    };

    const card = () => {
      const { T } = screen(st.chat.on);
      if (st.chat.on === "imessage") {
        const it = st.item;
        const c = el("card", `<div class="card__top"><span class="card__cal"><b></b><span></span></span><div><strong></strong><small></small></div></div><div class="card__bottom"></div>`);
        c.querySelector(".card__cal b")!.textContent = it.mon;
        c.querySelector(".card__cal span")!.textContent = it.day;
        c.querySelector("strong")!.textContent = it.title;
        c.querySelector("small")!.textContent = "Tue 2:00 to 2:45 PM · Google Meet";
        c.querySelector(".card__bottom")!.textContent = "Invite draft · waiting for you";
        const row = el("row them"); row.append(c); T.append(row);
        if (lastBubble) lastBubble.classList.remove("tail");
        lastBubble = null;
        return;
      }
      if (st.chat.on === "slack") {
        T.querySelector<HTMLElement>(".sl-msg:last-child .sl-body")!.append(graph(st.chat.graph!));
        return;
      }
      const k = st.chat.card!;
      const pre = "ap";
      const c = el(`${pre}-card`);
      c.append(txt(`${pre}-card__kicker`, k.kicker), txt(`${pre}-card__title`, k.title));
      const fields = el(`${pre}-card__fields`);
      for (const [label, value] of k.fields) { const f = el(`${pre}-card__field`); f.append(txt("l", label), txt("v", value)); fields.append(f); }
      c.append(fields);
      const actions = el(`${pre}-card__actions`);
      actions.append(txt(`${pre}-btn ${pre}-btn--go`, k.primary), txt(`${pre}-btn`, k.secondary));
      c.append(actions);
      (T.lastElementChild as HTMLElement).append(c);
    };

    /* the spend graph: the line draws to today, the area fades in under
       it, then the payment steps it up (dashed) against the budget line */
    const graph = (g: Graph) => {
      const W = 520, H = 140, pl = 10, pr = 50, pt = 12, pb = 22;
      const pw = W - pl - pr, ph = H - pt - pb;
      const x = (d: number) => pl + (d / g.days) * pw;
      const y = (k: number) => pt + ph - (k / g.max) * ph;
      const today = g.soFar.length - 1;
      const top = g.soFar[today], after = top + g.add;
      const line = g.soFar.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
      const area = `M${x(0)},${y(0)} ${g.soFar.map((v, i) => `L${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ")} L${x(today).toFixed(1)},${y(0)} Z`;
      const step = `M${x(today).toFixed(1)},${y(top).toFixed(1)} L${x(today + 1).toFixed(1)},${y(after).toFixed(1)} L${x(g.days).toFixed(1)},${y(after).toFixed(1)}`;
      const mono = 'font-family="ui-monospace, SFMono-Regular, Menlo, monospace"';
      const grid = [0.25, 0.5, 0.75, 1].map((f) => `<line x1="${pl}" x2="${pl + pw}" y1="${y(f * g.max).toFixed(1)}" y2="${y(f * g.max).toFixed(1)}" stroke="rgba(0,0,0,.12)" stroke-dasharray="2 4"/>`).join("");
      const yt = [0, 10, 20, 30].map((k) => `<text x="${W - pr + 10}" y="${(y(k) + 3.5).toFixed(1)}" font-size="9" ${mono} letter-spacing="1" fill="rgba(10,10,10,.7)">$${k}K</text>`).join("");
      const xt = ([[0, `${g.month} 1`, "start"], [today, "TODAY", "middle"], [20, `${g.month} 20`, "middle"], [g.days, `${g.month} ${g.days}`, "end"]] as [number, string, string][])
        .map(([d, l, a]) => `<text x="${x(d).toFixed(1)}" y="${H - 6}" text-anchor="${a}" font-size="9" ${mono} letter-spacing="1.2" fill="rgba(10,10,10,.7)">${l}</text>`).join("");
      const mx = x(today + 1), my = y(after);
      const box = el("sl-graph", `
        <div class="sl-graph__top">
          <div><p>${g.left[0]}</p><b>${g.left[1]}</b></div>
          <div class="sl-graph__after"><p>${g.right[0]}</p><b>${g.right[1]}<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17 17 7M9 7h8v8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></b><p>${g.right[2]}</p></div>
        </div>
        <svg class="sl-graph__plot" viewBox="0 0 ${W} ${H}" aria-hidden="true">
          ${grid}
          <line class="sl-graph__budget" x1="${pl}" x2="${pl + pw}" y1="${y(g.budget).toFixed(1)}" y2="${y(g.budget).toFixed(1)}" stroke="rgba(10,10,10,.38)" stroke-width="1.5"/>
          <text x="${pl + 4}" y="${(y(g.budget) - 5).toFixed(1)}" font-size="8.5" ${mono} letter-spacing="1.2" fill="rgba(10,10,10,.7)">BUDGET $${g.budget}K</text>
          <path class="sl-graph__area" d="${area}" fill="rgba(0,0,0,.10)"/>
          <path class="sl-graph__line" d="${line}" pathLength="1" fill="none" stroke="#0a0a0a" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
          <g class="sl-graph__today"><line x1="${x(today).toFixed(1)}" x2="${x(today).toFixed(1)}" y1="${pt - 4}" y2="${pt + ph}" stroke="#0a0a0a" stroke-width="1.3"/><circle cx="${x(today).toFixed(1)}" cy="${pt - 4}" r="2.6" fill="#0a0a0a"/></g>
          <g class="sl-graph__step">
            <path d="${step}" fill="none" stroke="#0a0a0a" stroke-width="2" stroke-dasharray="5 5" stroke-linejoin="round" stroke-linecap="round"/>
            <circle cx="${mx.toFixed(1)}" cy="${my.toFixed(1)}" r="10" fill="#0a0a0a"/>
            <text x="${mx.toFixed(1)}" y="${(my + 3.6).toFixed(1)}" text-anchor="middle" font-size="11" font-weight="700" fill="#eeeeee">$</text>
          </g>
          ${yt}${xt}
        </svg>`);
      const actions = el("sl-card__actions");
      actions.append(txt("sl-btn sl-btn--go", g.primary), txt("sl-btn", g.secondary));
      const wrap = el("sl-graph-wrap");
      wrap.append(box, actions);
      return wrap;
    };

    const tap = async () => {
      const { T } = screen(st.chat.on);
      const pre = st.chat.on === "slack" ? "sl" : "ap";
      const btn = T.querySelector<HTMLElement>(`.${pre}-btn--go`);
      if (!btn) return;
      btn.classList.add("is-press");
      minute = 1;
      await wait(320);
      const done = el(`${pre}-card__done`, '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="m3.5 8.5 3 3 6-7" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>');
      done.append(st.chat.on === "slack" ? st.chat.graph!.approved : st.chat.card!.approved);
      btn.parentElement!.replaceWith(done);
    };

    const me = async (text: string) => {
      const { T } = screen(st.chat.on);
      await typeReply(text);
      if (st.chat.on === "imessage") {
        if (last === "me" && lastBubble) lastBubble.classList.remove("tail");
        const row = el(`row me${last !== "me" ? " first" : ""}`);
        lastBubble = txt("bubble tail", text);
        row.append(lastBubble); T.append(row);
        last = "me";
        const receipt = (h: string) => { T.querySelectorAll(".receipt").forEach((r) => r.remove()); row.append(el("receipt", h)); };
        await wait(450); receipt("Delivered");
        await wait(500); receipt(`<b>Read</b> ${now(1)}`);
        return;
      }
      if (st.chat.on === "slack") {
        const g = el("sl-msg", `<img class="sl-ava" src="/landing/anywhere/ddd827596c.jpg" alt=""><div class="sl-body"><div class="sl-head"><b>Zeradam</b><span>${now(minute)}</span></div></div>`);
        g.querySelector(".sl-body")!.append(said("sl-text", text));
        T.append(g);
      } else {
        T.append(txt("ap-me", text));
      }
      last = "me";
    };

    /* a teammate in the channel */
    const other = (who: string, img: string, text: string) => {
      const { T } = screen(st.chat.on);
      const g = el("sl-msg", `<img class="sl-ava" src="${img}" alt=""><div class="sl-body"><div class="sl-head"><b>${who}</b><span>${now(minute)}</span></div></div>`);
      g.querySelector(".sl-body")!.append(said("sl-text", text));
      T.append(g);
      last = null;
    };

    const dots = async (ms: number) => {
      const { S, T } = screen(st.chat.on);
      if (reduce) return;
      if (st.chat.on === "imessage") {
        const row = el("row them"); row.append(el("bubble typing", "<i></i><i></i><i></i>")); T.append(row);
        await wait(ms); row.remove();
      } else if (st.chat.on === "slack") {
        const tip = S.querySelector<HTMLElement>(".sl-typing")!;
        tip.classList.add("is-on"); await wait(ms); tip.classList.remove("is-on");
      } else {
        const w = el("ap-working", "Alfred is working<i></i><i></i><i></i>"); T.append(w);
        await wait(ms); w.remove();
      }
    };

    const chat = async () => {
      for (const s of st.chat.steps) {
        if (s.do === "dots") await dots(s.ms);
        else if (s.do === "them") them(s.text, s.html);
        else if (s.do === "card") card();
        else if (s.do === "tap") await tap();
        else if (s.do === "me") await me(s.text);
        else if (s.do === "other") other(s.who, s.img, s.text);
        else if (s.do === "done") setInvite("sent");
        else await wait(s.ms);
      }
    };

    /* reduced motion: the end of the first story, still */
    if (reduce) {
      st = STORIES[0];
      setAt(0); setReply(true); setInvite("none"); setText(st.task ?? ""); setPhase("split");
      reset();
      chat().catch(() => {});
      return () => { alive = false; };
    }

    let n = 0;
    const story = async () => {
      st = STORIES[n % STORIES.length];
      setAt(n % STORIES.length);
      reset();
      setReply(false); setInvite("none"); setText("");

      // the Slack story skips scene 1: straight into the #finance window,
      // where you ask Sona and she answers
      if (st.chat.on === "slack") {
        setPhase("desk");
        await wait(1300);
        await chat();
        await wait(4000);
        setPhase("out");
        await wait(800);
        n++;
        return;
      }

      // scene 1: type the task and send it
      setPhase("input");
      await wait(900);
      setTyping(true);
      for (const step of planTyping(st.task ?? "")) { await wait(step.ms); setText(step.text); }
      setTyping(false);
      await wait(900);
      setSending(true);
      await wait(380);
      setSending(false);

      // scene 2: the Loat's inbox (the phone layout goes straight to the phone)
      if (layout === "desktop") {
        setPhase("mail");
        await wait(1700);
        setReply(true);
        await wait(1500);
        setInvite("draft");
        await wait(1600);
      }

      // scene 3: the inbox makes room; the Loat checks with you on your phone
      setPhase("split");
      await wait(1300);
      await chat();
      await wait(4000);

      // and out, to the next story
      setPhase("out");
      await wait(800);
      n++;
    };
    const play = async () => {
      if (running) return;
      running = true;
      try { while (alive && visible) await story(); } catch { /* unmounted mid-story */ }
      running = false;
    };
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) play(); }, { threshold: 0.3 });
    io.observe(R);
    return () => { alive = false; io.disconnect(); };
  }, [layout]);

  const lit = text.length > 0;
  const st = STORIES[at];
  return (
    <div
      ref={root}
      className="hs absolute inset-0"
      data-phase={phase}
      data-layout={layout}
      style={{ "--hs-mono": mono.style.fontFamily, "--hs-lato": lato.style.fontFamily } as React.CSSProperties}
      role="img"
      aria-label="Three Workloat Loats at work. Alfred books a technical screen with Priya and checks with you by text, Sona pays an invoice inside the marketing budget once you approve in Slack, and Alfred stops a contract from renewing on its own once you approve in the Workloat app."
    >
      {/* scene 1: Workloat's home */}
      <div className="hs-home">
        <div className="flex w-full flex-col items-center px-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/workloat-wordmark-white.png" alt="" className="mb-[clamp(24px,3vw,40px)] h-[clamp(22px,2.2vw,32px)] w-auto select-none" aria-hidden />
          <div aria-hidden className={`relative flex w-full max-w-[720px] flex-wrap items-end gap-[6px] rounded-[6px] border border-black/[0.09] bg-[#fbfaf6] p-[8px] sm:flex-nowrap shadow-[0_10px_34px_rgba(0,0,0,0.08)] transition-transform duration-200 ${sending ? "scale-[0.99]" : ""}`}>
            <span className="flex h-[44px] w-[44px] shrink-0 items-center justify-center">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="#111"><path d="M4.666,19.63a6.765,6.765,0,0,1-.148-9.713l6.8-6.8a4.845,4.845,0,1,1,6.852,6.851l-6.8,6.8a2.992,2.992,0,0,1-4.132,0,2.927,2.927,0,0,1,0-4.133L12.673,7.2a1,1,0,0,1,1.414,1.414L8.65,14.049a.925.925,0,0,0,0,1.3.945.945,0,0,0,1.3,0l6.8-6.8a2.845,2.845,0,0,0-4.023-4.023l-6.8,6.8a4.766,4.766,0,0,0,.1,6.843,4.93,4.93,0,0,0,6.807-.273l7.984-7.984a1,1,0,1,1,1.414,1.414l-7.984,7.984A7.122,7.122,0,0,1,9.223,21.4,6.607,6.607,0,0,1,4.666,19.63Z" /></svg>
            </span>
            <span className="relative min-h-[44px] min-w-0 flex-1 py-[10px] text-left text-[clamp(15px,1.25vw,17px)] leading-[24px] max-sm:order-first max-sm:basis-full max-sm:px-[10px]">
              {lit ? (
                <span className="text-[#111]">
                  {text}
                  <span className="ml-[1px] inline-block h-[19px] w-[2px] translate-y-[3px] bg-[#111]" style={{ animation: typing ? "none" : "caret-blink 1s infinite" }} />
                </span>
              ) : (
                <span className="text-[#9a9a9a]">Ask {st.loat} to schedule, follow up, or find out</span>
              )}
            </span>
            <span className="flex h-[44px] shrink-0 items-center gap-[6px] pl-[4px] max-sm:ml-auto">
              <span className="flex h-[38px] items-center gap-[6px] rounded-full px-[12px] text-[15px] font-medium text-[#111]">
                {st.loat}
                <svg width="11" height="11" viewBox="0 0 16 16" fill="none"><path d="m4 6 4 4 4-4" stroke="#6b6b6b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </span>
              <span className="flex h-[44px] w-[44px] items-center justify-center rounded-full bg-[#111]">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="#fff"><path d="M12 3a1 1 0 0 1 1 1v16a1 1 0 0 1-2 0V4a1 1 0 0 1 1-1ZM8 6a1 1 0 0 1 1 1v10a1 1 0 0 1-2 0V7a1 1 0 0 1 1-1Zm8 0a1 1 0 0 1 1 1v10a1 1 0 0 1-2 0V7a1 1 0 0 1 1-1ZM4 9a1 1 0 0 1 1 1v4a1 1 0 0 1-2 0v-4a1 1 0 0 1 1-1Zm16 0a1 1 0 0 1 1 1v4a1 1 0 0 1-2 0v-4a1 1 0 0 1 1-1Z" /></svg>
              </span>
              <span className={`flex h-[44px] w-[44px] items-center justify-center rounded-full transition-colors duration-200 ${lit ? "bg-[#111]" : "bg-[#d4d4d4]"}`}>
                <svg width="20" height="20" viewBox="0 0 16 16" fill="none"><path d="M8 13V3M4 7l4-4 4 4" stroke="#fff" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* scenes 2 and 3, on the scaled canvas */}
      <div
        className="hs-canvas"
        aria-hidden
        style={{ width: canvas.w, height: canvas.h, transform: `translate(${fit.x}px, ${fit.y}px) scale(${fit.z})` }}
      >
        {layout === "desktop" && (
          <div className="hs-mail">
            <div className="hs-mail__bar">
              <span className="hs-ava"><LoatPx loat={st.loat} /></span>
              <b>{st.loat}&apos;s inbox</b>
              <span className="hs-mail__addr">{st.addr}</span>
              <span className="hs-mail__tag">Inbox</span>
            </div>
            <div className="hs-mail__body">
              <h3>{st.subject}</h3>
              {[st.first, st.next].map((m, k) => (
                <div key={`${at}-${k}`} className={`hs-msg ${k ? `hs-msg--reply ${reply ? "is-in" : ""}` : ""}`}>
                  <Sender m={m} loat={st.loat} />
                  <div>
                    <div className="hs-msg__head"><b>{m.from}</b><span>{m.time}</span></div>
                    <div className="hs-msg__to">{m.to}</div>
                    <p>{m.body}</p>
                    <p className="hs-msg__sig">{m.sig}</p>
                  </div>
                </div>
              ))}
              <div className={`hs-invite ${invite !== "none" ? "is-in" : ""}`}>
                <span className="hs-cal"><b>{st.item.mon}</b><span>{st.item.day}</span></span>
                <div className="hs-invite__what">
                  <strong>{st.item.title}</strong>
                  <small>{st.item.sub}</small>
                </div>
                <span className={`hs-status ${invite === "sent" ? "is-sent" : ""}`}>{invite === "sent" ? st.item.done : st.item.waiting}</span>
              </div>
            </div>
          </div>
        )}

        {/* the Slack story: the #finance window from the Wherever you work
            section, at 1.4x on a computer, taller and narrower on a phone */}
        <div className="hs-slack">
          <div className="hs-slack__win hs-screen sl" data-on="slack">
            <div className="slack__bar"><i /><i /><i />
              <span className="slack__search"><svg viewBox="0 0 10 10" aria-hidden><circle cx="4.3" cy="4.3" r="3" fill="none" stroke="currentColor" strokeWidth="1.2" /><path d="M6.6 6.6 9 9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" /></svg>Search Workloat Workspace</span>
            </div>
            <div className="slack__chan">
              <b># finance</b>
              <svg className="chev" viewBox="0 0 10 10" aria-hidden><path d="M2.5 4 5 6.5 7.5 4" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
              <span className="facepile">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/landing/anywhere/ddd827596c.jpg" alt="" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/landing/anywhere/bb8f97ba52.jpg" alt="" />
                <span className="facepile__px"><LoatPx loat="Sona" /></span>
                <span className="facepile__n">6</span>
              </span>
            </div>
            <div className="sl-thread" data-thread />
            <div className="slack__compose" data-field>
              <div className="compose__fmt"><span>B</span><span style={{ fontStyle: "italic" }}>I</span><span style={{ textDecoration: "line-through" }}>S</span><i /><span>@</span></div>
              <div className="compose__text"><span className="sl-text ph" data-ftext data-ph="Message #finance">Message #finance</span></div>
              <div className="compose__tools">
                <span className="plus"><svg viewBox="0 0 10 10" aria-hidden><path d="M5 1.5v7M1.5 5h7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg></span>
                <span>Aa</span>
                <span>@</span>
                <span className="send"><svg viewBox="0 0 10 10" aria-hidden><path d="M1.5 5h6.5M5.2 2.2 8 5 5.2 7.8" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg></span>
              </div>
            </div>
            <span className="sl-typing">Sona is typing…</span>
          </div>
        </div>

        <div className="hs-phone">
          <div className="hs-phone__fit" style={{ transform: `scale(${PHONE_SCALE})` }}>
            {/* iMessage: "Workloat · Alfred by text" */}
            <div className="screen hs-screen" data-on="imessage" hidden={st.chat.on !== "imessage"}>
              <StatusBar clock={st.chat.clock} />
              <header className="im-head">
                <span className="im-back">{BACK}<span>3</span></span>
                <span className="im-who">
                  <span className="im-ava"><LoatPx loat="Alfred" /></span>
                  <span className="im-name">Alfred · Workloat<svg viewBox="0 0 6 10"><path d="m1 1 4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg></span>
                </span>
                <span className="im-cam"><svg viewBox="0 0 26 18"><rect x="1" y="2" width="16" height="14" rx="4" fill="none" stroke="currentColor" strokeWidth="1.8" /><path d="m18 7 6-3.5v11L18 11" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /></svg></span>
              </header>
              <div className="im-thread" data-thread />
              <div className="im-input">
                <span className="im-plus"><svg viewBox="0 0 14 14"><path d="M7 1.5v11M1.5 7h11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg></span>
                <span className="im-field" data-field>
                  <span className="im-text ph" data-ftext data-ph="iMessage">iMessage</span>
                  <span className="im-mic"><svg viewBox="0 0 16 16"><rect x="5.5" y="1.5" width="5" height="8.5" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1.5" /><path d="M3 7.5a5 5 0 0 0 10 0M8 12.5v2.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg></span>
                  <span className="im-send"><svg viewBox="0 0 14 14"><path d="M7 12V2.5M2.8 6.5 7 2.3l4.2 4.2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg></span>
                </span>
                <span className="home-ind" />
              </div>
            </div>

            {/* the Workloat app's inbox, light */}
            <div className="screen hs-screen ap" data-on="app" hidden={st.chat.on !== "app"}>
              <StatusBar clock={st.chat.clock} />
              <header className="ap-top">
                <span className="ap-back">{BACK}Inbox</span>
                <h4>{STORIES[2].chat.title}</h4>
                <span className="ap-from"><span className="ap-ava ap-ava--xs"><LoatPx loat="Alfred" /></span>Alfred · alfred_workloat@workloat.com</span>
              </header>
              <div className="ap-thread" data-thread />
              <div className="ap-compose">
                <div className="ap-field" data-field>
                  <span className="ap-clip"><svg viewBox="0 0 24 24" aria-hidden fill="currentColor"><path d="M4.666,19.63a6.765,6.765,0,0,1-.148-9.713l6.8-6.8a4.845,4.845,0,1,1,6.852,6.851l-6.8,6.8a2.992,2.992,0,0,1-4.132,0,2.927,2.927,0,0,1,0-4.133L12.673,7.2a1,1,0,0,1,1.414,1.414L8.65,14.049a.925.925,0,0,0,0,1.3.945.945,0,0,0,1.3,0l6.8-6.8a2.845,2.845,0,0,0-4.023-4.023l-6.8,6.8a4.766,4.766,0,0,0,.1,6.843,4.93,4.93,0,0,0,6.807-.273l7.984-7.984a1,1,0,1,1,1.414,1.414l-7.984,7.984A7.122,7.122,0,0,1,9.223,21.4,6.607,6.607,0,0,1,4.666,19.63Z" /></svg></span>
                  <span className="ap-text ph" data-ftext data-ph="Reply to Alfred">Reply to Alfred</span>
                  <span className="ap-send"><svg viewBox="0 0 16 16" aria-hidden><path d="M8 13V3M4 7l4-4 4 4" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" /></svg></span>
                </div>
                <span className="home-ind" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
