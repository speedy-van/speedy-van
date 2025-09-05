import { NextRequest, NextResponse } from 'next/server';
import { ErrorMonitoringService } from '../../../../agent/tools/production/ErrorMonitoringService';

const errorService = ErrorMonitoringService.getInstance();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { period, title, assignee } = body;

    if (!period || !period.start || !period.end) {
      return NextResponse.json(
        { success: false, error: 'Period with start and end dates is required' },
        { status: 400 }
      );
    }

    if (!title) {
      return NextResponse.json(
        { success: false, error: 'Report title is required' },
        { status: 400 }
      );
    }

    const report = await errorService.generateErrorReport(
      {
        start: new Date(period.start),
        end: new Date(period.end),
      },
      title,
      assignee
    );

    return NextResponse.json({ success: true, report });
  } catch (error) {
    console.error('Error generating report:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');
    const assignee = searchParams.get('assignee');

    // Build filter for reports
    const where: any = {};
    
    if (status) {
      where.status = status;
    }
    
    if (assignee) {
      where.assignee = assignee;
    }

    const reports = await errorService.getErrorReports(page, limit);
    return NextResponse.json({ success: true, ...reports });
  } catch (error) {
    console.error('Error getting reports:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
