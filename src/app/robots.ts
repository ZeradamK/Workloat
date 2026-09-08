import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/web-app" },
    sitemap: "https://payloat.com/sitemap.xml",
  };
}
