import { Search, Bell } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function AppHeader() {
  return (
    <header className="h-14 border-b border-border bg-card flex items-center px-4 gap-4 shrink-0">
      <SidebarTrigger className="text-muted-foreground hover:text-foreground" />

      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search records, modules..."
            className="pl-9 h-9 bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 ml-auto">
        <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive" />
        </Button>
      </div>
    </header>
  );
}
