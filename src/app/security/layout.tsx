import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Security — Payloat",
  description:
    "How Payloat Ledger protects your organization and your agents' purchase data.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
