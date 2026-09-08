"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { supabase } from "@/lib/supabase";
import { relTime, useWebApp } from "../shell";
import { CARD, Eyebrow, GREEN } from "../pieces";

/**
 * Connections: where agents get their keys, and where card feeds will
 * plug in later. Creating an agent is one of the two browser writes.
 * The key is shown once and never stored in plain text.
 */

const EASE = [0.25, 0.6, 0.2, 1] as const;

const ENDPOINT = `${process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://xtjcsgsmvzulthfltnux.supabase.co"}/functions/v1/ledger-record`;

export default function ConnectionsPage() {
  const { org, agents, showingSample, reload } = useWebApp();
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [issued, setIssued] = useState<{ name: string; key: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!org || !name.trim()) return;
    setBusy(true);
    setError(null);
    const { data, error } = await supabase.rpc("create_agent", { p_org: org.id, p_name: name.trim(), p_role: role.trim() || null });
    if (error) {
      setError(error.message.includes("does not exist") ? "The ledger tables aren't in this project yet. Apply migration 0010 first." : error.message);
      setBusy(false);
      return;
    }
    const row = Array.isArray(data) ? data[0] : data;
    setIssued({ name: name.trim(), key: (row as { api_key: string }).api_key });
    setName("");
    setRole("");
    setBusy(false);
    await reload();
  };

  const copy = async () => {
    if (!issued) return;
    try {
      await navigator.clipboard.writeText(issued.key);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked: the key is still on screen */
    }
  };

  const curl = `curl -X POST ${ENDPOINT} \\
  -H "Authorization: Bearer ${issued?.key ?? "pl_live_…"}" \\
  -H "Content-Type: application/json" \\
  -d '{"type":"intent","summary":"Task: weekly produce restock, cap $500",
       "purchase":{"external_id":"po-1","merchant":"Sysco","kind":"order","task":"Weekly produce restock","cap":500}}'`;

  return (
    <div className="mx-auto w-full max-w-[880px] px-6 pb-24 pt-6 min-[900px]:px-10">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE }} className="mt-4">
        <Eyebrow>Agents</Eyebrow>
        <div className="mt-2 flex flex-col gap-3">
          {agents.length === 0 && (
            <p className="text-[13px] text-sub">No agents yet. Create the first one below.</p>
          )}
          {agents.map((a) => (
            <div key={a.id} className={`${CARD} flex items-center gap-4 px-5 py-4`}>
              <span className="min-w-0 flex-1">
                <span className="block text-[15px] font-semibold text-ink">{a.name}</span>
                <span className="block text-[12px] text-sub">
                  {a.key_prefix ? `${a.key_prefix}…` : "no key"} · {a.last_event_at ? `last wrote ${relTime(a.last_event_at)}` : "hasn't written yet"}
                </span>
              </span>
              <span className="rounded-full px-3 py-1.5 text-[11px] font-semibold" style={{ backgroundColor: a.status === "active" ? "rgba(30,158,86,0.12)" : "#f2f2f3", color: a.status === "active" ? GREEN : "#75736e" }}>
                {a.status === "active" ? "Active" : a.status === "paused" ? "Paused" : "Revoked"}
              </span>
            </div>
          ))}
        </div>

        {issued ? (
          <div className={`${CARD} mt-4 border-[#4477f6] p-5`}>
            <Eyebrow>Key for {issued.name}</Eyebrow>
            <p className="mt-2 text-[13px] text-sub">Copy it now. It is shown once and stored only as a hash.</p>
            <div className="mt-3 flex items-center gap-2 rounded-[10px] bg-[#f7f7f8] px-4 py-3">
              <code className="min-w-0 flex-1 truncate font-mono text-[13px] text-ink">{issued.key}</code>
              <button type="button" onClick={copy} className="shrink-0 rounded-full bg-[#0a0a0a] px-3.5 py-1.5 text-[11px] font-semibold text-white">
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <p className="mt-5 text-[13px] font-semibold text-ink">First call</p>
            <pre className="mt-2 overflow-x-auto rounded-[10px] bg-[#0a0a0a] px-4 py-3.5 font-mono text-[11.5px] leading-[1.6] text-white/90">{curl}</pre>
            <button type="button" onClick={() => setIssued(null)} className="mt-4 text-[13px] font-semibold text-ink underline-offset-2 hover:underline">
              Done, hide the key
            </button>
          </div>
        ) : (
          <form onSubmit={create} className={`${CARD} mt-4 p-5`}>
            <Eyebrow>New agent</Eyebrow>
            <div className="mt-3 grid gap-3 min-[640px]:grid-cols-2">
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Name, like Procurement" aria-label="Agent name" maxLength={80} disabled={showingSample || !org} className="w-full rounded-[10px] border border-solid border-black/[0.12] bg-white px-4 py-3 text-[14px] text-ink outline-none transition-colors placeholder:text-[#b3b1ac] focus:border-black/30 disabled:opacity-50" />
              <input type="text" value={role} onChange={(e) => setRole(e.target.value)} placeholder="What it does, like orders produce" aria-label="Agent description" maxLength={160} disabled={showingSample || !org} className="w-full rounded-[10px] border border-solid border-black/[0.12] bg-white px-4 py-3 text-[14px] text-ink outline-none transition-colors placeholder:text-[#b3b1ac] focus:border-black/30 disabled:opacity-50" />
            </div>
            {error && <p className="mt-3 text-[13px]" style={{ color: "#c2402a" }}>{error}</p>}
            {showingSample && <p className="mt-3 text-[13px] text-sub">Exit the sample preview to create a real agent.</p>}
            {!org && <p className="mt-3 text-[13px] text-sub">Create your organization on the Overview first.</p>}
            <button type="submit" disabled={busy || !name.trim() || showingSample || !org} className="mt-4 rounded-full bg-[#0a0a0a] px-6 py-3 text-[14px] font-medium text-white transition-transform hover:scale-[1.02] disabled:opacity-40">
              {busy ? "Creating…" : "Create agent and show its key"}
            </button>
          </form>
        )}
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE, delay: 0.06 }} className="mt-10">
        <Eyebrow>How agents write</Eyebrow>
        <div className={`${CARD} mt-2 px-5 py-4`}>
          <p className="text-[13px] leading-[1.6] text-sub">
            One POST per event to <code className="font-mono text-[12px] text-ink">{ENDPOINT}</code> with the agent&apos;s key as a Bearer token. Types: <b className="font-semibold text-ink">intent</b> (the task and cap before buying), <b className="font-semibold text-ink">checkout</b> (merchant and amount), <b className="font-semibold text-ink">receipt</b> (the number on the paper), <b className="font-semibold text-ink">status</b> (placed, delivered, refunded), <b className="font-semibold text-ink">note</b>. Use the same <code className="font-mono text-[12px] text-ink">external_id</code> to keep events on one purchase.
          </p>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE, delay: 0.1 }} className="mt-10">
        <Eyebrow>Card feeds</Eyebrow>
        <div className="mt-2 flex flex-col gap-3">
          {[
            ["Ramp", "Match agent card transactions to ledger purchases."],
            ["Brex", "Match agent card transactions to ledger purchases."],
            ["Mercury", "Match agent card transactions to ledger purchases."],
            ["Bank & cards via Teller", "Any other card the agents spend on."],
          ].map(([title, detail]) => (
            <div key={title} className={`${CARD} flex items-center gap-4 px-5 py-4`}>
              <span className="min-w-0 flex-1">
                <span className="block text-[15px] font-semibold text-ink">{title}</span>
                <span className="block text-[12px] text-sub">{detail}</span>
              </span>
              <span className="rounded-full bg-[#f2f2f3] px-3 py-1.5 text-[11px] font-semibold text-[#75736e]">Planned</span>
            </div>
          ))}
        </div>
      </motion.div>

      <p className="mt-16 text-center text-[12px] text-sub">Keys are hashed at rest. The browser never sees one twice.</p>
    </div>
  );
}
