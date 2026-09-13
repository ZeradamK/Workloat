"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  AnimatePresence,
  animate,
  motion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import NavDock from "@/components/NavDock";
import FooterSection from "@/components/FooterSection";
import { productLight } from "@/components/introProgress";

/**
 * Product page, Cash App outsmart-scams anatomy: massive H1, a hero canvas
 * with a corner paragraph, then alternating rows of eyebrow + large copy
 * against big rounded media canvases. Canvases marked `visual: null` are
 * reserved for supplied motion assets (shader / video / 3D) and ship as
 * clean color fields until then. Nav Product sub-items anchor to each row.
 */

const EASE = [0.25, 0.6, 0.2, 1] as const;

type Row = {
  slug: string;
  copy: string;
  bg: string;
  visual: React.ReactNode | null;
  cta?: { label: string; href: string };
};

/* click-to-expand tabs (Ramp flexible-card affordance in our bar anatomy) */
type Tab = {
  logo: string;
  name: string;
  note: string;
  amount: string;
  details: [string, string][];
  pill?: { label: string; tone: "green" | "ink" };
  /** the bar's ground and, on dark grounds, white type */
  bg?: string;
  dark?: boolean;
};

/* the notification bars carry the goal act's grounds per charge; on the
   gray canvases the two #eeeeee ones read as white */
const PURCHASE_TABS: Tab[] = [
  {
    logo: "/logos/openai.svg",
    name: "OpenAI",
    note: "API usage, Software agent",
    amount: "$2,500.00",
    details: [
      ["Task", "Support replies, September"],
      ["Cap", "$3,000"],
      ["Receipt", "Matched"],
    ],
    pill: { label: "Under cap", tone: "ink" },
  },
  {
    logo: "/logos/vercel.svg",
    name: "Vercel",
    note: "Hosting, Ops agent",
    amount: "$350.00",
    bg: "#0a0a0a",
    dark: true,
    details: [
      ["Task", "Pro seats and bandwidth"],
      ["Cap", "$400"],
      ["Receipt", "Matched"],
    ],
    pill: { label: "Under cap", tone: "ink" },
  },
  {
    logo: "/logos/claude.svg",
    name: "Claude",
    note: "Seats, Software agent",
    amount: "$4,000.00",
    bg: "#eae2d6",
    details: [
      ["Task", "Team plan, 20 seats"],
      ["Cap", "$3,000"],
      ["Receipt", "Matched"],
    ],
    pill: { label: "Over cap by $1,000", tone: "ink" },
  },
];

const RECEIPT_TABS: Tab[] = [
  {
    logo: "/logos/stripe.png",
    name: "Stripe",
    note: "Receipt matched Sep 3",
    amount: "$600.00",
    bg: "#fff5f5",
    details: [
      ["Recorded", "$600.00"],
      ["Receipt", "$600.00"],
    ],
    pill: { label: "Matched", tone: "green" },
  },
  {
    logo: "/logos/aws.svg",
    name: "AWS",
    note: "Receipt still missing",
    amount: "$850.00",
    bg: "#2e6fa0",
    dark: true,
    details: [
      ["Recorded", "Sep 8"],
      ["Expected by", "Sep 12"],
    ],
    pill: { label: "No receipt yet", tone: "ink" },
  },
];

