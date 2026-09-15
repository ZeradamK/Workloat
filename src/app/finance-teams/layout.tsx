import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Financial teams — Payloat",
  description:
    "Payle is the financial manager agent for teams that run on agents. It plans budgets, approves agent charges, and closes the month on Payloat infrastructure.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
