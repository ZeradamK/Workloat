import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact | Workloat",
  description:
    "Reach Workloat: support, sales, press, and help.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
