import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign up | Workloat",
  description:
    "Create your Workloat account and be first in line when it opens.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
