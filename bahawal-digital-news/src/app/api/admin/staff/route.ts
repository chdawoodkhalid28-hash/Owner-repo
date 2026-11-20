import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { getStaffContext } from "@/lib/auth/staff";

export const dynamic = "force-dynamic";
const roles = ["admin", "editor", "reporter"] as const;

async function adminOnly() {
  const { user, authUser } = await getStaffContext();
  if (!authUser) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  if (!user || user.role !== "admin") return { error: NextResponse.json({ error: "Administrator role required" }, { status: 403 }) };
  return { user };
}

export async function GET() {
  const access = await adminOnly();
  if (access.error) return access.error;
  try {
    const sql = neon(process.env.DATABASE_URL!);
    const rows = await sql`SELECT id,name,email,role,active,created_at FROM public.users ORDER BY created_at DESC`;
    return NextResponse.json({ staff: rows });
  } catch (error) {
    console.error("staff_list_error", error);
    return NextResponse.json({ error: "Unable to load staff" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const access = await adminOnly();
  if (access.error) return access.error;
  try {
    const body = await req.json();
    const email = String(body.email || "").trim().toLowerCase();
    const role = String(body.role || "reporter");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !roles.includes(role as typeof roles[number])) {
      return NextResponse.json({ error: "Valid email and role are required" }, { status: 400 });
    }
    const sql = neon(process.env.DATABASE_URL!);
    const identity = await sql`SELECT id,name,email FROM neon_auth."user" WHERE lower(email)=${email} LIMIT 1`;
    if (!identity.length) return NextResponse.json({ error: "This person must create a Neon Auth account before staff access can be assigned" }, { status: 404 });
    const rows = await sql`INSERT INTO public.users (name,email,password_hash,role,active,auth_user_id)
      VALUES (${identity[0].name || email},${email},'!managed-by-neon-auth!',${role},true,${identity[0].id}::uuid)
      ON CONFLICT (email) DO UPDATE SET role=EXCLUDED.role,active=true,auth_user_id=EXCLUDED.auth_user_id,updated_at=now()
      RETURNING id,name,email,role,active`;
    return NextResponse.json({ staff: rows[0] }, { status: 201 });
  } catch (error) {
    console.error("staff_assign_error", error);
    return NextResponse.json({ error: "Unable to assign newsroom role" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const access = await adminOnly();
  if (access.error) return access.error;
  try {
    const body = await req.json();
    const id = Number(body.id);
    const role = String(body.role || "");
    const active = body.active;
    if (!Number.isSafeInteger(id) || id < 1 || (role && !roles.includes(role as typeof roles[number])) || (active !== undefined && typeof active !== "boolean")) {
      return NextResponse.json({ error: "Invalid staff update" }, { status: 400 });
    }
    if (id === access.user.id) return NextResponse.json({ error: "You cannot change your own staff access here" }, { status: 409 });
    const sql = neon(process.env.DATABASE_URL!);
    const rows = await sql`UPDATE public.users SET role=COALESCE(NULLIF(${role},''),role),active=COALESCE(${active ?? null},active),updated_at=now() WHERE id=${id} RETURNING id,name,email,role,active`;
    if (!rows.length) return NextResponse.json({ error: "Staff member not found" }, { status: 404 });
    return NextResponse.json({ staff: rows[0] });
  } catch (error) {
    console.error("staff_update_error", error);
    return NextResponse.json({ error: "Unable to update staff member" }, { status: 500 });
  }
}
