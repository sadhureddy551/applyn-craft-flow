import {
  LayoutDashboard,
  Boxes,
  FileStack,
  GitBranch,
  CheckSquare,
  Zap,
  FileText,
  BarChart3,
  ChevronDown,
  Link2,
  LogOut,
  User,
  Mail,
  MessageCircle,
  Plug,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation, useNavigate } from "react-router-dom";
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();

  const initials = profile?.name
    ? profile.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : '??';

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
        {!collapsed && (
          <Popover>
            <PopoverTrigger asChild>
              <button className="w-full mx-1 mt-3 p-3 rounded-xl bg-muted/50 border border-border hover:bg-muted/80 transition-colors text-left">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-full gradient-brand flex items-center justify-center shrink-0">
                    <span className="text-xs font-semibold text-primary-foreground">{initials}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate text-foreground">{profile?.name || 'User'}</p>
                    <p className="text-xs text-muted-foreground truncate">{profile?.email || ''}</p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </div>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-1" align="start" side="top" sideOffset={8}>
              <button
                onClick={() => navigate('/settings')}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-foreground hover:bg-muted transition-colors"
              >
                <User className="h-4 w-4 text-muted-foreground" />
                Profile & Settings
              </button>
              <div className="h-px bg-border my-1" />
              <button
                onClick={signOut}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-destructive hover:bg-destructive/10 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </PopoverContent>
          </Popover>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
