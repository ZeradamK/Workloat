"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import NavDock from "@/components/NavDock";
import FooterSection from "@/components/FooterSection";
import InsightsChart from "@/components/tracker/InsightsChart";
import { money } from "@/components/tracker/money";

/**
 * Enterprise page on Dropbox Enterprise's anatomy, measured from the
 * 1920px capture, in Payloat's type and palette:
 *   1. Hero: eyebrow, four-line headline, paragraph, pill left; the
 *      ledger web app (a live window mock) right, on the page's white.
 *   2. A black band: a centered two-line headline, paragraph, link, then
 *      four tiles with a title and a line under each.
 *   3. Security: centered headline, paragraph, link; then an accordion
 *      left and a photo bleeding to the right edge.
 *   4. Features on #eeeeee: centered headline, then two rows alternating
 *      photo and copy, the photos bleeding to the page edge.
 *   5. A black closer: headline, subline, four columns.
 *   6. Footer.
 */

const EASE = [0.25, 0.6, 0.2, 1] as const;
const INK = "#0a0a0a";
const MIST = "#eeeeee";

const up = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.55, ease: EASE },
} as const;

/* the page's side gutter: 61px at 1920 */
const GUTTER = "px-[clamp(20px,3.2vw,61px)]";

const DAILY = [
  0, 85, 85, 210, 210, 340, 340, 495, 640, 640, 820, 980, 980, 1210, 1385,
  1500, 1500, 1830, 2100, 2350,
];
const X_LABELS = ["Sep 01", "Sep 08", "Sep 15", "Sep 22"];

export default function EnterprisePage() {
  return (
    <main className="bg-white">
      <NavDock forceDark />
      <Hero />
      <Trust />
      <Security />
      <Features />
      <Bigger />
      <FooterSection />
    </main>
  );
}

/* ------------------------------------------------------------------ */
/* 1. Hero                                                             */
/* ------------------------------------------------------------------ */

function Hero() {
  return (
    <section className={`${GUTTER} overflow-x-clip pb-[clamp(56px,4vw,76px)] pt-[clamp(140px,8.6vw,165px)]`}>
      <div className="grid items-start gap-12 min-[1000px]:grid-cols-[minmax(0,640px)_minmax(0,1020px)] min-[1000px]:gap-[clamp(40px,3.4vw,66px)]">
        <div className="pt-[clamp(0px,0.5vw,10px)]">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="text-[15px] font-medium text-ink"
          >
            Payloat Enterprise
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: EASE, delay: 0.05 }}
            className="mt-[clamp(20px,1.7vw,32px)] max-w-[560px] text-[clamp(38px,3.2vw,61px)] font-medium leading-[1.06] tracking-[-2px] text-ink"
          >
            One ledger for every agent across the company.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: EASE, delay: 0.12 }}
            className="mt-[clamp(20px,1.6vw,30px)] max-w-[500px] text-[16px] leading-[1.5] text-ink"
          >
            Give every team&apos;s agents a mandate, a cap, and a card. Payloat
            records each purchase the moment it lands, with the task behind
            it, and rolls the company&apos;s agent spend into one ledger finance
            can read before the statement.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: EASE, delay: 0.18 }}
            className="mt-[clamp(28px,2.2vw,42px)]"
          >
            <Pill href="/contact">Contact sales</Pill>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE, delay: 0.2 }}
        >
          <LedgerWindow />
        </motion.div>
      </div>
    </section>
  );
}

/* the ledger web app, drawn live: a window with a sidebar, a toolbar of
   actions, and the company's agents as cards */
