import { useEffect, useState } from "react";
import { useEvent } from "@/lib/EventContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Clock, Link2, Users, ShieldAlert } from "lucide-react";
import { getRiskSummary } from "@/services/riskServiceg";

const riskThemeMap = {
  High: {
    border: "border-l-risk",
    bg: "bg-risk/10",
    text: "text-risk",
    softCard: "bg-risk/5 border-risk/20",
    badge: "bg-risk/10 text-risk",
  },
  Medium: {
    border: "border-l-warning",
    bg: "bg-warning/10",
    text: "text-warning",
    softCard: "bg-warning/5 border-warning/20",
    badge: "bg-warning/10 text-warning",
  },
  Low: {
    border: "border-l-success",
    bg: "bg-success/10",
    text: "text-success",
    softCard: "bg-success/5 border-success/20",
    badge: "bg-success/10 text-success",
  },
};

function EmptyState({ text }) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-muted/20 px-4 py-6 text-center">
      <p className="text-xs text-muted-foreground">{text}</p>
    </div>
  );
}

export default function RiskPanel() {
  const { selectedEventId } = useEvent();
  const [riskData, setRiskData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadRiskData = async () => {
      if (!selectedEventId) {
        setRiskData(null);
        return;
      }

      try {
        setLoading(true);
        const data = await getRiskSummary(selectedEventId);
        setRiskData(data);
      } catch (error) {
        console.error("Failed to load risk summary:", error);
        setRiskData(null);
      } finally {
        setLoading(false);
      }
    };

    loadRiskData();
  }, [selectedEventId]);

  const riskLevel = riskData?.riskLevel || "Low";
  const theme = riskThemeMap[riskLevel] || riskThemeMap.Low;

  const overdueCritical = riskData?.overdueCritical || [];
  const blockedTasks = riskData?.blockedTasks || [];
  const overloaded = riskData?.overloadedMembers || [];
  const alerts = riskData?.alerts || [];

  const totalSignals =
    overdueCritical.length + blockedTasks.length + overloaded.length;

  return (
    <div className="space-y-6 animate-slide-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">
            Risk Detection
          </h1>
          <p className="text-sm text-muted-foreground">
            Proactive risk monitoring and alert system
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 shadow-card">
          <AlertTriangle className={`h-4 w-4 ${theme.text}`} />
          <span className="text-xs font-semibold text-foreground">
            {totalSignals} active risk signals
          </span>
        </div>
      </div>

      {loading && (
        <div className="text-sm text-muted-foreground">
          Loading risk data...
        </div>
      )}

      {!loading && (
        <>
          <Card className={`shadow-card border-l-4 ${theme.border}`}>
            <CardContent className="p-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-2xl ${theme.bg}`}>
                  <ShieldAlert className={`h-8 w-8 ${theme.text}`} />
                </div>

                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">
                    Execution Risk Level
                  </p>
                  <p className={`text-3xl font-heading font-bold ${theme.text}`}>
                    {riskLevel}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 md:min-w-[320px]">
                <div className="rounded-xl bg-muted/30 border border-border p-3 text-center">
                  <p className="text-lg font-heading font-bold text-foreground">
                    {overdueCritical.length}
                  </p>
                  <p className="text-[10px] text-muted-foreground">Critical</p>
                </div>
                <div className="rounded-xl bg-muted/30 border border-border p-3 text-center">
                  <p className="text-lg font-heading font-bold text-foreground">
                    {blockedTasks.length}
                  </p>
                  <p className="text-[10px] text-muted-foreground">Blocked</p>
                </div>
                <div className="rounded-xl bg-muted/30 border border-border p-3 text-center">
                  <p className="text-lg font-heading font-bold text-foreground">
                    {overloaded.length}
                  </p>
                  <p className="text-[10px] text-muted-foreground">Overloaded</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="shadow-card hover:shadow-card-hover transition-all">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-heading flex items-center gap-2">
                  <Clock className="h-4 w-4 text-risk" />
                  Overdue Critical ({overdueCritical.length})
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-2">
                {overdueCritical.length === 0 ? (
                  <EmptyState text="No overdue critical tasks" />
                ) : (
                  overdueCritical.map((t) => (
                    <div
                      key={t.id}
                      className="p-3 rounded-xl bg-risk/5 border border-risk/20"
                    >
                      <p className="text-sm font-semibold text-foreground">
                        {t.title || "Untitled Task"}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-1">
                        {t.assignee?.name || "Unassigned"}
                      </p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card className="shadow-card hover:shadow-card-hover transition-all">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-heading flex items-center gap-2">
                  <Link2 className="h-4 w-4 text-warning" />
                  Blocked Tasks ({blockedTasks.length})
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-2">
                {blockedTasks.length === 0 ? (
                  <EmptyState text="No blocked tasks" />
                ) : (
                  blockedTasks.map((t) => (
                    <div
                      key={t.id}
                      className="p-3 rounded-xl bg-warning/5 border border-warning/20"
                    >
                      <p className="text-sm font-semibold text-foreground">
                        {t.title || "Untitled Task"}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-1">
                        {t.blockedBy || "No reason"}
                      </p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card className="shadow-card hover:shadow-card-hover transition-all">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-heading flex items-center gap-2">
                  <Users className="h-4 w-4 text-warning" />
                  Overloaded Members ({overloaded.length})
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-2">
                {overloaded.length === 0 ? (
                  <EmptyState text="No overloaded members" />
                ) : (
                  overloaded.map((m) => (
                    <div
                      key={m.id}
                      className="p-3 rounded-xl bg-warning/5 border border-warning/20"
                    >
                      <p className="text-sm font-semibold text-foreground">
                        {m.name || "Unknown"}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-1">
                        {m.taskCount} tasks assigned
                      </p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-heading flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-risk" />
                Alert Feed
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-3">
              {alerts.length === 0 ? (
                <EmptyState text="No active alerts right now." />
              ) : (
                alerts.map((alert) => {
                  const isHigh = alert.severity === "high";

                  return (
                    <div
                      key={alert.id}
                      className={`p-4 rounded-xl border-l-4 ${
                        isHigh
                          ? "border-l-risk bg-risk/5"
                          : "border-l-warning bg-warning/5"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3 flex-wrap">
                        <p className="text-sm font-semibold text-foreground">
                          {alert.title || "Untitled"}
                        </p>

                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                            isHigh
                              ? "bg-risk/10 text-risk"
                              : "bg-warning/10 text-warning"
                          }`}
                        >
                          {alert.severity || "unknown"}
                        </span>
                      </div>

                      <p className="text-xs text-muted-foreground mt-1.5">
                        {alert.description || "No description"}
                      </p>

                      <p className="text-[10px] text-muted-foreground/60 mt-2">
                        {new Date(alert.timestamp).toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                          hour12: true,
                        })}
                      </p>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}