"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { money } from "@/components/tracker/money";
import { supabase } from "@/lib/supabase";
import AreaChart from "./AreaChart";
import {
  DAY,
  issuesFor,
  num,
  relTime,
  startOfDay,
  useWebApp,
  whenPhrase,
  type Purchase,
} from "./shell";
import { BLUE, CARD, Eyebrow, GREEN, Group, PurchaseDrawer } from "./pieces";

/**
 * Overview: what the company's agents spent, what needs a look, who spent
 * it, and what lands this month. Every number is computed from this org's
 * ledger. With no org yet, the page is the one form that creates it.
 */

const EASE = [0.25, 0.6, 0.2, 1] as const;

type Range = "1W" | "1M" | "3M" | "YTD" | "ALL";
const RANGE_DAYS: Record<"1W" | "1M" | "3M", number> = { "1W": 7, "1M": 30, "3M": 90 };

export default function OverviewPage() {
  const { org, agents, purchases, events, hasRealData, showingSample, setPreview, agentName, reload } = useWebApp();
  const [selected, setSelected] = useState<Purchase | null>(null);
  const [range, setRange] = useState<Range>("1M");
  const [onboardingHidden, setOnboardingHidden] = useState(false);

  const today = startOfDay(new Date());
  const spanDays = useMemo(() => {
    if (range === "YTD") {
      const jan1 = new Date(today.getFullYear(), 0, 1);
      return Math.min(Math.max(Math.ceil((today.getTime() - jan1.getTime()) / DAY) + 1, 7), 180);
    }
    if (range !== "ALL") return RANGE_DAYS[range];
    const earliest = purchases.reduce((m, p) => Math.min(m, new Date(p.placed_at).getTime()), Date.now());
    return Math.min(Math.max(Math.ceil((today.getTime() - startOfDay(new Date(earliest)).getTime()) / DAY) + 1, 7), 180);
  }, [range, purchases, today]);
  const chartStart = new Date(today.getTime() - (spanDays - 1) * DAY);

  const spent = purchases.filter((p) => p.status !== "cancelled" && p.status !== "intended");
  const inRange = spent.filter((p) => new Date(p.placed_at).getTime() >= chartStart.getTime());
  const rangeTotal = inRange.reduce((s, p) => s + num(p.amount), 0);
  const refundedTotal = inRange.filter((p) => p.status === "refunded").reduce((s, p) => s + num(p.amount), 0);

  const daily = Array.from({ length: spanDays }, (_, i) => {
    const dayEnd = chartStart.getTime() + i * DAY + DAY - 1;
    return inRange.filter((p) => new Date(p.placed_at).getTime() <= dayEnd).reduce((s, p) => s + num(p.amount), 0);
  });
  const xLabels = [0, 1, 2, 3].map((q) =>
    new Date(chartStart.getTime() + Math.round((q * (spanDays - 1)) / 3) * DAY).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
  );

  const withIssues = purchases.filter((p) => issuesFor(p).length > 0);
  const alerts = withIssues.filter((p) => issuesFor(p).some((i) => i.tone === "alert"));
  const warns = withIssues.filter((p) => !alerts.includes(p));

  /* by agent, this range */
  const byAgent = agents
    .map((a) => {
      const mine = inRange.filter((p) => p.agent_id === a.id);
      return { agent: a, total: mine.reduce((s, p) => s + num(p.amount), 0), count: mine.length, issues: mine.filter((p) => issuesFor(p).length > 0).length };
    })
    .sort((x, y) => y.total - x.total);
  const byAgentMax = Math.max(...byAgent.map((b) => b.total), 1);

  /* what lands this month: renewals and expected deliveries */
  const now = new Date();
  const landing = purchases
    .filter((p) => p.status !== "cancelled" && p.status !== "refunded")
    .map((p) => ({ p, date: p.kind === "subscription" ? p.next_charge_at : p.expected_at }))
    .filter((x): x is { p: Purchase; date: string } => !!x.date)
    .filter((x) => {
      const d = new Date(x.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
  const monthCharges = landing.filter((x) => x.p.kind === "subscription");
  const monthTotal = monthCharges.reduce((s, x) => s + num(x.p.amount), 0);
  const upNext = landing
    .filter((x) => !whenPhrase(x.date).overdue)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

  const steps = [
    { label: "Organization created", done: !!org },
    { label: "First agent and API key", done: agents.length > 0 && !showingSample },
    { label: "First event recorded by an agent", done: events.length > 0 && !showingSample },
  ];
  const doneCount = steps.filter((s) => s.done).length;
  const showOnboarding = !onboardingHidden && doneCount < steps.length;

  const recent = events.slice(0, 6);

  if (!org && !showingSample) return <CreateOrg onCreated={reload} onPreview={() => setPreview(true)} />;

  return (
    <div className="mx-auto w-full max-w-[1120px] px-6 pb-24 pt-6 min-[900px]:px-10">
      {showingSample && (
        <div className={`${CARD} mb-5 flex items-center justify-between gap-3 py-2 pl-4 pr-2`}>
          <span className="text-[12px] font-semibold" style={{ color: BLUE }}>
            Design preview · sample restaurant data. None of these numbers are yours.
          </span>
          <button type="button" onClick={() => setPreview(false)} className="rounded-full bg-[#0a0a0a] px-3.5 py-1.5 text-[11px] font-semibold text-white transition-transform hover:scale-[1.03]">
            Exit preview
          </button>
        </div>
      )}

      <div className="grid items-start gap-5 min-[1100px]:grid-cols-[1fr_300px]">
        <div className="min-w-0">
          {purchases.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: EASE, delay: 0.05 }}
              className={`${CARD} flex flex-col items-center rounded-[20px] px-8 py-20 text-center`}
            >
              <Image src="/payloat-mark.svg" alt="" width={44} height={44} className="h-11 w-auto" />
              <h2 className="mt-6 text-[22px] font-semibold tracking-[-0.4px] text-ink">
                {hasRealData ? "Your agents haven't recorded a purchase yet" : "Your ledger is ready for its first agent"}
              </h2>
              <p className="mt-2 max-w-[420px] text-[15px] leading-[1.55] text-sub">
                {hasRealData
                  ? "The moment an agent records an intent or a checkout, it shows up here with the task it was given, the cap, and the receipt when it lands."
                  : "Create an agent in Connections, give it its key, and every purchase it makes lands here with the task it was given, the cap, and the receipt."}
              </p>
              <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
                <Link href="/web-app/connections" className="rounded-full bg-[#0a0a0a] px-6 py-3 text-[14px] font-medium text-white transition-transform hover:scale-[1.02]">
                  {hasRealData ? "See agent keys" : "Create your first agent"}
                </Link>
                <button type="button" onClick={() => setPreview(true)} className="rounded-full border border-solid border-black/[0.12] bg-white px-6 py-3 text-[14px] font-medium text-ink transition-transform hover:scale-[1.02]">
                  Preview with sample data
                </button>
              </div>
            </motion.div>
          ) : (
            <>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: EASE, delay: 0.05 }} className={`${CARD} p-5`}>
                <Eyebrow href="/web-app/purchases">Agent spend</Eyebrow>
                <div className="mt-2.5 flex items-end justify-between gap-4">
                  <div>
                    <p className="font-numeral text-[clamp(28px,3vw,36px)] font-semibold tracking-[-1.3px] text-ink">{money(rangeTotal)}</p>
                    <p className="mt-0.5 font-numeral text-[13px] font-medium text-sub">
                      {inRange.length} {inRange.length === 1 ? "purchase" : "purchases"} across {byAgent.filter((b) => b.count > 0).length} {byAgent.filter((b) => b.count > 0).length === 1 ? "agent" : "agents"}
                      {refundedTotal > 0 && (
                        <>
                          {" · "}
                          <span style={{ color: GREEN }}>{money(refundedTotal)} refunded</span>
                        </>
                      )}
                    </p>
                  </div>
                  <Link href="/web-app/agents" className="flex items-center gap-1 rounded-[9px] border border-solid border-black/[0.12] bg-white px-3.5 py-1.5 text-[12px] font-semibold text-ink transition-colors hover:bg-[#f7f7f8]">
                    By agent
                    <svg width="10" height="10" viewBox="0 0 16 16" fill="none" aria-hidden>
                      <path d="m6 3.5 5 4.5-5 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </Link>
                </div>
                <AreaChart daily={daily} xLabels={xLabels} className="mt-5 h-[210px]" />
                <div className="mt-3 flex justify-center gap-1">
                  {(["1W", "1M", "3M", "YTD", "ALL"] as Range[]).map((r) => (
                    <button key={r} type="button" onClick={() => setRange(r)} className={`rounded-full px-3.5 py-1.5 text-[12px] font-semibold transition-colors ${range === r ? "bg-[#e9e9eb] text-ink" : "text-sub"}`}>
                      {r}
                    </button>
                  ))}
                </div>
              </motion.div>

              {/* needs a look */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: EASE, delay: 0.1 }}>
                {withIssues.length === 0 ? (
                  <div className={`${CARD} mt-5 flex items-center gap-3 px-5 py-4`}>
                    <span className="flex h-8 w-8 items-center justify-center rounded-full" style={{ backgroundColor: "rgba(30,158,86,0.12)" }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                        <path d="m5 12.5 4.5 4.5L19 7.5" stroke={GREEN} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                    <span className="text-[14px] text-ink">Nothing needs a look. Every purchase is inside its cap with a matching receipt.</span>
                  </div>
                ) : (
                  <>
                    {alerts.length > 0 && <Group title="Needs a look" items={alerts} tone="alert" onSelect={setSelected} />}
                    {warns.length > 0 && <Group title="Worth knowing" items={warns} onSelect={setSelected} />}
                  </>
                )}
              </motion.div>

              {/* by agent + this month */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: EASE, delay: 0.15 }} className="mt-5 grid gap-5 min-[840px]:grid-cols-2">
                <div className={`${CARD} p-5`}>
                  <Eyebrow href="/web-app/agents">Spend by agent</Eyebrow>
                  <div className="mt-3 flex flex-col gap-3">
                    {byAgent.map((b) => (
                      <div key={b.agent.id}>
                        <div className="flex items-baseline justify-between gap-3">
                          <span className="truncate text-[13px] font-semibold text-ink">{b.agent.name}</span>
                          <span className="font-numeral text-[13px] font-semibold text-ink">{money(b.total)}</span>
                        </div>
                        <div className="mt-1.5 h-2 rounded-full bg-[#eeeef0]">
                          <div className="h-2 rounded-full" style={{ width: `${(b.total / byAgentMax) * 100}%`, backgroundColor: BLUE }} />
                        </div>
                        <span className="mt-1 block text-[11px] text-sub">
                          {b.count} {b.count === 1 ? "purchase" : "purchases"}
                          {b.issues > 0 && ` · ${b.issues} to look at`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className={`${CARD} p-5`}>
                  <Eyebrow href="/web-app/subscriptions">Renewing in {now.toLocaleDateString("en-US", { month: "long" })}</Eyebrow>
                  <p className="mt-2 font-numeral text-[24px] font-semibold tracking-[-0.8px] text-ink">{money(monthTotal)}</p>
                  <div className="mt-3">
                    <Eyebrow>Up next</Eyebrow>
                    <div className="mt-1 flex flex-col divide-y divide-black/5">
                      {upNext.length === 0 ? (
                        <p className="pt-2 text-[13px] text-sub">Nothing dated this month.</p>
                      ) : (
                        upNext.map(({ p, date }) => (
                          <button key={p.id} type="button" onClick={() => setSelected(p)} className="flex w-full items-center gap-2.5 py-2.5 text-left transition-opacity hover:opacity-60">
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-[13px] font-semibold text-ink">{p.merchant}</span>
                              <span className="block text-[11px] capitalize text-sub">
                                {p.kind === "subscription" ? "renews" : p.kind === "travel" ? "trip" : "arrives"} {whenPhrase(date).text}
                              </span>
                            </span>
                            <span className="font-numeral text-[13px] font-semibold text-ink">{money(num(p.amount))}</span>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* recent ledger */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: EASE, delay: 0.2 }} className={`${CARD} mt-5 px-5 py-4`}>
                <Eyebrow href="/web-app/ledger">Latest from the ledger</Eyebrow>
                <div className="mt-1 flex flex-col divide-y divide-black/5">
                  {recent.map((e) => {
                    const p = purchases.find((x) => x.id === e.purchase_id) ?? null;
                    return (
                      <button key={e.id} type="button" onClick={() => p && setSelected(p)} className="flex w-full items-center gap-3 py-2.5 text-left transition-opacity hover:opacity-60">
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[13px] text-ink">{e.summary}</span>
                          <span className="block text-[11px] text-sub">
                            {agentName(e.agent_id)} · {relTime(e.at)}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            </>
          )}
        </div>

        {/* ---- right rail ---- */}
        <motion.aside initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: EASE, delay: 0.12 }} className="flex min-w-0 flex-col gap-4">
          {showOnboarding && (
            <div className="rounded-[14px] bg-[#1e5b3c] p-5 text-white">
              <div className="flex items-start justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-[1.4px] text-white/70">Get set up</span>
                <button type="button" onClick={() => setOnboardingHidden(true)} aria-label="Dismiss" className="-mr-1 -mt-1 p-1 text-white/70 transition-opacity hover:opacity-60">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
              <p className="mt-2 text-[17px] font-semibold tracking-[-0.3px]">Give an agent its ledger</p>
              <div className="mt-3 flex gap-1">
                {steps.map((s, i) => (
                  <span key={i} className="h-1.5 flex-1 rounded-full" style={{ backgroundColor: s.done ? "#d6f251" : "rgba(255,255,255,0.25)" }} />
                ))}
              </div>
              <p className="mt-1.5 text-[11px] font-medium text-white/70">{Math.round((doneCount / steps.length) * 100)}% complete</p>
              <ul className="mt-3 flex flex-col gap-1.5">
                {steps.map((s) => (
                  <li key={s.label} className="flex items-center gap-2 text-[12px]" style={{ opacity: s.done ? 1 : 0.75 }}>
                    <span className="flex h-4 w-4 items-center justify-center rounded-full" style={{ backgroundColor: s.done ? "#d6f251" : "rgba(255,255,255,0.2)" }}>
                      {s.done && (
                        <svg width="8" height="8" viewBox="0 0 24 24" fill="none" aria-hidden>
                          <path d="m5 12.5 4.5 4.5L19 7.5" stroke="#1e5b3c" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </span>
                    {s.label}
                  </li>
                ))}
              </ul>
              <Link href="/web-app/connections" className="mt-4 flex h-9 items-center justify-center rounded-[10px] bg-white text-[12px] font-semibold text-[#1e5b3c] transition-transform hover:scale-[1.02]">
                Open Connections
              </Link>
            </div>
          )}

          <div className={`${CARD} p-5`}>
            <Eyebrow href="/web-app/agents">Agents</Eyebrow>
            {agents.length === 0 ? (
              <p className="mt-2 text-[13px] text-sub">No agents yet.</p>
            ) : (
              <div className="mt-1 flex flex-col divide-y divide-black/5">
                {agents.map((a) => (
                  <div key={a.id} className="flex items-center gap-2.5 py-2.5">
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-semibold text-ink">{a.name}</span>
                      <span className="block text-[11px] text-sub">{a.last_event_at ? `Active ${relTime(a.last_event_at)}` : "No events yet"}</span>
                    </span>
                    <span className="rounded-full px-2.5 py-1 text-[10px] font-semibold" style={{ backgroundColor: a.status === "active" ? "rgba(30,158,86,0.12)" : "#f2f2f3", color: a.status === "active" ? GREEN : "#75736e" }}>
                      {a.status === "active" ? "Active" : a.status === "paused" ? "Paused" : "Revoked"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {purchases.length > 0 && (
            <div className={`${CARD} p-5`}>
              <Eyebrow href="/web-app/receipts">Receipts</Eyebrow>
              <ReceiptMeter purchases={purchases} />
            </div>
          )}
        </motion.aside>
      </div>

      <p className="mt-16 text-center text-[12px] text-sub">Agents write through the API. The browser reads. Nothing here is edited by hand.</p>

      <PurchaseDrawer purchase={selected} onClose={() => setSelected(null)} />
    </div>
  );
}

function ReceiptMeter({ purchases }: { purchases: Purchase[] }) {
  const billed = purchases.filter((p) => !["intended", "authorized", "cancelled"].includes(p.status));
  const matched = billed.filter((p) => p.receipt_amount !== null && Math.abs(num(p.receipt_amount) - num(p.amount)) <= 0.01).length;
  const mismatch = billed.filter((p) => p.receipt_amount !== null && Math.abs(num(p.receipt_amount) - num(p.amount)) > 0.01).length;
  const missing = billed.length - matched - mismatch;
  const pct = billed.length ? (matched / billed.length) * 100 : 0;
  return (
    <>
      <p className="mt-2 font-numeral text-[20px] font-semibold tracking-[-0.6px] text-ink">
        {matched} <span className="text-[13px] font-medium text-sub">of {billed.length} matched</span>
      </p>
      <div className="mt-2.5 h-2 rounded-full bg-[#eeeef0]">
        <div className="h-2 rounded-full" style={{ width: `${pct}%`, backgroundColor: GREEN }} />
      </div>
      <p className="mt-1.5 text-[11px] text-sub">
        {missing} missing · {mismatch} {mismatch === 1 ? "mismatch" : "mismatches"}
      </p>
    </>
  );
}

/* the one browser write on this page: the organization itself */
function CreateOrg({ onCreated, onPreview }: { onCreated: () => Promise<void>; onPreview: () => void }) {
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setBusy(true);
    setError(null);
    const { error } = await supabase.rpc("create_organization", { p_name: name.trim() });
    if (error) {
      setError(error.message.includes("does not exist") ? "The ledger tables aren't in this project yet. Apply migration 0010 first." : error.message);
      setBusy(false);
      return;
    }
    await onCreated();
    setBusy(false);
  };

  return (
    <div className="mx-auto w-full max-w-[1120px] px-6 pb-24 pt-6 min-[900px]:px-10">
      <motion.form
        onSubmit={submit}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: EASE, delay: 0.05 }}
        className={`${CARD} mx-auto flex max-w-[560px] flex-col items-center rounded-[20px] px-8 py-16 text-center`}
      >
        <Image src="/payloat-mark.svg" alt="" width={44} height={44} className="h-11 w-auto" />
        <h2 className="mt-6 text-[22px] font-semibold tracking-[-0.4px] text-ink">Name the company this ledger is for</h2>
        <p className="mt-2 max-w-[400px] text-[15px] leading-[1.55] text-sub">
          Agents get keys under this organization. Everyone you add can see what those agents spend.
        </p>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Company name"
          aria-label="Company name"
          maxLength={120}
          className="mt-7 w-full max-w-[380px] rounded-[10px] border border-solid border-black/[0.12] bg-white px-4 py-3 text-[14px] text-ink outline-none transition-colors placeholder:text-[#b3b1ac] focus:border-black/30"
        />
        {error && <p className="mt-3 text-[13px]" style={{ color: "#c2402a" }}>{error}</p>}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
          <button type="submit" disabled={busy || !name.trim()} className="rounded-full bg-[#0a0a0a] px-6 py-3 text-[14px] font-medium text-white transition-transform hover:scale-[1.02] disabled:opacity-40">
            {busy ? "Creating…" : "Create organization"}
          </button>
          <button type="button" onClick={onPreview} className="rounded-full border border-solid border-black/[0.12] bg-white px-6 py-3 text-[14px] font-medium text-ink transition-transform hover:scale-[1.02]">
            Preview with sample data
          </button>
        </div>
      </motion.form>
    </div>
  );
}
