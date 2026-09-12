"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";

/**
 * FAQ accordion (Cash App "Common questions" anatomy): big questions
 * separated by hairlines, one open at a time, thin plus/minus toggles.
 * Answers stay honest: shipped vs planned is kept straight.
 */

const ITEMS = [
  {
    q: "What does Payloat Ledger record?",
    a: "Everything your agents buy. Each purchase arrives with the task the agent was given, the cap it had, the merchant, the amount, and the receipt when it lands. Subscriptions carry their next charge date, orders and trips carry their expected date. It all lives in one ledger so nothing an agent did is a mystery.",
  },
  {
    q: "How do purchases get into the ledger?",
    a: "Your agents write them. Each agent gets its own key and records an intent before it buys, the checkout when it pays, and the receipt when it arrives. Card feeds from Ramp, Brex, Mercury, and your bank are planned, so what was charged can be matched against what was recorded.",
  },
  {
    q: "Do you sell my data?",
    a: "No. Your data is used for one thing, showing your company what its agents did. We never sell it or share it with advertisers.",
  },
  {
    q: "What does Payloat Ledger cost?",
    a: "Payloat Ledger is free while in beta. Pricing will be per organization, with a free tier for a handful of agents and paid plans as your agents and their volume grow.",
  },
  {
    q: "When can I get it?",
    a: "Payloat Ledger is in development. The web app and the agent API open first. Sign up and you will be the first to know.",
  },
];

export default function FAQSection() {
  const [open, setOpen] = useState(0);

  return (
    <section id="faq" className="mx-auto max-w-[1200px] scroll-mt-[90px] px-6 pb-[clamp(64px,8vw,128px)] pt-[clamp(32px,5vw,80px)]">
      <h2 className="pb-6 text-[clamp(24px,2.4vw,32px)] font-medium tracking-[-1px] text-ink">
        FAQ
      </h2>

      <div className="border-t border-black/10">
        {ITEMS.map((item, i) => {
          const isOpen = open === i;
          return (
            <div key={item.q} className="border-b border-black/10">
              <button
                type="button"
                onClick={() => setOpen(isOpen ? -1 : i)}
                aria-expanded={isOpen}
                className={`flex w-full items-center justify-between gap-6 text-left transition-[padding] duration-200 ${
                  isOpen ? "py-7" : "py-3.5"
                }`}
              >
                <span
                  className="text-[clamp(22px,2.4vw,34px)] font-medium tracking-[-0.5px] transition-colors duration-200"
                  style={{ color: isOpen ? "#0a0a0a" : "#a3a19c" }}
                >
                  {item.q}
                </span>
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden
                  className="shrink-0"
                  style={{ color: isOpen ? "#0a0a0a" : "#a3a19c" }}
                >
                  <path
                    d="M3 12h18"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                  <motion.path
                    d="M12 3v18"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    initial={false}
                    animate={{ opacity: isOpen ? 0 : 1, scaleY: isOpen ? 0 : 1 }}
                    transition={{ duration: 0.2 }}
                    style={{ originY: "12px" }}
                  />
                </svg>
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
                    <p className="max-w-[820px] pb-9 text-[16px] leading-relaxed text-sub">
                      {item.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
}
