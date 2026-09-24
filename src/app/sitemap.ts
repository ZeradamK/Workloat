import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://payloat.com";
  return ["", "/integration", "/product", "/finance-teams", "/enterprise", "/security", "/contact", "/signup"].map(
    (path) => ({ url: `${base}${path}`, changeFrequency: "weekly", priority: path === "" ? 1 : 0.7 }),
  );
}
