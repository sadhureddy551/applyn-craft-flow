import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { PermissionProvider } from "@/components/PermissionProvider";
import Dashboard from "@/pages/Dashboard";
import ModulesPage from "@/pages/ModulesPage";
import ModuleDetailPage from "@/pages/ModuleDetailPage";
import RecordDetailPage from "@/pages/RecordDetailPage";
import TemplatesPage from "@/pages/TemplatesPage";
import PipelinesPage from "@/pages/PipelinesPage";
import AutomationsPage from "@/pages/AutomationsPage";
import AutomationBuilderPage from "@/pages/AutomationBuilderPage";
import RelationshipsPage from "@/pages/RelationshipsPage";
import FormsPage from "@/pages/FormsPage";
import FormBuilderPage from "@/pages/FormBuilderPage";
import FormPreviewPage from "@/pages/FormPreviewPage";
import PlaceholderPage from "@/pages/PlaceholderPage";
import TasksPage from "@/pages/TasksPage";
import EmailPage from "@/pages/EmailPage";
import WhatsAppPage from "@/pages/WhatsAppPage";
import IntegrationsPage from "@/pages/IntegrationsPage";
import ReportsPage from "@/pages/ReportsPage";
import ReportDetailPage from "@/pages/ReportDetailPage";
import SettingsPage from "@/pages/SettingsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppLayout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/modules" element={<ModulesPage />} />
            <Route path="/modules/:moduleId" element={<ModuleDetailPage />} />
            <Route path="/modules/:moduleId/records/:recordId" element={<RecordDetailPage />} />
            <Route path="/templates" element={<TemplatesPage />} />
            <Route path="/pipelines" element={<PipelinesPage />} />
            <Route path="/automations" element={<AutomationsPage />} />
            <Route path="/automations/:automationId" element={<AutomationBuilderPage />} />
            <Route path="/relationships" element={<RelationshipsPage />} />
            <Route path="/forms" element={<FormsPage />} />
            <Route path="/forms/:formId" element={<FormBuilderPage />} />
            <Route path="/forms/:formId/preview" element={<FormPreviewPage />} />
            <Route path="/form/:formId" element={<FormPreviewPage />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/email" element={<EmailPage />} />
            <Route path="/whatsapp" element={<WhatsAppPage />} />
            <Route path="/integrations" element={<IntegrationsPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/reports/:reportId" element={<ReportDetailPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
