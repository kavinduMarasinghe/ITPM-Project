import { useEffect, useState } from "react";
import { useEvent } from "@/lib/EventContext";
import { societies } from "@/lib/mockData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trophy, TrendingUp, AlertTriangle, Star, Target } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import { getPerformanceSummary } from "@/services/performanceServiceg";

export default function G_Performance() {
  const { selectedEventId, setSelectedEventId, userEvents } = useEvent();
  const [performanceData, setPerformanceData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadPerformanceData = async () => {
      if (!selectedEventId) {
        setPerformanceData(null);
        return;
      }

      try {
        setLoading(true);
        const data = await getPerformanceSummary(selectedEventId);
        setPerformanceData(data);
      } catch (error) {
        console.error("Failed to load performance summary:", error);
        setPerformanceData(null);
      } finally {
        setLoading(false);
      }
    };

    loadPerformanceData();
  }, [selectedEventId]);

  const memberStats = performanceData?.memberStats || [];
  const chartData = performanceData?.chartData || [];
  const topPerformer = performanceData?.topPerformer || null;
  const radarData = performanceData?.radarData || [];

  const getPerformanceColor = (score) => {
    if (score >= 75) return "text-success";
    if (score >= 50) return "text-warning";
    return "text-risk";
  };

  const getPerformanceBadge = (score) => {
    if (score >= 75) {
      return {
        label: "Excellent",
        class: "bg-success/10 text-success border-success/20",
      };
    }
    if (score >= 50) {
      return {
        label: "Good",
        class: "bg-warning/10 text-warning border-warning/20",
      };
    }
    return {
      label: "Needs Attention",
      class: "bg-risk/10 text-risk border-risk/20",
    };
  };

  const getSocietyIcon = (societyId) => {
    const resolvedSocietyId =
      typeof societyId === "string"
        ? societyId
        : societyId && typeof societyId === "object" && "id" in societyId
        ? String(societyId.id || "")
        : "";

    return societies.find((s) => s.id === resolvedSocietyId)?.icon || "";
  };

  return (
    <div className="space-y-6 animate-slide-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">
            Member Performance
          </h1>
          <p className="text-sm text-muted-foreground">
            Analytics and contribution tracking per member
          </p>
        </div>

        <Select value={selectedEventId} onValueChange={setSelectedEventId}>
          <SelectTrigger className="w-[260px] h-9 text-xs">
            <SelectValue placeholder="Select event" />
          </SelectTrigger>
          <SelectContent>
            {userEvents.map((ev) => (
              <SelectItem key={ev.id} value={ev.id} className="text-xs">
                {getSocietyIcon(ev.societyId)} {ev.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading && (
        <div className="text-sm text-muted-foreground">
          Loading performance data...
        </div>
      )}

      {topPerformer && topPerformer.total > 0 && (
        <Card className="shadow-card border-l-4 border-l-warning overflow-hidden">
          <CardContent className="p-5 flex items-center gap-5">
            <div className="h-14 w-14 rounded-2xl gradient-primary flex items-center justify-center shrink-0">
              <Trophy className="h-7 w-7 text-primary-foreground" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
                Top Performer
              </p>
              <p className="text-lg font-heading font-bold text-foreground">
                {topPerformer.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {topPerformer.completed}/{topPerformer.total} tasks completed •
                Score: {topPerformer.performanceScore}%
              </p>
            </div>
            <div className="ml-auto">
              <Star className="h-8 w-8 text-warning fill-warning" />
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Card className="lg:col-span-7 shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-heading flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" /> Task Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} barGap={2}>
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
                  dataKey="completed"
                  fill="hsl(152, 60%, 42%)"
                  radius={[4, 4, 0, 0]}
                  name="Completed"
                />
                <Bar
                  dataKey="pending"
                  fill="hsl(235, 65%, 52%)"
                  radius={[4, 4, 0, 0]}
                  name="Pending"
                />
                <Bar
                  dataKey="overdue"
                  fill="hsl(0, 72%, 55%)"
                  radius={[4, 4, 0, 0]}
                  name="Overdue"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {topPerformer && radarData.length > 0 && (
          <Card className="lg:col-span-5 shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-heading">
                Top Performer Radar
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis
                    dataKey="metric"
                    tick={{
                      fontSize: 10,
                      fill: "hsl(var(--muted-foreground))",
                    }}
                  />
                  <PolarRadiusAxis tick={{ fontSize: 9 }} domain={[0, 100]} />
                  <Radar
                    dataKey="value"
                    stroke="hsl(235, 65%, 52%)"
                    fill="hsl(235, 65%, 52%)"
                    fillOpacity={0.2}
                    strokeWidth={2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {memberStats.map((member, index) => {
          const badge = getPerformanceBadge(member.performanceScore);

          return (
            <Card
              key={member.id}
              className="shadow-card hover:shadow-card-hover transition-all"
            >
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="relative">
                    <div
                      className="h-11 w-11 rounded-full flex items-center justify-center text-sm font-bold text-primary-foreground"
                      style={{ backgroundColor: member.avatar || "#64748b" }}
                    >
                      {(member.name || "NA")
                        .split(" ")
                        .filter(Boolean)
                        .map((n) => n[0])
                        .join("")}
                    </div>

                    {index === 0 && member.total > 0 && (
                      <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-warning flex items-center justify-center">
                        <Trophy className="h-3 w-3 text-warning-foreground" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">
                      {member.name}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {member.role}
                    </p>
                  </div>

                  <Badge variant="outline" className={`text-[9px] ${badge.class}`}>
                    {badge.label}
                  </Badge>
                </div>

                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-muted-foreground">
                      Performance Score
                    </span>
                    <span
                      className={`text-sm font-heading font-bold ${getPerformanceColor(
                        member.performanceScore
                      )}`}
                    >
                      {member.performanceScore}%
                    </span>
                  </div>
                  <Progress value={member.performanceScore} className="h-2" />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center p-2 rounded-lg bg-muted/50">
                    <p className="text-xs font-heading font-bold text-foreground">
                      {member.completed}
                    </p>
                    <p className="text-[9px] text-muted-foreground">Done</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-muted/50">
                    <p className="text-xs font-heading font-bold text-foreground">
                      {member.total - member.completed}
                    </p>
                    <p className="text-[9px] text-muted-foreground">Pending</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-muted/50">
                    <p
                      className={`text-xs font-heading font-bold ${
                        member.overdue > 0 ? "text-risk" : "text-foreground"
                      }`}
                    >
                      {member.overdue}
                    </p>
                    <p className="text-[9px] text-muted-foreground">Overdue</p>
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-3 text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" /> {member.rate}% completion
                  </span>
                  {member.criticalTotal > 0 && (
                    <span className="flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" /> {member.criticalDone}/
                      {member.criticalTotal} critical
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {!loading && memberStats.length === 0 && (
        <div className="text-center py-16">
          <p className="text-lg text-muted-foreground">
            No team members assigned to this event.
          </p>
        </div>
      )}
    </div>
  );
}