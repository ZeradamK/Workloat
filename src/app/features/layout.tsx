import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Features — Payloat",
  description:
    "Track, request, and recover. Payloat reads receipts, follows refunds, and turns purchases into insight.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
