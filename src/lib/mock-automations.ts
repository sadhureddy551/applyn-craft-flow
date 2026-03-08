import { Automation } from './automation-types';

export const mockAutomations: Automation[] = [
  {
    id: 'auto-1',
    tenantId: 't1',
    moduleId: '1',
    name: 'Auto-assign new leads',
    triggerType: 'record_created',
    conditionsJSON: [
      { id: 'c1', fieldKey: 'source', operator: 'equals', value: 'Website' },
    ],
    actionsJSON: [
      { id: 'a1', type: 'assign_owner', config: { owner: 'John Doe' } },
      { id: 'a2', type: 'send_email', config: { to: '{{record.email}}', subject: 'Welcome!', body: 'Thanks for your interest.' } },
    ],
    isActive: true,
    createdAt: '2026-03-01T10:00:00Z',
    updatedAt: '2026-03-07T10:00:00Z',
  },
  {
    id: 'auto-2',
    tenantId: 't1',
    moduleId: '1',
    name: 'Notify on stage change',
    triggerType: 'stage_changed',
    conditionsJSON: [],
    actionsJSON: [
      { id: 'a3', type: 'create_task', config: { title: 'Follow up on stage change', assignee: 'John Doe' } },
    ],
    isActive: true,
    createdAt: '2026-03-02T10:00:00Z',
    updatedAt: '2026-03-06T10:00:00Z',
  },
  {
    id: 'auto-3',
    tenantId: 't1',
    moduleId: '2',
    name: 'Send welcome email',
    triggerType: 'record_created',
    conditionsJSON: [],
    actionsJSON: [
      { id: 'a4', type: 'send_email', config: { to: '{{record.email}}', subject: 'Welcome to our CRM', body: 'Hello {{record.name}}!' } },
    ],
    isActive: false,
    createdAt: '2026-03-03T10:00:00Z',
    updatedAt: '2026-03-05T10:00:00Z',
  },
];
