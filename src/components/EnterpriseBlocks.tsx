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

const STACK = [
  { src: "/logos/openai.svg", alt: "OpenAI" },
  { src: "/logos/aws.svg", alt: "AWS" },
  { src: "/logos/stripe-wordmark.svg", alt: "Stripe", low: true },
  { src: "/logos/oracle.svg", alt: "Oracle", low: true },
  { src: "/logos/brex.svg", alt: "Brex" },
  { src: "/logos/claude.svg", alt: "Claude" },
  { src: "/logos/vercel.svg", alt: "Vercel" },
  { src: "/logos/banks/capitalone.svg", alt: "Capital One", low: true },
  { src: "/logos/banks/citi.png", alt: "Citi" },
];

export function Compatible() {
  return (
    <section className="overflow-x-clip" style={{ backgroundColor: MIST }}>
      <div className={`${GUTTER} grid items-center gap-12 py-[clamp(64px,5.3vw,102px)] min-[900px]:grid-cols-[847fr_973fr] min-[900px]:gap-[clamp(32px,2.7vw,52px)]`}>
        <div>
          <motion.h2 {...up} className="max-w-[720px] text-[clamp(32px,2.9vw,56px)] font-medium leading-[1.12] tracking-[-1.8px] text-ink">
            Compatible with every enterprise company running agents
          </motion.h2>
          <motion.div {...up} className="mt-[clamp(28px,2.6vw,50px)]">
            <ArrowButton href="/contact">Book a demo</ArrowButton>
          </motion.div>
        </div>

        {/* the 3x3 ruled grid */}
        <motion.div {...up} className="relative grid grid-cols-3 border border-black/[0.12] bg-transparent">
          <span className="pointer-events-none absolute -left-6 -right-6 -top-px h-px bg-black/[0.12]" />
          <span className="pointer-events-none absolute -bottom-px -left-6 -right-6 h-px bg-black/[0.12]" />
          <Cross pos="top-left" />
          <Cross pos="bottom-right" />
          {STACK.map((l, k) => (
            <div
              key={l.alt}
              className={`flex h-[clamp(80px,6.8vw,130px)] items-center justify-center border-black/[0.12] ${k % 3 ? "border-l" : ""} ${k >= 3 ? "border-t" : ""}`}
            >
              <Image
                src={l.src}
                alt={l.alt}
                width={140}
                height={40}
                className={`w-auto brightness-0 ${l.low ? "h-[clamp(12px,1vw,20px)]" : "h-[clamp(22px,1.9vw,36px)]"}`}
              />
            </div>
          ))}
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
