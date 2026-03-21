import { useState, useEffect } from "react";
import { getOverview, getUserProgress } from "../../api/reporting";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/Table";
import { Badge } from "../../components/ui/Badge";
import { Skeleton } from "../../components/ui/Skeleton";
import { BarChart3, Users, TrendingUp, CheckCircle2 } from "lucide-react";

export default function Reporting({ user }) {
  const [stats, setStats] = useState(null);
  const [progressData, setProgressData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchReporting();
  }, []);

  const fetchReporting = async () => {
    try {
      setLoading(true);
      const [statsRes, progressRes] = await Promise.all([
        getOverview(),
        getUserProgress()
      ]);
      setStats(statsRes.data);
      setProgressData(progressRes.data || []);
    } catch (err) {
      setError("Failed to load reporting data");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "COMPLETED": return <Badge variant="success">Completed</Badge>;
      case "IN_PROGRESS": return <Badge variant="default">In Progress</Badge>;
      default: return <Badge variant="secondary">Not Started</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Reporting & Analytics</h1>
        <p className="text-sm text-muted-foreground">Monitor platform engagement and learner progress.</p>
      </div>

      {error && (
        <div className="p-3 text-sm rounded-md bg-destructive/15 text-destructive border border-destructive/20">
          {error}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="border border-border rounded-xl p-5 bg-card shadow-sm">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Enrollments</p>
              {loading ? <Skeleton className="h-8 w-16 mt-1" /> : <p className="text-2xl font-bold">{stats?.totalParticipants || 0}</p>}
            </div>
          </div>
        </div>
        <div className="border border-border rounded-xl p-5 bg-card shadow-sm">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Not Started</p>
              {loading ? <Skeleton className="h-8 w-16 mt-1" /> : <p className="text-2xl font-bold">{stats?.yetToStart || 0}</p>}
            </div>
          </div>
        </div>
        <div className="border border-border rounded-xl p-5 bg-card shadow-sm">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">In Progress</p>
              {loading ? <Skeleton className="h-8 w-16 mt-1" /> : <p className="text-2xl font-bold">{stats?.inProgress || 0}</p>}
            </div>
          </div>
        </div>
        <div className="border border-border rounded-xl p-5 bg-card shadow-sm">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Completed</p>
              {loading ? <Skeleton className="h-8 w-16 mt-1" /> : <p className="text-2xl font-bold">{stats?.completed || 0}</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Progress Table */}
      <h2 className="text-lg font-semibold pt-4">Learner Progress</h2>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">#</TableHead>
              <TableHead>Learner Name</TableHead>
              <TableHead>Course</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Completion</TableHead>
              <TableHead className="text-right">Enrolled On</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-[150px]" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-[200px]" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-[80px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-4 w-[80px] ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : progressData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  No learner progress data available.
                </TableCell>
              </TableRow>
            ) : (
              progressData.map((row) => (
                <TableRow key={`${row.courseName}-${row.participantName}`}>
                  <TableCell className="font-medium text-muted-foreground">{row.srNo}</TableCell>
                  <TableCell className="font-medium">{row.participantName}</TableCell>
                  <TableCell>{row.courseName}</TableCell>
                  <TableCell>{getStatusBadge(row.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-24 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary" 
                          style={{ width: `${row.completionPercentage || 0}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">{row.completionPercentage || 0}%</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right text-sm text-muted-foreground">
                    {new Date(row.enrolledDate).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
