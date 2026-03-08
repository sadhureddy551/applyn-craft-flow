import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Zap, Plus, Trash2, Filter, Play, Mail, User, FileText, Edit3, Globe,
  ChevronDown, ArrowDown, Circle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAutomations } from '@/hooks/useAutomations';
import { mockModules, mockFields } from '@/lib/mock-data';
import {
  AutomationTriggerType, AutomationActionType, ConditionOperator,
  TRIGGER_LABELS, ACTION_LABELS, CONDITION_OPERATOR_LABELS,
} from '@/lib/automation-types';
import { useToast } from '@/hooks/use-toast';

const ACTION_ICONS: Record<AutomationActionType, typeof Mail> = {
  assign_owner: User,
  send_email: Mail,
  create_task: FileText,
  update_field: Edit3,
  send_webhook: Globe,
};

const ACTION_COLORS: Record<AutomationActionType, string> = {
  assign_owner: 'bg-blue-500/10 text-blue-600',
  send_email: 'bg-violet-500/10 text-violet-600',
  create_task: 'bg-emerald-500/10 text-emerald-600',
  update_field: 'bg-amber-500/10 text-amber-600',
  send_webhook: 'bg-rose-500/10 text-rose-600',
};

function FlowConnector() {
  return (
    <div className="flex flex-col items-center py-1">
      <div className="w-px h-6 bg-border" />
      <ArrowDown className="h-4 w-4 text-muted-foreground -my-0.5" />
      <div className="w-px h-2 bg-border" />
    </div>
  );
}

