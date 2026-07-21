import { useEffect, useMemo, useState } from "react";
import { societies } from "@/lib/mockData";
import { useEvent } from "@/lib/EventContext";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Flame,
  TrendingUp,
  Users,
  ListTodo,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { getDashboardSummary } from "@/services/dashboardServiceg";

function ReadinessGauge({ score, label, color }) {
  const circumference = 2 * Math.PI * 70;
  const offset = circumference - (score / 100) * circumference;

  const colorMap = {
    success: "hsl(152,60%,42%)",
    warning: "hsl(36,90%,55%)",
    risk: "hsl(0,72%,55%)",
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        <svg width="180" height="180" viewBox="0 0 160 160">
          <circle
            cx="80"
            cy="80"
            r="70"
            fill="none"
            stroke="hsl(var(--border))"
            strokeWidth="10"
          />
          <circle
            cx="80"
            cy="80"
            r="70"
            fill="none"
            stroke={colorMap[color]}
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform="rotate(-90 80 80)"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-heading text-4xl font-bold text-foreground">
            {score}%
          </span>
          <span className="text-xs text-muted-foreground">Readiness</span>
        </div>
      </div>

      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold ${
          color === "success"
            ? "bg-success/10 text-success"
            : color === "warning"
            ? "bg-warning/10 text-warning"
            : "bg-risk/10 text-risk"
        }`}
      >
        {label}
      </span>
    </div>
  );
}

function CountdownTimer({ days, isPast }) {
  const [secondsLeft, setSecondsLeft] = useState(0);

  useEffect(() => {
    if (isPast) return;

    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev + 1) % 86400);
    }, 1000);

    return () => clearInterval(timer);
  }, [isPast]);

  const hours = isPast ? 0 : 23 - Math.floor((secondsLeft / 3600) % 24);
  const minutes = isPast ? 0 : 59 - Math.floor((secondsLeft / 60) % 60);
  const seconds = isPast ? 0 : 59 - (secondsLeft % 60);

  const units = [
    { label: "Days", value: isPast ? 0 : days },
    { label: "Hrs", value: hours },
    { label: "Min", value: minutes },
    { label: "Sec", value: seconds },
  ];

  return (
    <div className="flex gap-3">
      {units.map((u) => (
        <div key={u.label} className="flex flex-col items-center">
          <div className="bg-muted rounded-lg w-14 h-14 flex items-center justify-center">
            <span className="font-heading text-xl font-bold text-foreground">
              {String(u.value).padStart(2, "0")}
            </span>
          </div>
          <span className="text-[10px] text-muted-foreground mt-1">
            {u.label}
          </span>
        </div>
      ))}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, variant = "default" }) {
  const variantStyles = {
    default: "text-primary",
    success: "text-success",
    warning: "text-warning",
    risk: "text-risk",
  };

  return (
    <Card className="shadow-card hover:shadow-card-hover transition-shadow">
      <CardContent className="p-4 flex items-center gap-4">
        <div className={`p-2.5 rounded-xl bg-muted ${variantStyles[variant]}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-2xl font-heading font-bold text-foreground">
            {value}
          </p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

const PIE_COLORS = [
  "hsl(var(--muted-foreground))",
  "hsl(var(--primary))",
  "hsl(var(--warning))",
  "hsl(var(--success))",
];

function getReadinessStatus(score) {
  if (score >= 75) return { label: "Ready", color: "success" };
  if (score >= 50) return { label: "At Risk", color: "warning" };
  return { label: "Critical", color: "risk" };
}

export default function Dashboard() {
  const { selectedEventId, setSelectedEventId, userEvents, currentSociety } =
    useEvent();

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(false);

  const currentEvent =
    userEvents.find((e) => e.id === selectedEventId) ?? userEvents[0];

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!selectedEventId) {
        setDashboardData(null);
        return;
      }

      try {
        setLoading(true);
        const data = await getDashboardSummary(selectedEventId);
        setDashboardData(data);
      } catch (error) {
        console.error("Failed to load dashboard summary:", error);
        setDashboardData(null);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [selectedEventId]);

  const summary = dashboardData?.summary;
  const trendChart = dashboardData?.trendChart || [];
  const workloadDistribution = dashboardData?.workloadDistribution || [];
  const riskAlerts = dashboardData?.riskAlerts || [];
  const countdown = dashboardData?.countdown;

  const score = summary?.readinessScore || 0;
  const readinessStatus = useMemo(() => getReadinessStatus(score), [score]);

  const completedCount = summary?.completedTasks || 0;
  const inProgressCount = summary?.inProgressTasks || 0;
  const reviewCount = summary?.reviewTasks || 0;
  const todoCount = summary?.todoTasks || 0;
  const overdueCount = summary?.overdueTasks || 0;
  const totalTasks = summary?.totalTasks || 0;
  const pendingCount = totalTasks - completedCount;
  const completionPct = summary?.completionRate || 0;

  const statusDistribution = [
    { name: "To Do", value: todoCount },
    { name: "In Progress", value: inProgressCount },
    { name: "Review", value: reviewCount },
    { name: "Completed", value: completedCount },
  ].filter((item) => item.value > 0);

  const workloadData = workloadDistribution.map((m) => ({
    name: (m.name || "NA").split(" ")[0],
    tasks: m.total,
    completed: m.completed,
  }));

  const trendData = trendChart.map((item) => ({
    day: item.name,
    score: item.value,
  }));

  return (
    <div className="space-y-6 animate-slide-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">
            Mission Control
          </h1>
          <p className="text-sm text-muted-foreground">
            Monitor event readiness and execution status
          </p>
        </div>

        <Select value={selectedEventId} onValueChange={setSelectedEventId}>
          <SelectTrigger className="w-[280px] h-9 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {userEvents.map((ev) => {
              const soc = societies.find((s) => s.id === ev.societyId);
              return (
                <SelectItem key={ev.id} value={ev.id} className="text-xs">
                  {soc?.icon} {ev.name}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      {currentSociety && (
        <div className="flex items-center gap-2 bg-card rounded-lg px-4 py-2 shadow-card border border-border w-fit">
          <span className="text-lg">{currentSociety.icon}</span>
          <span className="text-xs font-semibold text-foreground">
            {currentSociety.name}
          </span>
          <span className="text-[10px] text-muted-foreground">
            • {currentEvent?.status}
          </span>
        </div>
      )}

      {loading && (
        <div className="text-sm text-muted-foreground">
          Loading dashboard...
        </div>
      )}

      {!loading && dashboardData && summary && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <Card className="lg:col-span-4 shadow-card">
              <CardContent className="p-6 flex flex-col items-center gap-4">
                <ReadinessGauge
                  score={score}
                  label={readinessStatus.label}
                  color={readinessStatus.color}
                />
                {countdown && (
                  <CountdownTimer
                    days={countdown.days}
                    isPast={countdown.isPast}
                  />
                )}
              </CardContent>
            </Card>

            <div className="lg:col-span-8 space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
                <StatCard icon={ListTodo} label="Total Tasks" value={totalTasks} />
                <StatCard
                  icon={CheckCircle2}
                  label="Completed"
                  value={`${completionPct}%`}
                  variant="success"
                />
                <StatCard icon={Clock} label="Pending" value={pendingCount} />
                <StatCard
                  icon={Flame}
                  label="Overdue"
                  value={overdueCount}
                  variant="risk"
                />
                <StatCard
                  icon={TrendingUp}
                  label="In Progress"
                  value={inProgressCount}
                  variant="warning"
                />
                <StatCard
                  icon={Users}
                  label="Team Members"
                  value={workloadDistribution.length}
                />
              </div>

              <Card className="shadow-card">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-muted-foreground">
                      Overall Completion
                    </span>
                    <span className="text-xs font-heading font-bold text-foreground">
                      {completionPct}%
                    </span>
                  </div>
                  <Progress value={completionPct} className="h-2.5" />
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <Card className="lg:col-span-3 shadow-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-heading">
                  Task Status
                </CardTitle>
              </CardHeader>
              <CardContent className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {statusDistribution.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>

                <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 -mt-2">
                  {statusDistribution.map((s, i) => (
                    <span
                      key={s.name}
                      className="flex items-center gap-1 text-[10px] text-muted-foreground"
                    >
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: PIE_COLORS[i] }}
                      />{" "}
                      {s.name}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-4 shadow-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-heading">
                  Readiness Trend
                </CardTitle>
              </CardHeader>
              <CardContent className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData}>
                    <defs>
                      <linearGradient
                        id="gradientArea"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="hsl(235,65%,52%)"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="100%"
                          stopColor="hsl(235,65%,52%)"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="hsl(var(--border))"
                    />
                    <XAxis
                      dataKey="day"
                      tick={{ fontSize: 11 }}
                      stroke="hsl(var(--muted-foreground))"
                    />
                    <YAxis
                      tick={{ fontSize: 11 }}
                      stroke="hsl(var(--muted-foreground))"
                    />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="score"
                      stroke="hsl(235,65%,52%)"
                      fill="url(#gradientArea)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="lg:col-span-5 shadow-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-heading">
                  Team Workload
                </CardTitle>
              </CardHeader>
              <CardContent className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={workloadData} barGap={2}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="hsl(var(--border))"
                    />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 10 }}
                      stroke="hsl(var(--muted-foreground))"
                    />
                    <YAxis
                      tick={{ fontSize: 11 }}
                      stroke="hsl(var(--muted-foreground))"
                    />
                    <Tooltip />
                    <Bar
                      dataKey="tasks"
                      fill="hsl(235,65%,52%)"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="completed"
                      fill="hsl(152,60%,42%)"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="shadow-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-heading flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-risk" /> Risk Alerts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 max-h-[260px] overflow-y-auto">
                {riskAlerts.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle2 className="h-8 w-8 text-success mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      No active risk alerts
                    </p>
                  </div>
                ) : (
                  riskAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`p-3 rounded-lg border-l-4 ${
                        alert.severity === "high"
                          ? "border-l-risk bg-risk/5"
                          : alert.severity === "medium"
                          ? "border-l-warning bg-warning/5"
                          : "border-l-muted bg-muted/50"
                      }`}
                    >
                      <p className="text-xs font-semibold text-foreground">
                        {alert.title}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {alert.description}
                      </p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-heading flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" /> Workload Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 max-h-[260px] overflow-y-auto">
                {workloadDistribution.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      No team members assigned yet
                    </p>
                  </div>
                ) : (
                  workloadDistribution.map((member) => (
                    <div
                      key={member.id}
                      className="p-3 rounded-lg bg-muted/30 border border-border"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-foreground">
                            {member.name}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {member.role}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-semibold text-foreground">
                            {member.completed}/{member.total}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            completed
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {!loading && !dashboardData && (
        <div className="text-center py-16">
          <p className="text-lg text-muted-foreground">
            No dashboard data available for this event.
          </p>
        </div>
      )}
    </div>
  );
}