import type { MetadataRoute } from "next";

const BASE = "https://kasir-bazar-offline-pi.vercel.app";
const routes = ["", "/pos", "/products", "/dashboard", "/purchases", "/checkout", "/install", "/donasi"];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((r) => ({
    url: BASE + r,
    lastModified: new Date(),
    changeFrequency: r === "" ? "weekly" : "monthly",
    priority: r === "" ? 1 : 0.7,
  }));
}