export default function AutomationBuilderPage() {
  const { automationId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    getAutomation, updateAutomation, toggleActive,
    addCondition, removeCondition, addAction, removeAction,
  } = useAutomations();

  const automation = getAutomation(automationId || '');

  // Condition dialog state
  const [condOpen, setCondOpen] = useState(false);
  const [condField, setCondField] = useState('');
  const [condOp, setCondOp] = useState<ConditionOperator>('equals');
  const [condValue, setCondValue] = useState('');

  // Action dialog state
  const [actOpen, setActOpen] = useState(false);
  const [actType, setActType] = useState<AutomationActionType>('assign_owner');
  const [actConfig, setActConfig] = useState<Record<string, string>>({});

  if (!automation) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[50vh]">
        <p className="text-muted-foreground">Automation not found</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/automations')}>Back to Automations</Button>
      </div>
    );
  }

  const mod = mockModules.find(m => m.id === automation.moduleId);
  const fields = mockFields[automation.moduleId] || [];

  const handleAddCondition = () => {
    if (!condField) return;
    addCondition(automation.id, {
      id: `c-${Date.now()}`,
      fieldKey: condField,
      operator: condOp,
      value: condValue,
    });
    setCondOpen(false);
    setCondField('');
    setCondValue('');
    toast({ title: 'Condition added' });
  };

  const handleAddAction = () => {
    addAction(automation.id, {
      id: `a-${Date.now()}`,
      type: actType,
      config: { ...actConfig },
    });
    setActOpen(false);
    setActConfig({});
    toast({ title: 'Action added' });
  };

  const renderActionConfigFields = () => {
    switch (actType) {
      case 'assign_owner':
        return (
          <div><Label>Owner Name</Label><Input value={actConfig.owner || ''} onChange={e => setActConfig({ ...actConfig, owner: e.target.value })} placeholder="e.g. John Doe" /></div>
        );
      case 'send_email':
        return (
          <>
            <div><Label>To</Label><Input value={actConfig.to || ''} onChange={e => setActConfig({ ...actConfig, to: e.target.value })} placeholder="{{record.email}}" /></div>
            <div><Label>Subject</Label><Input value={actConfig.subject || ''} onChange={e => setActConfig({ ...actConfig, subject: e.target.value })} placeholder="Subject line" /></div>
            <div><Label>Body</Label><Textarea value={actConfig.body || ''} onChange={e => setActConfig({ ...actConfig, body: e.target.value })} placeholder="Email body..." rows={3} /></div>
          </>
        );
      case 'create_task':
        return (
          <>
            <div><Label>Task Title</Label><Input value={actConfig.title || ''} onChange={e => setActConfig({ ...actConfig, title: e.target.value })} placeholder="Follow up with lead" /></div>
            <div><Label>Assignee</Label><Input value={actConfig.assignee || ''} onChange={e => setActConfig({ ...actConfig, assignee: e.target.value })} placeholder="John Doe" /></div>
          </>
        );
      case 'update_field':
        return (
          <>
            <div>
              <Label>Field</Label>
              <Select value={actConfig.fieldKey || ''} onValueChange={v => setActConfig({ ...actConfig, fieldKey: v })}>
                <SelectTrigger><SelectValue placeholder="Select field" /></SelectTrigger>
                <SelectContent>{fields.map(f => <SelectItem key={f.fieldKey} value={f.fieldKey}>{f.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>New Value</Label><Input value={actConfig.newValue || ''} onChange={e => setActConfig({ ...actConfig, newValue: e.target.value })} placeholder="Value" /></div>
          </>
        );
      case 'send_webhook':
        return (
          <>
            <div><Label>Webhook URL</Label><Input value={actConfig.url || ''} onChange={e => setActConfig({ ...actConfig, url: e.target.value })} placeholder="https://..." /></div>
            <div><Label>Payload (JSON)</Label><Textarea value={actConfig.payload || ''} onChange={e => setActConfig({ ...actConfig, payload: e.target.value })} placeholder='{"key": "value"}' rows={3} /></div>
          </>
        );
    }
  };

  const needsValue = !['is_empty', 'is_not_empty'].includes(condOp);

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/automations')}><ArrowLeft className="h-4 w-4" /></Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">{automation.name}</h1>
          <p className="text-sm text-muted-foreground">{mod?.name} · {TRIGGER_LABELS[automation.triggerType]}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{automation.isActive ? 'Active' : 'Inactive'}</span>
            <Switch checked={automation.isActive} onCheckedChange={() => toggleActive(automation.id)} />
          </div>
        </div>
      </div>

      {/* Visual Flow */}
      <div className="flex flex-col items-center">
        {/* TRIGGER NODE */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-lg">
          <Card className="border-2 border-primary/30 bg-primary/5">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl gradient-brand flex items-center justify-center shrink-0">
                <Zap className="h-5 w-5 text-primary-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Trigger</p>
                <p className="text-sm font-semibold text-foreground">{TRIGGER_LABELS[automation.triggerType]}</p>
              </div>
              <Select value={automation.triggerType} onValueChange={(v) => updateAutomation(automation.id, { triggerType: v as AutomationTriggerType })}>
                <SelectTrigger className="w-[160px] h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(TRIGGER_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </motion.div>

        <FlowConnector />

        {/* CONDITIONS */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="w-full max-w-lg">
          <Card className="border-2 border-amber-400/30 bg-amber-50/50 dark:bg-amber-950/10">
            <CardHeader className="pb-2 pt-4 px-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-amber-600" />
                  <CardTitle className="text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400">Conditions</CardTitle>
                  {automation.conditionsJSON.length === 0 && <span className="text-xs text-muted-foreground">(all records)</span>}
                </div>
                <Dialog open={condOpen} onOpenChange={setCondOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="h-7 text-xs"><Plus className="h-3 w-3 mr-1" />Add</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-sm">
                    <DialogHeader><DialogTitle>Add Condition</DialogTitle></DialogHeader>
                    <div className="space-y-4 pt-2">
                      <div>
                        <Label>Field</Label>
                        <Select value={condField} onValueChange={setCondField}>
                          <SelectTrigger><SelectValue placeholder="Select field" /></SelectTrigger>
                          <SelectContent>{fields.map(f => <SelectItem key={f.fieldKey} value={f.fieldKey}>{f.label}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Operator</Label>
                        <Select value={condOp} onValueChange={(v) => setCondOp(v as ConditionOperator)}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {Object.entries(CONDITION_OPERATOR_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      {needsValue && <div><Label>Value</Label><Input value={condValue} onChange={e => setCondValue(e.target.value)} placeholder="Value" /></div>}
                      <Button onClick={handleAddCondition} disabled={!condField} className="w-full">Add Condition</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            {automation.conditionsJSON.length > 0 && (
              <CardContent className="px-4 pb-4 pt-1">
                <div className="space-y-2">
                  {automation.conditionsJSON.map((cond, i) => {
                    const field = fields.find(f => f.fieldKey === cond.fieldKey);
                    return (
                      <div key={cond.id} className="flex items-center gap-2 bg-background/80 rounded-lg px-3 py-2 border border-border/50">
                        {i > 0 && <Badge variant="outline" className="text-[9px] px-1.5 mr-1">AND</Badge>}
                        <span className="text-xs font-medium text-foreground">{field?.label || cond.fieldKey}</span>
                        <Badge variant="secondary" className="text-[10px]">{CONDITION_OPERATOR_LABELS[cond.operator]}</Badge>
                        {cond.value && <span className="text-xs text-muted-foreground">"{cond.value}"</span>}
                        <div className="flex-1" />
                        <button onClick={() => removeCondition(automation.id, cond.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            )}
          </Card>
        </motion.div>

        <FlowConnector />

        {/* ACTIONS */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="w-full max-w-lg space-y-3">
          {automation.actionsJSON.map((action, i) => {
            const Icon = ACTION_ICONS[action.type];
            const colorClass = ACTION_COLORS[action.type];
            return (
              <div key={action.id}>
                <Card className="border-2 border-accent/30 bg-accent/5">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${colorClass}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Action {i + 1}</p>
                      <p className="text-sm font-semibold text-foreground">{ACTION_LABELS[action.type]}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {Object.entries(action.config).map(([k, v]) => (
                          <span key={k} className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{k}: {v}</span>
                        ))}
                      </div>
                    </div>
                    <button onClick={() => removeAction(automation.id, action.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                  </CardContent>
                </Card>
                {i < automation.actionsJSON.length - 1 && <FlowConnector />}
              </div>
            );
          })}

          {/* Add Action */}
          <div className="flex flex-col items-center">
            {automation.actionsJSON.length > 0 && <FlowConnector />}
            <Dialog open={actOpen} onOpenChange={setActOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="border-dashed border-2 w-full max-w-lg h-14 text-muted-foreground hover:text-foreground hover:border-primary/30">
                  <Plus className="h-4 w-4 mr-2" />Add Action
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader><DialogTitle>Add Action</DialogTitle></DialogHeader>
                <div className="space-y-4 pt-2">
                  <div>
                    <Label>Action Type</Label>
                    <div className="grid grid-cols-2 gap-2 mt-1.5">
                      {(Object.entries(ACTION_LABELS) as [AutomationActionType, string][]).map(([key, label]) => {
                        const Icon = ACTION_ICONS[key];
                        const colorClass = ACTION_COLORS[key];
                        return (
                          <button key={key} onClick={() => { setActType(key); setActConfig({}); }}
                            className={`flex items-center gap-2 p-3 rounded-lg border text-left text-xs font-medium transition-colors ${actType === key ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:bg-muted/50'}`}>
                            <div className={`h-7 w-7 rounded-md flex items-center justify-center ${colorClass}`}><Icon className="h-3.5 w-3.5" /></div>
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  {renderActionConfigFields()}
                  <Button onClick={handleAddAction} className="w-full gradient-brand text-primary-foreground">Add Action</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
