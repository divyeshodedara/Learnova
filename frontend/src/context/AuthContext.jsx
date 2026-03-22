import { createContext, useState, useEffect, useCallback, useMemo } from "react";
import { getMe } from "../api/auth";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const res = await getMe();
      const userData = res.data.user;
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
    } catch {
      setUser(null);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  }, []);

  const value = useMemo(() => ({
    user,
    loading,
    logout,
    isAdmin: user?.role === "ADMIN",
    isInstructor: user?.role === "INSTRUCTOR",
    isLearner: user?.role === "LEARNER",
    isBackoffice: user?.role === "ADMIN" || user?.role === "INSTRUCTOR",
    refetch: fetchUser,
  }), [user, loading, logout, fetchUser]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
