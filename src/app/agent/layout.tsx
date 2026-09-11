import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Meet Payloat — the agent that keeps your agents on budget",
  description:
    "Payloat is an agent of its own. It reads every purchase your other agents make, matches the receipts, watches the caps, and answers when anyone asks.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
