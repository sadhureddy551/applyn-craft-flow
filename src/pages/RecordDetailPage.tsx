import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Mail, Phone, Building2, User, Clock, MoreHorizontal, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockModules, mockFields, mockRecords } from "@/lib/mock-data";
import { useRecordActivities, useRecordNotes, useRecordFiles } from "@/hooks/useRecords";
import { InlineEditField } from "@/components/records/InlineEditField";
import { ActivityTimeline } from "@/components/records/ActivityTimeline";
import { RecordNotes } from "@/components/records/RecordNotes";
import { RecordFiles } from "@/components/records/RecordFiles";
import { RecordDeleteDialog } from "@/components/records/RecordDeleteDialog";
import { useToast } from "@/hooks/use-toast";

const stageColors: Record<string, string> = {
  New: 'bg-brand-blue/10 text-brand-blue border-brand-blue/20',
  Contacted: 'bg-brand-purple/10 text-brand-purple border-brand-purple/20',
  Proposal: 'bg-brand-indigo/10 text-brand-indigo border-brand-indigo/20',
  Negotiation: 'bg-accent/10 text-accent border-accent/20',
  'Closed Won': 'bg-accent/10 text-accent border-accent/20',
  Qualified: 'bg-accent/10 text-accent border-accent/20',
  Discovery: 'bg-brand-blue/10 text-brand-blue border-brand-blue/20',
};

export default function RecordDetailPage() {
  const { moduleId, recordId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const mod = mockModules.find((m) => m.id === moduleId);
  const fields = mockFields[moduleId || ''] || [];
  const allRecords = mockRecords[moduleId || ''] || [];
  const record = allRecords.find((r) => r.id === recordId);

  const { activities, addActivity } = useRecordActivities(recordId || '');
  const { notes, addNote, deleteNote } = useRecordNotes(recordId || '');
  const { files, addFile, deleteFile } = useRecordFiles(recordId || '');

  const [values, setValues] = useState<Record<string, any>>(record?.values || {});
  const [deleteOpen, setDeleteOpen] = useState(false);

  if (!mod || !record) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">Record not found.</p>
        <Button variant="link" onClick={() => navigate(`/modules/${moduleId}`)}>Back to {mod?.name || 'module'}</Button>
      </div>
    );
  }

  const nameField = fields[0];
  const recordName = values[nameField?.fieldKey] || 'Untitled';
  const email = values['email'] || '';
  const phone = values['phone'] || '';
  const company = values['company'] || '';
  const stage = record.stage || values['status'] || values['stage'] || '';

  const handleFieldSave = (fieldKey: string, newValue: any) => {
    const oldValue = values[fieldKey];
    setValues((prev) => ({ ...prev, [fieldKey]: newValue }));
    const field = fields.find((f) => f.fieldKey === fieldKey);
    addActivity('field_updated', `${field?.label || fieldKey} changed from \"${oldValue || 'empty'}\" to \"${newValue}\"`);
    toast({ title: "Field updated", description: `${field?.label} has been saved.` });
  };

  const handleDelete = () => {
    toast({ title: "Record deleted", description: `"${recordName}" has been deleted.` });
    navigate(`/modules/${moduleId}`);
  };

  // Group fields into sections
  const contactFields = fields.filter((f) => ['email', 'phone', 'company'].includes(f.fieldKey));
  const otherFields = fields.filter((f) => !['email', 'phone', 'company'].includes(f.fieldKey) && f.orderIndex !== 0);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Back nav */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => navigate(`/modules/${moduleId}`)}>
          <ArrowLeft className="h-4 w-4 mr-1.5" /> {mod.name}
        </Button>
      </div>

      {/* Business Card */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-border bg-card shadow-card p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="h-14 w-14 rounded-xl gradient-brand flex items-center justify-center shrink-0">
              <span className="text-xl font-bold text-primary-foreground">
                {recordName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
              </span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">{recordName}</h1>
              <div className="flex flex-wrap items-center gap-3 mt-1.5 text-sm text-muted-foreground">
                {company && (
                  <span className="flex items-center gap-1">
                    <Building2 className="h-3.5 w-3.5" /> {company}
                  </span>
                )}
                {email && (
                  <span className="flex items-center gap-1">
                    <Mail className="h-3.5 w-3.5" /> {email}
                  </span>
                )}
                {phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5" /> {phone}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-2">
                {stage && (
                  <Badge variant="outline" className={`text-xs ${stageColors[stage] || 'bg-muted text-muted-foreground'}`}>
                    {stage}
                  </Badge>
                )}
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <User className="h-3 w-3" /> {record.createdBy}
                </span>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {new Date(record.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => setDeleteOpen(true)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </motion.div>

      {/* Main Content + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Section - Editable Fields */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Info */}
          {contactFields.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="rounded-xl border border-border bg-card shadow-card p-5">
              <h3 className="text-sm font-semibold text-foreground mb-3">Contact Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1">
                {contactFields.map((f) => (
                  <div key={f.id} className="py-1">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{f.label}</label>
                    <InlineEditField field={f} value={values[f.fieldKey]} onSave={handleFieldSave} />
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Other Fields */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-xl border border-border bg-card shadow-card p-5">
            <h3 className="text-sm font-semibold text-foreground mb-3">Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1">
              {otherFields.map((f) => (
                <div key={f.id} className={`py-1 ${f.fieldType === 'textarea' ? 'sm:col-span-2' : ''}`}>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{f.label}</label>
                  <InlineEditField field={f} value={values[f.fieldKey]} onSave={handleFieldSave} />
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right Sidebar */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="space-y-0">
          <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
            <Tabs defaultValue="activity" className="w-full">
              <TabsList className="w-full rounded-none border-b border-border bg-muted/30 h-auto p-0">
                <TabsTrigger value="activity" className="flex-1 rounded-none text-xs py-2.5 data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary">Activity</TabsTrigger>
                <TabsTrigger value="notes" className="flex-1 rounded-none text-xs py-2.5 data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary">Notes</TabsTrigger>
                <TabsTrigger value="files" className="flex-1 rounded-none text-xs py-2.5 data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary">Files</TabsTrigger>
              </TabsList>
              <div className="p-4">
                <TabsContent value="activity" className="mt-0">
                  <ActivityTimeline activities={activities} />
                </TabsContent>
                <TabsContent value="notes" className="mt-0">
                  <RecordNotes notes={notes} onAdd={addNote} onDelete={deleteNote} />
                </TabsContent>
                <TabsContent value="files" className="mt-0">
                  <RecordFiles files={files} onAdd={addFile} onDelete={deleteFile} />
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </motion.div>
      </div>

      <RecordDeleteDialog open={deleteOpen} onOpenChange={setDeleteOpen} recordName={recordName} onConfirm={handleDelete} />
    </div>
  );
}
