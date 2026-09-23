"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { money } from "@/components/tracker/money";
import { isOpen, num, startOfDay, useWebApp, whenPhrase, type Purchase } from "../shell";
import { CARD, Group, PurchaseDrawer, Stat } from "../pieces";

/**
 * Orders & travel: the purchases with a date something is supposed to
 * happen on. Late first, then arriving this week, then the rest, then
 * what already landed. Refunded orders show what came back.
 */

const EASE = [0.25, 0.6, 0.2, 1] as const;

export default function OrdersPage() {
  const { purchases } = useWebApp();
  const [selected, setSelected] = useState<Purchase | null>(null);

  const dated = purchases.filter((p) => p.kind === "order" || p.kind === "travel");
  const open = dated.filter(isOpen);
  const late = open.filter((p) => p.expected_at && whenPhrase(p.expected_at).overdue);
  const today = startOfDay(new Date()).getTime();
  const week = open.filter((p) => {
    if (!p.expected_at || late.includes(p)) return false;
    const diff = startOfDay(new Date(p.expected_at)).getTime() - today;
    return diff < 7 * 86_400_000;
  });
  const rest = open.filter((p) => !late.includes(p) && !week.includes(p));
  const settled = dated.filter((p) => !isOpen(p));
  const inFlight = open.reduce((s, p) => s + num(p.amount), 0);
  const refunded = settled.filter((p) => p.status === "refunded").reduce((s, p) => s + num(p.amount), 0);

  return (
    <div className="mx-auto w-full max-w-[880px] px-6 pb-24 pt-6 min-[900px]:px-10">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE, delay: 0.05 }} className="grid gap-3 min-[640px]:grid-cols-3">
        <Stat label="IN FLIGHT" value={money(inFlight)} note={`${open.length} ${open.length === 1 ? "order or trip" : "orders and trips"}`} />
        <Stat label="LATE" value={String(late.length)} note={late.length === 0 ? "nothing overdue" : "past expected date"} />
        <Stat label="REFUNDED" value={money(refunded)} note="came back" />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE, delay: 0.1 }}>
        {dated.length === 0 ? (
          <div className={`${CARD} mt-8 rounded-[20px] px-8 py-16 text-center`}>
            <p className="mx-auto max-w-[400px] text-[15px] leading-[1.55] text-sub">
              No orders or trips yet. When an agent records a shipment or a booking with an expected date, it lands here and turns red if that date passes.
            </p>
          </div>
        ) : (
          <>
            {late.length > 0 && <Group title="Late" items={late} tone="alert" onSelect={setSelected} />}
            {week.length > 0 && <Group title="This week" items={week} onSelect={setSelected} />}
            {rest.length > 0 && <Group title="Later" items={rest} onSelect={setSelected} />}
            {settled.length > 0 && <Group title="Delivered, refunded, or cancelled" items={settled} onSelect={setSelected} />}
          </>
        )}
      </motion.div>

      <p className="mt-16 text-center text-[12px] text-sub">Agents write through the API. The browser reads.</p>
      <PurchaseDrawer purchase={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
