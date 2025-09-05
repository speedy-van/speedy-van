import { PrismaClient } from '@prisma/client';
import { ProductionError, ErrorReport, ErrorFilter, ErrorAnalytics } from '../../types';

export class ErrorMonitoringService {
  private prisma: PrismaClient;
  private static instance: ErrorMonitoringService;

  private constructor() {
    this.prisma = new PrismaClient();
  }

  public static getInstance(): ErrorMonitoringService {
    if (!ErrorMonitoringService.instance) {
      ErrorMonitoringService.instance = new ErrorMonitoringService();
    }
    return ErrorMonitoringService.instance;
  }

  /**
   * Log a production error
   */
  async logError(error: Omit<ProductionError, 'id' | 'createdAt' | 'updatedAt'>): Promise<ProductionError> {
    try {
      const createdError = await this.prisma.productionError.create({
        data: {
          timestamp: error.timestamp,
          level: error.level,
          category: error.category,
          source: error.source,
          message: error.message,
          stackTrace: error.stackTrace,
          context: error.context,
          metadata: error.metadata,
          impact: error.impact,
          relatedErrors: error.relatedErrors || [],
        },
      });

      // Trigger real-time alerts for critical errors
      if (error.level === 'critical') {
        await this.triggerCriticalErrorAlert(createdError);
      }

      return createdError;
    } catch (error) {
      console.error('Failed to log production error:', error);
      throw new Error('Failed to log production error');
    }
  }

  /**
   * Get errors with filtering and pagination
   */
  async getErrors(filter: ErrorFilter, page: number = 1, limit: number = 50): Promise<{
    errors: ProductionError[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      const where: any = {};

      if (filter.level && filter.level.length > 0) {
        where.level = { in: filter.level };
      }

      if (filter.category && filter.category.length > 0) {
        where.category = { in: filter.category };
      }

      if (filter.source && filter.source.length > 0) {
        where.source = { in: filter.source };
      }

      if (filter.priority && filter.priority.length > 0) {
        where.metadata = {
          path: ['priority'],
          in: filter.priority,
        };
      }

      if (filter.status && filter.status.length > 0) {
        where.metadata = {
          path: ['status'],
          in: filter.status,
        };
      }

      if (filter.dateRange) {
        where.timestamp = {
          gte: filter.dateRange.start,
          lte: filter.dateRange.end,
        };
      }

      if (filter.assignee) {
        where.metadata = {
          path: ['assignee'],
          equals: filter.assignee,
        };
      }

      const total = await this.prisma.productionError.count({ where });
      const totalPages = Math.ceil(total / limit);

      const errors = await this.prisma.productionError.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      });

