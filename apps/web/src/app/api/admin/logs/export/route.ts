import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { logExporter } from "@/lib/log-export";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      type = 'audit',
      format = 'json',
      dateFrom,
      dateTo,
      filters = {},
      includeDetails = false,
      maxRecords
    } = body;

    const actorId = (session.user as any).id;

    const exportOptions = {
      type,
      format,
      dateFrom: dateFrom ? new Date(dateFrom) : undefined,
      dateTo: dateTo ? new Date(dateTo) : undefined,
      filters,
      includeDetails,
      maxRecords: maxRecords ? parseInt(maxRecords) : undefined
    };

    const result = await logExporter.exportLogs(exportOptions, actorId);

    // Return the file as a download
    return new NextResponse(result.data as any, {
      status: 200,
      headers: {
        'Content-Type': result.contentType,
        'Content-Disposition': `attachment; filename="${result.filename}"`,
        'X-Export-Records': result.recordCount.toString(),
        'X-Export-Time': result.exportTime.toISOString()
      }
    });

  } catch (error) {
    console.error("Error exporting logs:", error);
    return NextResponse.json(
      { error: "Failed to export logs" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const actorId = (session.user as any).id;

    const exportHistory = await logExporter.getExportHistory(actorId, limit);

    return NextResponse.json({
      exports: exportHistory,
      total: exportHistory.length
    });

  } catch (error) {
    console.error("Error fetching export history:", error);
    return NextResponse.json(
      { error: "Failed to fetch export history" },
      { status: 500 }
    );
  }
}
