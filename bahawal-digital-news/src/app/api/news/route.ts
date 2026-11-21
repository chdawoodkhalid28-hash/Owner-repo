import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
export const revalidate = 60;
export async function GET() {
  if (!process.env.DATABASE_URL) return NextResponse.json({ articles: [], source: "empty", message: "Database connection is not configured." });
  try {
    const sql = neon(process.env.DATABASE_URL);
    const rows = await sql`
      SELECT a.id,a.title_ur,a.title_en,a.slug,a.excerpt_ur,a.excerpt_en,a.language,a.category_id,
        a.location,a.featured,a.breaking,a.image_url,a.published_at,a.views,
        c.name_ur AS category_name_ur,c.name_en AS category_name_en
      FROM public.articles a
      LEFT JOIN public.categories c ON c.id=a.category_id
      WHERE a.status='published' AND a.deleted_at IS NULL AND a.published_at <= now()
      ORDER BY a.featured DESC,a.published_at DESC
      LIMIT 30`;
    return NextResponse.json({ articles: rows, source: "database" }, { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } });
  } catch (error) {
    console.error("news_api_error", error);
    return NextResponse.json({ articles: [], source: "error", message: "News feed temporarily unavailable." });
  }
}