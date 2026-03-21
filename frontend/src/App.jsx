import { Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./components/theme-provider";
import { useAuth } from "./hooks/useAuth";
import { Toaster } from "./components/ui/sonner";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import Dashboard from "./pages/Dashboard";
import ComingSoon from "./pages/ComingSoon";
import CoursesPage from "./pages/courses/CoursesPage";
import CourseDetailPage from "./pages/courses/CourseDetailPage";
import UsersPage from "./pages/admin/UsersPage";
import ReportingPage from "./pages/reporting/ReportingPage";
import DashboardLayout from "./components/layout/DashboardLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import UserManagement from "./pages/admin/UserManagement";
import CourseList from "./pages/management/CourseList";
import CourseEditor from "./pages/management/CourseEditor";
import CurriculumBuilder from "./pages/management/CurriculumBuilder";
import Reporting from "./pages/management/Reporting";
import BrowseCourses from "./pages/learner/BrowseCourses";
import CourseDetail from "./pages/learner/CourseDetail";
import MyCourses from "./pages/learner/MyCourses";
import PaymentHistory from "./pages/learner/PaymentHistory";
import CoursePlayer from "./pages/learner/CoursePlayer";
import QuizPlayer from "./pages/learner/QuizPlayer";

function App() {
  const { user, loading, logout, isAdmin, isBackoffice } = useAuth();

  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route
          element={
            <ProtectedRoute user={user} loading={loading}>
              <DashboardLayout user={user} onLogout={logout} />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard user={user} />} />

          <Route
            path="/courses"
            element={
              <ProtectedRoute user={user} loading={false} allowedRoles={["ADMIN", "INSTRUCTOR"]}>
                <CoursesPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/courses/:id"
            element={
              <ProtectedRoute user={user} loading={false} allowedRoles={["ADMIN", "INSTRUCTOR"]}>
                <CourseDetailPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/users"
            element={
              <ProtectedRoute user={user} loading={false} allowedRoles={["ADMIN"]}>
                <UsersPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/reporting"
            element={
              <ProtectedRoute user={user} loading={false} allowedRoles={["ADMIN", "INSTRUCTOR"]}>
                <ReportingPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/browse"
            element={
              <BrowseCourses />
            }
          />
          <Route
            path="/browse/:id"
            element={
              <CourseDetail />
            }
          />

          <Route
            path="/my-courses"
            element={
              <ProtectedRoute user={user} loading={false}>
                <MyCourses />
              </ProtectedRoute>
            }
          />

          <Route
            path="/payments"
            element={
              <ProtectedRoute user={user} loading={false}>
                <PaymentHistory />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Special layout for course player, doesn't use DashboardLayout necessarily, but relies on auth */}
        <Route
          path="/player/:courseId/:lessonId"
          element={
            <ProtectedRoute user={user} loading={loading}>
              <CoursePlayer />
            </ProtectedRoute>
          }
        />
        <Route
          path="/player/:courseId/quiz/:quizId"
          element={
            <ProtectedRoute user={user} loading={loading}>
              <QuizPlayer />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
      <Toaster position="top-right" />
    </ThemeProvider>
  );
}

export default App;
