import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Purchases — Payloat",
  description:
    "Every agent purchase accounted for, from intent to receipt.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
