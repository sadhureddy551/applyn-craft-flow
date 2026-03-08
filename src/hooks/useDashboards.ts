import { useState, useCallback } from 'react';
import { CrmDashboard, DashboardWidget, DashboardWidgetType } from '@/lib/dashboard-types';
import { mockDashboards } from '@/lib/mock-dashboards';

export function useDashboards() {
  const [dashboards, setDashboards] = useState<CrmDashboard[]>(mockDashboards);

  const getDashboard = useCallback((id: string) => dashboards.find(d => d.id === id), [dashboards]);

  const createDashboard = useCallback((name: string) => {
    const d: CrmDashboard = {
      id: `dash-${Date.now()}`,
      tenantId: 't1',
      name,
      widgets: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setDashboards(prev => [d, ...prev]);
    return d;
  }, []);

  const deleteDashboard = useCallback((id: string) => {
    setDashboards(prev => prev.filter(d => d.id !== id));
  }, []);

  const addWidget = useCallback((dashboardId: string, widgetType: DashboardWidgetType, configJSON: Record<string, any>, colSpan: 1 | 2 | 3 = 1) => {
    setDashboards(prev => prev.map(d => {
      if (d.id !== dashboardId) return d;
      const widget: DashboardWidget = {
        id: `w-${Date.now()}`,
        dashboardId,
        widgetType,
        configJSON,
        orderIndex: d.widgets.length,
        colSpan,
      };
      return { ...d, widgets: [...d.widgets, widget], updatedAt: new Date().toISOString() };
    }));
  }, []);

  const removeWidget = useCallback((dashboardId: string, widgetId: string) => {
    setDashboards(prev => prev.map(d => {
      if (d.id !== dashboardId) return d;
      return { ...d, widgets: d.widgets.filter(w => w.id !== widgetId).map((w, i) => ({ ...w, orderIndex: i })), updatedAt: new Date().toISOString() };
    }));
  }, []);

  const reorderWidgets = useCallback((dashboardId: string, fromIndex: number, toIndex: number) => {
    setDashboards(prev => prev.map(d => {
      if (d.id !== dashboardId) return d;
      const sorted = [...d.widgets].sort((a, b) => a.orderIndex - b.orderIndex);
      const [moved] = sorted.splice(fromIndex, 1);
      sorted.splice(toIndex, 0, moved);
      return { ...d, widgets: sorted.map((w, i) => ({ ...w, orderIndex: i })), updatedAt: new Date().toISOString() };
    }));
  }, []);

  const resizeWidget = useCallback((dashboardId: string, widgetId: string, colSpan: 1 | 2 | 3) => {
    setDashboards(prev => prev.map(d => {
      if (d.id !== dashboardId) return d;
      return { ...d, widgets: d.widgets.map(w => w.id === widgetId ? { ...w, colSpan } : w), updatedAt: new Date().toISOString() };
    }));
  }, []);

  const updateWidgetConfig = useCallback((dashboardId: string, widgetId: string, configJSON: Record<string, any>) => {
    setDashboards(prev => prev.map(d => {
      if (d.id !== dashboardId) return d;
      return { ...d, widgets: d.widgets.map(w => w.id === widgetId ? { ...w, configJSON: { ...w.configJSON, ...configJSON } } : w), updatedAt: new Date().toISOString() };
    }));
  }, []);

  return { dashboards, getDashboard, createDashboard, deleteDashboard, addWidget, removeWidget, reorderWidgets, resizeWidget, updateWidgetConfig };
}
