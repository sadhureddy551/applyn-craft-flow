export type ViewType = 'table' | 'kanban' | 'calendar' | 'list';

export interface ModuleView {
  id: string;
  tenantId: string;
  moduleId: string;
  name: string;
  viewType: ViewType;
  configJSON: {
    filters?: Record<string, string>;
    sortField?: string;
    sortDir?: 'asc' | 'desc';
    visibleColumns?: string[];
  };
  orderIndex: number;
  isDefault?: boolean;
}
