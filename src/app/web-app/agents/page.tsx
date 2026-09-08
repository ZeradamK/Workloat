"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { money } from "@/components/tracker/money";
import { DAY, isOpen, issuesFor, num, relTime, useWebApp, type Agent, type Purchase } from "../shell";
import { CARD, Eyebrow, GREEN, PurchaseDrawer, PurchaseRow } from "../pieces";

/**
 * Agents: one card per agent. What it is for, what it spent in the last 30
 * days, what is still open, what needs a look, and when it last wrote to
 * the ledger. Tap a card to see its purchases.
 */

const EASE = [0.25, 0.6, 0.2, 1] as const;

export default function AgentsPage() {
  const { agents, purchases } = useWebApp();
  const [open, setOpen] = useState<string | null>(null);
  const [selected, setSelected] = useState<Purchase | null>(null);
  const cutoff = Date.now() - 30 * DAY;

  return (
    <div className="mx-auto w-full max-w-[880px] px-6 pb-24 pt-6 min-[900px]:px-10">
      {agents.length === 0 ? (
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE }} className={`${CARD} mt-4 rounded-[20px] px-8 py-16 text-center`}>
          <p className="mx-auto max-w-[400px] text-[15px] leading-[1.55] text-sub">
            No agents yet. Create one in Connections, hand it its key, and it shows up here the moment it records a purchase.
          </p>
          <Link href="/web-app/connections" className="mt-6 inline-block rounded-full bg-[#0a0a0a] px-6 py-3 text-[14px] font-medium text-white transition-transform hover:scale-[1.02]">
            Create an agent
          </Link>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE }} className="mt-4 flex flex-col gap-4">
          {agents.map((a) => (
            <AgentCard
              key={a.id}
              agent={a}
              purchases={purchases.filter((p) => p.agent_id === a.id)}
              cutoff={cutoff}
              expanded={open === a.id}
              onToggle={() => setOpen(open === a.id ? null : a.id)}
              onSelect={setSelected}
            />
          ))}
        </motion.div>
      )}
      <p className="mt-16 text-center text-[12px] text-sub">Agents write through the API. The browser reads.</p>
      <PurchaseDrawer purchase={selected} onClose={() => setSelected(null)} />
    </div>
  );
}

function AgentCard({
  agent: a,
  purchases,
  cutoff,
  expanded,
  onToggle,
  onSelect,
}: {
  agent: Agent;
  purchases: Purchase[];
  cutoff: number;
  expanded: boolean;
  onToggle: () => void;
  onSelect: (p: Purchase) => void;
}) {
  const spent = purchases.filter((p) => p.status !== "cancelled" && p.status !== "intended");
  const last30 = spent.filter((p) => new Date(p.placed_at).getTime() >= cutoff);
  const total30 = last30.reduce((s, p) => s + num(p.amount), 0);
  const openCount = purchases.filter(isOpen).length;
  const issues = purchases.filter((p) => issuesFor(p).length > 0).length;
  const subs = purchases.filter((p) => p.kind === "subscription" && p.status === "active");
  const monthly = subs.reduce((s, p) => s + num(p.amount), 0);

  return (
    <div className={`${CARD} px-5 py-5`}>
      <button type="button" onClick={onToggle} className="flex w-full items-start gap-4 text-left">
        <span className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-[13px] bg-[#f2f2f3]">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <rect x="5" y="7" width="14" height="11" rx="3" />
            <path d="M9 12h.01M15 12h.01M12 3.5V7M9 21h6" />
          </svg>
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2">
            <span className="truncate text-[16px] font-semibold text-ink">{a.name}</span>
            <span className="rounded-full px-2.5 py-1 text-[10px] font-semibold" style={{ backgroundColor: a.status === "active" ? "rgba(30,158,86,0.12)" : "#f2f2f3", color: a.status === "active" ? GREEN : "#75736e" }}>
              {a.status === "active" ? "Active" : a.status === "paused" ? "Paused" : "Revoked"}
            </span>
          </span>
          <span className="block text-[13px] leading-snug text-sub">{a.role ?? "No description"}</span>
          <span className="mt-1 block text-[12px] text-sub">
            {a.last_event_at ? `Last wrote ${relTime(a.last_event_at)}` : "Hasn't written yet"}
            {a.key_prefix && ` · key ${a.key_prefix}…`}
          </span>
        </span>
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden className="mt-1 shrink-0 transition-transform" style={{ transform: expanded ? "rotate(90deg)" : "none" }}>
          <path d="m6 3.5 5 4.5-5 4.5" stroke="#706e68" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <div className="mt-4 grid grid-cols-2 gap-3 min-[640px]:grid-cols-4">
        <Mini label="Last 30 days" value={money(total30)} note={`${last30.length} ${last30.length === 1 ? "purchase" : "purchases"}`} />
        <Mini label="Open" value={String(openCount)} note="not settled" />
        <Mini label="To look at" value={String(issues)} note={issues === 0 ? "all clear" : "with issues"} alert={issues > 0} />
        <Mini label="Recurring" value={money(monthly)} note={`${subs.length} active ${subs.length === 1 ? "subscription" : "subscriptions"}`} />
      </div>

      {expanded && (
        <div className="mt-4 border-t border-solid border-black/5 pt-2">
          <Eyebrow>Purchases</Eyebrow>
          {purchases.length === 0 ? (
            <p className="mt-2 text-[13px] text-sub">Nothing recorded yet.</p>
          ) : (
            <div className="flex flex-col divide-y divide-black/5">
              {purchases.map((p) => (
                <PurchaseRow key={p.id} purchase={p} onSelect={onSelect} showAgent={false} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Mini({ label, value, note, alert }: { label: string; value: string; note: string; alert?: boolean }) {
  return (
    <div className="rounded-[10px] bg-[#f7f7f8] px-3.5 py-3">
      <span className="block text-[10px] font-semibold uppercase tracking-[1.2px] text-sub">{label}</span>
      <span className="mt-1 block font-numeral text-[18px] font-semibold tracking-[-0.5px]" style={{ color: alert ? "#c2402a" : "#0a0a0a" }}>
        {value}
      </span>
      <span className="block text-[11px] text-sub">{note}</span>
    </div>
  );
}
