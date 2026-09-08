"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

/**
 * Payloat Ledger shell: auth gate, the org lookup, one shared load of
 * agents + purchases + events, and the persistent chrome every /web-app
 * route lives inside. Agents WRITE through the ledger-record function; the
 * browser READS. The only browser writes are creating an org and an agent.
 */

/* ---------- types (mirror 0010_agent_ledger.sql) ---------- */

export type PurchaseKind = "purchase" | "subscription" | "order" | "travel";
export type PurchaseStatus =
  | "intended"
  | "authorized"
  | "placed"
  | "confirmed"
  | "delivered"
  | "active"
  | "cancelled"
  | "refunded"
  | "flagged";
export type EventType = "intent" | "checkout" | "receipt" | "status" | "note";

export type Org = { id: string; name: string; created_at: string };

export type Agent = {
  id: string;
  name: string;
  role: string | null;
  status: "active" | "paused" | "revoked";
  key_prefix: string | null;
  created_at: string;
  last_event_at: string | null;
};

export type Purchase = {
  id: string;
  agent_id: string;
  external_id: string | null;
  merchant: string;
  merchant_domain: string | null;
  amount: number | string;
  currency: string;
  kind: PurchaseKind;
  status: PurchaseStatus;
  task: string | null;
  cap: number | string | null;
  placed_at: string;
  next_charge_at: string | null;
  expected_at: string | null;
  receipt_amount: number | string | null;
  receipt_url: string | null;
  note: string | null;
};

export type LedgerEvent = {
  id: string;
  agent_id: string;
  purchase_id: string | null;
  type: EventType;
  at: string;
  summary: string;
  hash: string;
};

export const KIND_NAME: Record<PurchaseKind, string> = {
  purchase: "Purchase",
  subscription: "Subscription",
  order: "Order",
  travel: "Travel",
};

export const STATUS_LABEL: Record<PurchaseStatus, string> = {
  intended: "Intended",
  authorized: "Authorized",
  placed: "Placed",
  confirmed: "Confirmed",
  delivered: "Delivered",
  active: "Active",
  cancelled: "Cancelled",
  refunded: "Refunded",
  flagged: "Flagged",
};

export const EVENT_LABEL: Record<EventType, string> = {
  intent: "Intent",
  checkout: "Checkout",
  receipt: "Receipt",
  status: "Status",
  note: "Note",
};

/* ---------- time helpers ---------- */

export const DAY = 86_400_000;

export function startOfDay(d: Date) {
  const c = new Date(d);
  c.setHours(0, 0, 0, 0);
  return c;
}

export function num(v: number | string | null | undefined): number {
  if (v === null || v === undefined) return 0;
  const n = typeof v === "number" ? v : parseFloat(v);
  return Number.isFinite(n) ? n : 0;
}

/** "tomorrow", "Friday", "Sep 14", or "was Sep 2" */
export function whenPhrase(iso: string | null): { text: string; overdue: boolean } {
  if (!iso) return { text: "no date", overdue: false };
  const d = new Date(iso);
  const today = startOfDay(new Date());
  const diff = Math.round((startOfDay(d).getTime() - today.getTime()) / DAY);
  const short = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  if (diff < 0) return { text: `was ${short}`, overdue: true };
  if (diff === 0) return { text: "today", overdue: false };
  if (diff === 1) return { text: "tomorrow", overdue: false };
  if (diff < 7) return { text: d.toLocaleDateString("en-US", { weekday: "long" }), overdue: false };
  return { text: short, overdue: false };
}

export function relTime(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const min = Math.floor(ms / 60_000);
  if (min < 2) return "just now";
  if (min < 60) return `${min} min ago`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  return days === 1 ? "yesterday" : `${days} days ago`;
}

/* ---------- what "needs a look" means (THIS-WEEK-PLAN.md) ---------- */

export type Issue = {
  code: "over_cap" | "receipt_mismatch" | "receipt_missing" | "renews_soon" | "late" | "flagged";
  label: string;
  tone: "alert" | "warn";
};