const ROWS: Row[] = [
  {
    slug: "agent-purchases",
    copy: "Every agent purchase, recorded with the task behind it. Payloat Ledger keeps the merchant, the amount, the cap the agent was given, and what it was asked to do, so no purchase is a mystery.",
    bg: "#eeeeee",
    visual: <ClickTabs tabs={PURCHASE_TABS} />,
  },
  {
    slug: "receipt-matching",
    copy: "A receipt that never matches is money lost. Payloat Ledger checks every receipt against what the agent recorded and flags the ones that are missing or wrong.",
    bg: "#eeeeee",
    visual: <ClickTabs tabs={RECEIPT_TABS} />,
  },
  {
    slug: "cap-alerts",
    copy: "The moment an agent spends past the cap it was given, Payloat Ledger flags it, to the agent and to whoever owns it, before the month closes.",
    bg: "#eeeeee",
    cta: { label: "Get Payloat Ledger", href: "/signup" },
    visual: (
      <div className="w-full max-w-[360px] space-y-2.5">
        <Bar
          logo="/logos/claude.svg"
          name="Claude"
          note="Renews tomorrow"
          amount="$4,000.00"
          bg="#eae2d6"
        />
        <div className="flex items-center gap-3 rounded-[18px] bg-[#0a0a0a] py-[6px] pl-[6px] pr-2.5">
          <span className="flex h-[43px] w-[43px] shrink-0 items-center justify-center rounded-[11px] bg-white text-[20px] font-bold text-ink">
            !
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[16px] font-semibold text-white">
              Cap alert
            </span>
            <span className="block text-[13px] leading-snug text-white/60">
              Software &amp; seats went $1,000 over its cap
            </span>
          </span>
        </div>
      </div>
    ),
  },
  {
    slug: "subscriptions",
    copy: "Every subscription an agent holds, seen before it renews. Keep or drop, but always on purpose.",
    bg: "#eeeeee",
    visual: (
      <div className="w-full max-w-[360px] space-y-2.5">
        <Bar
          logo="/logos/vercel.svg"
          name="Vercel"
          note="Hosting, renews Friday"
          amount="$350.00"
          bg="#0a0a0a"
          dark
        />
        <Bar
          logo="/logos/stripe.png"
          name="Stripe"
          note="Platform fees, monthly"
          amount="$600.00"
          bg="#fff5f5"
        />
      </div>
    ),
  },
  {
    slug: "security",
    copy: "Locked to your organization and encrypted end to end. Payloat Ledger reads what agents record, and it never moves your money.",
    bg: "#0a0a0a",
    cta: { label: "Learn about security", href: "/security" },
    visual: (
      <div className="flex flex-col items-center gap-6">
        <div className="relative h-[92px] w-[184px] rounded-full bg-[#d6f251]">
          <span className="absolute right-1.5 top-1.5 flex h-[80px] w-[80px] items-center justify-center rounded-full bg-white">
            <svg
              width="30"
              height="30"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#0a0a0a"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <rect x="5" y="10.5" width="14" height="9.5" rx="2.5" />
              <path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" />
            </svg>
          </span>
        </div>
        <span className="text-[16px] font-medium text-white">Pause agent</span>
      </div>
    ),
  },
  {
    slug: "privacy-and-data",
    copy: "Your data belongs to your company. It is never sold, and you can revoke any agent key at any time.",
    bg: "#eeeeee",
    visual: (
      <svg
        width="190"
        height="190"
        viewBox="0 0 48 48"
        fill="none"
        stroke="#0a0a0a"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M24 5 8 10.5v10C8 31 14.5 39.3 24 43c9.5-3.7 16-12 16-22.5v-10L24 5Z" />
        <path d="m16.5 24 5.5 5.5 10-11" />
      </svg>
    ),
  },
];

