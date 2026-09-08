import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Account — Payloat",
  description:
    "Your Payloat account.",
  robots: { index: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
