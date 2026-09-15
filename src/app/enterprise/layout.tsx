import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Enterprise — Payloat",
  description:
    "Payloat for enterprises: one ledger for every agent's spend across every team, bank, and card.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
