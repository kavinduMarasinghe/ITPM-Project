import { SidebarProvider, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/G_AppSidebar";
import { NotificationDropdown } from "@/components/G_NotificationDropdown";
import { EventChat } from "@/components/G_EventChat";
import { useEvent } from "@/lib/EventContext";
import { useLocation, Outlet } from "react-router-dom";

function LayoutContent() {
  const { currentEvent, currentSociety, hasEventAccess } = useEvent();
  const { open } = useSidebar();
  const location = useLocation();

  const isLandingPage =
    location.pathname === "/" || location.pathname === "/events";

  const currentEventId = currentEvent?._id || currentEvent?.id || "";

  const headerTitle = isLandingPage
    ? "EventAura"
    : currentEvent?.name || "EventAura";

  const headerSub = isLandingPage ? undefined : currentSociety?.name;

  const showChat =
    !isLandingPage &&
    currentEvent &&
    currentEventId &&
    hasEventAccess(currentEventId);

  return (
    <>
      <div className="min-h-screen w-full bg-background">
        <AppSidebar />

        <div
          className={`flex min-h-screen min-w-0 flex-1 flex-col transition-all duration-300 ${
            open ? "md:ml-64" : "md:ml-20"
          }`}
        >
          <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-card/80 px-4 backdrop-blur-md md:px-6">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="rounded-xl border border-border bg-background hover:bg-muted" />
            </div>

            <div className="flex min-w-0 flex-1 items-center gap-3">
              {headerSub && (
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-xl text-sm shrink-0 shadow-sm"
                  style={{
                    backgroundColor: `${currentSociety?.color || "#6366f1"}20`,
                  }}
                >
                  {currentSociety?.icon || "📋"}
                </div>
              )}

              <div className="min-w-0">
                <h2 className="truncate font-heading text-sm font-semibold text-foreground md:text-base">
                  {headerTitle}
                </h2>
                {headerSub && (
                  <p className="truncate text-[11px] text-muted-foreground">
                    {headerSub}
                  </p>
                )}
              </div>
            </div>

            <NotificationDropdown />
          </header>

          <main className="flex-1 overflow-auto p-4 md:p-6">
            <div className="mx-auto w-full">
              <Outlet />
            </div>
          </main>
        </div>
      </div>

      {showChat && <EventChat />}
    </>
  );
}

export function Layout() {
  return (
    <SidebarProvider>
      <LayoutContent />
    </SidebarProvider>
  );
}