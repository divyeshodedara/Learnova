import { useState, useEffect, useCallback } from "react";
import { getMe } from "../api/auth";

export function useAuth() {
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

  const isAdmin = user?.role === "ADMIN";
  const isInstructor = user?.role === "INSTRUCTOR";
  const isLearner = user?.role === "LEARNER";
  const isBackoffice = isAdmin || isInstructor;

  return { user, loading, logout, isAdmin, isInstructor, isLearner, isBackoffice, refetch: fetchUser };
}