const SETTLED: PurchaseStatus[] = ["cancelled", "refunded", "delivered"];

export function isOpen(p: Purchase): boolean {
  return !SETTLED.includes(p.status);
}

export function issuesFor(p: Purchase): Issue[] {
  const out: Issue[] = [];
  const amount = num(p.amount);
  const cap = p.cap === null ? null : num(p.cap);
  const today = startOfDay(new Date()).getTime();
  if (p.status === "flagged") out.push({ code: "flagged", label: "Flagged by agent", tone: "alert" });
  if (cap !== null && amount > cap + 0.005)
    out.push({ code: "over_cap", label: `Over cap by $${(amount - cap).toFixed(2)}`, tone: "alert" });
  if (p.receipt_amount !== null && Math.abs(num(p.receipt_amount) - amount) > 0.01)
    out.push({ code: "receipt_mismatch", label: "Receipt doesn't match", tone: "alert" });
  if (
    p.receipt_amount === null &&
    ["placed", "confirmed", "delivered", "active"].includes(p.status) &&
    Date.now() - new Date(p.placed_at).getTime() > 2 * DAY
  )
    out.push({ code: "receipt_missing", label: "No receipt yet", tone: "warn" });
  if (p.kind === "subscription" && p.next_charge_at && p.status !== "cancelled") {
    const diff = startOfDay(new Date(p.next_charge_at)).getTime() - today;
    if (diff >= 0 && diff < 7 * DAY) out.push({ code: "renews_soon", label: "Renews this week", tone: "warn" });
  }
  if (
    (p.kind === "order" || p.kind === "travel") &&
    p.expected_at &&
    isOpen(p) &&
    startOfDay(new Date(p.expected_at)).getTime() < today
  )
    out.push({ code: "late", label: "Past expected date", tone: "alert" });
  return out;
}

/* ---------- nav ---------- */

type NavIconName =
  | "overview"
  | "agents"
  | "purchases"
  | "subscriptions"
  | "orders"
  | "receipts"
  | "ledger"
  | "connections"
  | "account";

type NavItem = {
  href: string;
  label: string;
  icon: NavIconName;
  badge?: (purchases: Purchase[]) => number;
};

const NAV_GROUPS: { label: string; items: NavItem[] }[] = [
  {
    label: "Visibility",
    items: [
      { href: "/web-app", label: "Overview", icon: "overview" },
      { href: "/web-app/agents", label: "Agents", icon: "agents" },
      {
        href: "/web-app/purchases",
        label: "Purchases",
        icon: "purchases",
        badge: (ps) => ps.filter((p) => issuesFor(p).length > 0).length,
      },
      { href: "/web-app/subscriptions", label: "Subscriptions", icon: "subscriptions" },
      { href: "/web-app/orders", label: "Orders & travel", icon: "orders" },
    ],
  },
  {
    label: "Records",
    items: [
      { href: "/web-app/receipts", label: "Receipts", icon: "receipts" },
      { href: "/web-app/ledger", label: "Ledger", icon: "ledger" },
    ],
  },
  {
    label: "Sources",
    items: [{ href: "/web-app/connections", label: "Connections", icon: "connections" }],
  },
  {
    label: "You",
    items: [{ href: "/web-app/account", label: "Account", icon: "account" }],
  },
];

const NAV: NavItem[] = NAV_GROUPS.flatMap((g) => g.items);

/* ---------- context ---------- */

type WebAppState = {
  user: User;
  org: Org | null;
  agents: Agent[];
  purchases: Purchase[];
  events: LedgerEvent[];
  /** true while the real org has at least one purchase or agent */
  hasRealData: boolean;
  preview: boolean;
  setPreview: (v: boolean) => void;
  showingSample: boolean;
  name: string;
  initial: string;
  agentName: (id: string) => string;
  reload: () => Promise<void>;
  beginSignOut: () => void;
};

const Ctx = createContext<WebAppState | null>(null);

