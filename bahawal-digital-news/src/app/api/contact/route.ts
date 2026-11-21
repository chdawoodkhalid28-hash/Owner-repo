import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
export const dynamic = "force-dynamic";
const MAX_BODY_BYTES = 12 * 1024;
export async function POST(req: NextRequest) {
  try {
    const origin = req.headers.get("origin");
    if (origin && origin !== req.nextUrl.origin) return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
    const contentLength = Number(req.headers.get("content-length") || 0);
    if (contentLength > MAX_BODY_BYTES) return NextResponse.json({ error: "درخواست بہت بڑی ہے۔" }, { status: 413 });
    const raw = await req.text();
    if (new TextEncoder().encode(raw).byteLength > MAX_BODY_BYTES) return NextResponse.json({ error: "درخواست بہت بڑی ہے۔" }, { status: 413 });
    let body: Record<string, unknown>;
    try {
      const parsed: unknown = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return NextResponse.json({ error: "درخواست درست نہیں۔" }, { status: 400 });
      body = parsed as Record<string, unknown>;
    } catch {
      return NextResponse.json({ error: "درخواست درست نہیں۔" }, { status: 400 });
    }
    if (typeof body.website === "string" && body.website.trim()) return NextResponse.json({ ok: true });
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const subject = typeof body.subject === "string" ? body.subject.trim() : "";
    const message = typeof body.message === "string" ? body.message.trim() : "";
    if (name.length < 2 || name.length > 120 || !/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email) || email.length > 254 || subject.length < 3 || subject.length > 180 || message.length < 10 || message.length > 10000) {
      return NextResponse.json({ error: "براہِ کرم تمام معلومات درست اور مکمل درج کریں۔" }, { status: 400 });
    }
    if (!process.env.DATABASE_URL) return NextResponse.json({ error: "رابطہ سروس عارضی طور پر دستیاب نہیں۔" }, { status: 503 });
    const sql = neon(process.env.DATABASE_URL);
    const recent = await sql`SELECT count(*)::int AS total FROM public.contact_submissions WHERE lower(email)=lower(${email}) AND created_at > now() - interval '15 minutes'`;
    if (Number(recent[0]?.total || 0) >= 3) return NextResponse.json({ error: "آپ کے پیغامات کی حد پوری ہو گئی ہے۔ کچھ دیر بعد دوبارہ کوشش کریں۔" }, { status: 429 });
    await sql`INSERT INTO public.contact_submissions(name,email,subject,message) VALUES(${name},${email},${subject},${message})`;
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    console.error("contact_submission_error", error);
    return NextResponse.json({ error: "پیغام محفوظ نہیں ہو سکا۔ براہِ کرم دوبارہ کوشش کریں۔" }, { status: 500 });
  }
}
