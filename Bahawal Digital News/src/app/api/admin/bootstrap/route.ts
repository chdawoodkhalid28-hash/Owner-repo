import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { auth } from "@/lib/auth/server";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const { data, error } = await auth.getSession();
    const account = data?.user;
    if (error || !account) return NextResponse.json({ error: "Sign in first" }, { status: 401 });
    const allowedEmail = process.env.BDN_BOOTSTRAP_ADMIN_EMAIL?.trim().toLowerCase();
    if (!allowedEmail || account.email.toLowerCase() !== allowedEmail) {
      return NextResponse.json({ error: "This account is not eligible for initial administrator setup" }, { status: 403 });
    }
    const sql = neon(process.env.DATABASE_URL!);
    const rows = await sql`WITH guard AS MATERIALIZED (
        SELECT pg_advisory_xact_lock(771920261)
      ), created AS (
        INSERT INTO public.users (name,email,password_hash,role,active,auth_user_id)
        SELECT ${account.name || account.email},lower(${account.email}),'!managed-by-neon-auth!','admin',true,${account.id}::uuid
        FROM guard
        WHERE NOT EXISTS (SELECT 1 FROM public.users)
        ON CONFLICT (auth_user_id) DO NOTHING
        RETURNING id,name,email,role
      )
      SELECT id,name,email,role FROM created
      UNION ALL
      SELECT id,name,email,role FROM public.users
      WHERE auth_user_id = ${account.id}::uuid AND active = true
      LIMIT 1`;
    if (!rows.length) return NextResponse.json({ error: "Initial admin setup is closed because a newsroom staff account already exists" }, { status: 409 });
    return NextResponse.json({ user: rows[0], created: true });
  } catch (error) {
    console.error("admin_bootstrap_error", error);
    return NextResponse.json({ error: "Initial administrator setup failed" }, { status: 500 });
  }
}
