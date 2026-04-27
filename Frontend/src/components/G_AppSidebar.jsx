import {
  LayoutDashboard,
  KanbanSquare,
  CalendarRange,
  AlertTriangle,
  Users,
  Radio,
  BarChart3,
  Zap,
  FolderOpen,
  Award,
  Building2,
  Sparkles,
} from "lucide-react";
import { NavLink } from "@/components/G_NavLink";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

const mainNav = [
  { title: "Communities", url: "/communities", icon: Building2 },
  { title: "My Events", url: "/my-events", icon: FolderOpen },
  { title: "Past Events", url: "/past-events", icon: Award },
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Task Board", url: "/task-board", icon: KanbanSquare },
  { title: "Timeline", url: "/timeline", icon: CalendarRange },
];

const monitorNav = [
  { title: "Risk Detection", url: "/risks", icon: AlertTriangle },
  { title: "Workload", url: "/workload", icon: Users },
  { title: "Performance", url: "/performance", icon: Award },
  { title: "Live Mode", url: "/live", icon: Radio },
  { title: "Reports", url: "/reports", icon: BarChart3 },
];

const getInitials = (name) =>
  name
    ?.split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "U";

export function AppSidebar() {
  const { user, loading } = useAuth();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const renderItems = (items) => (
    <SidebarMenu>
      {items.map((item) => (
        <SidebarMenuItem key={item.title}>
          <SidebarMenuButton asChild isActive={isActive(item.url)}>
            <NavLink
              to={item.url}
              end
              className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200 hover:bg-sidebar-accent/80 ${
                collapsed ? "justify-center px-2" : ""
              }`}
              activeClassName="bg-sidebar-accent text-sidebar-primary-foreground font-semibold shadow-sm"
            >
              <item.icon className="h-4 w-4 shrink-0 transition-transform group-hover:scale-105" />
              {!collapsed && <span className="truncate text-sm">{item.title}</span>}
            </NavLink>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border/60 bg-sidebar">
      <SidebarHeader className="p-4 pb-3">
        <div
          className={`flex items-center ${collapsed ? "justify-center" : "gap-3"}`}
        >
          <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 shadow-lg shrink-0">
            <Zap className="h-4 w-4 text-white" />
            {!collapsed && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-white/90 text-[9px] text-indigo-600">
                <Sparkles className="h-2.5 w-2.5" />
              </span>
            )}
          </div>

          {!collapsed && (
            <div className="min-w-0">
              <p className="font-heading text-base font-bold text-sidebar-accent-foreground">
                EventAura
              </p>
              <p className="text-[11px] text-sidebar-foreground/60">
                Task Management
              </p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 pb-2">
        <SidebarGroup className="mb-3">
          <SidebarGroupLabel className="px-3 text-[10px] uppercase tracking-[0.2em] text-sidebar-foreground/50">
            {!collapsed && "Command Center"}
          </SidebarGroupLabel>
          <SidebarGroupContent>{renderItems(mainNav)}</SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="px-3 text-[10px] uppercase tracking-[0.2em] text-sidebar-foreground/50">
            {!collapsed && "Monitoring"}
          </SidebarGroupLabel>
          <SidebarGroupContent>{renderItems(monitorNav)}</SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3">
        {loading ? (
          collapsed ? (
            <div className="mx-auto h-10 w-10 animate-pulse rounded-xl bg-sidebar-accent/60" />
          ) : (
            <div className="rounded-2xl border border-sidebar-border/60 bg-sidebar-accent/70 p-3 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-sidebar-accent" />
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="h-3 w-3/4 animate-pulse rounded bg-sidebar-accent" />
                  <div className="h-2.5 w-full animate-pulse rounded bg-sidebar-accent/70" />
                </div>
              </div>
            </div>
          )
        ) : user ? (
          !collapsed ? (
            <div className="rounded-2xl border border-sidebar-border/60 bg-sidebar-accent/70 p-3 shadow-sm">
              <div className="flex items-start gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold text-white shrink-0"
                  style={{
                    background:
                      user.avatar && user.avatar.startsWith("#")
                        ? user.avatar
                        : "linear-gradient(135deg,#6366f1,#8b5cf6)",
                  }}
                >
                  {user.avatar && /^https?:\/\//.test(user.avatar) ? (
                    <img
                      src={user.avatar}
                      alt={user.name || "User avatar"}
                      className="h-10 w-10 rounded-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    getInitials(user.name)
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-heading font-bold text-sidebar-accent-foreground">
                    {user.name || "Unnamed user"}
                  </p>
                  <p className="truncate text-[11px] text-sidebar-foreground/55">
                    {user.email || ""}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div
              className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl border border-sidebar-border/60 bg-sidebar-accent/70"
              title={user.name || "User"}
            >
              <span className="text-xs font-bold text-sidebar-accent-foreground">
                {getInitials(user.name)}
              </span>
            </div>
          )
        ) : !collapsed ? (
          <Link
            to="/login"
            className="flex items-center justify-center rounded-2xl border border-dashed border-sidebar-border/70 bg-sidebar-accent/40 px-3 py-3 text-xs font-semibold text-sidebar-foreground/70 transition hover:bg-sidebar-accent"
          >
            Sign in
          </Link>
        ) : (
          <Link
            to="/login"
            title="Sign in"
            className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl border border-dashed border-sidebar-border/70 bg-sidebar-accent/40 text-[11px] font-semibold text-sidebar-foreground/70 transition hover:bg-sidebar-accent"
          >
            In
          </Link>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}