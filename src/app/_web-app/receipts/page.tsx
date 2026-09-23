"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { money } from "@/components/tracker/money";
import { num, useWebApp, type Purchase } from "../shell";
import { CARD, Group, PurchaseDrawer, Stat } from "../pieces";

/**
 * Receipts: does the paper match the purchase? Three buckets: mismatched
 * (the receipt says a different number), missing (billed, no receipt yet),
 * matched. The first two are where money leaks.
 */

const EASE = [0.25, 0.6, 0.2, 1] as const;

export default function ReceiptsPage() {
  const { purchases } = useWebApp();
  const [selected, setSelected] = useState<Purchase | null>(null);

  const billed = purchases.filter((p) => !["intended", "authorized", "cancelled"].includes(p.status));
  const mismatch = billed.filter((p) => p.receipt_amount !== null && Math.abs(num(p.receipt_amount) - num(p.amount)) > 0.01);
  const missing = billed.filter((p) => p.receipt_amount === null);
  const matched = billed.filter((p) => !mismatch.includes(p) && !missing.includes(p));
  const gap = mismatch.reduce((s, p) => s + (num(p.receipt_amount) - num(p.amount)), 0);
  const unreceipted = missing.reduce((s, p) => s + num(p.amount), 0);

  return (
    <div className="mx-auto w-full max-w-[880px] px-6 pb-24 pt-6 min-[900px]:px-10">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE, delay: 0.05 }} className="grid gap-3 min-[640px]:grid-cols-3">
        <Stat label="MATCHED" value={`${matched.length} of ${billed.length}`} note="receipt equals purchase" />
        <Stat label="MISMATCHED" value={String(mismatch.length)} note={mismatch.length === 0 ? "none" : `${gap >= 0 ? "+" : "−"}${money(Math.abs(gap))} against you`} />
        <Stat label="MISSING" value={money(unreceipted)} note={`${missing.length} billed without a receipt`} />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE, delay: 0.1 }}>
        {billed.length === 0 ? (
          <div className={`${CARD} mt-8 rounded-[20px] px-8 py-16 text-center`}>
            <p className="mx-auto max-w-[400px] text-[15px] leading-[1.55] text-sub">
              No billed purchases yet. Once agents record checkouts and receipts, this page shows which ones match and which ones don&apos;t.
            </p>
          </div>
        ) : (
          <>
            {mismatch.length > 0 && <Group title="Receipt doesn't match" items={mismatch} tone="alert" onSelect={setSelected} />}
            {missing.length > 0 && <Group title="No receipt yet" items={missing} onSelect={setSelected} />}
            {matched.length > 0 && <Group title="Matched" items={matched} onSelect={setSelected} />}
          </>
        )}
      </motion.div>

      <p className="mt-16 text-center text-[12px] text-sub">Agents attach receipts through the API. The browser reads.</p>
      <PurchaseDrawer purchase={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
