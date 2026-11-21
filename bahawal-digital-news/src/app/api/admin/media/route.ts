import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { getStaffContext, roleCanManageAll } from "@/lib/auth/staff";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const allowed = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export async function POST(req: NextRequest) {
  try {
    const { user, authUser } = await getStaffContext();
    if (!authUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!user || !roleCanManageAll(user.role)) return NextResponse.json({ error: "Editor or administrator role required" }, { status: 403 });
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return NextResponse.json({ error: "Select an image file" }, { status: 400 });
    if (!allowed.has(file.type)) return NextResponse.json({ error: "Only JPEG, PNG, WebP and GIF images are supported" }, { status: 415 });
    if (file.size < 1 || file.size > 3_500_000) return NextResponse.json({ error: "Image must be smaller than 3.5 MB" }, { status: 413 });
    const bytes = Buffer.from(await file.arrayBuffer());
    const isJpeg = bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
    const isPng = bytes.length >= 8 && bytes.subarray(0, 8).equals(Buffer.from([0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a]));
    const isGif = bytes.length >= 6 && (bytes.subarray(0, 6).toString("ascii") === "GIF87a" || bytes.subarray(0, 6).toString("ascii") === "GIF89a");
    const isWebp = bytes.length >= 12 && bytes.subarray(0, 4).toString("ascii") === "RIFF" && bytes.subarray(8, 12).toString("ascii") === "WEBP";
    const signatureMatches = (file.type === "image/jpeg" && isJpeg) || (file.type === "image/png" && isPng) || (file.type === "image/gif" && isGif) || (file.type === "image/webp" && isWebp);
    if (!signatureMatches) return NextResponse.json({ error: "The uploaded file content does not match its image type" }, { status: 415 });
    const alt = String(form.get("alt_text") || "").trim().slice(0, 300) || null;
    const caption = String(form.get("caption") || "").trim().slice(0, 500) || null;
    const credit = String(form.get("credit") || "").trim().slice(0, 300) || null;
    const sql = neon(process.env.DATABASE_URL!);
    const inserted = await sql`INSERT INTO public.media(url,filename,alt_text,caption,credit,uploaded_by,mime_type,data)
      VALUES ('pending',${file.name.slice(0,255)},${alt},${caption},${credit},${user.id},${file.type},${bytes})
      RETURNING id`;
    const id = Number(inserted[0].id);
    const url = `/api/media/${id}`;
    await sql`UPDATE public.media SET url=${url} WHERE id=${id}`;
    await sql`INSERT INTO public.editorial_activity(user_id,action,entity_type,entity_id,details)
      VALUES (${user.id},'media_uploaded','media',${id},${JSON.stringify({ filename: file.name, mime_type: file.type, size: file.size })}::jsonb)`;
    return NextResponse.json({ media: { id, url, filename: file.name, mime_type: file.type, alt_text: alt, caption, credit } }, { status: 201 });
  } catch (error) {
    console.error("admin_media_upload_error", error);
    return NextResponse.json({ error: "Image upload failed" }, { status: 500 });
  }
}
