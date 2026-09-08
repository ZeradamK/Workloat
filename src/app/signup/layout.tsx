import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign up — Payloat",
  description:
    "Create your Payloat account and be first in line when the app ships.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
