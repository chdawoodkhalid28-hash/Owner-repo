import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (typeof email !== "string" || !/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email.trim())) return NextResponse.json({ error: "A valid email address is required." }, { status: 400 });
    if (!process.env.DATABASE_URL) return NextResponse.json({ error: "Newsletter service is not configured yet." }, { status: 503 });
    const sql = neon(process.env.DATABASE_URL);
    await sql`INSERT INTO public.newsletter_subscribers(email,active) VALUES(${email.trim().toLowerCase()},true) ON CONFLICT(email) DO UPDATE SET active=true`;
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("newsletter_api_error", error);
    return NextResponse.json({ error: "Unable to save subscription right now." }, { status: 500 });
  }
}