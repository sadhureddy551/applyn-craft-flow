import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import Dashboard from "@/pages/Dashboard";
import ModulesPage from "@/pages/ModulesPage";
import ModuleDetailPage from "@/pages/ModuleDetailPage";
import RecordDetailPage from "@/pages/RecordDetailPage";
import TemplatesPage from "@/pages/TemplatesPage";
import PipelinesPage from "@/pages/PipelinesPage";
import AutomationsPage from "@/pages/AutomationsPage";
import RelationshipsPage from "@/pages/RelationshipsPage";
import PlaceholderPage from "@/pages/PlaceholderPage";
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
            <Route path="/relationships" element={<RelationshipsPage />} />
            <Route path="/tasks" element={<PlaceholderPage title="Tasks" description="Manage tasks and to-dos across your CRM" />} />
            <Route path="/forms" element={<PlaceholderPage title="Forms" description="Build lead capture forms for your website" />} />
            <Route path="/reports" element={<PlaceholderPage title="Reports" description="Create custom reports with charts and analytics" />} />
            <Route path="/settings" element={<PlaceholderPage title="Settings" description="Configure your workspace, users, and permissions" />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
