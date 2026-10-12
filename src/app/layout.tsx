import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://workloat.com"),
  title: "Workloat",
  description:
    "Workloat gives you AI workers called Loats. Each Loat has its own email address and a human owner, and asks for your OK before it writes to anyone else.",
  openGraph: {
    type: "website",
    siteName: "Workloat",
    url: "https://workloat.com",
    title: "Workloat",
    description:
      "AI workers with their own email address, a human owner and approvals. Give your work to a Loat. It answers to you.",
  },
  /* The tab icon carries its own ground, so it reads on either browser
     chrome: the black tile by default, which is also what Google shows
     beside the result, and a light tile swapped in where the chrome is
     dark and a black tile would sink into it. */
  icons: {
    icon: [
      { url: "/icon.png", type: "image/png", sizes: "192x192" },
      {
        url: "/brand/icon-light-tile.png",
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
    title: "Workloat",
    description:
      "AI workers with their own email address, a human owner and approvals. Give your work to a Loat. It answers to you.",
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
