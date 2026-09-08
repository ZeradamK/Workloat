"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { EVENT_LABEL, startOfDay, useWebApp, type EventType, type Purchase } from "../shell";
import { BLUE, CARD, GREEN, PurchaseDrawer } from "../pieces";

/**
 * Ledger: the raw append-only event log, newest first, grouped by day.
 * Each row is one thing an agent told us, with the hash that chains it to
 * the row before. This is the page an auditor would read.
 */

const EASE = [0.25, 0.6, 0.2, 1] as const;

const TYPES: { key: "all" | EventType; label: string }[] = [
  { key: "all", label: "All" },
  { key: "intent", label: "Intents" },
  { key: "checkout", label: "Checkouts" },
  { key: "receipt", label: "Receipts" },
  { key: "status", label: "Status" },
  { key: "note", label: "Notes" },
];

export default function LedgerPage() {
  const { events, purchases, agentName } = useWebApp();
  const [type, setType] = useState<"all" | EventType>("all");
  const [selected, setSelected] = useState<Purchase | null>(null);

  const filtered = events.filter((e) => (type === "all" ? true : e.type === type));
  const groups: { label: string; items: typeof events }[] = [];
  for (const e of filtered) {
    const label = startOfDay(new Date(e.at)).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
    const g = groups.find((x) => x.label === label);
    if (g) g.items.push(e);
    else groups.push({ label, items: [e] });
  }

  return (
    <div className="mx-auto w-full max-w-[880px] px-6 pb-24 pt-6 min-[900px]:px-10">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE }} className="scrollbar-none -mx-6 mt-4 flex gap-2 overflow-x-auto px-6 min-[900px]:mx-0 min-[900px]:px-0">
        {TYPES.map((t) => (
          <button key={t.key} type="button" onClick={() => setType(t.key)} className={`shrink-0 rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors ${t.key === type ? "bg-[#e9e9eb] text-ink" : "text-sub hover:text-ink"}`}>
            {t.label}
          </button>
        ))}
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE, delay: 0.08 }}>
        {events.length === 0 ? (
          <div className={`${CARD} mt-8 rounded-[20px] px-8 py-16 text-center`}>
            <p className="mx-auto max-w-[420px] text-[15px] leading-[1.55] text-sub">
              The ledger is empty. Each call an agent makes to the API appends one row here, chained to the row before it, so nothing can be quietly changed later.
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className={`${CARD} mt-8 px-8 py-12 text-center`}>
            <p className="text-[14px] text-sub">No events of that type yet.</p>
          </div>
        ) : (
          groups.map((g) => (
            <div key={g.label} className="mt-8">
              <h2 className="px-1 text-[13px] font-semibold tracking-[0.2px] text-sub">{g.label}</h2>
              <div className={`${CARD} mt-2 flex flex-col divide-y divide-black/5 px-4`}>
                {g.items.map((e) => {
                  const p = purchases.find((x) => x.id === e.purchase_id) ?? null;
                  const dot = e.type === "receipt" ? GREEN : e.type === "intent" ? BLUE : "#0a0a0a";
                  return (
                    <button key={e.id} type="button" onClick={() => p && setSelected(p)} className="flex w-full items-start gap-3 py-3 text-left transition-opacity hover:opacity-60" disabled={!p}>
                      <span className="mt-[7px] h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: dot }} aria-hidden />
                      <span className="min-w-0 flex-1">
                        <span className="block text-[14px] leading-snug text-ink">{e.summary}</span>
                        <span className="block text-[12px] text-sub">
                          {EVENT_LABEL[e.type]} · {agentName(e.agent_id)}
                          {p && ` · ${p.merchant}`} · {new Date(e.at).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                        </span>
                      </span>
                      <span className="shrink-0 font-mono text-[11px] text-sub" title={e.hash}>{e.hash.slice(0, 8)}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </motion.div>

      <p className="mt-16 text-center text-[12px] text-sub">Append only. Each row carries the hash of the one before it.</p>
      <PurchaseDrawer purchase={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