export function useWebApp(): WebAppState {
  const v = useContext(Ctx);
  if (!v) throw new Error("useWebApp must be used inside the /web-app shell");
  return v;
}

export default function WebAppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [org, setOrg] = useState<Org | null | undefined>(undefined);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [events, setEvents] = useState<LedgerEvent[]>([]);
  const [firstName, setFirstName] = useState<string | null>(null);
  const [preview, setPreview] = useState(false);
  const signingOut = useRef(false);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (mounted) setUser(data.session?.user ?? null);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (user === null && !signingOut.current) router.replace("/signup");
  }, [user, router]);

  const reload = useCallback(async () => {
    if (!user) return;
    const { data: mem } = await supabase
      .from("org_members")
      .select("org_id, organizations(id,name,created_at)")
      .limit(1)
      .maybeSingle();
    const orgRow = (mem as { organizations?: Org | Org[] } | null)?.organizations;
    const found = Array.isArray(orgRow) ? (orgRow[0] ?? null) : (orgRow ?? null);
    setOrg(found);
    if (!found) {
      setAgents([]);
      setPurchases([]);
      setEvents([]);
      return;
    }
    const [a, p, e] = await Promise.all([
      supabase
        .from("agents")
        .select("id,name,role,status,key_prefix,created_at,last_event_at")
        .eq("org_id", found.id)
        .order("created_at", { ascending: true }),
      supabase
        .from("agent_purchases")
        .select(
          "id,agent_id,external_id,merchant,merchant_domain,amount,currency,kind,status,task,cap,placed_at,next_charge_at,expected_at,receipt_amount,receipt_url,note",
        )
        .eq("org_id", found.id)
        .order("placed_at", { ascending: false })
        .limit(1000),
      supabase
        .from("ledger_events")
        .select("id,agent_id,purchase_id,type,at,summary,hash")
        .eq("org_id", found.id)
        .order("at", { ascending: false })
        .limit(500),
    ]);
    setAgents((a.data as Agent[] | null) ?? []);
    setPurchases((p.data as Purchase[] | null) ?? []);
    setEvents((e.data as LedgerEvent[] | null) ?? []);
  }, [user]);

  useEffect(() => {
    if (!user) return;
    reload();
    supabase
      .from("profiles")
      .select("first_name")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => setFirstName(data?.first_name ?? null));
  }, [user, reload]);

  /* live: any new purchase or event for this org re-reads the ledger */
  useEffect(() => {
    if (!org) return;
    const ch = supabase
      .channel(`ledger-${org.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "agent_purchases", filter: `org_id=eq.${org.id}` },
        () => reload(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "ledger_events", filter: `org_id=eq.${org.id}` },
        () => reload(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [org, reload]);

  const sample = useMemo(() => sampleData(), []);

  if (!user || org === undefined) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f7f8]">
        <span className="h-6 w-6 animate-spin rounded-full border-2 border-solid border-[#0a0a0a] border-t-transparent" />
      </main>
    );
  }

  const name =
    firstName ??
    (user.user_metadata?.full_name as string | undefined)?.split(" ")[0] ??
    user.email?.split("@")[0] ??
    "there";
  const initial = name.charAt(0).toUpperCase();

  const hasRealData = purchases.length > 0 || agents.length > 0;
  const showingSample = preview && purchases.length === 0;
  const shownAgents = showingSample ? sample.agents : agents;
  const shownPurchases = showingSample ? sample.purchases : purchases;
  const shownEvents = showingSample ? sample.events : events;
  const agentName = (id: string) => shownAgents.find((a) => a.id === id)?.name ?? "Unknown agent";

  const onAccount = pathname?.startsWith("/web-app/account") ?? false;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const pageTitle = onAccount
    ? "Account"
    : pathname === "/web-app"
      ? `${greeting}, ${name}`
      : (NAV.find((n) => pathname?.startsWith(n.href) && n.href !== "/web-app")?.label ??
        `${greeting}, ${name}`);
  const isActive = (href: string) =>
    href === "/web-app" ? pathname === "/web-app" : (pathname?.startsWith(href) ?? false);

  const state: WebAppState = {
    user,
    org,
    agents: shownAgents,
    purchases: shownPurchases,
    events: shownEvents,
    hasRealData,
    preview,
    setPreview,
    showingSample,
    name,
    initial,
    agentName,
    reload,
    beginSignOut: () => {
      signingOut.current = true;
    },
  };

  return (
    <Ctx.Provider value={state}>
      <div className="min-h-screen bg-[#f7f7f8] min-[900px]:grid min-[900px]:grid-cols-[232px_1fr]">
        {/* ---- persistent sidebar rail (desktop) ---- */}
        <aside className="sticky top-0 hidden h-screen flex-col border-r border-solid border-black/[0.06] px-4 py-7 min-[900px]:flex">
          <Link href="/" className="flex items-center gap-2.5 px-2" aria-label="Payloat Ledger home">
            <Image
              src="/payloat-app-icon-v2.png"
              alt="Payloat"
              width={84}
              height={84}
              className="h-[42px] w-[42px] rounded-[10px]"
            />
            <span className="min-w-0">
              <span className="block text-[14px] font-semibold leading-tight text-ink">Ledger</span>
              <span className="block truncate text-[11px] text-sub">{org?.name ?? "No organization yet"}</span>
            </span>
          </Link>
          <nav className="mt-7 flex flex-col">
            {NAV_GROUPS.map((g) => (
              <div key={g.label} className="flex flex-col gap-1 pb-4">
                <span className="px-3 pb-1.5 pt-2 text-[10px] font-semibold uppercase tracking-[1.4px] text-sub/80">
                  {g.label}
                </span>
                {g.items.map((n) => {
                  const activeItem = isActive(n.href) && !onAccount;
                  const badge = n.badge ? n.badge(shownPurchases) : 0;
                  return (
                    <Link
                      key={n.href}
                      href={n.href}
                      className={`flex items-center gap-3 rounded-[12px] px-3 py-2.5 text-[14px] font-medium transition-colors ${
                        activeItem ? "bg-[#e9e9eb] text-ink" : "text-sub hover:text-ink"
                      }`}
                    >
                      <NavIcon name={n.icon} />
                      <span className="flex-1">{n.label}</span>
                      {badge > 0 && (
                        <span className="rounded-full bg-white px-2 py-0.5 font-numeral text-[11px] font-semibold text-ink">
                          {badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>
          <div className="mt-auto flex flex-col gap-4">
            <Link
              href="/contact"
              className="flex w-fit items-center gap-2.5 rounded-full border border-solid border-black/[0.07] bg-white px-4 py-2.5 text-[13px] font-semibold text-ink transition-transform hover:scale-[1.03]"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M20 12.5a7.5 7.5 0 0 1-11 6.6L4 20l1-4.6a7.5 7.5 0 1 1 15-2.9Z" />
              </svg>
              Help &amp; support
            </Link>
            <ViewPill />
            <Link
              href="/web-app/account"
              className={`flex items-center gap-3 rounded-[12px] px-2 py-1.5 transition-opacity hover:opacity-70 ${
                onAccount ? "bg-[#e9e9eb]" : ""
              }`}
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#d6f251] text-[14px] font-semibold text-ink">
                {initial}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-[14px] font-medium text-ink">{name}</span>
                <span className="block text-[12px] text-sub">Account</span>
              </span>
            </Link>
          </div>
        </aside>

        {/* ---- main column ---- */}
        <div className="min-w-0">
          <div className="flex items-center justify-between px-6 pt-7 min-[900px]:hidden">
            <Link href="/" aria-label="Payloat Ledger home">
              <Image
                src="/payloat-app-icon-v2.png"
                alt="Payloat"
                width={72}
                height={72}
                className="h-[36px] w-[36px] rounded-[9px]"
              />
            </Link>
            <div className="flex items-center gap-2.5">
              <ViewPill />
              <Link
                href="/web-app/account"
                aria-label="Account"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#d6f251] text-[14px] font-semibold text-ink"
              >
                {initial}
              </Link>
            </div>
          </div>
          <div className="mx-auto flex w-full max-w-[1120px] items-center justify-between gap-4 px-6 pt-7 min-[900px]:px-10 min-[900px]:pt-8">
            <h1 className="truncate text-[clamp(22px,2.4vw,28px)] font-semibold tracking-[-0.6px] text-ink">
              {pageTitle}
            </h1>
            <div className="hidden shrink-0 items-center gap-2 min-[900px]:flex">
              <ViewPill tall />
              <Link
                href="/web-app/connections"
                aria-label="Connections"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-solid border-black/[0.07] bg-white text-ink transition-colors hover:bg-[#f0f0f2]"
              >
                <NavIcon name="connections" />
              </Link>
              <Link
                href="/web-app/account"
                aria-label="Account"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-solid border-black/[0.07] bg-white text-[13px] font-semibold text-ink transition-colors hover:bg-[#f0f0f2]"
              >
                {initial}
              </Link>
            </div>
          </div>
          <div className="scrollbar-none flex gap-5 overflow-x-auto border-b border-solid border-black/[0.06] px-6 pt-5 min-[900px]:hidden">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className={`shrink-0 border-b-2 border-solid pb-2.5 text-[13px] font-semibold transition-colors ${
                  isActive(n.href) && !onAccount ? "border-[#0a0a0a] text-ink" : "border-transparent text-sub"
                }`}
              >
                {n.label}
              </Link>
            ))}
          </div>
          {children}
        </div>
      </div>
    </Ctx.Provider>
  );
}

/* ---------- chrome ---------- */

function ViewPill({ tall }: { tall?: boolean }) {
  return (
    <span
      className={`flex items-center gap-1.5 self-start rounded-full border border-solid border-black/[0.07] bg-white px-3 text-[11px] font-semibold text-ink ${
        tall ? "h-10 px-3.5" : "py-1.5"
      }`}
      title="Agents write through the API. The browser reads."
    >
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M2.5 12s3.5-6.5 9.5-6.5 9.5 6.5 9.5 6.5-3.5 6.5-9.5 6.5S2.5 12 2.5 12Z" />
        <circle cx="12" cy="12" r="2.8" />
      </svg>
      Agents write, you view
    </span>
  );
}

function NavIcon({ name }: { name: NavIconName }) {
  const stroke = {
    width: "17",
    height: "17",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.7",
    strokeLinecap: "round",
    strokeLinejoin: "round",
  } as const;
  switch (name) {
    case "overview":
      return (
        <svg {...stroke} aria-hidden>
          <circle cx="12" cy="12" r="2" />
          <path d="M16.2 7.8a6 6 0 0 1 0 8.4M7.8 16.2a6 6 0 0 1 0-8.4M19 5a10 10 0 0 1 0 14M5 19A10 10 0 0 1 5 5" />
        </svg>
      );
    case "agents":
      return (
        <svg {...stroke} aria-hidden>
          <rect x="5" y="7" width="14" height="11" rx="3" />
          <path d="M9 12h.01M15 12h.01M12 3.5V7M9 21h6" />
        </svg>
      );
    case "purchases":
      return (
        <svg {...stroke} aria-hidden>
          <path d="M4 6h16M4 12h10M4 18h7" />
        </svg>
      );
    case "subscriptions":
      return (
        <svg {...stroke} aria-hidden>
          <path d="M20 12a8 8 0 1 1-2.3-5.6M20 3.5V8h-4.5" />
        </svg>
      );
    case "orders":
      return (
        <svg {...stroke} aria-hidden>
          <path d="M3.5 9.5 12 5l8.5 4.5v9L12 23l-8.5-4.5v-9Z" transform="translate(0 -2)" />
          <path d="M3.5 7.5 12 12l8.5-4.5M12 12v9" />
        </svg>
      );
    case "receipts":
      return (
        <svg {...stroke} aria-hidden>
          <path d="M6 3.5h12v17l-2-1.5-2 1.5-2-1.5-2 1.5-2-1.5-2 1.5v-17Z" />
          <path d="M9 8h6M9 11.5h6M9 15h4" />
        </svg>
      );
    case "ledger":
      return (
        <svg {...stroke} aria-hidden>
          <rect x="4" y="4" width="16" height="16" rx="2.5" />
          <path d="M8 9h8M8 12.5h8M8 16h5" />
        </svg>
      );
    case "connections":
      return (
        <svg {...stroke} aria-hidden>
          <path d="M10.5 13.5a4 4 0 0 0 6 .4l2.3-2.3a4 4 0 1 0-5.7-5.7l-1.2 1.2" />
          <path d="M13.5 10.5a4 4 0 0 0-6-.4l-2.3 2.3a4 4 0 1 0 5.7 5.7l1.2-1.2" />
        </svg>
      );
    case "account":
      return (
        <svg {...stroke} aria-hidden>
          <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 8c1.4-3.3 4-5 7-5s5.6 1.7 7 5" />
        </svg>
      );
  }
}

/* ---------- labeled sample preview (empty-state only) ----------
   A restaurant persona, per THIS-WEEK-PLAN.md. Rendered only while the real
   org has no purchases and the owner turns the preview on. Never mixed
   with real rows; every id starts with "sample-". */

function sampleData(): { agents: Agent[]; purchases: Purchase[]; events: LedgerEvent[] } {
  const at = (days: number, hour = 10) =>
    new Date(startOfDay(new Date()).getTime() + days * DAY + hour * 3600_000).toISOString();
  const agents: Agent[] = [
    { id: "sample-a1", name: "Procurement", role: "Orders produce, dry goods, and supplies", status: "active", key_prefix: "pl_live_sa", created_at: at(-40), last_event_at: at(0, 7) },
    { id: "sample-a2", name: "Software & seats", role: "Keeps subscriptions and seats current", status: "active", key_prefix: "pl_live_sb", created_at: at(-40), last_event_at: at(-1, 18) },
    { id: "sample-a3", name: "Travel", role: "Books trips for hiring and supplier visits", status: "paused", key_prefix: "pl_live_sc", created_at: at(-22), last_event_at: at(-5, 12) },
  ];
  const mk = (
    id: string,
    agent_id: string,
    merchant: string,
    amount: number,
    kind: PurchaseKind,
    status: PurchaseStatus,
    task: string,
    placed: number,
    extra: Partial<Purchase> = {},
  ): Purchase => ({
    id: `sample-${id}`,
    agent_id,
    external_id: id,
    merchant,
    merchant_domain: null,
    amount,
    currency: "USD",
    kind,
    status,
    task,
    cap: null,
    placed_at: at(placed, 9),
    next_charge_at: null,
    expected_at: null,
    receipt_amount: null,
    receipt_url: null,
    note: null,
    ...extra,
  });
  const purchases: Purchase[] = [
    mk("po-1042", "sample-a1", "Sysco", 412.8, "order", "placed", "Weekly produce restock", -1, { cap: 500, expected_at: at(1), receipt_amount: 412.8 }),
    mk("po-1041", "sample-a1", "Restaurant Depot", 238.14, "order", "delivered", "Dry goods and paper", -4, { cap: 300, receipt_amount: 251.02 }),
    mk("po-1040", "sample-a1", "WebstaurantStore", 96.5, "purchase", "confirmed", "Replace two sauté pans", -3, { cap: 80, receipt_amount: 96.5 }),
    mk("po-1039", "sample-a1", "Uline", 143.9, "order", "placed", "Takeout packaging, 4 cases", -6, { cap: 200, expected_at: at(-1), receipt_amount: 143.9 }),
    mk("po-1038", "sample-a1", "Instacart", 61.22, "purchase", "placed", "Emergency lime and cilantro run", -3, { cap: 75 }),
    mk("sub-toast", "sample-a2", "Toast", 165, "subscription", "active", "POS plan, 3 terminals", -28, { next_charge_at: at(4), receipt_amount: 165 }),
    mk("sub-gws", "sample-a2", "Google Workspace", 115.2, "subscription", "active", "8 seats for managers", -20, { next_charge_at: at(12), receipt_amount: 115.2 }),
    mk("sub-square", "sample-a2", "Square Payroll", 105, "subscription", "active", "Payroll for 14 staff", -15, { next_charge_at: at(2), receipt_amount: 105 }),
    mk("sub-7shifts", "sample-a2", "7shifts", 34.99, "subscription", "active", "Scheduling, 1 location", -9, { next_charge_at: at(21), receipt_amount: 34.99 }),
    mk("sub-slack", "sample-a2", "Slack", 43.5, "subscription", "cancelled", "Dropped after moving to Workspace chat", -33, { receipt_amount: 43.5 }),
    mk("trip-chi", "sample-a3", "Marriott Chicago", 389, "travel", "confirmed", "Hiring trip, sous chef interviews", -5, { cap: 450, expected_at: at(9), receipt_amount: 389 }),
    mk("trip-united", "sample-a3", "United Airlines", 276.4, "travel", "confirmed", "Flights for the Chicago trip", -5, { cap: 350, expected_at: at(9), receipt_amount: 276.4 }),
    mk("po-1037", "sample-a1", "Chefs' Warehouse", 528.6, "order", "refunded", "Dairy order, arrived warm", -11, { cap: 600, receipt_amount: 528.6 }),
  ];
  const ev = (id: string, agent_id: string, purchase_id: string, type: EventType, days: number, hour: number, summary: string): LedgerEvent => ({
    id: `sample-e-${id}`,
    agent_id,
    purchase_id: `sample-${purchase_id}`,
    type,
    at: at(days, hour),
    summary,
    hash: `${id}9f2c4a7e1b3d`.padEnd(24, "0"),
  });
  const events: LedgerEvent[] = [
    ev("1", "sample-a1", "po-1042", "receipt", 0, 7, "Sysco invoice matched at $412.80"),
    ev("2", "sample-a1", "po-1042", "checkout", -1, 9, "Placed weekly produce order, $412.80 of $500 cap"),
    ev("3", "sample-a1", "po-1042", "intent", -1, 8, "Task: weekly produce restock, cap $500"),
    ev("4", "sample-a2", "sub-square", "status", -1, 18, "Square Payroll renews Thursday, $105"),
    ev("5", "sample-a1", "po-1040", "checkout", -3, 11, "Bought two sauté pans, $96.50 over the $80 cap"),
    ev("6", "sample-a1", "po-1040", "intent", -3, 10, "Task: replace two sauté pans, cap $80"),
    ev("7", "sample-a1", "po-1038", "checkout", -3, 15, "Instacart run for limes and cilantro, $61.22"),
    ev("8", "sample-a1", "po-1041", "receipt", -4, 16, "Restaurant Depot receipt reads $251.02, order was $238.14"),
    ev("9", "sample-a1", "po-1041", "status", -4, 14, "Delivered to back door, signed by Ana"),
    ev("10", "sample-a3", "trip-chi", "checkout", -5, 12, "Booked Marriott Chicago, 2 nights, $389"),
    ev("11", "sample-a3", "trip-united", "checkout", -5, 12, "Booked United round trip, $276.40"),
    ev("12", "sample-a1", "po-1039", "checkout", -6, 9, "Ordered 4 cases takeout packaging, expected in 5 days"),
    ev("13", "sample-a1", "po-1037", "status", -9, 10, "Chefs' Warehouse refunded $528.60 in full"),
    ev("14", "sample-a1", "po-1037", "note", -11, 13, "Dairy arrived warm, refund requested"),
  ];
  return { agents, purchases, events };
}