export default function ProductPage() {
  /* while the fixed dock (viewport band ~15–68px) overlaps the black hero
     canvas, zip the dock to #EEEEEE in 50ms; zip back once it passes */
  const heroRef = useRef<HTMLDivElement>(null);
  const litRef = useRef(false);

  useEffect(() => {
    const onScroll = () => {
      const r = heroRef.current?.getBoundingClientRect();
      if (!r) return;
      const overlap = r.top < 68 && r.bottom > 15;
      if (overlap !== litRef.current) {
        litRef.current = overlap;
        animate(productLight, overlap ? 1 : 0, {
          duration: 0.05,
          ease: "easeOut",
        });
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      productLight.set(0);
    };
  }, []);

  return (
    <main className="bg-white">
      <NavDock forceDark />

      <section className="mx-auto max-w-[1200px] px-6 pb-[clamp(96px,11vw,176px)] pt-[170px]">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="mb-4 text-[15px] text-sub"
        >
          Product intro
        </motion.p>
        {/* massive display headline, outsmart-scams scale */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: EASE }}
          className="text-[clamp(48px,7.5vw,96px)] font-medium leading-[1.02] tracking-[-3px] text-ink"
        >
          Everything Payloat Ledger
          <br />
          sees after an agent pays
        </motion.h1>

        {/* hero canvas: the glowing card render, corner paragraph on top */}
        <motion.div
          ref={heroRef}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: EASE, delay: 0.1 }}
          className="relative mt-12 min-h-[420px] overflow-hidden rounded-[32px] p-8 min-[900px]:min-h-[600px] min-[900px]:p-12"
          style={{ backgroundColor: "#000000" }}
        >
          {/* smaller than native so it never upscales; its black field
              blends into the canvas */}
          <Parallax
            amount={26}
            className="absolute bottom-0 right-0 w-[min(62%,820px)]"
          >
            <Image
              src="/product-hero-card.jpg"
              alt=""
              width={1672}
              height={941}
              priority
              className="h-auto w-full"
            />
          </Parallax>
          <p className="relative max-w-[460px] text-[clamp(20px,2vw,26px)] leading-[1.35] tracking-[-0.5px] text-white">
            Purchases, subscriptions, orders, and travel, recorded by your
            agents and checked before the receipts land.
          </p>
        </motion.div>


        {/* Fluz "It works" anatomy: centered display headline + two moment
            canvases */}
        <div className="mt-[clamp(96px,11vw,176px)]">
          <h2 className="text-center text-[clamp(34px,4.5vw,64px)] font-medium leading-[1.05] tracking-[-2px] text-ink">
            From the agent or
            <br />
            from the card. It works.
          </h2>
          <p className="mx-auto mt-4 max-w-[440px] text-center text-[15px] leading-[1.5] text-sub">
            Payloat Ledger takes what agents record and what cards charge,
            and lines them up.
          </p>

          <div className="mt-12 grid gap-5 min-[900px]:grid-cols-2">
            <Parallax amount={32}>
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.55, ease: EASE }}
              className="relative flex h-[400px] items-center justify-center rounded-[32px] min-[900px]:h-[460px]"
              style={{ backgroundColor: "#eeeeee" }}
            >
              <div className="relative w-[min(320px,80%)]">
                <Bar
                  logo="/logos/openai.svg"
                  name="OpenAI"
                  note="API usage this month"
                  amount="$2,500.00"
                />
                <div className="absolute -bottom-10 right-3 flex items-center gap-1.5">
                  <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
                    <path
                      d="M5.5 3.5 18 12l-5.3 1 2.9 5.4-2.7 1.4-2.9-5.5-4.5 3.2V3.5Z"
                      fill="#0a0a0a"
                      stroke="#fff"
                      strokeWidth="1.4"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="rounded-full bg-[#0a0a0a] px-3 py-1.5 text-[12px] font-semibold text-white">
                    Recorded
                  </span>
                </div>
              </div>
            </motion.div>
            </Parallax>

            <Parallax amount={52}>
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.55, ease: EASE, delay: 0.08 }}
              className="relative flex h-[400px] items-center justify-center overflow-hidden rounded-[32px] min-[900px]:h-[460px]"
            >
              <Image
                src="/payloat-card-gradient.png"
                alt=""
                fill
                sizes="(min-width: 900px) 590px, 100vw"
                className="object-cover"
              />
              <div className="relative h-[210px] w-[min(340px,80%)] rounded-[22px] bg-[#0d0d0d] p-5">
                <div className="flex items-start justify-between">
                  <span className="font-numeral text-[14px] font-semibold text-white/80">
                    •••• 3346
                  </span>
                  <span className="text-[14px] font-bold italic tracking-tight text-white/80">
                    VISA
                  </span>
                </div>
                <span className="absolute bottom-5 left-5 text-[26px] font-bold tracking-[-0.5px] text-white">
                  Payloat
                </span>
              </div>
            </motion.div>
            </Parallax>
          </div>
        </div>

        {/* alternating feature rows */}
        {ROWS.map((r, i) => {
          const mediaLeft = i % 2 === 1;
          return (
            <motion.article
              key={r.slug}
              id={r.slug}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.55, ease: EASE }}
              className="mt-[clamp(72px,9vw,144px)] grid items-center gap-6 scroll-mt-[110px] min-[900px]:grid-cols-2"
            >
              <Parallax
                amount={14}
                className={`px-2 py-4 min-[900px]:px-[60px] ${
                  mediaLeft ? "min-[900px]:order-2" : ""
                }`}
              >
                <p className="max-w-[480px] text-[clamp(24px,2.6vw,34px)] font-medium leading-[1.25] tracking-[-1px] text-ink">
                  {r.copy}
                </p>
                {r.cta && (
                  <Link
                    href={r.cta.href}
                    className="mt-8 inline-flex h-12 items-center rounded-full border border-solid border-black px-6 text-[15px] font-medium text-ink transition-colors hover:bg-[#0a0a0a] hover:text-white"
                  >
                    {r.cta.label}
                  </Link>
                )}
              </Parallax>
              <Parallax
                amount={38}
                className={mediaLeft ? "min-[900px]:order-1" : ""}
              >
                <div
                  className="flex h-[420px] items-center justify-center rounded-[32px] p-8 min-[900px]:h-[560px]"
                  style={{ backgroundColor: r.bg }}
                >
                  {r.visual}
                </div>
              </Parallax>
            </motion.article>
          );
        })}
      </section>


      <FooterSection />
    </main>
  );
}

/* Scroll parallax: drifts children vertically as the element crosses the
   viewport, spring-smoothed like the home page scrubs. */
function Parallax({
  amount = 40,
  className,
  children,
}: {
  amount?: number;
  className?: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const smooth = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 26,
    mass: 0.3,
  });
  const y = useTransform(smooth, [0, 1], [amount, -amount]);
  return (
    <motion.div ref={ref} style={{ y }} className={className}>
      {children}
    </motion.div>
  );
}

/* Expandable notification-bar tabs: tap a bar, it unfolds its detail rows
   (one open per canvas, plus toggle rotates to a close). */
