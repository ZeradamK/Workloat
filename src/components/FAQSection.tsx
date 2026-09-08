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
    q: "What does Payloat track?",
    a: "Payloat watches everything that happens after checkout. Returns and their deadlines, refunds you are owed, subscriptions and their renewals, BNPL installments and the charges landing on your cards. It all lives in one timeline so nothing slips.",
  },
  {
    q: "How does Payloat see my purchases?",
    a: "You choose what to connect. Link Gmail and Payloat reads purchase emails like receipts and renewal notices. Add your cards through Apple Wallet or your bank and charges appear as they happen. You can disconnect either at any time.",
  },
  {
    q: "Do you sell my data?",
    a: "No. Your data is used for one thing, showing you your own dashboard. We never sell it or share it with advertisers.",
  },
  {
    q: "What does Payloat cost?",
    a: "Payloat is free while in beta. Planned pricing is Personal at $4.99 a month, Pro at $7.99 with AI parsing and active refund requests, Premium at $12.99, and Business at $49.99 for small teams.",
  },
  {
    q: "When can I get it?",
    a: "Payloat is in development, iOS first. The Download button will go live with the first release wave.",
  },
];

export default function FAQSection() {
  const [open, setOpen] = useState(0);

  return (
    <section id="faq" className="mx-auto max-w-[1200px] scroll-mt-[90px] px-6 pb-32 pt-10">
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
