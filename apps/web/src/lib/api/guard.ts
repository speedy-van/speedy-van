import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";

type Role = "admin" | "driver" | "customer";

export function httpJson(status: number, data: unknown) {
  return NextResponse.json(data, { status });
}

export function withApiHandler<T>(
  handler: (req: NextRequest, ctx: any) => Promise<NextResponse>,
) {
  return async (req: NextRequest, ctx: any) => {
    try {
      return await handler(req, ctx);
    } catch (err: any) {
      console.error("[API ERROR]", err);
      return httpJson(500, { error: "Internal Server Error" });
    }
  };
}

export async function requireRole(req: NextRequest, role: Role) {
  const session = await getServerSession(authOptions);
  if (!session) return httpJson(401, { error: "Unauthorized" });
  const userRole = (session.user as any)?.role as Role | undefined;
  if (role === "customer" && (userRole === "customer" || userRole === "admin")) return null;
  if (role === "driver" && (userRole === "driver" || userRole === "admin")) return null;
  if (role === "admin" && userRole === "admin") return null;
  return httpJson(403, { error: "Forbidden" });
}
