"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";

/**
 * The compatibility grid and the pricing row, shared by the enterprise
 * page and the home page. Both sit on #eeeeee in the site's ruled grid.
 */

const EASE = [0.25, 0.6, 0.2, 1] as const;
const INK = "#0a0a0a";
const MIST = "#eeeeee";
const GREEN = "#163300";
const LIME = "#9fe870";

const up = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.55, ease: EASE },
} as const;

/* the side gutter: 52px at 1920 */
const GUTTER = "px-[clamp(20px,2.7vw,52px)]";

/* the grid's small crosshair where a rule meets a rail */
function Cross({ pos }: { pos: "top-left" | "bottom-right" }) {
  const at = pos === "top-left" ? "-left-[7px] -top-[7px]" : "-bottom-[7px] -right-[7px]";
  return (
    <span className={`pointer-events-none absolute z-10 h-[13px] w-[13px] ${at}`} aria-hidden>
      <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-black/40" />
      <span className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-black/40" />
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* 3. Compatible                                                       */
/* ------------------------------------------------------------------ */

/* the companies, in the order the grid reads (five across, three down).
   h is each mark's largest height, set by eye so a square monogram and
   a long wordmark carry the same weight in their cells; it holds from
   1600px up and scales down with the viewport, never below 62% */
type Mark = { src: string; alt: string; h: number };
const STACK: Mark[] = [
  { src: "/logos/openai.svg", alt: "OpenAI", h: 40 },
  { src: "/logos/salesforce.png", alt: "Salesforce", h: 46 },
  { src: "/logos/accenture.png", alt: "Accenture", h: 34 },
  { src: "/logos/aws.svg", alt: "AWS", h: 44 },
  { src: "/logos/deloitte.png", alt: "Deloitte", h: 36 },
  { src: "/logos/stripe-wordmark.svg", alt: "Stripe", h: 34 },
  { src: "/logos/pwc.png", alt: "PwC", h: 38 },
  { src: "/logos/claude.svg", alt: "Claude", h: 36 },
  { src: "/logos/oracle.svg", alt: "Oracle", h: 21 },
  { src: "/logos/brex.svg", alt: "Brex", h: 30 },
  { src: "/logos/vercel.svg", alt: "Vercel", h: 30 },
  { src: "/logos/banks/capitalone.svg", alt: "Capital One", h: 34 },
  { src: "/logos/workday.svg", alt: "Workday", h: 36 },
  { src: "/logos/banks/citi.png", alt: "Citi", h: 36 },
  { src: "/logos/ramp.svg", alt: "Ramp", h: 30 },
];

/* the dashed rule the whole section is drawn in */
const DASH = "border-dashed border-black/[0.18]";

/** A full-bleed dashed rule: it runs past the rails to the page's edges. */
function Bleed({ at }: { at: "top" | "bottom" }) {
  return (
    <span
      aria-hidden
      className={`pointer-events-none absolute -left-[100vw] -right-[100vw] h-0 border-t ${DASH} ${at === "top" ? "top-0" : "bottom-0"}`}
    />
  );
}

/**
 * Compatible: the logo wall on Mora's anatomy (Mobbin). Two dashed rails
 * run the section's full height; a caption row sits between two rules
 * that run edge to edge; below it the logos fill a grid of dashed cells,
 * five across on a wide screen and three on a phone, every mark in black.
 */
export function Compatible() {
  return (
    /* clear ground above and below the ruled block: 150px on a wide
       screen, easing down to 56px on a phone */
    <section className="overflow-x-clip py-[clamp(56px,7.8vw,150px)]" style={{ backgroundColor: MIST }}>
      <div className={`relative mx-auto w-[calc(100%-2*clamp(20px,7.7vw,148px))] max-w-[1624px] border-x ${DASH} pb-[clamp(20px,1.6vw,28px)] pt-[clamp(28px,3vw,56px)]`}>
        <motion.div {...up} className="relative">
          <Bleed at="top" />
          <h2 className="px-4 py-[clamp(18px,1.6vw,24px)] text-center text-[clamp(14px,0.95vw,18px)] tracking-[-0.1px] text-black/55">
            Compatible with every enterprise company running agents
          </h2>
          <Bleed at="bottom" />
        </motion.div>

        <motion.div {...up} className="relative">
          <ul className="grid grid-cols-3 min-[800px]:grid-cols-5" aria-label="Companies">
            {STACK.map((l, k) => (
              <li
                key={l.alt}
                className={`flex h-[clamp(72px,4.75vw,92px)] items-center justify-center border-b ${DASH} ${k % 3 ? "max-[799px]:border-l" : ""} ${k % 5 ? "min-[800px]:border-l" : ""} ${k >= STACK.length - 5 ? "min-[800px]:border-b-0" : ""} ${k >= STACK.length - 3 ? "max-[799px]:border-b-0" : ""}`}
              >
                <Image
                  src={l.src}
                  alt={l.alt}
                  width={160}
                  height={48}
                  className="w-auto max-w-[70%] object-contain brightness-0"
                  style={{ height: `clamp(${Math.round(l.h * 0.62)}px, ${((l.h / 1600) * 100).toFixed(3)}vw, ${l.h}px)` }}
                />
              </li>
            ))}
          </ul>
          <Bleed at="bottom" />
        </motion.div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* 4. Pricing                                                          */
/* ------------------------------------------------------------------ */

const PLANS: {
  name: string;
  blurb: string;
  price: string | null;
  cents?: string;
  per: string[];
  cta: string;
  href: string;
  tone: "dark" | "lime";
  popular?: boolean;
  featuresHead: string;
  features: { text: string; paid?: boolean }[];
}[] = [
  {
    name: "Free",
    blurb: "Get one agent on the ledger",
    price: "$0",
    per: ["for one agent"],
    cta: "Get started free",
    href: "/signup",
    tone: "dark",
    featuresHead: "Free features:",
    features: [
      { text: "1 agent and unlimited purchases" },
      { text: "Every charge with the task behind it" },
      { text: "Receipts matched to the cent" },
      { text: "One connected bank or card" },
      { text: "Monthly summary" },
      { text: "Slack notifications" },
    ],
  },
  {
    name: "Team",
    blurb: "Run a team's agents against shared caps",
    price: "$49",
    per: ["per team / month", "billed annually"],
    cta: "Buy Team",
    href: "/signup",
    tone: "dark",
    featuresHead: "All Free features, plus:",
    features: [
      { text: "Unlimited agents in the team" },
      { text: "Caps per agent, vendor, and month" },
      { text: "Approvals in Slack" },
      { text: "Unlimited banks and cards" },
      { text: "Month-end close drafted by Payle" },
      { text: "Email and chat support" },
    ],
  },
  {
    name: "Business",
    blurb: "Every team on one ledger with the security of SSO",
    price: "$149",
    per: ["per team / month", "billed annually"],
    cta: "Buy Business",
    href: "/signup",
    tone: "lime",
    popular: true,
    featuresHead: "All Team features, plus:",
    features: [
      { text: "Single sign-on (SAML 2.0)" },
      { text: "Company-wide budgets and rollups" },
      { text: "Audit trail export" },
      { text: "Priority support" },
      { text: "Flexible payment options" },
    ],
  },
  {
    name: "Enterprise",
    blurb: "Multiple ledgers with enterprise-grade controls and a named team",
    price: null,
    per: ["Contact for pricing"],
    cta: "Contact us",
    href: "/contact",
    tone: "dark",
    featuresHead: "All Business features, plus:",
    features: [
      { text: "Multiple ledgers and workspaces" },
      { text: "Advanced security and admin controls" },
      { text: "SCIM user and group management" },
      { text: "Audit logs, reports, and reporting APIs" },
      { text: "Require 2FA for members" },
      { text: "Data residency" },
      { text: "Bring your own key", paid: true },
      { text: "Premier support", paid: true },
      { text: "Onboarding for every team", paid: true },
    ],
  },
];

export function Pricing() {
  return (
    <section className="overflow-x-clip" style={{ backgroundColor: MIST }}>
      <div className={`${GUTTER} pb-[clamp(40px,2.7vw,52px)] pt-[clamp(20px,1.9vw,36px)]`}>
        {/* the four plans as cells on one ruled row */}
        <div className="relative grid border border-black/[0.12] min-[700px]:grid-cols-2 min-[1100px]:grid-cols-4">
          <span className="pointer-events-none absolute -left-6 -right-6 -top-px h-px bg-black/[0.12]" />
          <span className="pointer-events-none absolute -bottom-px -left-6 -right-6 h-px bg-black/[0.12]" />
          <Cross pos="top-left" />
          <Cross pos="bottom-right" />
          {PLANS.map((p, k) => (
            <motion.div
              key={p.name}
              {...up}
              transition={{ ...up.transition, delay: k * 0.06 }}
              className={[
                "relative flex flex-col bg-white p-[clamp(24px,1.8vw,34px)] border-black/[0.12]",
                k > 0 ? "border-t" : "",
                k % 2 === 1 ? "min-[700px]:border-l" : "",
                k >= 2 ? "min-[700px]:border-t" : "min-[700px]:border-t-0",
                k > 0 ? "min-[1100px]:border-l" : "",
                "min-[1100px]:border-t-0",
              ].join(" ")}
            >
              {p.popular && <span className="pointer-events-none absolute inset-0 border-[3px]" style={{ borderColor: GREEN }} />}
              <div className="flex items-center gap-3">
                <h3 className="text-[clamp(28px,1.9vw,36px)] font-medium tracking-[-1px] text-ink">{p.name}</h3>
                {p.popular && (
                  <span className="px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.5px] text-ink" style={{ backgroundColor: LIME }}>
                    Most popular
                  </span>
                )}
              </div>
              <p className="mt-[clamp(16px,1.5vw,28px)] min-h-[3.2em] text-[clamp(15px,1vw,19px)] leading-[1.45] text-ink">{p.blurb}</p>

              <div className="mt-[clamp(24px,2.5vw,48px)]">
                {p.price ? (
                  <p className="flex items-baseline gap-2 text-ink">
                    <span className="font-numeral text-[clamp(36px,2.4vw,46px)] font-semibold tracking-[-1.5px]" style={p.popular ? { color: GREEN } : undefined}>
                      {p.price}
                    </span>
                    <span className="text-[17px] font-semibold" style={p.popular ? { color: GREEN } : undefined}>USD</span>
                  </p>
                ) : (
                  <span className="block h-[46px] w-[46px]" aria-hidden>
                    <svg viewBox="0 0 46 46" fill="none" className="h-full w-full">
                      <rect x="3" y="6" width="28" height="20" rx="3" fill={INK} />
                      <rect x="15" y="16" width="28" height="20" rx="3" fill={INK} stroke="#ffffff" strokeWidth="2" />
                    </svg>
                  </span>
                )}
                {p.per.map((line, j) => (
                  <p key={line} className={`text-[16px] text-ink ${j === 0 ? "mt-2 font-semibold" : ""}`}>
                    {line}
                    {j === 1 && (
                      <span className="ml-3 inline-flex items-center gap-2 align-middle text-sub">
                        <span className="relative inline-block h-[20px] w-[36px] rounded-full" style={{ backgroundColor: INK }}>
                          <span className="absolute left-[2px] top-[2px] h-[16px] w-[16px] rounded-full bg-white" />
                        </span>
                        monthly
                      </span>
                    )}
                  </p>
                ))}
              </div>

              <div className="mt-[clamp(20px,1.8vw,34px)]">
                <ArrowButton href={p.href} tone={p.tone}>
                  {p.cta}
                </ArrowButton>
              </div>

              <div className="mt-[clamp(28px,2.2vw,42px)] h-[4px]" style={{ backgroundColor: INK }} />
              <p className="mt-[clamp(28px,2.4vw,46px)] text-[clamp(20px,1.4vw,26px)] text-ink">{p.featuresHead}</p>
              <ul className="mt-5 space-y-3">
                {p.features.map((f) => (
                  <li key={f.text} className="flex items-start gap-3 text-[16px] leading-[1.3] text-ink">
                    <span className="mt-[3px] flex h-[16px] w-[16px] shrink-0 items-center justify-center" style={{ color: GREEN }}>
                      {f.paid ? (
                        <span className="font-numeral text-[16px] font-bold leading-none">$</span>
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                          <path d="M2.5 8.5 6 12l7.5-8" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </span>
                    {f.text}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* the split button: a square arrow block on the left, the label on a
   filled body */
export function ArrowButton({ href, children, tone = "dark" }: { href: string; children: React.ReactNode; tone?: "dark" | "lime" | "light" | "pale" | "inverse" | "white" }) {
  const lime = tone === "lime";
  const light = tone === "light";
  /* pale: an #eeeeee arrow block with a dark chevron, a white body;
     inverse: a white arrow block with a dark chevron, an #eeeeee body */
  const pale = tone === "pale";
  const inverse = tone === "inverse";
  /* white: a black arrow block, a white body, for #eeeeee grounds */
  const white = tone === "white";
  return (
    <Link href={href} className="group inline-flex h-[60px] items-stretch text-[clamp(16px,1.15vw,22px)] transition-transform hover:scale-[1.02] active:scale-[0.98]">
      <span className="flex w-[60px] items-center justify-center" style={{ backgroundColor: lime ? GREEN : pale ? MIST : inverse ? "#ffffff" : INK }}>
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
          <path d="M5 2.5 10.5 8 5 13.5" stroke={pale || inverse ? INK : "#ffffff"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <span
        className="flex items-center px-8"
        style={{ backgroundColor: lime ? LIME : light ? "#1e1e1e" : inverse ? MIST : pale || white ? "#ffffff" : "#2c2c2c", color: lime || pale || inverse || white ? INK : "#ffffff" }}
      >
        {children}
      </span>
    </Link>
  );
}
