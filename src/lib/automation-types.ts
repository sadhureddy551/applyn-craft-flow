export type AutomationTriggerType = 'record_created' | 'record_updated' | 'stage_changed' | 'form_submitted';

export type ConditionOperator = 'equals' | 'not_equals' | 'contains' | 'gt' | 'lt' | 'is_empty' | 'is_not_empty' | 'date_before' | 'date_after';

export type AutomationActionType = 'assign_owner' | 'send_email' | 'create_task' | 'update_field' | 'send_webhook';

export interface AutomationCondition {
  id: string;
  fieldKey: string;
  operator: ConditionOperator;
  value: string;
}

export interface AutomationAction {
  id: string;
  type: AutomationActionType;
  config: Record<string, string>;
}

export interface Automation {
  id: string;
  tenantId: string;
  moduleId: string;
  name: string;
  triggerType: AutomationTriggerType;
  conditionsJSON: AutomationCondition[];
  actionsJSON: AutomationAction[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const TRIGGER_LABELS: Record<AutomationTriggerType, string> = {
  record_created: 'Record Created',
  record_updated: 'Record Updated',
  stage_changed: 'Stage Changed',
  form_submitted: 'Form Submitted',
};

export const ACTION_LABELS: Record<AutomationActionType, string> = {
  assign_owner: 'Assign Owner',
  send_email: 'Send Email',
  create_task: 'Create Task',
  update_field: 'Update Field',
  send_webhook: 'Send Webhook',
};

export const CONDITION_OPERATOR_LABELS: Record<ConditionOperator, string> = {
  equals: 'Equals',
  not_equals: 'Does not equal',
  contains: 'Contains',
  gt: 'Greater than',
  lt: 'Less than',
  is_empty: 'Is empty',
  is_not_empty: 'Is not empty',
  date_before: 'Date is before',
  date_after: 'Date is after',
};