      return {
        errors,
        total,
        page,
        totalPages,
      };
    } catch (error) {
      console.error('Failed to get errors:', error);
      throw new Error('Failed to get errors');
    }
  }

  /**
   * Generate comprehensive error analytics
   */
  async generateAnalytics(filter: ErrorFilter): Promise<ErrorAnalytics> {
    try {
      const where: any = {};

      if (filter.dateRange) {
        where.timestamp = {
          gte: filter.dateRange.start,
          lte: filter.dateRange.end,
        };
      }

      // Get total errors
      const totalErrors = await this.prisma.productionError.count({ where });

      // Get errors by category
      const categoryResults = await this.prisma.productionError.groupBy({
        by: ['category'],
        where,
        _count: { category: true },
      });

      const categoryDistribution = categoryResults.map(result => ({
        category: result.category,
        count: result._count.category,
        percentage: (result._count.category / totalErrors) * 100,
      }));

      // Get errors by source
      const sourceResults = await this.prisma.productionError.groupBy({
        by: ['source'],
        where,
        _count: { source: true },
      });

      const sourceDistribution = sourceResults.map(result => ({
        source: result.source,
        count: result._count.source,
        percentage: (result._count.source / totalErrors) * 100,
      }));

      // Get trend data (last 30 days by default)
      const endDate = filter.dateRange?.end || new Date();
      const startDate = filter.dateRange?.start || new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);

      const trendData = await this.getTrendData(startDate, endDate);

      // Get top issues (most frequent errors)
      const topIssues = await this.getTopIssues(where, 10);

      // Calculate error rate (errors per hour)
      const timeDiff = endDate.getTime() - startDate.getTime();
      const hoursDiff = timeDiff / (1000 * 60 * 60);
      const errorRate = totalErrors / hoursDiff;

      // Calculate resolution time statistics
      const resolutionStats = await this.calculateResolutionTimeStats(where);

      return {
        totalErrors,
        errorRate,
        resolutionTime: resolutionStats,
        categoryDistribution,
        sourceDistribution,
        trendData,
        topIssues,
      };
    } catch (error) {
      console.error('Failed to generate analytics:', error);
      throw new Error('Failed to generate analytics');
    }
  }

  /**
   * Generate comprehensive error report
   */
  async generateErrorReport(
    period: { start: Date; end: Date },
    title: string,
    assignee?: string
  ): Promise<ErrorReport> {
    try {
      const filter: ErrorFilter = { dateRange: period };
      const analytics = await this.generateAnalytics(filter);
      const errors = await this.getErrors(filter, 1, 1000); // Get all errors for the period

      // Generate AI-powered recommendations
      const recommendations = await this.generateAIRecommendations(analytics, errors.errors);

      const report: Omit<ErrorReport, 'id' | 'createdAt' | 'updatedAt'> = {
        title,
        summary: this.generateReportSummary(analytics, errors.errors),
        generatedAt: new Date(),
        period: { start: period.start, end: period.end },
        errors: errors.errors,
        statistics: {
          totalErrors: analytics.totalErrors,
          criticalErrors: await this.getCriticalErrorCount(period),
          resolvedErrors: await this.getResolvedErrorCount(period),
          averageResolutionTime: analytics.resolutionTime.average,
          topCategories: analytics.categoryDistribution.slice(0, 5),
          topSources: analytics.sourceDistribution.slice(0, 5),
          trendAnalysis: analytics.trendData,
        },
        recommendations,
        assignee,
        status: 'draft',
      };

      const createdReport = await this.prisma.errorReport.create({
        data: {
          title: report.title,
          summary: report.summary,
          generatedAt: report.generatedAt,
          periodStart: report.period.start,
          periodEnd: report.period.end,
          errors: report.errors,
          statistics: report.statistics,
          recommendations: report.recommendations,
          assignee: report.assignee,
          status: report.status,
        },
      });

      return {
        ...report,
        id: createdReport.id,
        createdAt: createdReport.createdAt,
        updatedAt: createdReport.updatedAt,
      };
    } catch (error) {
      console.error('Failed to generate error report:', error);
      throw new Error('Failed to generate error report');
    }
  }

  /**
   * Update error status and assignee
   */
  async updateErrorStatus(
    errorId: string,
    status: ProductionError['metadata']['status'],
    assignee?: string,
    resolution?: string
  ): Promise<ProductionError> {
    try {
      const updateData: any = {
        metadata: {
          status,
          ...(assignee && { assignee }),
          ...(resolution && { resolution }),
          ...(status === 'resolved' && { resolvedAt: new Date() }),
        },
      };

      const updatedError = await this.prisma.productionError.update({
        where: { id: errorId },
        data: updateData,
      });

      return updatedError;
    } catch (error) {
      console.error('Failed to update error status:', error);
      throw new Error('Failed to update error status');
    }
  }

  /**
   * Get error reports
   */
  async getErrorReports(page: number = 1, limit: number = 20): Promise<{
    reports: ErrorReport[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      const total = await this.prisma.errorReport.count();
      const totalPages = Math.ceil(total / limit);

      const reports = await this.prisma.errorReport.findMany({
        orderBy: { generatedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      });

      return {
        reports,
        total,
        page,
        totalPages,
      };
    } catch (error) {
      console.error('Failed to get error reports:', error);
      throw new Error('Failed to get error reports');
    }
  }

  /**
   * Clean up old errors (older than specified days)
   */
  async cleanupOldErrors(daysOld: number = 90): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const result = await this.prisma.productionError.deleteMany({
        where: {
          timestamp: {
            lt: cutoffDate,
          },
        },
      });

      return result.count;
    } catch (error) {
      console.error('Failed to cleanup old errors:', error);
      throw new Error('Failed to cleanup old errors');
    }
  }

  // Private helper methods
  private async triggerCriticalErrorAlert(error: ProductionError): Promise<void> {
    // TODO: Implement real-time alerting (Slack, email, etc.)
    console.log(`🚨 CRITICAL ERROR ALERT: ${error.message} in ${error.source}`);
  }

  private async getTrendData(startDate: Date, endDate: Date): Promise<Array<{ timestamp: string; errorCount: number; resolutionCount: number }>> {
    // TODO: Implement trend data calculation
    return [];
  }

  private async getTopIssues(where: any, limit: number): Promise<Array<{ error: ProductionError; frequency: number; lastOccurrence: Date }>> {
    // TODO: Implement top issues calculation
    return [];
  }

  private async calculateResolutionTimeStats(where: any): Promise<{ average: number; median: number; p95: number }> {
    // TODO: Implement resolution time statistics
    return { average: 0, median: 0, p95: 0 };
  }

  private async generateAIRecommendations(analytics: ErrorAnalytics, errors: ProductionError[]): Promise<ErrorReport['recommendations']> {
    // TODO: Implement AI-powered recommendations
    return [];
  }

  private generateReportSummary(analytics: ErrorAnalytics, errors: ProductionError[]): string {
    const criticalCount = errors.filter(e => e.level === 'critical').length;
    const resolvedCount = errors.filter(e => e.metadata.status === 'resolved').length;
    
    return `Generated error report covering ${analytics.totalErrors} errors. ${criticalCount} critical issues detected, ${resolvedCount} resolved. Top categories: ${analytics.categoryDistribution.slice(0, 3).map(c => c.category).join(', ')}.`;
  }

  private async getCriticalErrorCount(period: { start: Date; end: Date }): Promise<number> {
    return await this.prisma.productionError.count({
      where: {
        level: 'critical',
        timestamp: {
          gte: period.start,
          lte: period.end,
        },
      },
    });
  }

  private async getResolvedErrorCount(period: { start: Date; end: Date }): Promise<number> {
    return await this.prisma.productionError.count({
      where: {
        metadata: {
          path: ['status'],
          equals: 'resolved',
        },
        timestamp: {
          gte: period.start,
          lte: period.end,
        },
      },
    });
  }
}
