import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { getStaffContext, roleCanManageAll } from "@/lib/auth/staff";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { user, authUser } = await getStaffContext();
    if (!authUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!user) return NextResponse.json({ error: "Newsroom role required" }, { status: 403 });
    const sql = neon(process.env.DATABASE_URL!);
    const rows = roleCanManageAll(user.role)
      ? await sql`SELECT id,title_ur,title_en,slug,status,language,category_id,location,created_at,published_at,scheduled_at,author_id,excerpt_ur,excerpt_en,body_ur,body_en,image_url,source_attribution FROM public.articles ORDER BY created_at DESC LIMIT 100`
      : await sql`SELECT id,title_ur,title_en,slug,status,language,location,created_at,published_at,scheduled_at,author_id,excerpt_ur,excerpt_en,body_ur,body_en,image_url,source_attribution FROM public.articles WHERE author_id = ${user.id} ORDER BY created_at DESC LIMIT 100`;
    const categories = await sql`SELECT id,name_ur,name_en,slug FROM public.categories ORDER BY sort_order,id`;
    return NextResponse.json({ articles: rows, categories, staff: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    console.error("admin_list_error", error);
    return NextResponse.json({ error: "Unable to load CMS data" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user, authUser } = await getStaffContext();
    if (!authUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!user) return NextResponse.json({ error: "Newsroom role required" }, { status: 403 });
    const body = await req.json();
    const titleUr = String(body.title_ur || "").trim();
    const titleEn = String(body.title_en || "").trim();
    const slug = String(body.slug || "").trim().toLowerCase();
    const bodyUr = String(body.body_ur || "").trim();
    const bodyEn = String(body.body_en || "").trim();
    const language = ["ur", "en", "both"].includes(body.language) ? body.language : "both";
    const requestedStatus = ["draft", "published", "scheduled"].includes(body.status) ? body.status : "draft";
    const status = roleCanManageAll(user.role) ? requestedStatus : "draft";
    if (!titleUr && !titleEn) return NextResponse.json({ error: "At least one headline is required" }, { status: 400 });
    if (titleUr.length > 300 || titleEn.length > 300 || bodyUr.length > 100000 || bodyEn.length > 100000) {
      return NextResponse.json({ error: "Article content exceeds allowed limits" }, { status: 400 });
    }
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return NextResponse.json({ error: "Slug must use lowercase letters, numbers and hyphens" }, { status: 400 });
    const categoryId = body.category_id ? Number(body.category_id) : null;
    if (categoryId !== null && (!Number.isSafeInteger(categoryId) || categoryId < 1)) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }
    const location = String(body.location || "").trim().slice(0, 160) || null;
    const excerptUr = String(body.excerpt_ur || "").trim().slice(0, 1000) || null;
    const excerptEn = String(body.excerpt_en || "").trim().slice(0, 1000) || null;
    const imageUrl = String(body.image_url || "").trim() || null;
    const scheduledAt = body.scheduled_at ? new Date(body.scheduled_at) : null;
    if (requestedStatus === "scheduled" && (!scheduledAt || Number.isNaN(scheduledAt.getTime()) || scheduledAt <= new Date())) return NextResponse.json({ error: "Choose a future publication date and time" }, { status: 400 });
    const sourceAttribution = String(body.source_attribution || "").trim().slice(0, 2000) || null;
    if (imageUrl && !/^https:\/\//i.test(imageUrl) && !/^\/api\/media\/\d+$/.test(imageUrl)) return NextResponse.json({ error: "Image URL must be HTTPS or a BDN media URL" }, { status: 400 });
    const sql = neon(process.env.DATABASE_URL!);
    const rows = await sql`INSERT INTO public.articles
      (title_ur,title_en,slug,excerpt_ur,excerpt_en,body_ur,body_en,language,category_id,location,author_id,status,image_url,source_attribution,published_at,scheduled_at)
      VALUES (${titleUr || titleEn},${titleEn || null},${slug},${excerptUr},${excerptEn},${bodyUr || null},${bodyEn || null},${language},${categoryId},${location},${user.id},${status},${imageUrl},${sourceAttribution},${status === "published" ? new Date().toISOString() : null},${status === "scheduled" ? scheduledAt!.toISOString() : null})
      RETURNING id,slug,status,author_id`;
    await sql`INSERT INTO public.editorial_activity(user_id,action,entity_type,entity_id,details) VALUES (${user.id},'article_created','article',${Number(rows[0].id)},${JSON.stringify({ slug, status })}::jsonb)`;
    return NextResponse.json({ article: rows[0], notice: user.role === "reporter" && requestedStatus === "published" ? "Reporter submissions are saved as drafts for editorial review." : undefined }, { status: 201 });
  } catch (error: unknown) {
    console.error("admin_create_error", error);
    if (typeof error === "object" && error !== null && "code" in error && error.code === "23505") {
      return NextResponse.json({ error: "This slug already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: "Article could not be saved. Check required fields." }, { status: 500 });
  }
}
