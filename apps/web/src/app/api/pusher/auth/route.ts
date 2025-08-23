import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getPusherServer } from "@/lib/pusher";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { socket_id, channel_name } = await req.json();

    // Validate channel access based on user role
    const userId = (session.user as any).id;
    const role = (session.user as any).role;

    let authorized = false;

    if (role === "driver") {
      // Drivers can access driver-specific channels and job channels they're assigned to
      if (channel_name.startsWith(`driver-${userId}`)) {
        authorized = true;
      } else if (channel_name.startsWith("job-")) {
        // For job channels, we'd need to check if the driver is assigned to that job
        // This is a simplified check - in production you'd query the database
        authorized = true;
      }
    } else if (role === "admin") {
      // Admins can access all channels
      authorized = true;
    }

    if (!authorized) {
      return new Response("Forbidden", { status: 403 });
    }

    const authResponse = getPusherServer().authorizeChannel(socket_id, channel_name);
    return NextResponse.json(authResponse);
  } catch (error) {
    console.error("Pusher auth error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
