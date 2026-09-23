"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { money } from "@/components/tracker/money";
import {
  DAY,
  EVENT_LABEL,
  KIND_NAME,
  STATUS_LABEL,
  issuesFor,
  num,
  startOfDay,
  useWebApp,
  whenPhrase,
  type Issue,
  type LedgerEvent,
  type Purchase,
  type PurchaseKind,
  type PurchaseStatus,
} from "./shell";

/**
 * Shared pieces on the white-card system. A purchase row reads: kind tile,
 * merchant + the task the agent was given, issue chips, amount. The drawer
 * shows the whole story: task, cap, receipt, and the event timeline.
 */

const EASE = [0.25, 0.6, 0.2, 1] as const;

export const CARD =
  "rounded-[14px] border border-solid border-black/[0.07] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03)]";

export const GREEN = "#1e9e56";
export const BLUE = "#4477f6";
export const ALERT = "#c2402a";
export const WARN = "#9a6b00";

export function fullDate(iso: string | null): string {
  if (!iso) return "No date";
  const d = new Date(iso);
  const text = d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const diff = Math.round((startOfDay(d).getTime() - startOfDay(new Date()).getTime()) / DAY);
  const rel =
    diff === 0 ? "today" : diff === 1 ? "tomorrow" : diff > 1 ? `in ${diff} days` : diff === -1 ? "yesterday" : `${-diff} days ago`;
  return `${text} · ${rel}`;
}

/** the "when" line for a purchase, by kind */
export function whenLine(p: Purchase): { text: string; overdue: boolean } {
  if (p.kind === "subscription") {
    if (p.status === "cancelled") return { text: "Cancelled", overdue: false };
    const w = whenPhrase(p.next_charge_at);
    return { text: `Renews ${w.text}`, overdue: false };
  }
  if (p.kind === "order" || p.kind === "travel") {
    if (p.status === "delivered") return { text: "Delivered", overdue: false };
    if (p.status === "refunded") return { text: "Refunded", overdue: false };
    if (p.status === "cancelled") return { text: "Cancelled", overdue: false };
    const w = whenPhrase(p.expected_at);
    return { text: p.kind === "travel" ? `Trip ${w.text}` : `Expected ${w.text}`, overdue: w.overdue };
  }
  return { text: STATUS_LABEL[p.status], overdue: false };
}

export function amountParts(p: Purchase): { text: string; color: string } {
  const m = money(num(p.amount));
  return p.status === "refunded" ? { text: `+${m}`, color: GREEN } : { text: m, color: "#0a0a0a" };
}

