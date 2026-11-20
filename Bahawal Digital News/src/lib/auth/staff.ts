import { neon } from "@neondatabase/serverless";
import { auth } from "@/lib/auth/server";

export type StaffRole = "admin" | "editor" | "reporter";
export type StaffUser = { id: number; name: string; email: string; role: StaffRole; active: boolean; auth_user_id: string };

export async function getStaffContext(): Promise<{ user: StaffUser | null; authUser: { id: string; email: string; name?: string } | null }> {
  if (!process.env.DATABASE_URL) return { user: null, authUser: null };
  const { data, error } = await auth.getSession();
  const authUser = data?.user && !error
    ? { id: data.user.id, email: data.user.email, name: data.user.name }
    : null;
  if (!authUser) return { user: null, authUser: null };
  const sql = neon(process.env.DATABASE_URL);
  const rows = await sql`SELECT id,name,email,role,active,auth_user_id
    FROM public.users
    WHERE auth_user_id = ${authUser.id}::uuid
      AND lower(email) = lower(${authUser.email})
      AND active = true
    LIMIT 1`;
  return { user: (rows[0] as StaffUser | undefined) ?? null, authUser };
}

export function roleCanManageAll(role: StaffRole) {
  return role === "admin" || role === "editor";
}
