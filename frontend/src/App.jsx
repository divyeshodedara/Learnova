import { Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./components/theme-provider";
import { useAuth } from "./hooks/useAuth";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import Dashboard from "./pages/Dashboard";
import ComingSoon from "./pages/ComingSoon";
import DashboardLayout from "./components/layout/DashboardLayout";
import ProtectedRoute from "./components/ProtectedRoute";

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
                <ComingSoon title="Courses Management" description="Create and manage your courses" />
              </ProtectedRoute>
            }
          />

          <Route
            path="/users"
            element={
              <ProtectedRoute user={user} loading={false} allowedRoles={["ADMIN"]}>
                <ComingSoon title="User Management" description="Manage platform users and roles" />
              </ProtectedRoute>
            }
          />

          <Route
            path="/reporting"
            element={
              <ProtectedRoute user={user} loading={false} allowedRoles={["ADMIN", "INSTRUCTOR"]}>
                <ComingSoon title="Reporting Dashboard" description="Track learner progress and analytics" />
              </ProtectedRoute>
            }
          />

          <Route
            path="/browse"
            element={
              <ComingSoon title="Browse Courses" description="Discover and enroll in published courses" />
            }
          />

          <Route
            path="/my-courses"
            element={
              <ComingSoon title="My Courses" description="View your enrolled courses and track progress" />
            }
          />

          <Route
            path="/payments"
            element={
              <ComingSoon title="Payments" description="View your payment history" />
            }
          />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </ThemeProvider>
  );
}

export default App;
