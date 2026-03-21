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

function LearnerDashboard() {
  const [enrollments, setEnrollments] = useState([]);

  useEffect(() => {
    getMyEnrollments()
      .then((res) => setEnrollments(res.data.data || []))
      .catch(() => {});
  }, []);

  const inProgress = enrollments.filter((e) => e.status === "IN_PROGRESS").length;
  const completed = enrollments.filter((e) => e.status === "COMPLETED").length;
  const yetToStart = enrollments.filter((e) => e.status === "YET_TO_START").length;

  return (
    <>
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
      {user?.role === "LEARNER" && <LearnerDashboard />}
    </div>
  );
}