import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "node:crypto";
import { neon } from "@neondatabase/serverless";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const origin = req.headers.get("origin");
    if (origin && origin !== req.nextUrl.origin) {
      return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
    }

    const contentLength = Number(req.headers.get("content-length") || 0);
    if (contentLength > 4096) {
      return NextResponse.json({ error: "Request is too large." }, { status: 413 });
    }

    const body = await req.json();
    // Honeypot: quietly accept automated submissions without storing them.
    if (typeof body?.website === "string" && body.website.trim()) {
      return NextResponse.json({ ok: true });
    }

    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "A valid email address is required." }, { status: 400 });
    }

    const databaseUrl = process.env.DATABASE_URL;
    const rateLimitSecret = process.env.NEON_AUTH_COOKIE_SECRET;
    if (!databaseUrl || !rateLimitSecret) {
      return NextResponse.json({ error: "Newsletter service is not configured yet." }, { status: 503 });
    }

    const forwardedFor = req.headers.get("x-forwarded-for");
    const clientIp = req.headers.get("x-real-ip") || forwardedFor?.split(",")[0]?.trim() || "unknown";
    const rateKey = createHmac("sha256", rateLimitSecret).update(clientIp).digest("hex");
    const sql = neon(databaseUrl);
    const rate = await sql`INSERT INTO public.api_rate_limits(rate_key,window_started_at,request_count,updated_at)
      VALUES (${rateKey},now(),1,now())
      ON CONFLICT(rate_key) DO UPDATE SET
        request_count=CASE
          WHEN public.api_rate_limits.window_started_at < now() - interval '1 hour' THEN 1
          ELSE public.api_rate_limits.request_count + 1
        END,
        window_started_at=CASE
          WHEN public.api_rate_limits.window_started_at < now() - interval '1 hour' THEN now()
          ELSE public.api_rate_limits.window_started_at
        END,
        updated_at=now()
      RETURNING request_count`;
    if (Number(rate[0]?.request_count || 0) > 10) {
      return NextResponse.json({ error: "Too many subscription attempts. Please try again later." }, { status: 429 });
    }

    await sql`INSERT INTO public.newsletter_subscribers(email,active)
      VALUES(${email},true)
      ON CONFLICT(email) DO UPDATE SET active=true`;
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("newsletter_api_error", error);
    return NextResponse.json({ error: "Unable to save subscription right now." }, { status: 500 });
  }
}
