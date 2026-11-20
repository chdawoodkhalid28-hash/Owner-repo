import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { getStaffContext, roleCanManageAll } from "@/lib/auth/staff";

export const dynamic = "force-dynamic";

type Context = { params: Promise<{ id: string }> };
function validSlug(value: string) { return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value); }

export async function PATCH(req: NextRequest, context: Context) {
  try {
    const { user, authUser } = await getStaffContext();
    if (!authUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!user) return NextResponse.json({ error: "Newsroom role required" }, { status: 403 });
    const { id: rawId } = await context.params;
    const id = Number(rawId);
    if (!Number.isSafeInteger(id) || id < 1) return NextResponse.json({ error: "Invalid article id" }, { status: 400 });
    const body = await req.json();
    const titleUr = String(body.title_ur || "").trim();
    const titleEn = String(body.title_en || "").trim();
    const slug = String(body.slug || "").trim().toLowerCase();
    const status = ["draft", "published", "scheduled", "archived"].includes(body.status) ? body.status : "draft";
    if (!titleUr && !titleEn) return NextResponse.json({ error: "At least one headline is required" }, { status: 400 });
    if (titleUr.length > 300 || titleEn.length > 300 || String(body.body_ur || "").length > 100000 || String(body.body_en || "").length > 100000) return NextResponse.json({ error: "Article content exceeds allowed limits" }, { status: 400 });
    if (!validSlug(slug)) return NextResponse.json({ error: "Slug must use lowercase letters, numbers and hyphens" }, { status: 400 });
    if (user.role === "reporter" && status !== "draft") return NextResponse.json({ error: "Reporter submissions must remain drafts for editorial review" }, { status: 403 });
    const scheduledAt = body.scheduled_at ? new Date(body.scheduled_at) : null;
    if (status === "scheduled" && (!roleCanManageAll(user.role) || !scheduledAt || Number.isNaN(scheduledAt.getTime()) || scheduledAt <= new Date())) return NextResponse.json({ error: "Editors must choose a future publication time" }, { status: 400 });
    const categoryId = body.category_id ? Number(body.category_id) : null;
    if (categoryId !== null && (!Number.isSafeInteger(categoryId) || categoryId < 1)) return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    const imageUrl = String(body.image_url || "").trim() || null;
    if (imageUrl && !/^https:\/\//i.test(imageUrl) && !/^\/api\/media\/\d+$/.test(imageUrl)) return NextResponse.json({ error: "Image URL must be HTTPS or a BDN media URL" }, { status: 400 });
    const sql = neon(process.env.DATABASE_URL!);
    const owned = await sql`SELECT id,status FROM public.articles WHERE id=${id} AND author_id=${user.id} LIMIT 1`;
    if (!roleCanManageAll(user.role) && (!owned.length || owned[0].status !== "draft")) return NextResponse.json({ error: "You may only edit your own draft articles" }, { status: 403 });
    const rows = await sql`UPDATE public.articles SET
      title_ur=${titleUr || titleEn}, title_en=${titleEn || null}, slug=${slug},
      excerpt_ur=${String(body.excerpt_ur || "").trim().slice(0,1000) || null},
      excerpt_en=${String(body.excerpt_en || "").trim().slice(0,1000) || null},
      body_ur=${String(body.body_ur || "").trim() || null}, body_en=${String(body.body_en || "").trim() || null},
      language=${["ur","en","both"].includes(body.language) ? body.language : "both"},
      category_id=${categoryId}, location=${String(body.location || "").trim().slice(0,160) || null},
      image_url=${imageUrl}, source_attribution=${String(body.source_attribution || "").trim().slice(0,2000) || null},
      status=${status},
      published_at=CASE WHEN ${status}='published' THEN COALESCE(published_at,now()) ELSE NULL END,
      scheduled_at=CASE WHEN ${status}='scheduled' THEN ${scheduledAt ? scheduledAt.toISOString() : null}::timestamptz ELSE NULL END,
      updated_at=now()
      WHERE id=${id}
      RETURNING id,title_ur,title_en,slug,status,published_at,scheduled_at`;
    if (!rows.length) return NextResponse.json({ error: "Article not found" }, { status: 404 });
    await sql`INSERT INTO public.editorial_activity(user_id,action,entity_type,entity_id,details) VALUES (${user.id},'article_updated','article',${id},${JSON.stringify({ status, slug })}::jsonb)`;
    return NextResponse.json({ article: rows[0] });
  } catch (error: unknown) {
    console.error("admin_article_update_error", error);
    if (typeof error === "object" && error !== null && "code" in error && error.code === "23505") return NextResponse.json({ error: "This slug already exists" }, { status: 409 });
    return NextResponse.json({ error: "Unable to update article" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, context: Context) {
  try {
    const { user, authUser } = await getStaffContext();
    if (!authUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!user) return NextResponse.json({ error: "Newsroom role required" }, { status: 403 });
    const { id: rawId } = await context.params;
    const id = Number(rawId);
    if (!Number.isSafeInteger(id) || id < 1) return NextResponse.json({ error: "Invalid article id" }, { status: 400 });
    const sql = neon(process.env.DATABASE_URL!);
    const rows = roleCanManageAll(user.role)
      ? await sql`DELETE FROM public.articles WHERE id=${id} RETURNING id,slug`
      : await sql`DELETE FROM public.articles WHERE id=${id} AND author_id=${user.id} AND status='draft' RETURNING id,slug`;
    if (!rows.length) return NextResponse.json({ error: "Article not found or you do not have permission to delete it" }, { status: 404 });
    await sql`INSERT INTO public.editorial_activity(user_id,action,entity_type,entity_id,details) VALUES (${user.id},'article_deleted','article',${id},${JSON.stringify({ slug: rows[0].slug })}::jsonb)`;
    return NextResponse.json({ deleted: true, id });
  } catch (error) {
    console.error("admin_article_delete_error", error);
    return NextResponse.json({ error: "Unable to delete article" }, { status: 500 });
  }
}
