import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Purchases — Payloat",
  description:
    "Every purchase accounted for, from checkout to refund.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
