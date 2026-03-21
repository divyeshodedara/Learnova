import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { Users, Clock, TrendingUp, CheckCircle2 } from "lucide-react";
import { getOverview, getUserProgress } from "../../api/reporting";
import { getCourses } from "../../api/courses";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

function formatTime(seconds) {
  if (!seconds && seconds !== 0) return "—";
  const s = Number(seconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function StatCard({ icon: Icon, label, value, loading: isLoading }) {
  return (
    <div className="border rounded-lg p-4 space-y-2">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="h-4 w-4" />
        <span className="text-sm">{label}</span>
      </div>
      {isLoading ? (
        <Skeleton className="h-8 w-16" />
      ) : (
        <p className="text-2xl font-bold">{value}</p>
      )}
    </div>
  );
}

export default function ReportingPage() {
  const [overview, setOverview] = useState(null);
  const [overviewLoading, setOverviewLoading] = useState(true);

  const [progressRows, setProgressRows] = useState([]);
  const [progressLoading, setProgressLoading] = useState(true);

  const [courses, setCourses] = useState([]);
  const [courseFilter, setCourseFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Fetch overview stats
  useEffect(() => {
    setOverviewLoading(true);
    getOverview()
      .then((res) => setOverview(res.data.data || res.data))
      .catch(() => toast.error("Failed to load overview"))
      .finally(() => setOverviewLoading(false));
  }, []);

  // Fetch courses for filter dropdown
  useEffect(() => {
    getCourses()
      .then((res) => setCourses(res.data.data || res.data.courses || res.data || []))
      .catch(() => {});
  }, []);

  // Fetch progress rows
  const fetchProgress = useCallback(async () => {
    setProgressLoading(true);
    try {
      const params = {};
      if (courseFilter !== "ALL") params.courseId = courseFilter;
      if (statusFilter !== "ALL") params.status = statusFilter;
      const res = await getUserProgress(params);
      setProgressRows(res.data.data || res.data || []);
    } catch {
      toast.error("Failed to load learner progress");
    } finally {
      setProgressLoading(false);
    }
  }, [courseFilter, statusFilter]);

  useEffect(() => { fetchProgress(); }, [fetchProgress]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Reporting</h1>
        <p className="text-muted-foreground">Track learner progress and analytics</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Participants" value={overview?.totalParticipants || 0} loading={overviewLoading} />
        <StatCard icon={Clock} label="Yet to Start" value={overview?.yetToStart || 0} loading={overviewLoading} />
        <StatCard icon={TrendingUp} label="In Progress" value={overview?.inProgress || 0} loading={overviewLoading} />
        <StatCard icon={CheckCircle2} label="Completed" value={overview?.completed || 0} loading={overviewLoading} />
      </div>

      <Separator />

      {/* Filters */}
      <div className="flex items-center gap-3">
        <Select value={courseFilter} onValueChange={setCourseFilter}>
          <SelectTrigger className="w-[200px]"><SelectValue placeholder="Filter by course" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Courses</SelectItem>
            {courses.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Statuses</SelectItem>
            <SelectItem value="YET_TO_START">Yet to Start</SelectItem>
            <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Progress Table */}
      {progressLoading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">Sr No</TableHead>
              <TableHead>Course Name</TableHead>
              <TableHead>Participant</TableHead>
              <TableHead>Enrolled</TableHead>
              <TableHead>Started</TableHead>
              <TableHead>Time Spent</TableHead>
              <TableHead>Completion</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Completed</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {progressRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-muted-foreground py-8">No data available</TableCell>
              </TableRow>
            ) : (
              progressRows.map((row, idx) => (
                <TableRow key={row.id || idx}>
                  <TableCell className="text-muted-foreground">{idx + 1}</TableCell>
                  <TableCell className="font-medium">{row.courseName || row.course?.title || "—"}</TableCell>
                  <TableCell>{row.participantName || (row.user ? `${row.user.firstName} ${row.user.lastName || ""}`.trim() : "—")}</TableCell>
                  <TableCell className="text-muted-foreground">{row.enrolledAt ? new Date(row.enrolledAt).toLocaleDateString() : "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{row.startDate ? new Date(row.startDate).toLocaleDateString() : "—"}</TableCell>
                  <TableCell>{formatTime(row.timeSpent)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-16 rounded-full bg-muted overflow-hidden">
                        <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(row.completionPercentage || 0, 100)}%` }} />
                      </div>
                      <span className="text-xs text-muted-foreground">{row.completionPercentage || 0}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={
                      row.status === "COMPLETED" ? "default" :
                      row.status === "IN_PROGRESS" ? "secondary" : "outline"
                    }>
                      {row.status === "YET_TO_START" ? "Yet to Start" :
                       row.status === "IN_PROGRESS" ? "In Progress" :
                       row.status === "COMPLETED" ? "Completed" : row.status || "—"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{row.completedAt ? new Date(row.completedAt).toLocaleDateString() : "—"}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
