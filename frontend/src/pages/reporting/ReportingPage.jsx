import { useEffect, useState, useCallback } from "react";
import {
  Users,
  TrendingUp,
  Clock,
  CheckCircle2,
  Award,
  Target,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { toast } from "sonner";
import { getOverview, getUserProgress } from "../../api/reporting";
import { getCourses } from "../../api/courses";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

/* ─── helpers ─── */
const fmtTime = (seconds) => {
  if (!seconds && seconds !== 0) return "-";
  const s = Number(seconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString() : "-");

const BADGE_COLORS = {
  MASTER: "bg-yellow-500 text-white",
  EXPERT: "bg-purple-500 text-white",
  SPECIALIST: "bg-blue-500 text-white",
  ACHIEVER: "bg-green-500 text-white",
  EXPLORER: "bg-teal-500 text-white",
  NEWBIE: "bg-gray-500 text-white",
};

const statCards = [
  { key: "totalParticipants", label: "Total Participants", icon: Users },
  { key: "yetToStart", label: "Yet to Start", icon: Clock },
  { key: "inProgress", label: "In Progress", icon: TrendingUp },
  { key: "completed", label: "Completed", icon: CheckCircle2 },
  { key: "totalQuizAttempts", label: "Quiz Attempts", icon: Target },
  { key: "avgQuizScore", label: "Avg Quiz Score", icon: Award, suffix: "%" },
];

export default function ReportingPage() {
  const [overview, setOverview] = useState(null);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedRow, setExpandedRow] = useState(null);

  const [courses, setCourses] = useState([]);
  const [courseFilter, setCourseFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  /* ─── fetch overview ─── */
  useEffect(() => {
    getOverview()
      .then((r) => setOverview(r.data.data || r.data))
      .catch(() => {});
  }, []);

  /* ─── fetch courses for filter ─── */
  useEffect(() => {
    getCourses()
      .then((r) => setCourses(r.data.data || r.data || []))
      .catch(() => {});
  }, []);

  /* ─── fetch progress rows ─── */
  const fetchProgress = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (courseFilter !== "ALL") params.courseId = courseFilter;
      if (statusFilter !== "ALL") params.status = statusFilter;
      const res = await getUserProgress(params);
      setRows(res.data.data || res.data || []);
    } catch {
      toast.error("Failed to load progress data");
    } finally {
      setLoading(false);
    }
  }, [courseFilter, statusFilter]);

  useEffect(() => { fetchProgress(); }, [fetchProgress]);

  return (
    <div className="space-y-6">
      {/* header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Reporting</h1>
        <p className="text-muted-foreground text-sm">Track learner progress and analytics</p>
      </div>

      {/* stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {statCards.map(({ key, label, icon: Icon, suffix }) => (
          <div key={key} className="rounded-lg border bg-card p-4 space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Icon className="h-4 w-4" />
              <span className="text-sm">{label}</span>
            </div>
            {overview ? (
              <p className="text-2xl font-bold">{overview[key] ?? 0}{suffix || ""}</p>
            ) : (
              <Skeleton className="h-8 w-16" />
            )}
          </div>
        ))}
      </div>

      <Separator />

      {/* filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Select value={courseFilter} onValueChange={setCourseFilter}>
          <SelectTrigger className="w-[220px]"><SelectValue placeholder="All Courses" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Courses</SelectItem>
            {courses.map((c) => (
              <SelectItem key={c.id} value={String(c.id)}>{c.title}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="All Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Status</SelectItem>
            <SelectItem value="YET_TO_START">Yet to Start</SelectItem>
            <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* progress table */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[60px]">Sr No</TableHead>
              <TableHead>Course Name</TableHead>
              <TableHead>Participant Name</TableHead>
              <TableHead>Badge</TableHead>
              <TableHead>Points</TableHead>
              <TableHead>Best Quiz Score</TableHead>
              <TableHead>Enrolled Date</TableHead>
              <TableHead>Time Spent</TableHead>
              <TableHead>Completion %</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Completed Date</TableHead>
              <TableHead className="w-[40px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 12 }).map((_, j) => (
                    <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={12} className="text-center py-12 text-muted-foreground">
                  No progress data found
                </TableCell>
              </TableRow>
            ) : (
              rows.map((r, i) => {
                const bestOverall = r.quizScores?.length
                  ? Math.max(...r.quizScores.filter((q) => q.bestScore !== null).map((q) => q.bestScore), 0)
                  : null;
                const isExpanded = expandedRow === r.id;

                return (
                  <>
                    <TableRow key={r.id || i} className="cursor-pointer" onClick={() => setExpandedRow(isExpanded ? null : r.id)}>
                      <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                      <TableCell className="font-medium">{r.course?.title || "-"}</TableCell>
                      <TableCell>
                        {r.user
                          ? `${r.user.firstName || ""} ${r.user.lastName || ""}`.trim()
                          : "-"}
                      </TableCell>
                      <TableCell>
                        {r.user?.badgeLevel ? (
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${BADGE_COLORS[r.user.badgeLevel] || "bg-gray-200"}`}>
                            <Award className="h-3 w-3" />
                            {r.user.badgeLevel}
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-xs">None</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{r.courseEarnedPoints ?? r.user?.totalPoints ?? 0}{r.courseMaxPoints > 0 && <span className="text-muted-foreground text-xs">/{r.courseMaxPoints}</span>}</span>
                          {r.coursePointsPercent != null && r.courseMaxPoints > 0 && (
                            <span className="text-xs text-muted-foreground">{r.coursePointsPercent}%</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {bestOverall !== null ? (
                          <span className={`font-semibold ${bestOverall >= 80 ? "text-green-600" : bestOverall >= 50 ? "text-yellow-600" : "text-red-600"}`}>
                            {Math.round(bestOverall)}%
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-xs">No attempts</span>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{fmtDate(r.enrolledAt)}</TableCell>
                      <TableCell>{fmtTime(r.timeSpentSeconds)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-16 rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full bg-foreground rounded-full transition-all"
                              style={{ width: `${Math.min(r.completionPct ?? 0, 100)}%` }}
                            />
                          </div>
                          <span className="text-sm">{Math.round(r.completionPct ?? 0)}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            r.status === "COMPLETED" ? "default"
                              : r.status === "IN_PROGRESS" ? "secondary"
                                : "outline"
                          }
                        >
                          {r.status?.replace(/_/g, " ") || "-"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{fmtDate(r.completedAt)}</TableCell>
                      <TableCell>
                        {r.quizScores?.length > 0 && (
                          isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                        )}
                      </TableCell>
                    </TableRow>
                    {isExpanded && r.quizScores?.length > 0 && (
                      <TableRow key={`${r.id}-detail`}>
                        <TableCell colSpan={12} className="bg-muted/50 p-4">
                          <div className="space-y-2">
                            <p className="text-sm font-semibold">Quiz Scores Breakdown</p>
                            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                              {r.quizScores.map((qs, qi) => (
                                <div key={qi} className="rounded-md border bg-card p-3 space-y-1">
                                  <p className="text-sm font-medium">{qs.quizTitle}</p>
                                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                    <span>Best Score: {qs.bestScore !== null ? <span className="font-semibold text-foreground">{Math.round(qs.bestScore)}%</span> : "N/A"}</span>
                                    <span>Attempts: {qs.attempts}</span>
                                    <span>Points: {qs.pointsEarned}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
