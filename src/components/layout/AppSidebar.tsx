import { NavLink } from "@/components/NavLink";
import {
  LayoutDashboard,
  FolderTree,
  LifeBuoy,
  Gauge,
  BarChart3,
  Network,
  HardDrive,
  Activity,
  Layers,
  ScrollText,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

/** All navigable routes in the simulator. */
const navItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "File Explorer", url: "/explorer", icon: FolderTree },
  { title: "Recovery Centre", url: "/recovery", icon: LifeBuoy },
  { title: "Optimizer", url: "/optimizer", icon: Gauge },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
  { title: "FS Structure", url: "/structure", icon: Network },
  { title: "Free Space", url: "/free-space", icon: HardDrive },
  { title: "File Access", url: "/access", icon: Activity },
  { title: "Cache LRU/FIFO", url: "/cache", icon: Layers },
  { title: "Journaling", url: "/journal", icon: ScrollText },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border px-4 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-sidebar-primary">
            <HardDrive className="h-4 w-4 text-sidebar-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold text-sidebar-accent-foreground">FS Recovery</span>
              <span className="text-xs text-sidebar-foreground">Optimization Tool</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Modules</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className="flex items-center gap-3 rounded-md px-2 py-2 text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      activeClassName="!bg-sidebar-primary !text-sidebar-primary-foreground font-medium"
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