function LedgerWindow() {
  const nav = ["All agents", "Approvals", "Caps", "Receipts"];
  const folders = ["Engineering", "Growth", "Support", "Ops"];
  const agents = [
    { name: "Research agent", team: "Engineering · 12 charges", spend: 2350, chart: true },
    { name: "Ad buyer", team: "Growth · 31 charges", spend: 4120, chart: false },
    { name: "Procurement", team: "Ops · 8 charges", spend: 891.34, chart: false },
  ];
  return (
    <div
      className="overflow-hidden border border-black/[0.12] bg-white text-ink"
      style={{ aspectRatio: "1020 / 610", borderRadius: 8 }}
    >
      <div className="grid h-full grid-cols-[22%_1fr]">
        {/* sidebar */}
        <div className="border-r border-black/[0.08] p-[3.2%] text-[clamp(8px,0.75vw,13px)]" style={{ backgroundColor: "#f7f7f7" }}>
          <Image src="/payloat-app-icon-blacktile.png" alt="" width={22} height={22} className="h-[clamp(14px,1.3vw,22px)] w-[clamp(14px,1.3vw,22px)] rounded-[5px]" />
          <ul className="mt-[9%] space-y-[6%]">
            {nav.map((n, i) => (
              <li key={n} className={`flex items-center gap-2 px-2 py-1 ${i === 0 ? "bg-black/[0.06]" : ""}`} style={{ borderRadius: 4 }}>
                <span className="h-[7px] w-[7px] rounded-[2px] bg-ink/60" />
                {n}
              </li>
            ))}
          </ul>
          <p className="mt-[16%] text-ink/50">Teams</p>
          <ul className="mt-[5%] space-y-[6%] text-ink/70">
            {folders.map((f) => (
              <li key={f} className="flex items-center gap-2 px-2">
                <span className="h-[7px] w-[9px] rounded-[2px] border border-ink/40" />
                {f}
              </li>
            ))}
          </ul>
        </div>

        {/* main */}
        <div className="flex min-w-0 flex-col p-[2.6%]">
          <div className="flex items-center gap-3">
            <div className="flex h-[clamp(20px,1.7vw,30px)] flex-1 items-center gap-2 border border-black/[0.12] px-3 text-[clamp(8px,0.7vw,12px)] text-ink/50" style={{ borderRadius: 999 }}>
              <span className="h-[8px] w-[8px] rounded-full border border-ink/40" />
              Search
            </div>
            <span className="h-[clamp(14px,1.3vw,22px)] w-[clamp(14px,1.3vw,22px)] rounded-full bg-black/10" />
          </div>
          <div className="mt-[2.5%] grid grid-cols-4 gap-[1.5%]">
            {["New cap", "Import", "Add agent", "Export"].map((a, i) => (
              <span
                key={a}
                className={`flex h-[clamp(28px,2.6vw,46px)] items-end px-[8%] pb-[6%] text-[clamp(8px,0.7vw,12px)] font-medium ${i === 0 ? "text-white" : "border border-black/[0.12] text-ink"}`}
                style={{ borderRadius: 4, backgroundColor: i === 0 ? INK : undefined }}
              >
                {a}
              </span>
            ))}
          </div>
          <p className="mt-[3%] text-[clamp(9px,0.85vw,14px)] font-semibold">All agents</p>
          <div className="mt-[1.5%] flex gap-2 text-[clamp(7px,0.65vw,11px)]">
            {["This month", "Over cap"].map((t, i) => (
              <span key={t} className={`px-2 py-[2px] ${i === 0 ? "bg-black/[0.08]" : "border border-black/[0.12]"}`} style={{ borderRadius: 999 }}>
                {t}
              </span>
            ))}
          </div>
          <div className="mt-[2.5%] grid min-h-0 flex-1 grid-cols-3 gap-[2%]">
            {agents.map((a) => (
              <div key={a.name} className="flex min-h-0 flex-col border border-black/[0.1] p-[6%]" style={{ borderRadius: 6 }}>
                <div className="min-h-0 flex-1 overflow-hidden" style={{ backgroundColor: MIST, borderRadius: 4 }}>
                  {a.chart ? (
                    <>
                      {/* the chart needs room: under 700px the tile shows
                          the figure instead */}
                      <div className="hidden h-full w-full p-[6%] min-[700px]:block">
                        <InsightsChart daily={DAILY} xLabels={X_LABELS} className="h-full" />
                      </div>
                      <div className="flex h-full flex-col justify-end p-[8%] min-[700px]:hidden">
                        <span className="font-numeral text-[clamp(12px,1.4vw,24px)] font-semibold tracking-[-0.5px]">{money(a.spend)}</span>
                        <span className="text-[clamp(7px,0.6vw,10px)] text-ink/50">spent this month</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex h-full flex-col justify-end p-[8%]">
                      <span className="font-numeral text-[clamp(12px,1.4vw,24px)] font-semibold tracking-[-0.5px]">{money(a.spend)}</span>
                      <span className="text-[clamp(7px,0.6vw,10px)] text-ink/50">spent this month</span>
                    </div>
                  )}
                </div>
                <p className="mt-[6%] truncate text-[clamp(8px,0.7vw,12px)] font-medium">{a.name}</p>
                <p className="truncate text-[clamp(7px,0.6vw,10px)] text-ink/50">{a.team}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 2. Trust band                                                       */
/* ------------------------------------------------------------------ */

const TILES = [
  { mark: "SOC 2", sub: "Type II", title: "Audited controls", desc: "Access, change, and availability controls audited on a yearly cycle." },
  { mark: "Read", sub: "only", title: "Read-only bank access", desc: "Payloat reads statements through Plaid and Teller. It never holds credentials and never moves money." },
  { mark: "1", sub: "ledger", title: "One ledger, every team", desc: "Every agent charge across the company lands in the same record, with the task behind it." },
  { mark: "0", sub: "past cap", title: "Caps enforced, not warned", desc: "An agent that reaches its cap is stopped. Nothing goes through on a promise." },
];

function Trust() {
  return (
    <section className="text-white" style={{ backgroundColor: INK }}>
      <div className={`${GUTTER} mx-auto max-w-[1920px] pb-[clamp(72px,7vw,132px)] pt-[clamp(64px,5.2vw,100px)]`}>
        <motion.h2
          {...up}
          className="mx-auto max-w-[880px] text-center text-[clamp(30px,2.6vw,50px)] font-medium leading-[1.12] tracking-[-1.5px]"
          style={{ textWrap: "balance" }}
        >
          One clear message from finance teams: Payloat is where agent spend gets read.
        </motion.h2>
        <motion.p {...up} className="mx-auto mt-[clamp(16px,1.3vw,24px)] max-w-[760px] text-center text-[16px] leading-[1.5] text-white/80">
          Teams trust Payloat as the one place every agent purchase is recorded,
          matched to its receipt, and read against a cap. With the same controls
          at every team, the company closes the month from one ledger.
        </motion.p>
        <motion.div {...up} className="mt-[clamp(20px,1.6vw,30px)] flex justify-center">
          <Arrow href="/security" light>
            Read the security overview
          </Arrow>
        </motion.div>

        <div className="mx-auto mt-[clamp(56px,5.5vw,106px)] grid max-w-[1520px] gap-8 min-[700px]:grid-cols-2 min-[1000px]:grid-cols-4 min-[1000px]:gap-[clamp(24px,3vw,59px)]">
          {TILES.map((t, i) => (
            <motion.div key={t.title} {...up} transition={{ ...up.transition, delay: i * 0.06 }}>
              <div className="flex aspect-square flex-col items-center justify-center text-ink" style={{ backgroundColor: MIST }}>
                {/* the badge: a shield with the mark inside */}
                <div className="flex h-[62%] w-[52%] flex-col items-center justify-center border-[3px] border-ink bg-white" style={{ borderRadius: "6px 6px 50% 50% / 6px 6px 22% 22%" }}>
                  <span className="font-numeral text-[clamp(26px,2.4vw,46px)] font-bold leading-none tracking-[-1.5px]">{t.mark}</span>
                  <span className="mt-2 px-3 py-1 text-[clamp(10px,0.8vw,14px)] font-bold uppercase tracking-[1px] text-white" style={{ backgroundColor: INK }}>
                    {t.sub}
                  </span>
                </div>
              </div>
              <p className="mt-5 text-[18px] font-semibold">{t.title}</p>
              <p className="mt-2 text-[15px] leading-[1.45] text-white/75">{t.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* 3. Security                                                         */
/* ------------------------------------------------------------------ */

const SEC = [
  {
    title: "Read-only by design",
    body: "Payloat reads bank and card activity through Plaid and Teller and never holds a credential. It cannot move money, and it cannot be made to.",
  },
  {
    title: "Keys you can revoke in one tap",
    body: "Each agent writes with its own key. Pause an agent or revoke its key from the ledger and every write stops that second, with the history kept.",
  },
  {
    title: "An audit trail for every charge",
    body: "Every charge carries the agent, the task, the cap it was read against, and who approved anything over it. Export the trail whenever an auditor asks.",
  },
];

function Security() {
  const [open, setOpen] = useState(0);
  return (
    <section className="overflow-x-clip bg-white">
      <div className={`${GUTTER} pt-[clamp(64px,5.7vw,110px)]`}>
        <motion.h2
          {...up}
          className="mx-auto max-w-[900px] text-center text-[clamp(30px,2.6vw,50px)] font-medium leading-[1.12] tracking-[-1.5px] text-ink"
          style={{ textWrap: "balance" }}
        >
          Security isn&apos;t a feature. It&apos;s the ground the ledger stands on.
        </motion.h2>
        <motion.p {...up} className="mx-auto mt-[clamp(16px,1.3vw,24px)] max-w-[760px] text-center text-[16px] leading-[1.5] text-ink">
          Payloat helps teams run agents safely. Key, cap, and approval controls
          make sure nothing gets bought that you did not allow, and nothing gets
          read by anyone you did not name.
        </motion.p>
        <motion.div {...up} className="mt-[clamp(20px,1.6vw,30px)] flex justify-center">
          <Arrow href="/security">Read the security overview</Arrow>
        </motion.div>
      </div>

      <div className="mt-[clamp(48px,4.5vw,86px)] grid min-[900px]:grid-cols-2">
        {/* the accordion */}
        <div className={`${GUTTER} flex items-center py-[clamp(24px,2.5vw,48px)] min-[900px]:pr-[clamp(40px,5.7vw,110px)]`}>
          <ul className="w-full">
            {SEC.map((s, i) => (
              <li key={s.title} className="border-b border-black/[0.12]">
                <button
                  type="button"
                  onClick={() => setOpen(i)}
                  className="flex w-full items-center justify-between py-[clamp(18px,1.5vw,28px)] text-left text-[16px] font-semibold text-ink"
                >
                  {s.title}
                  <motion.svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden initial={false} animate={{ rotate: open === i ? 180 : 0 }}>
                    <path d="M3 5.5 8 10.5l5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </motion.svg>
                </button>
                <AnimatePresence initial={false}>
                  {open === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: EASE }}
                      className="overflow-hidden"
                    >
                      <p className="max-w-[560px] pb-4 text-[15px] leading-[1.55] text-ink">{s.body}</p>
                      <div className="pb-[clamp(18px,1.5vw,28px)]">
                        <Arrow href="/security">Learn more</Arrow>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            ))}
          </ul>
        </div>
        {/* the photo, bleeding to the right edge */}
        <div className="relative h-[clamp(320px,27vw,520px)]">
          <Image src="/enterprise/security.jpg" alt="" fill sizes="(min-width: 900px) 50vw, 100vw" className="object-cover" />
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* 4. Features                                                         */
/* ------------------------------------------------------------------ */

const ROWS = [
  {
    eyebrow: "Team management",
    title: "One policy for every team, set once",
    paras: [
      "Bringing a team onto Payloat is quick and controlled. Name the team, set its caps, and invite the people who approve.",
      "Every agent the team runs inherits the policy. Move an agent between teams, and its ledger moves with it.",
    ],
    photo: "/enterprise/teams.jpg",
    photoLeft: true,
    cta: null,
  },
  {
    eyebrow: "Records and retention",
    title: "Records that outlast the agent that made them",
    paras: [
      "Every charge, receipt, and approval is kept for as long as your policy says, with the task behind it. Retire an agent and its record stays readable.",
      "So if auditors come with questions, or a client wants to see a two-year-old purchase, the answer is one search away.",
    ],
    photo: "/enterprise/governance.jpg",
    photoLeft: false,
    cta: { label: "Explore retention", href: "/security" },
  },
];

function Features() {
  return (
    <section className="overflow-x-clip" style={{ backgroundColor: MIST }}>
      <motion.h2
        {...up}
        className={`${GUTTER} pt-[clamp(64px,5.7vw,110px)] text-center text-[clamp(30px,2.6vw,50px)] font-medium leading-[1.12] tracking-[-1.5px] text-ink`}
      >
        Built for enterprise finance teams
      </motion.h2>
      <div className="mt-[clamp(40px,4vw,76px)]">
        {ROWS.map((r) => (
          <div key={r.title} className="grid min-[900px]:grid-cols-[61.3fr_38.7fr]">
            <div className={`relative h-[clamp(320px,47vw,915px)] ${r.photoLeft ? "" : "min-[900px]:order-2"}`}>
              <Image src={r.photo} alt="" fill sizes="(min-width: 900px) 61vw, 100vw" className="object-cover" />
            </div>
            <div className={`flex items-center ${GUTTER} py-[clamp(40px,4vw,76px)] ${r.photoLeft ? "min-[900px]:pl-[clamp(32px,3.3vw,64px)]" : "min-[900px]:order-1 min-[900px]:pl-[clamp(40px,7.5vw,145px)]"}`}>
              <div className="max-w-[460px]">
                <p className="text-[13px] font-semibold text-ink">{r.eyebrow}</p>
                <h3 className="mt-3 text-[clamp(24px,1.6vw,30px)] font-medium leading-[1.2] tracking-[-0.8px] text-ink">{r.title}</h3>
                {r.paras.map((p) => (
                  <p key={p} className="mt-5 text-[15px] leading-[1.55] text-ink">{p}</p>
                ))}
                {r.cta && (
                  <div className="mt-8">
                    <Link
                      href={r.cta.href}
                      className="inline-flex h-12 items-center gap-6 border border-ink px-6 text-[14px] font-medium text-ink transition-colors hover:bg-ink hover:text-white"
                    >
                      {r.cta.label}
                      <ArrowGlyph />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* 5. Bigger                                                           */
/* ------------------------------------------------------------------ */

const COLS = [
  ["Teams", "Every team on one ledger, each with its own caps and approvers."],
  ["Caps", "Per agent, per vendor, per month. Enforced on the charge, not after it."],
  ["Approvals", "Anything over a cap waits for the budget owner, in Slack, with the context to decide."],
  ["Exports", "The month's ledger, receipts, and approvals, ready for the close and the audit."],
];

function Bigger() {
  return (
    <section className="text-white" style={{ backgroundColor: INK }}>
      <div className={`${GUTTER} mx-auto max-w-[1920px] pb-[clamp(64px,5.7vw,110px)] pt-[clamp(64px,5.7vw,110px)]`}>
        <motion.h2
          {...up}
          className="mx-auto max-w-[900px] text-center text-[clamp(30px,2.6vw,50px)] font-medium leading-[1.12] tracking-[-1.5px]"
          style={{ textWrap: "balance" }}
        >
          Payloat Enterprise: like Payloat, but company-wide
        </motion.h2>
        <motion.p {...up} className="mt-[clamp(14px,1.1vw,20px)] text-center text-[15px] text-white/80">
          Do everything you would normally do with Payloat, and more:
        </motion.p>
        <div className="mx-auto mt-[clamp(48px,5.4vw,104px)] grid max-w-[1520px] gap-10 min-[700px]:grid-cols-2 min-[1000px]:grid-cols-4 min-[1000px]:gap-[clamp(24px,3vw,59px)]">
          {COLS.map(([t, d], i) => (
            <motion.div key={t} {...up} transition={{ ...up.transition, delay: i * 0.06 }}>
              <p className="text-[20px] font-semibold">{t}</p>
              <p className="mt-2 max-w-[330px] text-[15px] leading-[1.45] text-white/75">{d}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Shared                                                              */
/* ------------------------------------------------------------------ */

function Pill({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex h-14 items-center gap-8 px-7 text-[15px] font-medium text-white transition-transform hover:scale-[1.02] active:scale-[0.98]"
      style={{ backgroundColor: INK, borderRadius: 8 }}
    >
      {children}
      <ArrowGlyph />
    </Link>
  );
}

function Arrow({ href, children, light = false }: { href: string; children: React.ReactNode; light?: boolean }) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-2 text-[15px] font-medium underline underline-offset-[5px] transition-opacity hover:opacity-70 ${light ? "text-white" : "text-ink"}`}
    >
      {children}
      <ArrowGlyph />
    </Link>
  );
}

function ArrowGlyph() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M2.5 8h11m0 0L8.8 3.3M13.5 8l-4.7 4.7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
