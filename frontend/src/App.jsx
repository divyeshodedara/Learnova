import { Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./components/theme-provider";
import { Toaster } from "./components/ui/sonner";
import { useAuth } from "./hooks/useAuth";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import Dashboard from "./pages/Dashboard";
import DashboardLayout from "./components/layout/DashboardLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import CoursesPage from "./pages/courses/CoursesPage";
import AdminCourseDetailPage from "./pages/courses/CourseDetailPage";
import UsersPage from "./pages/admin/UsersPage";
import ReportingPage from "./pages/reporting/ReportingPage";
import BrowsePage from "./pages/learner/BrowsePage";
import LearnerCourseDetailPage from "./pages/learner/CourseDetailPage";
import MyCoursesPage from "./pages/learner/MyCoursesPage";
import PlayerPage from "./pages/learner/PlayerPage";
import PaymentsPage from "./pages/learner/PaymentsPage";
import AdminPaymentsPage from "./pages/admin/PaymentsPage";
import AcceptInvitePage from "./pages/AcceptInvitePage";
import ProfilePage from "./pages/ProfilePage";
import NotFound from "./pages/NotFound";

function App() {
  const { user, loading, logout, isAdmin, isBackoffice } = useAuth();

  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/accept-invite/:token" element={<AcceptInvitePage />} />

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
                <AdminCourseDetailPage />
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
            path="/admin/payments"
            element={
              <ProtectedRoute user={user} loading={false} allowedRoles={["ADMIN"]}>
                <AdminPaymentsPage />
              </ProtectedRoute>
            }
          />

          <Route path="/browse" element={<BrowsePage />} />
          <Route path="/courses/:id/detail" element={<LearnerCourseDetailPage />} />
          <Route path="/my-courses" element={<MyCoursesPage />} />
          <Route path="/player/:courseId" element={<PlayerPage />} />
          <Route path="/payments" element={<PaymentsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster richColors position="top-right" />
    </ThemeProvider>
  );
}

export default App;
