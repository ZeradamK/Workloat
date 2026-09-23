import type { Metadata } from "next";
import WebAppShell from "./shell";

export const metadata: Metadata = {
  title: "Ledger — Payloat",
  description: "What your agents spent, what they were asked to do, and whether the receipts match. Agents write, you view.",
  robots: { index: false, follow: false },
};

export default function WebAppLayout({ children }: { children: React.ReactNode }) {
  return <WebAppShell>{children}</WebAppShell>;
}
