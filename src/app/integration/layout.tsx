import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Integration — Payloat",
  description:
    "Every bank, every agent, one place. Your banks' books and your agents' spending history side by side, with the team's spend alongside them.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
