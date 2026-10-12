import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "You're signed up | Workloat",
  description:
    "Your place is recorded. We will write to you the moment Workloat opens.",
  robots: { index: false, follow: true },
};

export default function ConfirmedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
