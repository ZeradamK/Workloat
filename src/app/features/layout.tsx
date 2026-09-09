import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Features — Payloat",
  description:
    "Record, match, and summarize. Payloat Ledger records what your agents buy, matches the receipts, and turns agent spend into a view you can trust.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
