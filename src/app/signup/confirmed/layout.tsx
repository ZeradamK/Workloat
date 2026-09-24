import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "You're signed up — Payloat",
  description:
    "Your place is recorded. We will write to you the moment Payloat Ledger opens.",
  robots: { index: false, follow: true },
};

export default function ConfirmedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
