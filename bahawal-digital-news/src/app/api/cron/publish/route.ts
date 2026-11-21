import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  const authorization = req.headers.get("authorization");
  if (!secret || authorization !== `Bearer ${secret}`) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const sql = neon(process.env.DATABASE_URL!);
    const published = await sql`UPDATE public.articles
      SET status='published',published_at=now(),scheduled_at=NULL,updated_at=now()
      WHERE status='scheduled' AND deleted_at IS NULL AND scheduled_at IS NOT NULL AND scheduled_at<=now()
      RETURNING id,slug`;
    for (const article of published) {
      await sql`INSERT INTO public.editorial_activity(user_id,action,entity_type,entity_id,details)
        VALUES (NULL,'scheduled_article_published','article',${article.id},${JSON.stringify({ slug: article.slug })}::jsonb)`;
    }
    return NextResponse.json({ published: published.length, articles: published });
  } catch (error) {
    console.error("scheduled_publish_error", error);
    return NextResponse.json({ error: "Scheduled publishing failed" }, { status: 500 });
  }
}
