import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://payloat.com"),
  title: "Payloat - Agent's spending managed better",
  description:
    "The ledger AI agents write to and company owners read: every purchase with the task it was given, the cap, the receipt, and what happened after.",
  openGraph: {
    type: "website",
    siteName: "Payloat Ledger",
    url: "https://payloat.com",
    title: "Payloat - Agent's spending managed better",
    description:
      "Every purchase your agents make, with the task behind it, the cap it had, and the receipt when it lands.",
  },
  /* The tab icon carries its own ground, so it reads on either browser
     chrome: the black tile by default, which is also what Google shows
     beside the result, and a light tile swapped in where the chrome is
     dark and a black tile would sink into it. */
  icons: {
    icon: [
      { url: "/icon.png", type: "image/png", sizes: "192x192" },
      {
        url: "/icon-dark-mode.png",
        type: "image/png",
        sizes: "192x192",
        media: "(prefers-color-scheme: dark)",
      },
    ],
    apple: { url: "/apple-icon.png", sizes: "180x180" },
    shortcut: "/favicon.ico",
  },
  twitter: {
    card: "summary_large_image",
    title: "Payloat - Agent's spending managed better",
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
