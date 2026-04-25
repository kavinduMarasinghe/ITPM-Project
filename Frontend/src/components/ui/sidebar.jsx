import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { PanelLeft } from "lucide-react";

import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/* ================= CONTEXT ================= */

const SidebarContext = React.createContext(null);

function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within SidebarProvider");
  }
  return context;
}

/* ================= PROVIDER ================= */

const SidebarProvider = ({ defaultOpen = true, children }) => {
  const isMobile = useIsMobile();
  const [open, setOpen] = React.useState(defaultOpen);
  const [openMobile, setOpenMobile] = React.useState(false);

  const toggleSidebar = () => {
    if (isMobile) {
      setOpenMobile((prev) => !prev);
    } else {
      setOpen((prev) => !prev);
    }
  };

  const state = open ? "expanded" : "collapsed";

  const value = React.useMemo(
    () => ({
      state,
      open,
      setOpen,
      openMobile,
      setOpenMobile,
      isMobile,
      toggleSidebar,
    }),
    [state, open, openMobile, isMobile]
  );

  return (
    <SidebarContext.Provider value={value}>
      <TooltipProvider delayDuration={0}>
        <div className="flex min-h-screen w-full">{children}</div>
      </TooltipProvider>
    </SidebarContext.Provider>
  );
};

/* ================= SIDEBAR ================= */

const Sidebar = ({ children, className, collapsible, ...props }) => {
  const { isMobile, open, openMobile, setOpenMobile } = useSidebar();

  if (isMobile) {
    return (
      <Sheet open={openMobile} onOpenChange={setOpenMobile}>
        <SheetContent
          side="left"
          className={cn("w-72 bg-sidebar p-0 text-sidebar-foreground", className)}
        >
          <div className="flex h-full w-full flex-col">{children}</div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <aside
      data-state={open ? "expanded" : "collapsed"}
      data-collapsible={collapsible || ""}
      className={cn(
        "hidden fixed left-0 top-0 z-40 h-screen border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-all duration-300 md:flex md:flex-col",
        open ? "w-64" : "w-20",
        className
      )}
      {...props}
    >
      {children}
    </aside>
  );
};

/* ================= TRIGGER ================= */

const SidebarTrigger = React.forwardRef(({ className, ...props }, ref) => {
  const { toggleSidebar } = useSidebar();

  return (
    <Button
      ref={ref}
      type="button"
      variant="ghost"
      size="icon"
      className={cn("shrink-0", className)}
      onClick={toggleSidebar}
      {...props}
    >
      <PanelLeft className="h-4 w-4" />
    </Button>
  );
});

SidebarTrigger.displayName = "SidebarTrigger";

/* ================= BASIC SECTIONS ================= */

const SidebarHeader = ({ children, className, ...props }) => (
  <div
    className={cn("border-b border-sidebar-border p-4", className)}
    {...props}
  >
    {children}
  </div>
);

const SidebarFooter = ({ children, className, ...props }) => (
  <div
    className={cn("mt-auto border-t border-sidebar-border p-4", className)}
    {...props}
  >
    {children}
  </div>
);

const SidebarContent = ({ children, className, ...props }) => (
  <div
    className={cn("flex-1 overflow-y-auto p-2", className)}
    {...props}
  >
    {children}
  </div>
);

/* ================= GROUP ================= */

const SidebarGroup = ({ children, className, ...props }) => (
  <div className={cn("space-y-1", className)} {...props}>
    {children}
  </div>
);

const SidebarGroupLabel = ({ children, className, ...props }) => (
  <div
    className={cn(
      "px-2 py-1 text-xs font-medium text-sidebar-foreground/60",
      className
    )}
    {...props}
  >
    {children}
  </div>
);

const SidebarGroupContent = ({ children, className, ...props }) => (
  <div className={cn("space-y-1", className)} {...props}>
    {children}
  </div>
);

/* ================= MENU ================= */

const SidebarMenu = ({ children, className, ...props }) => (
  <ul className={cn("space-y-1", className)} {...props}>
    {children}
  </ul>
);

const SidebarMenuItem = ({ children, className, ...props }) => (
  <li className={cn("", className)} {...props}>
    {children}
  </li>
);

const SidebarMenuButton = React.forwardRef(
  (
    { children, asChild = false, isActive = false, className, ...props },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";

    const content = (
      <Comp
        ref={ref}
        className={cn(
          "flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition outline-none",
          isActive
            ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold"
            : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
          className
        )}
        {...props}
      >
        {children}
      </Comp>
    );

    if (asChild) {
      return content;
    }

    return (
      <Tooltip>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent side="right">Menu item</TooltipContent>
      </Tooltip>
    );
  }
);

SidebarMenuButton.displayName = "SidebarMenuButton";

/* ================= EXPORT ================= */

export {
  Sidebar,
  SidebarProvider,
  SidebarTrigger,
  SidebarHeader,
  SidebarFooter,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
};