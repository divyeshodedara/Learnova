import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  Users,
  BarChart3,
  GraduationCap,
  Library,
  Plus,
  TrendingUp,
  Clock,
  CheckCircle2,
  Award,
  Star,
} from "lucide-react";
import { getCourses } from "../api/courses";
import { getOverview } from "../api/reporting";
import { getMyEnrollments } from "../api/enrollments";
import styles from "./dashboard.module.css";

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [courseCount, setCourseCount] = useState(0);

  useEffect(() => {
    getOverview()
      .then((res) => setStats(res.data))
      .catch(() => {});
    getCourses()
      .then((res) => setCourseCount(res.data.count || 0))
      .catch(() => {});
  }, []);

  return (
    <>
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <BookOpen className="h-5 w-5" />
          </div>
          <p className={styles.statLabel}>Total Courses</p>
          <p className={styles.statValue}>{courseCount}</p>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <Users className="h-5 w-5" />
          </div>
          <p className={styles.statLabel}>Total Enrollments</p>
          <p className={styles.statValue}>{stats?.totalParticipants || 0}</p>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <TrendingUp className="h-5 w-5" />
          </div>
          <p className={styles.statLabel}>In Progress</p>
          <p className={styles.statValue}>{stats?.inProgress || 0}</p>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <p className={styles.statLabel}>Completed</p>
          <p className={styles.statValue}>{stats?.completed || 0}</p>
        </div>
      </div>
      <h2 className={styles.sectionTitle}>Quick Actions</h2>
      <div className={styles.quickActions}>
        <Link to="/courses" className={styles.actionCard}>
          <BookOpen className="h-5 w-5" />
          <div>
            <div className={styles.actionLabel}>Manage Courses</div>
            <div className={styles.actionDesc}>Create and edit courses</div>
          </div>
        </Link>
        <Link to="/users" className={styles.actionCard}>
          <Users className="h-5 w-5" />
          <div>
            <div className={styles.actionLabel}>Manage Users</div>
            <div className={styles.actionDesc}>Add instructors and manage accounts</div>
          </div>
        </Link>
        <Link to="/reporting" className={styles.actionCard}>
          <BarChart3 className="h-5 w-5" />
          <div>
            <div className={styles.actionLabel}>View Reports</div>
            <div className={styles.actionDesc}>Track learner progress</div>
          </div>
        </Link>
      </div>
    </>
  );
}

function InstructorDashboard() {
  const [courseCount, setCourseCount] = useState(0);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    getCourses()
      .then((res) => setCourseCount(res.data.count || 0))
      .catch(() => {});
    getOverview()
      .then((res) => setStats(res.data))
      .catch(() => {});
  }, []);

  return (
    <>
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <BookOpen className="h-5 w-5" />
          </div>
          <p className={styles.statLabel}>My Courses</p>
          <p className={styles.statValue}>{courseCount}</p>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <Users className="h-5 w-5" />
          </div>
          <p className={styles.statLabel}>Total Enrollments</p>
          <p className={styles.statValue}>{stats?.totalParticipants || 0}</p>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <Clock className="h-5 w-5" />
          </div>
          <p className={styles.statLabel}>Yet to Start</p>
          <p className={styles.statValue}>{stats?.yetToStart || 0}</p>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <p className={styles.statLabel}>Completed</p>
          <p className={styles.statValue}>{stats?.completed || 0}</p>
        </div>
      </div>
      <h2 className={styles.sectionTitle}>Quick Actions</h2>
      <div className={styles.quickActions}>
        <Link to="/courses" className={styles.actionCard}>
          <Plus className="h-5 w-5" />
          <div>
            <div className={styles.actionLabel}>Create Course</div>
            <div className={styles.actionDesc}>Start building a new course</div>
          </div>
        </Link>
        <Link to="/reporting" className={styles.actionCard}>
          <BarChart3 className="h-5 w-5" />
          <div>
            <div className={styles.actionLabel}>View Reports</div>
            <div className={styles.actionDesc}>See learner progress</div>
          </div>
        </Link>
      </div>
    </>
  );
}