function ClickTabs({ tabs }: { tabs: Tab[] }) {
  const [open, setOpen] = useState(0);
  return (
    <div className="w-full max-w-[360px] space-y-2.5">
      {tabs.map((t, i) => {
        const isOpen = open === i;
        return (
          <div key={t.name} className="overflow-hidden rounded-[18px]" style={{ backgroundColor: t.bg ?? "#ffffff", color: t.dark ? "#ffffff" : "#0a0a0a" }}>
            <button
              type="button"
              onClick={() => setOpen(isOpen ? -1 : i)}
              aria-expanded={isOpen}
              className="flex w-full items-center gap-3 py-[6px] pl-[6px] pr-2.5 text-left"
            >
              <span className={`flex h-[43px] w-[43px] shrink-0 items-center justify-center rounded-[11px] ${t.bg ? "bg-white" : "bg-[#eeeeee]"}`}>
                <Image
                  src={t.logo}
                  alt={t.name}
                  width={54}
                  height={54}
                  className="h-[27px] w-[27px] rounded-[5px] object-contain"
                />
              </span>
              <span className="min-w-0 flex-1">
                <span className={`block text-[16px] font-semibold ${t.dark ? "text-white" : "text-ink"}`}>
                  {t.name}
                </span>
                <span className={`block text-[13px] leading-snug ${t.dark ? "text-white/70" : "text-sub"}`}>
                  {t.note}
                </span>
              </span>
              <span className={`text-[17px] font-semibold tracking-[-0.43px] ${t.dark ? "text-white" : "text-ink"}`}>
                {t.amount}
              </span>
              <motion.span
                className={`flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full ${t.dark ? "bg-white/20" : "bg-[#eeeeee]"}`}
                initial={false}
                animate={{ rotate: isOpen ? 45 : 0 }}
                transition={{ duration: 0.25, ease: [0.3, 0.9, 0.3, 1] }}
              >
                <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden>
                  <path
                    d="M6 1v10M1 6h10"
                    stroke={t.dark ? "#ffffff" : "#0a0a0a"}
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                </svg>
              </motion.span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.3, 0.9, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <div className={`mx-2.5 border-t py-3 pl-[46px] pr-1.5 ${t.dark ? "border-white/10" : "border-black/5"}`}>
                    {t.details.map(([label, value]) => (
                      <div
                        key={label}
                        className="flex items-baseline justify-between py-1 text-[13px]"
                      >
                        <span className={t.dark ? "text-white/60" : "text-sub"}>{label}</span>
                        <span className={`font-semibold ${t.dark ? "text-white" : "text-ink"}`}>{value}</span>
                      </div>
                    ))}
                    {t.pill && (
                      <span
                        className={`mt-2 inline-flex items-center gap-2 rounded-full py-1.5 text-[12px] font-semibold ${
                          t.pill.tone === "green"
                            ? "bg-white pl-1.5 pr-3 text-ink"
                            : t.dark
                              ? "bg-white px-3 text-ink"
                              : "bg-[#0a0a0a] px-3 text-white"
                        }`}
                      >
                        {t.pill.tone === "green" && (
                          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#1e9e56]">
                            <svg width="8" height="8" viewBox="0 0 24 24" fill="none" aria-hidden>
                              <path
                                d="m5 12.5 4.5 4.5L19 7.5"
                                stroke="#fff"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </span>
                        )}
                        {t.pill.label}
                      </span>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

/* The activities-list notification bar, white on the canvas fields. */
function Bar({
  logo,
  name,
  note,
  amount,
  bg,
  dark,
}: {
  logo: string;
  name: string;
  note: string;
  amount: string;
  /** the bar's ground (the goal act's per-charge colors) and, on dark
      grounds, white type */
  bg?: string;
  dark?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 rounded-[18px] py-[6px] pl-[6px] pr-2.5" style={{ backgroundColor: bg ?? "#ffffff" }}>
      <span className={`flex h-[43px] w-[43px] shrink-0 items-center justify-center rounded-[11px] ${bg ? "bg-white" : "bg-[#eeeeee]"}`}>
        <Image
          src={logo}
          alt={name}
          width={54}
          height={54}
          className="h-[27px] w-[27px] rounded-[5px] object-contain"
        />
      </span>
      <span className="min-w-0 flex-1">
        <span className={`block text-[16px] font-semibold ${dark ? "text-white" : "text-ink"}`}>{name}</span>
        <span className={`block text-[13px] leading-snug ${dark ? "text-white/70" : "text-sub"}`}>{note}</span>
      </span>
      <span className={`text-[17px] font-semibold tracking-[-0.43px] ${dark ? "text-white" : "text-ink"}`}>
        {amount}
      </span>
      <svg width="11" height="11" viewBox="0 0 16 16" fill="none" aria-hidden>
        <path
          d="m6 3.5 5 4.5-5 4.5"
          stroke={dark ? "#ffffff" : "#b3b1ac"}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

