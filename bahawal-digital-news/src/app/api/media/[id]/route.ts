import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req: Request, context: { params: Promise<{ id: string }> }) {
  const { id: rawId } = await context.params;
  const id = Number(rawId);
  if (!Number.isSafeInteger(id) || id < 1) return NextResponse.json({ error: "Not found" }, { status: 404 });
  try {
    const sql = neon(process.env.DATABASE_URL!);
    const rows = await sql`SELECT data,mime_type FROM public.media WHERE id=${id} LIMIT 1`;
    if (!rows.length || !rows[0].data) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const value = rows[0].data as Buffer | Uint8Array | string;
    const bytes = typeof value === "string"
      ? (value.startsWith("\\x") ? Buffer.from(value.slice(2), "hex") : Buffer.from(value, "base64"))
      : Buffer.from(value);
    return new NextResponse(bytes, { headers: {
      "Content-Type": String(rows[0].mime_type || "application/octet-stream"),
      "Content-Length": String(bytes.length),
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff"
    }});
  } catch (error) {
    console.error("media_read_error", error);
    return NextResponse.json({ error: "Unable to load image" }, { status: 500 });
  }
}
