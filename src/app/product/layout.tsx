import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Product — Payloat",
  description:
    "Everything Payloat watches after you pay: returns, refunds, renewals, subscriptions, security, and your data.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
