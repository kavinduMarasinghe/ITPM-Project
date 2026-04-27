import { useEffect, useState } from "react";
import { useEvent } from "@/lib/EventContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Download,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Users,
  BarChart3,
  TrendingUp,
  Zap,
  ShieldAlert,
  Trophy,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  PieChart as PieChartIcon,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { getEventReport } from "@/services/reportServiceg";

function CircularScore({ score, label, color, size = 180 }) {
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const colorMap = {
    success: "hsl(152, 60%, 42%)",
    warning: "hsl(36, 90%, 55%)",
    risk: "hsl(0, 72%, 55%)",
  };

  const labelClassMap = {
    success: "text-success",
    warning: "text-warning",
    risk: "text-risk",
  };

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={colorMap[color] || colorMap.warning}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
        />
      </svg>

      <div className="absolute flex flex-col items-center">
        <span className="text-4xl font-heading font-bold text-foreground">
          {score}%
        </span>
        <span
          className={`text-xs font-semibold ${
            labelClassMap[color] || "text-warning"
          }`}
        >
          {label}
        </span>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  subtitle,
  trend,
  accentClass,
}) {
  const TrendIcon =
    trend === "up" ? ArrowUpRight : trend === "down" ? ArrowDownRight : Minus;

  const trendColor =
    trend === "up"
      ? "text-success"
      : trend === "down"
      ? "text-risk"
      : "text-muted-foreground";

  return (
    <Card className="shadow-card hover:shadow-card-hover transition-all group">
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className={`p-2.5 rounded-xl ${accentClass}`}>
            <Icon className="h-4.5 w-4.5" />
          </div>
          {trend && <TrendIcon className={`h-4 w-4 ${trendColor}`} />}
        </div>

        <p className="text-2xl font-heading font-bold text-foreground">
          {value}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">{label}</p>

        {subtitle && (
          <p className="text-[10px] text-muted-foreground mt-1">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  );
}

function MemberPerformanceCard({ member, rank }) {
  const isTop = rank <= 3;
  const medals = ["🥇", "🥈", "🥉"];

  return (
    <Card
      className={`shadow-card hover:shadow-card-hover transition-all ${
        isTop ? "ring-1 ring-primary/20" : ""
      }`}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="relative">
            <div
              className="h-10 w-10 rounded-full flex items-center justify-center text-xs font-bold text-primary-foreground"
              style={{ backgroundColor: member.avatar || "#64748b" }}
            >
              {(member.name || "NA")
                .split(" ")
                .filter(Boolean)
                .map((n) => n[0])
                .join("")}
            </div>

            {isTop && (
              <span className="absolute -top-1 -right-1 text-sm">
                {medals[rank - 1]}
              </span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">
              {member.name}
            </p>
            <p className="text-[11px] text-muted-foreground">{member.role}</p>
          </div>

          <div className="text-right">
            <p className="text-lg font-heading font-bold text-foreground">
              {member.rate}%
            </p>
            <p className="text-[10px] text-muted-foreground">completion</p>
          </div>
        </div>

        <Progress value={member.rate} className="h-1.5 mb-3" />

        <div className="grid grid-cols-3 gap-2">
          <div className="text-center p-2 rounded-lg bg-muted/40">
            <p className="text-sm font-heading font-bold text-foreground">
              {member.total}
            </p>
            <p className="text-[10px] text-muted-foreground">Assigned</p>
          </div>

          <div className="text-center p-2 rounded-lg bg-success/5">
            <p className="text-sm font-heading font-bold text-success">
              {member.done}
            </p>
            <p className="text-[10px] text-muted-foreground">Completed</p>
          </div>

          <div className="text-center p-2 rounded-lg bg-risk/5">
            <p className="text-sm font-heading font-bold text-risk">
              {member.overdue}
            </p>
            <p className="text-[10px] text-muted-foreground">Overdue</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Report() {
  const { selectedEventId } = useEvent();
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadReportData = async () => {
      if (!selectedEventId) {
        setReportData(null);
        return;
      }

      try {
        setLoading(true);
        const data = await getEventReport(selectedEventId);
        setReportData(data);
      } catch (error) {
        console.error("Failed to load event report:", error);
        setReportData(null);
      } finally {
        setLoading(false);
      }
    };

    loadReportData();
  }, [selectedEventId]);

  const event = reportData?.event;
  const society = reportData?.society;
  const analytics = reportData?.analytics;
  const riskAlerts = reportData?.riskAlerts || [];
  const readinessScore = reportData?.readinessScore || 0;
  const readinessStatus = reportData?.readinessStatus || {
    label: "Unknown",
    color: "warning",
  };

  return (
    <div className="space-y-8 animate-slide-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">
            Performance Report
          </h1>
          <p className="text-sm text-muted-foreground">
            {event?.name || "No event selected"} • {society?.name || ""}
          </p>
        </div>

        <Button
          className="gradient-primary text-primary-foreground gap-2"
          onClick={() => window.print()}
        >
          <Download className="h-4 w-4" />
          Export Report
        </Button>
      </div>

      {loading && (
        <div className="text-sm text-muted-foreground">Loading report...</div>
      )}

      {!loading && reportData && analytics && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1 shadow-card hover:shadow-card-hover transition-all">
              <CardContent className="p-6 flex flex-col items-center justify-center gap-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Event Readiness
                </p>

                <CircularScore
                  score={readinessScore}
                  label={readinessStatus.label}
                  color={readinessStatus.color}
                  size={180}
                />

                <div className="flex gap-2 flex-wrap justify-center">
                  <Badge
                    variant="outline"
                    className="text-[10px] px-2 py-0.5 bg-success/5 text-success border-success/20"
                  >
                    {analytics.critical > 0
                      ? Math.round(
                          (analytics.criticalDone / analytics.critical) * 100
                        )
                      : 0}
                    % Critical Done
                  </Badge>

                  <Badge
                    variant="outline"
                    className="text-[10px] px-2 py-0.5 bg-primary/5 text-primary border-primary/20"
                  >
                    {analytics.avgProgress}% Avg Progress
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-2 gap-4">
              <StatCard
                icon={BarChart3}
                label="Total Tasks"
                value={analytics.total}
                subtitle={`${analytics.highPriority} high priority`}
                trend="neutral"
                accentClass="bg-primary/10 text-primary"
              />

              <StatCard
                icon={CheckCircle2}
                label="Completion Rate"
                value={`${analytics.completionRate}%`}
                subtitle={`${analytics.completed} of ${analytics.total} tasks`}
                trend={analytics.completionRate >= 50 ? "up" : "down"}
                accentClass="bg-success/10 text-success"
              />

              <StatCard
                icon={Clock}
                label="Overdue Tasks"
                value={analytics.overdue}
                subtitle={
                  analytics.overdue === 0 ? "All on schedule!" : "Needs attention"
                }
                trend={analytics.overdue === 0 ? "up" : "down"}
                accentClass="bg-warning/10 text-warning"
              />

              <StatCard
                icon={ShieldAlert}
                label="Risk Incidents"
                value={riskAlerts.length}
                subtitle={`${analytics.blocked} blocked tasks`}
                trend={riskAlerts.length === 0 ? "up" : "down"}
                accentClass="bg-risk/10 text-risk"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="shadow-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-heading flex items-center gap-2">
                  <PieChartIcon className="h-4 w-4 text-primary" />
                  Task Phase Distribution
                </CardTitle>
              </CardHeader>

              <CardContent>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analytics.phaseData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={80}
                        paddingAngle={3}
                        dataKey="value"
                        stroke="none"
                      >
                        {analytics.phaseData.map((entry, i) => (
                          <Cell key={i} fill={entry.fill} />
                        ))}
                      </Pie>

                      <Tooltip
                        contentStyle={{
                          background: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                          fontSize: "12px",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="flex flex-wrap gap-3 justify-center mt-2">
                  {analytics.phaseData.map((d) => (
                    <div
                      key={d.name}
                      className="flex items-center gap-1.5 text-[11px] text-muted-foreground"
                    >
                      <div
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: d.fill }}
                      />
                      {d.name} ({d.value})
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-heading flex items-center gap-2">
                  <Zap className="h-4 w-4 text-warning" />
                  Priority Breakdown
                </CardTitle>
              </CardHeader>

              <CardContent>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analytics.priorityData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={80}
                        paddingAngle={3}
                        dataKey="value"
                        stroke="none"
                      >
                        {analytics.priorityData.map((entry, i) => (
                          <Cell key={i} fill={entry.fill} />
                        ))}
                      </Pie>

                      <Tooltip
                        contentStyle={{
                          background: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                          fontSize: "12px",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="flex flex-wrap gap-3 justify-center mt-2">
                  {analytics.priorityData.map((d) => (
                    <div
                      key={d.name}
                      className="flex items-center gap-1.5 text-[11px] text-muted-foreground"
                    >
                      <div
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: d.fill }}
                      />
                      {d.name} ({d.value})
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-heading flex items-center gap-2">
                  <Users className="h-4 w-4 text-accent" />
                  Task Distribution
                </CardTitle>
              </CardHeader>

              <CardContent>
                <div className="h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.memberBarData} barGap={2}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="hsl(var(--border))"
                      />
                      <XAxis
                        dataKey="name"
                        tick={{
                          fontSize: 11,
                          fill: "hsl(var(--muted-foreground))",
                        }}
                      />
                      <YAxis
                        tick={{
                          fontSize: 11,
                          fill: "hsl(var(--muted-foreground))",
                        }}
                      />
                      <Tooltip
                        contentStyle={{
                          background: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                          fontSize: "12px",
                        }}
                      />
                      <Bar
                        dataKey="completed"
                        stackId="a"
                        fill="hsl(152, 60%, 42%)"
                        name="Completed"
                      />
                      <Bar
                        dataKey="pending"
                        stackId="a"
                        fill="hsl(235, 65%, 52%)"
                        radius={[4, 4, 0, 0]}
                        name="Pending"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-heading flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                Execution Pipeline
              </CardTitle>
            </CardHeader>

            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  {
                    key: "todo",
                    label: "To Do",
                    color: "hsl(220, 10%, 46%)",
                    count: analytics.todo,
                  },
                  {
                    key: "in-progress",
                    label: "In Progress",
                    color: "hsl(235, 65%, 52%)",
                    count: analytics.inProgress,
                  },
                  {
                    key: "review",
                    label: "Review",
                    color: "hsl(36, 90%, 55%)",
                    count: analytics.review,
                  },
                  {
                    key: "completed",
                    label: "Completed",
                    color: "hsl(152, 60%, 42%)",
                    count: analytics.completed,
                  },
                ].map((phase) => {
                  const pct =
                    analytics.total > 0
                      ? Math.round((phase.count / analytics.total) * 100)
                      : 0;

                  return (
                    <div
                      key={phase.key}
                      className="relative p-4 rounded-xl bg-muted/30 border border-border overflow-hidden group hover:border-primary/20 transition-all"
                    >
                      <div
                        className="absolute bottom-0 left-0 h-1 transition-all duration-500"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: phase.color,
                        }}
                      />

                      <div className="flex items-center gap-2 mb-2">
                        <div
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: phase.color }}
                        />
                        <span className="text-xs font-semibold text-muted-foreground">
                          {phase.label}
                        </span>
                      </div>

                      <p className="text-2xl font-heading font-bold text-foreground">
                        {phase.count}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {pct}% of total
                      </p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {riskAlerts.length > 0 && (
            <Card className="shadow-card border-risk/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-heading flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-risk" />
                  Risk Incidents
                </CardTitle>
              </CardHeader>

              <CardContent>
                <div className="space-y-3">
                  {riskAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="flex items-start gap-3 p-3 rounded-xl bg-muted/30 border border-border hover:border-risk/20 transition-all"
                    >
                      <div
                        className={`p-1.5 rounded-lg shrink-0 ${
                          alert.severity === "high"
                            ? "bg-risk/10 text-risk"
                            : alert.severity === "medium"
                            ? "bg-warning/10 text-warning"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        <ShieldAlert className="h-4 w-4" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="text-sm font-semibold text-foreground">
                            {alert.title}
                          </p>
                          <Badge
                            variant="outline"
                            className={`text-[10px] px-1.5 py-0 ${
                              alert.severity === "high"
                                ? "bg-risk/10 text-risk border-risk/20"
                                : alert.severity === "medium"
                                ? "bg-warning/10 text-warning border-warning/20"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {alert.severity}
                          </Badge>
                        </div>

                        <p className="text-xs text-muted-foreground">
                          {alert.description}
                        </p>
                      </div>

                      <span className="text-[10px] text-muted-foreground shrink-0">
                        {new Date(alert.timestamp).toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                          hour12: true,
                        })}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <div>
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-heading font-bold text-foreground">
                Team Performance
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {analytics.memberStats.map((member, i) => (
                <MemberPerformanceCard
                  key={member.id}
                  member={member}
                  rank={i + 1}
                />
              ))}
            </div>
          </div>
        </>
      )}

      {!loading && !reportData && (
        <div className="text-center py-16">
          <p className="text-lg text-muted-foreground">
            No report data available for this event.
          </p>
        </div>
      )}
    </div>
  );
}