function LearnerDashboard({ user }) {
  const [enrollments, setEnrollments] = useState([]);

  useEffect(() => {
    getMyEnrollments()
      .then((res) => setEnrollments(res.data.data || []))
      .catch(() => {});
  }, []);

  const inProgress = enrollments.filter((e) => e.status === "IN_PROGRESS").length;
  const completed = enrollments.filter((e) => e.status === "COMPLETED").length;
  const yetToStart = enrollments.filter((e) => e.status === "YET_TO_START").length;

  const BADGE_COLORS = {
    MASTER: "#eab308",
    EXPERT: "#a855f7",
    SPECIALIST: "#3b82f6",
    ACHIEVER: "#22c55e",
    EXPLORER: "#14b8a6",
    NEWBIE: "#6b7280",
  };

  return (
    <>
      <div className={styles.statCard} style={{ marginBottom: "1rem", padding: "1.25rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{
            width: 56, height: 56, borderRadius: "50%",
            background: BADGE_COLORS[user?.badgeLevel] || "#e5e7eb",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Award style={{ width: 28, height: 28, color: "white" }} />
          </div>
          <div>
            <p style={{ fontSize: "0.75rem", color: "var(--muted-foreground, #6b7280)" }}>Current Badge</p>
            <p style={{ fontSize: "1.25rem", fontWeight: 700 }}>
              {user?.badgeLevel || "No Badge Yet"}
            </p>
          </div>
          <div style={{ marginLeft: "auto", textAlign: "right" }}>
            <p style={{ fontSize: "0.75rem", color: "var(--muted-foreground, #6b7280)" }}>Total Points</p>
            <p style={{ fontSize: "1.5rem", fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
              <Star style={{ width: 20, height: 20, color: "#eab308" }} />
              {user?.totalPoints ?? 0}{user?.maxAchievablePoints > 0 && <span style={{ fontSize: "0.75rem", fontWeight: 400, color: "var(--muted-foreground, #6b7280)" }}>/ {user.maxAchievablePoints}</span>}
            </p>
          </div>
        </div>
        {user?.maxAchievablePoints > 0 && (
          <div style={{ marginTop: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem", color: "var(--muted-foreground, #6b7280)", marginBottom: 4 }}>
              <span>{user.pointsPercent ?? 0}% of maximum</span>
              {user.nextBadge && <span>Next: {user.nextBadge} at {user.nextBadgePct}%</span>}
            </div>
            <div style={{ height: 8, borderRadius: 4, background: "#e5e7eb", overflow: "hidden" }}>
              <div style={{ height: "100%", borderRadius: 4, background: BADGE_COLORS[user?.badgeLevel] || "#6b7280", width: `${Math.min(user.pointsPercent ?? 0, 100)}%`, transition: "width 0.5s" }} />
            </div>
          </div>
        )}
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <GraduationCap className="h-5 w-5" />
          </div>
          <p className={styles.statLabel}>Enrolled Courses</p>
          <p className={styles.statValue}>{enrollments.length}</p>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <TrendingUp className="h-5 w-5" />
          </div>
          <p className={styles.statLabel}>In Progress</p>
          <p className={styles.statValue}>{inProgress}</p>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <p className={styles.statLabel}>Completed</p>
          <p className={styles.statValue}>{completed}</p>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <Clock className="h-5 w-5" />
          </div>
          <p className={styles.statLabel}>Yet to Start</p>
          <p className={styles.statValue}>{yetToStart}</p>
        </div>
      </div>
      <h2 className={styles.sectionTitle}>Quick Actions</h2>
      <div className={styles.quickActions}>
        <Link to="/browse" className={styles.actionCard}>
          <Library className="h-5 w-5" />
          <div>
            <div className={styles.actionLabel}>Browse Courses</div>
            <div className={styles.actionDesc}>Discover new courses</div>
          </div>
        </Link>
        <Link to="/my-courses" className={styles.actionCard}>
          <GraduationCap className="h-5 w-5" />
          <div>
            <div className={styles.actionLabel}>My Courses</div>
            <div className={styles.actionDesc}>Continue learning</div>
          </div>
        </Link>
      </div>
    </>
  );
}

export default function Dashboard({ user }) {
  return (
    <div>
      <div className={styles.dashboardHeader}>
        <h1 className={styles.greeting}>Welcome, {user?.firstName}</h1>
        <p className={styles.greetingSub}>
          {user?.role === "ADMIN" && "Manage your platform from here"}
          {user?.role === "INSTRUCTOR" && "Manage your courses and track learners"}
          {user?.role === "LEARNER" && "Continue your learning journey"}
        </p>
      </div>
      {user?.role === "ADMIN" && <AdminDashboard />}
      {user?.role === "INSTRUCTOR" && <InstructorDashboard />}
      {user?.role === "LEARNER" && <LearnerDashboard user={user} />}
    </div>
  );
}