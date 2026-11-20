import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
function authorized(req: NextRequest) {
  const expected = process.env.BDN_ADMIN_TOKEN;
  const supplied = req.headers.get('x-bdn-admin-token');
  return Boolean(expected && supplied && supplied.length === expected.length && supplied === expected);
}
export async function GET(req: NextRequest) {
  if (!authorized(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!process.env.DATABASE_URL) return NextResponse.json({ error: 'DATABASE_URL is not configured' }, { status: 503 });
  try {
    const sql = neon(process.env.DATABASE_URL);
    const [articles, categories] = await Promise.all([
      sql`SELECT id,title_ur,title_en,slug,status,language,location,created_at,published_at FROM public.articles ORDER BY created_at DESC LIMIT 100`,
      sql`SELECT id,name_ur,name_en,slug FROM public.categories ORDER BY sort_order,id`
    ]);
    return NextResponse.json({ articles, categories });
  } catch (e) { console.error('admin_list_error', e); return NextResponse.json({ error: 'Unable to load CMS data' }, { status: 500 }); }
}
export async function POST(req: NextRequest) {
  if (!authorized(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!process.env.DATABASE_URL) return NextResponse.json({ error: 'DATABASE_URL is not configured' }, { status: 503 });
  try {
    const b = await req.json();
    const titleUr = String(b.title_ur || '').trim();
    const titleEn = String(b.title_en || '').trim();
    const slug = String(b.slug || '').trim().toLowerCase();
    const bodyUr = String(b.body_ur || '').trim();
    const bodyEn = String(b.body_en || '').trim();
    const language = ['ur','en','both'].includes(b.language) ? b.language : 'both';
    const status = ['draft','published'].includes(b.status) ? b.status : 'draft';
    if (!titleUr && !titleEn) return NextResponse.json({ error: 'At least one headline is required' }, { status: 400 });
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return NextResponse.json({ error: 'Slug must use lowercase letters, numbers and hyphens' }, { status: 400 });
    const sql = neon(process.env.DATABASE_URL);
    const categoryId = b.category_id ? Number(b.category_id) : null;
    const location = String(b.location || '').trim() || null;
    const excerptUr = String(b.excerpt_ur || '').trim() || null;
    const excerptEn = String(b.excerpt_en || '').trim() || null;
    const imageUrl = String(b.image_url || '').trim() || null;
    const rows = await sql`INSERT INTO public.articles
      (title_ur,title_en,slug,excerpt_ur,excerpt_en,body_ur,body_en,language,category_id,location,status,image_url,published_at)
      VALUES (${titleUr || titleEn},${titleEn || null},${slug},${excerptUr},${excerptEn},${bodyUr || null},${bodyEn || null},${language},${categoryId},${location},${status},${imageUrl},${status === 'published' ? new Date().toISOString() : null})
      RETURNING id,slug,status`;
    return NextResponse.json({ article: rows[0] }, { status: 201 });
  } catch (e: any) {
    console.error('admin_create_error', e);
    if (e?.code === '23505') return NextResponse.json({ error: 'This slug already exists' }, { status: 409 });
    return NextResponse.json({ error: 'Article could not be saved. Check required database fields.' }, { status: 500 });
  }
}