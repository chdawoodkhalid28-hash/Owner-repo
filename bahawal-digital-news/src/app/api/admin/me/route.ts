import { NextResponse } from "next/server";
import { getStaffContext } from "@/lib/auth/staff";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { user, authUser } = await getStaffContext();
    if (!authUser) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    if (!user) return NextResponse.json({ error: "Your account is not assigned to the BDN newsroom. Contact an administrator.", authenticated: true }, { status: 403 });
    return NextResponse.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    console.error("admin_session_error", error);
    return NextResponse.json({ error: "Unable to verify newsroom access" }, { status: 500 });
  }
}
