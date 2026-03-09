import {
  LayoutDashboard,
  Boxes,
  FileStack,
  GitBranch,
  CheckSquare,
  Zap,
  FileText,
  BarChart3,
  Link2,
  Mail,
  MessageCircle,
  Plug,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { UserMenu } from "@/components/UserMenu";
import { UserAvatar } from "@/components/UserAvatar";
import { useAuth } from "@/components/AuthProvider";

const mainNav = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Modules", url: "/modules", icon: Boxes },
  { title: "Templates", url: "/templates", icon: FileStack },
  { title: "Pipelines", url: "/pipelines", icon: GitBranch },
  { title: "Relationships", url: "/relationships", icon: Link2 },
];

const commNav = [
  { title: "Email", url: "/email", icon: Mail },
  { title: "WhatsApp", url: "/whatsapp", icon: MessageCircle },
];

const workNav = [
  { title: "Tasks", url: "/tasks", icon: CheckSquare },
  { title: "Automations", url: "/automations", icon: Zap },
  { title: "Forms", url: "/forms", icon: FileText },
  { title: "Reports", url: "/reports", icon: BarChart3 },
];

const bottomNav = [
  { title: "Integrations", url: "/integrations", icon: Plug },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const { profile } = useAuth();

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  const renderNavItems = (items: typeof mainNav) =>
    items.map((item) => (
      <SidebarMenuItem key={item.title}>
        <SidebarMenuButton asChild isActive={isActive(item.url)}>
          <NavLink
            to={item.url}
            end={item.url === "/"}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-sidebar-accent"
            activeClassName="bg-sidebar-accent text-sidebar-accent-foreground"
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {!collapsed && <span>{item.title}</span>}
          </NavLink>
        </SidebarMenuButton>
      </SidebarMenuItem>
    ));

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg gradient-brand flex items-center justify-center shrink-0">
            <span className="text-sm font-bold text-primary-foreground">A</span>
          </div>
          {!collapsed && (
            <div className="flex items-center gap-1">
              <span className="text-base font-bold tracking-tight text-foreground">Applyn</span>
              <span className="text-base font-light tracking-tight text-muted-foreground">CRM</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>{renderNavItems(mainNav)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <div className="mx-3 my-2 h-px bg-sidebar-border" />

        <SidebarGroup>
          {!collapsed && (
            <p className="px-3 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">Communication</p>
          )}
          <SidebarGroupContent>
            <SidebarMenu>{renderNavItems(commNav)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <div className="mx-3 my-2 h-px bg-sidebar-border" />

        <SidebarGroup>
          {!collapsed && (
            <p className="px-3 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">Workspace</p>
          )}
          <SidebarGroupContent>
            <SidebarMenu>{renderNavItems(workNav)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="px-2 pb-4">
        <SidebarMenu>{renderNavItems(bottomNav)}</SidebarMenu>
        {!collapsed ? (
          <UserMenu />
        ) : (
          <div className="flex justify-center mt-3">
            <UserAvatar
              name={profile?.name || 'User'}
              avatarUrl={profile?.avatar_url}
              status="online"
              size="sm"
            />
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
