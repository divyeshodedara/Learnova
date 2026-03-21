import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { ModeToggle } from "../mode-toggle";
import Sidebar from "./Sidebar";
import styles from "./layout.module.css";

export default function DashboardLayout({ user, onLogout }) {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    onLogout();
    navigate("/login");
  };

  return (
    <div className={styles.layoutWrapper}>
      <Sidebar
        user={user}
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
      />
      <div
        className={`${styles.mainContent} ${collapsed ? styles.mainContentCollapsed : ""}`}
      >
        <header className={styles.topBar}>
          <div className={styles.topBarLeft}>
            <span className={`${styles.roleBadge} ${
              user?.role === "ADMIN"
                ? styles.roleBadgeAdmin
                : user?.role === "INSTRUCTOR"
                  ? styles.roleBadgeInstructor
                  : styles.roleBadgeLearner
            }`}>
              {user?.role}
            </span>
          </div>
          <div className={styles.topBarRight}>
            <ModeToggle />
            <button className={styles.logoutBtn} onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </header>
        <main className={styles.pageContent}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
