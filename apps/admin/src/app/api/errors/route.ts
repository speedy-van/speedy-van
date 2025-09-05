import { NextRequest, NextResponse } from 'next/server';
import { ErrorMonitoringService } from '../../../agent/tools/production/ErrorMonitoringService';
import { ProductionError, ErrorFilter } from '../../../agent/types';

const errorService = ErrorMonitoringService.getInstance();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...data } = body;

    switch (action) {
      case 'log':
        const error: Omit<ProductionError, 'id' | 'createdAt' | 'updatedAt'> = {
          timestamp: new Date(data.timestamp || Date.now()),
          level: data.level || 'error',
          category: data.category || 'other',
          source: data.source || 'unknown',
          message: data.message || 'Unknown error',
          stackTrace: data.stackTrace,
          context: data.context || {},
          metadata: {
            tags: data.metadata?.tags || [],
            priority: data.metadata?.priority || 'medium',
            status: 'new',
            ...data.metadata,
          },
          impact: {
            affectedUsers: data.impact?.affectedUsers,
            downtime: data.impact?.downtime,
            severity: data.impact?.severity || 'minor',
            businessImpact: data.impact?.businessImpact || 'low',
            ...data.impact,
          },
          relatedErrors: data.relatedErrors || [],
        };

        const loggedError = await errorService.logError(error);
        return NextResponse.json({ success: true, error: loggedError });

      case 'update':
        const { errorId, status, assignee, resolution } = data;
        if (!errorId) {
          return NextResponse.json(
            { success: false, error: 'errorId is required' },
            { status: 400 }
          );
        }

        const updatedError = await errorService.updateErrorStatus(
          errorId,
          status,
          assignee,
          resolution
        );
        return NextResponse.json({ success: true, error: updatedError });

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error in errors API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'list':
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '50');
        
        // Parse filter parameters
        const filter: ErrorFilter = {};
        
        const level = searchParams.get('level');
        if (level) filter.level = level.split(',') as any;
        
        const category = searchParams.get('category');
        if (category) filter.category = category.split(',') as any;
        
        const source = searchParams.get('source');
        if (source) filter.source = source.split(',');
        
        const priority = searchParams.get('priority');
        if (priority) filter.priority = priority.split(',') as any;
        
        const status = searchParams.get('status');
        if (status) filter.status = status.split(',') as any;
        
        const assignee = searchParams.get('assignee');
        if (assignee) filter.assignee = assignee;
        
        const tags = searchParams.get('tags');
        if (tags) filter.tags = tags.split(',');
        
        // Parse date range
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');
        if (startDate && endDate) {
          filter.dateRange = {
            start: new Date(startDate),
            end: new Date(endDate),
          };
        }

        const result = await errorService.getErrors(filter, page, limit);
        return NextResponse.json({ success: true, ...result });

      case 'analytics':
        const analyticsFilter: ErrorFilter = {};
        
        const analyticsStartDate = searchParams.get('startDate');
        const analyticsEndDate = searchParams.get('endDate');
        if (analyticsStartDate && analyticsEndDate) {
          analyticsFilter.dateRange = {
            start: new Date(analyticsStartDate),
            end: new Date(analyticsEndDate),
          };
        }

        const analytics = await errorService.generateAnalytics(analyticsFilter);
        return NextResponse.json({ success: true, analytics });

      case 'reports':
        const reportsPage = parseInt(searchParams.get('page') || '1');
        const reportsLimit = parseInt(searchParams.get('limit') || '20');
        
        const reports = await errorService.getErrorReports(reportsPage, reportsLimit);
        return NextResponse.json({ success: true, ...reports });

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error in errors API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
