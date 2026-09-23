"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { money } from "@/components/tracker/money";
import { issuesFor, num, startOfDay, useWebApp, type Purchase, type PurchaseKind } from "../shell";
import { CARD, PurchaseDrawer, PurchaseRow } from "../pieces";

/**
 * Purchases: everything the agents bought, newest first, grouped by the day
 * it was placed. Search by merchant, task, or agent; filter by kind or
 * "needs a look". The drawer tells the whole story of one purchase.
 */

const EASE = [0.25, 0.6, 0.2, 1] as const;

type Filter = "all" | "issues" | PurchaseKind;

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "issues", label: "Needs a look" },
  { key: "purchase", label: "Purchases" },
  { key: "subscription", label: "Subscriptions" },
  { key: "order", label: "Orders" },
  { key: "travel", label: "Travel" },
];

export default function PurchasesPage() {
  const { purchases, agentName } = useWebApp();
  const [query, setQuery] = useState(() =>
    typeof window === "undefined" ? "" : (new URLSearchParams(window.location.search).get("q") ?? ""),
  );
  const [filter, setFilter] = useState<Filter>("all");
  const [selected, setSelected] = useState<Purchase | null>(null);

  const q = query.trim().toLowerCase();
  const filtered = purchases
    .filter((p) => (filter === "all" ? true : filter === "issues" ? issuesFor(p).length > 0 : p.kind === filter))
    .filter((p) =>
      q ? [p.merchant, p.task ?? "", agentName(p.agent_id), p.external_id ?? ""].some((s) => s.toLowerCase().includes(q)) : true,
    )
    .slice()
    .sort((a, b) => new Date(b.placed_at).getTime() - new Date(a.placed_at).getTime());

  const total = filtered.reduce((s, p) => s + num(p.amount), 0);
  const largest = filtered.reduce((m, p) => Math.max(m, num(p.amount)), 0);
  const average = filtered.length > 0 ? total / filtered.length : 0;

  const groups: { label: string; items: Purchase[]; total: number }[] = [];
  for (const p of filtered) {
    const label = startOfDay(new Date(p.placed_at)).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
    const g = groups.find((x) => x.label === label);
    if (g) {
      g.items.push(p);
      g.total += num(p.amount);
    } else groups.push({ label, items: [p], total: num(p.amount) });
  }

  return (
    <div className="mx-auto w-full max-w-[880px] px-6 pb-24 pt-6 min-[900px]:px-10">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE }}>
        {filtered.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {[
              ["Purchases", String(filtered.length)],
              ["Total", money(total)],
              ["Average", money(Math.round(average * 100) / 100)],
              ["Largest", money(largest)],
            ].map(([k, v]) => (
              <span key={k} className="flex items-baseline gap-1.5 rounded-full border border-solid border-black/[0.07] bg-white px-3.5 py-2">
                <span className="text-[11px] text-sub">{k}</span>
                <span className="font-numeral text-[13px] font-semibold text-ink">{v}</span>
              </span>
            ))}
          </div>
        )}
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE, delay: 0.05 }}>
        <input
          type="search"
          placeholder="Search merchants, tasks, agents"
          aria-label="Search purchases"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="mt-4 w-full rounded-[10px] border border-solid border-black/[0.12] bg-white px-4 py-3 text-[14px] text-ink outline-none transition-colors placeholder:text-[#b3b1ac] focus:border-black/30"
        />
        <div className="scrollbar-none -mx-6 mt-3 flex gap-2 overflow-x-auto px-6 min-[900px]:mx-0 min-[900px]:px-0">
          {FILTERS.map((f) => (
            <button key={f.key} type="button" onClick={() => setFilter(f.key)} className={`shrink-0 rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors ${f.key === filter ? "bg-[#e9e9eb] text-ink" : "text-sub hover:text-ink"}`}>
              {f.label}
            </button>
          ))}
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE, delay: 0.1 }}>
        {purchases.length === 0 ? (
          <div className={`${CARD} mt-8 rounded-[20px] px-8 py-16 text-center`}>
            <p className="mx-auto max-w-[400px] text-[15px] leading-[1.55] text-sub">
              Nothing recorded yet. Every purchase, subscription, order, and trip an agent records lands in this list with the task it was given.
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className={`${CARD} mt-8 px-8 py-12 text-center`}>
            <p className="text-[14px] text-sub">Nothing matches. Try a different search or filter.</p>
          </div>
        ) : (
          groups.map((g) => (
            <div key={g.label} className="mt-8">
              <div className="flex items-baseline justify-between px-1">
                <h2 className="text-[13px] font-semibold tracking-[0.2px] text-sub">{g.label}</h2>
                <span className="font-numeral text-[13px] font-medium text-sub">{money(g.total)}</span>
              </div>
              <div className={`${CARD} mt-2 flex flex-col divide-y divide-black/5 px-4`}>
                {g.items.map((p) => (
                  <PurchaseRow key={p.id} purchase={p} onSelect={setSelected} />
                ))}
              </div>
            </div>
          ))
        )}
      </motion.div>

      <p className="mt-16 text-center text-[12px] text-sub">Agents write through the API. The browser reads.</p>
      <PurchaseDrawer purchase={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
