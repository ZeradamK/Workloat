import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://workloat.com";
  return ["", "/finance-teams", "/enterprise", "/contact", "/signup"].map(
    (path) => ({ url: `${base}${path}`, changeFrequency: "weekly", priority: path === "" ? 1 : 0.7 }),
  );
}
