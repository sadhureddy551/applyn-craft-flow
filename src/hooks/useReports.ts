import { useState, useCallback, useMemo } from 'react';
import { Report, ReportDataPoint, ReportFilter, ReportMetric } from '@/lib/report-types';
import { mockReports } from '@/lib/mock-reports';
import { mockRecords, MockRecord } from '@/lib/mock-data';

export function useReports() {
  const [reports, setReports] = useState<Report[]>(mockReports);

  const createReport = useCallback((report: Omit<Report, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>) => {
    const newReport: Report = {
      ...report,
      id: `rpt-${Date.now()}`,
      tenantId: 't1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setReports((prev) => [newReport, ...prev]);
    return newReport;
  }, []);

  const updateReport = useCallback((id: string, updates: Partial<Report>) => {
    setReports((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updates, updatedAt: new Date().toISOString() } : r))
    );
  }, []);

  const deleteReport = useCallback((id: string) => {
    setReports((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const getReport = useCallback((id: string) => reports.find((r) => r.id === id), [reports]);

  return { reports, createReport, updateReport, deleteReport, getReport };
}

export function useReportData(report: Report | undefined) {
  return useMemo<ReportDataPoint[]>(() => {
    if (!report) return [];

    const records = mockRecords[report.moduleId] || [];

    // Apply filters
    let filtered = [...records];
    for (const filter of report.filtersJSON) {
      filtered = filtered.filter((r) => {
        const val = String(r.values[filter.fieldKey] ?? '');
        switch (filter.operator) {
          case 'equals': return val === filter.value;
          case 'contains': return val.toLowerCase().includes(filter.value.toLowerCase());
          case 'gt': return Number(r.values[filter.fieldKey]) > Number(filter.value);
          case 'lt': return Number(r.values[filter.fieldKey]) < Number(filter.value);
          default: return true;
        }
      });
    }

    // Group by
    const groups = new Map<string, MockRecord[]>();
    for (const record of filtered) {
      const key = String(record.values[report.groupBy] ?? 'Unknown');
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(record);
    }

    // Aggregate metrics
    const data: ReportDataPoint[] = [];
    for (const [group, recs] of groups) {
      const point: ReportDataPoint = { group };
      for (const metric of report.metrics) {
        const key = metric.label;
        if (metric.aggregation === 'count') {
          point[key] = recs.length;
        } else {
          const nums = recs.map((r) => Number(r.values[metric.fieldKey] || 0));
          switch (metric.aggregation) {
            case 'sum': point[key] = nums.reduce((a, b) => a + b, 0); break;
            case 'avg': point[key] = nums.length ? Math.round(nums.reduce((a, b) => a + b, 0) / nums.length) : 0; break;
            case 'min': point[key] = Math.min(...nums); break;
            case 'max': point[key] = Math.max(...nums); break;
          }
        }
      }
      data.push(point);
    }

    return data;
  }, [report]);
}
