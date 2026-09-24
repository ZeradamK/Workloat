import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://payloat.com"),
  title: "Payloat Ledger — What your agents spent",
  description:
    "The ledger AI agents write to and company owners read: every purchase with the task it was given, the cap, the receipt, and what happened after.",
  openGraph: {
    type: "website",
    siteName: "Payloat Ledger",
    url: "https://payloat.com",
    title: "Payloat Ledger — What your agents spent",
    description:
      "Every purchase your agents make, with the task behind it, the cap it had, and the receipt when it lands.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Payloat Ledger — What your agents spent",
    description:
      "Every purchase your agents make, with the task behind it, the cap it had, and the receipt when it lands.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
