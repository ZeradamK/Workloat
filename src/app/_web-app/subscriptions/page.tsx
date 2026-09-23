"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { money } from "@/components/tracker/money";
import { DAY, num, startOfDay, useWebApp, type Purchase } from "../shell";
import { CARD, Eyebrow, Group, PurchaseDrawer, Stat } from "../pieces";

/**
 * Subscriptions: what the agents keep paying for. Monthly run rate, what
 * renews in the next 30 days, and the calendar of charge days. Cancelled
 * plans stay listed so the owner can see what was dropped and when.
 */

const EASE = [0.25, 0.6, 0.2, 1] as const;

export default function SubscriptionsPage() {
  const { purchases } = useWebApp();
  const [view, setView] = useState<"list" | "calendar">("list");
  const [selected, setSelected] = useState<Purchase | null>(null);

  const subs = purchases.filter((p) => p.kind === "subscription");
  const active = subs.filter((p) => p.status !== "cancelled" && p.status !== "refunded");
  const cancelled = subs.filter((p) => p.status === "cancelled");
  const runRate = active.reduce((s, p) => s + num(p.amount), 0);

  const today = startOfDay(new Date());
  const in30 = active.filter((p) => {
    if (!p.next_charge_at) return false;
    const diff = startOfDay(new Date(p.next_charge_at)).getTime() - today.getTime();
    return diff >= 0 && diff < 30 * DAY;
  });
  const in30Total = in30.reduce((s, p) => s + num(p.amount), 0);
  const in7 = in30.filter((p) => startOfDay(new Date(p.next_charge_at!)).getTime() - today.getTime() < 7 * DAY);
  const later = active.filter((p) => !in7.includes(p));

  return (
    <div className="mx-auto w-full max-w-[880px] px-6 pb-24 pt-6 min-[900px]:px-10">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE, delay: 0.05 }} className="grid gap-3 min-[640px]:grid-cols-3">
        <Stat label="MONTHLY RUN RATE" value={money(runRate)} note={`${active.length} active`} />
        <Stat label="NEXT 30 DAYS" value={money(in30Total)} note={`${in30.length} ${in30.length === 1 ? "renewal" : "renewals"}`} />
        <Stat label="DROPPED" value={String(cancelled.length)} note={cancelled.length === 1 ? "subscription cancelled" : "subscriptions cancelled"} />
      </motion.div>

      {active.length > 0 && (
        <div className="mt-8 flex w-fit items-center gap-1 rounded-full border border-solid border-black/[0.07] bg-white p-1">
          {(["list", "calendar"] as const).map((v) => (
            <button key={v} type="button" onClick={() => setView(v)} className={`rounded-full px-4 py-1.5 text-[13px] font-medium capitalize transition-colors ${view === v ? "bg-[#e9e9eb] text-ink" : "text-sub"}`}>
              {v}
            </button>
          ))}
        </div>
      )}

      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE, delay: 0.1 }}>
        {subs.length === 0 ? (
          <div className={`${CARD} mt-8 rounded-[20px] px-8 py-16 text-center`}>
            <p className="mx-auto max-w-[400px] text-[15px] leading-[1.55] text-sub">
              No subscriptions recorded yet. When an agent records a plan with a next charge date, it lands here with its run rate.
            </p>
          </div>
        ) : view === "calendar" ? (
          <div className={`${CARD} mt-4 p-5`}>
            <Eyebrow>{today.toLocaleDateString("en-US", { month: "long", year: "numeric" })}</Eyebrow>
            <MonthGrid items={active} onSelect={setSelected} />
          </div>
        ) : (
          <>
            {in7.length > 0 && <Group title="Renews this week" items={in7} onSelect={setSelected} />}
            {later.length > 0 && <Group title="Active" items={later} onSelect={setSelected} />}
            {cancelled.length > 0 && <Group title="Cancelled" items={cancelled} onSelect={setSelected} />}
          </>
        )}
      </motion.div>

      <p className="mt-16 text-center text-[12px] text-sub">Agents write through the API. The browser reads.</p>
      <PurchaseDrawer purchase={selected} onClose={() => setSelected(null)} />
    </div>
  );
}

function MonthGrid({ items, onSelect }: { items: Purchase[]; onSelect: (p: Purchase) => void }) {
  const now = new Date();
  const first = new Date(now.getFullYear(), now.getMonth(), 1);
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const lead = first.getDay();
  const todayTime = startOfDay(now).getTime();
  const byDay = new Map<number, Purchase[]>();
  for (const p of items) {
    if (!p.next_charge_at) continue;
    const d = new Date(p.next_charge_at);
    if (d.getMonth() !== now.getMonth() || d.getFullYear() !== now.getFullYear()) continue;
    byDay.set(d.getDate(), [...(byDay.get(d.getDate()) ?? []), p]);
  }
  return (
    <div className="mt-3 grid grid-cols-7 gap-1">
      {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
        <span key={i} className="pb-1 text-center text-[10px] font-semibold text-sub">{d}</span>
      ))}
      {Array.from({ length: lead }, (_, i) => <span key={`lead${i}`} aria-hidden />)}
      {Array.from({ length: daysInMonth }, (_, i) => {
        const day = i + 1;
        const isToday = new Date(now.getFullYear(), now.getMonth(), day).getTime() === todayTime;
        const due = byDay.get(day);
        const total = due?.reduce((s, p) => s + num(p.amount), 0);
        const base = "flex min-h-[52px] flex-col items-start rounded-[8px] px-1.5 pt-1.5";
        const cell = (
          <>
            <span className="font-numeral text-[10px] font-semibold leading-none" style={{ color: due ? "#fff" : "#0a0a0a" }}>{day}</span>
            <span className="mt-1 font-numeral text-[9px] font-medium leading-none" style={{ color: due ? "rgba(255,255,255,0.85)" : "#b4b2ae" }}>
              {total !== undefined ? `$${Math.round(total)}` : "–"}
            </span>
            {due && due.length > 1 && <span className="mt-0.5 text-[8px] text-white/80">{due.length} plans</span>}
          </>
        );
        return due ? (
          <button key={day} type="button" onClick={() => onSelect(due[0])} className={`${base} bg-[#4477f6] transition-transform hover:scale-[1.04]`}>{cell}</button>
        ) : (
          <div key={day} className={`${base} border border-solid bg-white`} style={{ borderColor: isToday ? "#4477f6" : "rgba(0,0,0,0.08)" }}>{cell}</div>
        );
      })}
    </div>
  );
}
