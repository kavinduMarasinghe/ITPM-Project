import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { Layout } from "@/components/G_Layout";
import { EventProvider } from "@/lib/EventContext";
import ProtectedRoute from "@/components/G_ProtectedRoute";

import Login from "@/pages/G_Login";
import Register from "@/pages/G_Register";
import Communities from "@/pages/G_Communities";
import UpdateSociety from "@/pages/G_UpdateSociety";
import MyEvents from "@/pages/G_MyEvents";
import Dashboard from "@/pages/G_Dashboard";
import TaskWorkspace from "@/pages/G_TaskWorkspace";
import Timeline from "@/pages/G_Timeline";
import RiskPanel from "@/pages/G_RiskPanel";
import Workload from "@/pages/G_Workload";
import LiveMode from "@/pages/G_LiveMode";
import Report from "@/pages/G_Report";
import Performance from "@/pages/G_Performance";
import PastEvents from "@/pages/G_PastEvents";
import PastEventDetail from "@/pages/G_PastEventDetail";
import NotFound from "@/pages/G_NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />

      <BrowserRouter>
        <EventProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route path="/" element={<Communities />} />
              <Route path="/update-society/:id" element={<UpdateSociety />} />
              <Route path="/events" element={<MyEvents />} />
              <Route path="/past-events" element={<PastEvents />} />
              <Route path="/past-events/:eventId" element={<PastEventDetail />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/tasks" element={<TaskWorkspace />} />
              <Route path="/timeline" element={<Timeline />} />
              <Route path="/risks" element={<RiskPanel />} />
              <Route path="/workload" element={<Workload />} />
              <Route path="/live" element={<LiveMode />} />
              <Route path="/reports" element={<Report />} />
              <Route path="/performance" element={<Performance />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </EventProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;