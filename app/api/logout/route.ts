import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { requireApiAuth, toApiAuthErrorResponse } from "@/lib/apiAuth";

export async function POST(request: NextRequest) {
  try {
    await requireApiAuth({ request, routeId: "auth.logout" });
  } catch (error) {
    return toApiAuthErrorResponse(error);
  }

  try {
    const cookieStore = await cookies();

    // Delete the session cookie
    cookieStore.delete("session");

    return NextResponse.json(
      { success: true, message: "Logged out successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error during logout:", error);
    return NextResponse.json(
      { success: false, message: "Failed to log out" },
      { status: 500 },
    );
  }
}
