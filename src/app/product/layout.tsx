import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Product — Payloat",
  description:
    "Everything Payloat Ledger sees after an agent pays: purchases, receipts, subscriptions, orders, travel, security, and your data.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