export function Eyebrow({ children, href }: { children: React.ReactNode; href?: string }) {
  const inner = (
    <>
      {children}
      {href && (
        <svg width="9" height="9" viewBox="0 0 16 16" fill="none" aria-hidden>
          <path d="m6 3.5 5 4.5-5 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </>
  );
  const cls = "flex w-fit items-center gap-1 text-[10px] font-semibold uppercase tracking-[1.4px]";
  return href ? (
    <Link href={href} className={`${cls} text-sub transition-colors hover:text-ink`}>
      {inner}
    </Link>
  ) : (
    <span className={`${cls} text-sub`}>{inner}</span>
  );
}

export function Stat({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className={`${CARD} px-5 py-4`}>
      <Eyebrow>{label}</Eyebrow>
      <span className="mt-1.5 block font-numeral text-[24px] font-semibold tracking-[-0.8px] text-ink">{value}</span>
      {note && <span className="text-[12px] text-sub">{note}</span>}
    </div>
  );
}

export function StatusPill({ status }: { status: PurchaseStatus }) {
  const tone =
    status === "flagged"
      ? { bg: "rgba(194,64,42,0.1)", color: ALERT }
      : status === "refunded" || status === "delivered"
        ? { bg: "rgba(30,158,86,0.12)", color: GREEN }
        : status === "cancelled"
          ? { bg: "#f2f2f3", color: "#75736e" }
          : status === "active" || status === "confirmed"
            ? { bg: "rgba(68,119,246,0.12)", color: BLUE }
            : { bg: "#f2f2f3", color: "#0a0a0a" };
  return (
    <span className="rounded-full px-2.5 py-1 text-[10px] font-semibold" style={{ backgroundColor: tone.bg, color: tone.color }}>
      {STATUS_LABEL[status]}
    </span>
  );
}

export function IssueChips({ issues, max = 2 }: { issues: Issue[]; max?: number }) {
  if (issues.length === 0) return null;
  return (
    <span className="flex flex-wrap gap-1">
      {issues.slice(0, max).map((i) => (
        <span
          key={i.code}
          className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
          style={{
            backgroundColor: i.tone === "alert" ? "rgba(194,64,42,0.1)" : "rgba(154,107,0,0.12)",
            color: i.tone === "alert" ? ALERT : WARN,
          }}
        >
          {i.label}
        </span>
      ))}
      {issues.length > max && <span className="text-[10px] font-semibold text-sub">+{issues.length - max}</span>}
    </span>
  );
}

export function Group({
  title,
  items,
  tone,
  onSelect,
}: {
  title: string;
  items: Purchase[];
  tone?: "alert";
  onSelect?: (p: Purchase) => void;
}) {
  return (
    <div className={`${CARD} mt-4 px-5 py-4`}>
      <div className="flex items-center gap-2">
        <Eyebrow>{title}</Eyebrow>
        {tone === "alert" && <span className="h-1.5 w-1.5 rounded-full bg-[#e5484d]" aria-hidden />}
      </div>
      <div className="mt-1 flex flex-col divide-y divide-black/5">
        {items.map((p) => (
          <PurchaseRow key={p.id} purchase={p} onSelect={onSelect} />
        ))}
      </div>
    </div>
  );
}

export function PurchaseRow({
  purchase: p,
  onSelect,
  showAgent = true,
}: {
  purchase: Purchase;
  onSelect?: (p: Purchase) => void;
  showAgent?: boolean;
}) {
  const { agentName } = useWebApp();
  const when = whenLine(p);
  const amt = amountParts(p);
  const issues = issuesFor(p);
  const inner = (
    <>
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-[#f2f2f3]">
        <KindIcon kind={p.kind} size={16} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="truncate text-[14px] font-semibold text-ink">{p.merchant}</span>
          <IssueChips issues={issues} max={1} />
        </span>
        <span className="block truncate text-[12px] leading-snug" style={{ color: when.overdue ? ALERT : undefined }}>
          <span className={when.overdue ? "" : "text-sub"}>
            {when.text}
            {showAgent && ` · ${agentName(p.agent_id)}`}
            {p.task && ` · ${p.task}`}
          </span>
        </span>
      </span>
      <span className="font-numeral text-[14px] font-semibold tracking-[-0.3px]" style={{ color: amt.color }}>
        {amt.text}
      </span>
    </>
  );
  const cls = "flex w-full items-center gap-3 py-3";
  return onSelect ? (
    <button type="button" onClick={() => onSelect(p)} className={`${cls} text-left transition-opacity hover:opacity-60`}>
      {inner}
    </button>
  ) : (
    <div className={cls}>{inner}</div>
  );
}

/* the detail drawer: the purchase's whole story, read-only */
export function PurchaseDrawer({ purchase: p, onClose }: { purchase: Purchase | null; onClose: () => void }) {
  const { events, agentName, showingSample } = useWebApp();
  useEffect(() => {
    if (!p) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [p, onClose]);

  const timeline: LedgerEvent[] = p ? events.filter((e) => e.purchase_id === p.id) : [];
  const issues = p ? issuesFor(p) : [];
  const amt = p ? amountParts(p) : null;
  const when = p ? whenLine(p) : null;

  return (
    <AnimatePresence>
      {p && amt && when && (
        <>
          <motion.button
            type="button"
            aria-label="Close details"
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          />
          <motion.aside
            role="dialog"
            aria-label={`${p.merchant} details`}
            className="fixed right-0 top-0 z-50 flex h-full w-[min(440px,92vw)] flex-col overflow-y-auto border-l border-solid border-black/[0.07] bg-white px-7 pb-8 pt-6"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.32, ease: EASE }}
          >
            <button type="button" onClick={onClose} aria-label="Close" className="self-end p-2 text-sub transition-opacity hover:opacity-60">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>

            <div className="mt-2 flex items-start justify-between gap-4">
              <span className="flex h-[48px] w-[48px] items-center justify-center rounded-[12px] bg-[#f2f2f3]">
                <KindIcon kind={p.kind} size={20} />
              </span>
              <span className="font-numeral text-[28px] font-semibold tracking-[-1px]" style={{ color: amt.color }}>
                {amt.text}
              </span>
            </div>
            <h2 className="mt-4 text-[22px] font-semibold tracking-[-0.5px] text-ink">{p.merchant}</h2>
            <p className="mt-1 flex items-center gap-2 text-[14px]">
              <StatusPill status={p.status} />
              <span className={when.overdue ? "" : "text-sub"} style={{ color: when.overdue ? ALERT : undefined }}>
                {when.text}
              </span>
            </p>
            {issues.length > 0 && (
              <div className="mt-3">
                <IssueChips issues={issues} max={4} />
              </div>
            )}

            {p.task && (
              <div className="mt-6 rounded-[12px] bg-[#f7f7f8] px-4 py-3.5">
                <Eyebrow>What the agent was asked</Eyebrow>
                <p className="mt-1.5 text-[14px] leading-[1.5] text-ink">{p.task}</p>
              </div>
            )}

            <div className="mt-6 divide-y divide-black/5 border-y border-solid border-black/5">
              <Field k="Agent" v={agentName(p.agent_id)} />
              <Field k="Kind" v={KIND_NAME[p.kind]} />
              <Field k="Cap given" v={p.cap === null ? "None" : money(num(p.cap))} alert={issues.some((i) => i.code === "over_cap")} />
              <Field k="Placed" v={fullDate(p.placed_at)} />
              {p.kind === "subscription" && <Field k="Next charge" v={fullDate(p.next_charge_at)} />}
              {(p.kind === "order" || p.kind === "travel") && (
                <Field k={p.kind === "travel" ? "Trip date" : "Expected"} v={fullDate(p.expected_at)} alert={when.overdue} />
              )}
              <Field
                k="Receipt"
                v={p.receipt_amount === null ? "Not received" : money(num(p.receipt_amount))}
                alert={issues.some((i) => i.code === "receipt_mismatch")}
              />
              {p.external_id && <Field k="Agent reference" v={p.external_id} mono />}
            </div>

            {p.receipt_url && !showingSample && (
              <a
                href={p.receipt_url}
                target="_blank"
                rel="noreferrer"
                className="mt-5 flex items-center justify-between rounded-[12px] border border-solid border-black/[0.07] bg-white px-4 py-3.5 text-[13px] font-semibold text-ink transition-colors hover:bg-[#f7f7f8]"
              >
                Open receipt
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden>
                  <path d="m6 3.5 5 4.5-5 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            )}

            <div className="mt-7">
              <Eyebrow>Timeline</Eyebrow>
              {timeline.length === 0 ? (
                <p className="mt-2 text-[13px] text-sub">No events recorded for this purchase yet.</p>
              ) : (
                <ol className="mt-2 flex flex-col">
                  {timeline.map((e, i) => (
                    <li key={e.id} className="relative flex gap-3 pb-4">
                      {i < timeline.length - 1 && <span className="absolute left-[5px] top-4 h-full w-px bg-black/10" aria-hidden />}
                      <span className="mt-1.5 h-[11px] w-[11px] shrink-0 rounded-full border-2 border-solid border-white" style={{ backgroundColor: e.type === "receipt" ? GREEN : e.type === "intent" ? BLUE : "#0a0a0a" }} aria-hidden />
                      <span className="min-w-0">
                        <span className="block text-[13px] leading-snug text-ink">{e.summary}</span>
                        <span className="block text-[11px] text-sub">
                          {EVENT_LABEL[e.type]} · {new Date(e.at).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                        </span>
                      </span>
                    </li>
                  ))}
                </ol>
              )}
            </div>

            {p.note && <p className="mt-2 text-[13px] leading-[1.5] text-sub">{p.note}</p>}

            <p className="mt-auto pt-8 text-[12px] text-sub">Read-only. The agent that made this purchase updates it through the API.</p>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function Field({ k, v, alert, mono }: { k: string; v: string; alert?: boolean; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3.5">
      <span className="text-[13px] text-sub">{k}</span>
      <span className={`text-right text-[13px] font-medium ${mono ? "font-mono text-[12px]" : ""}`} style={{ color: alert ? ALERT : "#0a0a0a" }}>
        {v}
      </span>
    </div>
  );
}

export function KindIcon({ kind, size = 18 }: { kind: PurchaseKind; size?: number }) {
  const stroke = {
    width: String(size),
    height: String(size),
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "#0a0a0a",
    strokeWidth: "1.7",
    strokeLinecap: "round",
    strokeLinejoin: "round",
  } as const;
  switch (kind) {
    case "subscription":
      return (
        <svg {...stroke} aria-hidden>
          <path d="M20 12a8 8 0 1 1-2.3-5.6M20 3.5V8h-4.5" />
        </svg>
      );
    case "order":
      return (
        <svg {...stroke} aria-hidden>
          <path d="M3.5 7.5 12 3l8.5 4.5v9L12 21l-8.5-4.5v-9Z" />
          <path d="M3.5 7.5 12 12l8.5-4.5M12 12v9" />
        </svg>
      );
    case "travel":
      return (
        <svg {...stroke} aria-hidden>
          <path d="M10.5 13.5 4 11l1.5-1.5 6 1 5-5a1.8 1.8 0 0 1 2.5 2.5l-5 5 1 6L13.5 20l-2.5-6.5" />
        </svg>
      );
    default:
      return (
        <svg {...stroke} aria-hidden>
          <path d="M6 7h12l-1 12H7L6 7Z" />
          <path d="M9 7V5.5a3 3 0 0 1 6 0V7" />
        </svg>
      );
  }
}
