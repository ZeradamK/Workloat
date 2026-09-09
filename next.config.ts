import type { NextConfig } from "next";

/* While building (NEXT_PUBLIC_DEV_BYPASS_AUTH=1 in .env.local), the auth
   screens are out of the way: /signup lands on the ledger, which opens with
   no sign-in. / stays the landing page. The flag is never committed. */
const DEV_BYPASS = process.env.NEXT_PUBLIC_DEV_BYPASS_AUTH === "1";

const nextConfig: NextConfig = {
  async redirects() {
    if (!DEV_BYPASS) return [];
    return [
      { source: "/signup", destination: "/web-app", permanent: false },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
        ],
      },
    ];
  },
};

export default nextConfig;
