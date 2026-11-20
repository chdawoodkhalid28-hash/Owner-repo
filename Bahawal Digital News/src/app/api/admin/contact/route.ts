import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { getStaffContext, roleCanManageAll } from "@/lib/auth/staff";
export const dynamic = "force-dynamic";
export async function GET() {
  try {
    const { user, authUser } = await getStaffContext();
    if (!authUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!user || !roleCanManageAll(user.role)) return NextResponse.json({ error: "Editor or administrator role required" }, { status: 403 });
    const sql = neon(process.env.DATABASE_URL!);
    const rows = await sql`SELECT id,name,email,subject,message,status,created_at FROM public.contact_submissions ORDER BY created_at DESC LIMIT 100`;
    return NextResponse.json({ submissions: rows });
  } catch (error) {
    console.error("contact_inbox_error", error);
    return NextResponse.json({ error: "Unable to load newsroom inbox" }, { status: 500 });
  }
}
export async function PATCH(req: NextRequest) {
  try {
    const { user, authUser } = await getStaffContext();
    if (!authUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!user || !roleCanManageAll(user.role)) return NextResponse.json({ error: "Editor or administrator role required" }, { status: 403 });
    const body = await req.json();
    const id = Number(body.id), status = String(body.status || "");
    if (!Number.isSafeInteger(id) || id < 1 || !["new","reviewed","closed"].includes(status)) return NextResponse.json({ error: "Invalid inbox update" }, { status: 400 });
    const sql = neon(process.env.DATABASE_URL!);
    const rows = await sql`UPDATE public.contact_submissions SET status=${status},updated_at=now() WHERE id=${id} RETURNING id,status`;
    if (!rows.length) return NextResponse.json({ error: "Message not found" }, { status: 404 });
    return NextResponse.json({ submission: rows[0] });
  } catch (error) {
    console.error("contact_inbox_update_error", error);
    return NextResponse.json({ error: "Unable to update message" }, { status: 500 });
  }
}
