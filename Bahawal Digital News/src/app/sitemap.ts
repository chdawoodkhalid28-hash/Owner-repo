import type { MetadataRoute } from "next";
import { neon } from "@neondatabase/serverless";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://bahawal-digital-news.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const fixedRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, changeFrequency: "hourly", priority: 1 },
    ...["bahawalnagar", "chishtian", "haroonabad", "fort-abbas", "minchinabad", "rural"].map((slug) => ({
      url: baseUrl + "/district/" + slug,
      changeFrequency: "daily" as const,
      priority: 0.7,
    })),
  ];
  if (!process.env.DATABASE_URL) return fixedRoutes;
  try {
    const sql = neon(process.env.DATABASE_URL);
    const rows = await sql`SELECT slug, updated_at FROM public.articles WHERE status='published' AND published_at <= now() ORDER BY updated_at DESC LIMIT 5000`;
    return fixedRoutes.concat(rows.map((row: { slug: string; updated_at: Date | string }) => ({
      url: baseUrl + "/news/" + row.slug,
      lastModified: new Date(row.updated_at),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })));
  } catch (error) {
    console.error("sitemap_generation_error", error);
    return fixedRoutes;
  }
}
