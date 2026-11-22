import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const FEEDS = [
  { url: "https://www.app.com.pk/feed/", label: "Associated Press of Pakistan" },
  { url: "https://www.dawn.com/feeds/home", label: "Dawn" },
  { url: "https://feeds.bbci.co.uk/urdu/rss.xml", label: "BBC Urdu" },
];
const TRUSTED_HOSTS = new Set(["app.com.pk", "www.app.com.pk", "dawn.com", "www.dawn.com", "feeds.bbci.co.uk"]);
const HOLD_TERMS = [
  /\b(attack|blast|bomb|terror|terrorist|killed|kill|murder|rape|assault|violence|riot|protest|clash|war|strike|missile|military|army|police|arrest|accused|allegation|court|judge|election|vote|politic|minister|prime minister|president|religion|sectarian|blasphemy|suicide|abuse|earthquake|flood|disease|outbreak|epidemic|pandemic|emergency|death|dead|injured|casualt|scam|fraud|bankrupt|crash)\b/i,
  /(دھماک|دہشت|قتل|اغوا|زیادتی|تشدد|فائرنگ|مظاہر|احتجاج|تصادم|جنگ|میزائل|فوج|فوجی|پولیس|گرفتار|الزام|عدالت|جج|انتخابات|الیکشن|ووٹ|سیاسی|سیاست|وزیر|صدر|مذہب|مسلک|توہین|خودکشی|زلزلہ|سیلاب|وبا|ایمرجنسی|ہلاکت|جاں بحق|زخمی|فراڈ|دھوکہ)/,
];
function clean(s: string) {
  return s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([\da-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/\s+/g, " ").trim();
}
function getTag(xml: string, name: string) {
  const m = xml.match(new RegExp("<" + name + "(?:\\s[^>]*)?>([\\s\\S]*?)<\\/" + name + ">", "i"));
  return m ? clean(m[1]) : "";
}
function allowedUrl(raw: string) {
  try { const u = new URL(raw); return u.protocol === "https:" && TRUSTED_HOSTS.has(u.hostname.toLowerCase()) ? u.toString() : null; }
  catch { return null; }
}
function slugFor(title: string, url: string) {
  const base = title.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 65) || "news";
  let hash = 0; for (const c of url) hash = (hash * 31 + c.charCodeAt(0)) >>> 0;
  return base + "-" + hash.toString(36);
}
function sensitive(s: string) { return HOLD_TERMS.some((r) => r.test(s)); }

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!process.env.DATABASE_URL) return NextResponse.json({ error: "Database is not configured" }, { status: 500 });
  try {
    const sql = neon(process.env.DATABASE_URL);
    const report = { feeds: 0, fetched: 0, published: 0, heldForReview: 0, duplicates: 0, rejected: 0, errors: [] as string[] };
    const scheduled = await sql`UPDATE public.articles SET status='published',published_at=now(),scheduled_at=NULL,updated_at=now()
      WHERE status='scheduled' AND deleted_at IS NULL AND scheduled_at IS NOT NULL AND scheduled_at<=now() RETURNING id,slug`;
    for (const a of scheduled) await sql`INSERT INTO public.editorial_activity(user_id,action,entity_type,entity_id,details)
      VALUES (NULL,'scheduled_article_published','article',${a.id},${JSON.stringify({ slug: a.slug })}::jsonb)`;

    for (const feed of FEEDS) {
      try {
        const res = await fetch(feed.url, { headers: { "user-agent": "BahawalDigitalNewsBot/1.0" }, signal: AbortSignal.timeout(12000), cache: "no-store" });
        if (!res.ok) throw new Error("HTTP " + res.status);
        const xml = await res.text(); report.feeds++;
        const items = [...xml.matchAll(/<(item|entry)(?:\s[^>]*)?>([\s\S]*?)<\/\1>/gi)].slice(0, 25);
        for (const m of items) {
          report.fetched++;
          const block = m[2];
          const title = getTag(block, "title").slice(0, 300);
          const description = (getTag(block, "description") || getTag(block, "summary") || getTag(block, "content:encoded")).slice(0, 1000);
          const link = block.match(/<link(?:\s+[^>]*)?>([\s\S]*?)<\/link>/i) || block.match(/<link[^>]+href=["']([^"']+)["'][^>]*\/?\s*>/i);
          const url = allowedUrl(link ? clean(link[1]) : getTag(block, "guid"));
          if (!title || !url) { report.rejected++; continue; }
          const exists = await sql`SELECT id FROM public.articles WHERE canonical_url=${url} AND deleted_at IS NULL LIMIT 1`;
          if (exists.length) { report.duplicates++; continue; }
          const hold = sensitive(title + " " + description);
          const excerpt = description || title;
          const status = hold ? "draft" : "published";
          await sql`INSERT INTO public.articles
            (title_ur,slug,excerpt_ur,body_ur,language,author_id,status,source_attribution,canonical_url,published_at)
            VALUES (${title},${slugFor(title,url)},${excerpt.slice(0,900)},${excerpt.slice(0,900) + "\n\nاصل خبر پڑھیں: " + url},
              'ur',NULL,${status},${feed.label + " — " + url},${url},${hold ? null : new Date().toISOString()})`;
          if (hold) report.heldForReview++; else report.published++;
        }
      } catch (e) {
        report.errors.push(feed.label + ": " + (e instanceof Error ? e.message : "feed error"));
        console.error("news_ingest_feed_error", feed.label, e);
      }
    }
    return NextResponse.json({ ok: report.errors.length === 0, scheduledPublished: scheduled.length, ...report });
  } catch (e) {
    console.error("news_ingest_error", e);
    return NextResponse.json({ error: "Automated newsroom run failed" }, { status: 500 });
  }
}
