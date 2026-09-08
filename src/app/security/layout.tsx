import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Security — Payloat",
  description:
    "How Payloat protects your account and your purchase data.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
