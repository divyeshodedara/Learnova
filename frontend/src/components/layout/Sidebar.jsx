import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  BarChart3,
  GraduationCap,
  Library,
  PanelLeftClose,
  PanelLeft,
  CreditCard,
  Settings,
  Award,
  Star,
} from "lucide-react";
import styles from "./layout.module.css";

const adminNav = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Courses", href: "/courses", icon: BookOpen },
  { label: "Users", href: "/users", icon: Users },
  { label: "Payments", href: "/admin/payments", icon: CreditCard },
  { label: "Reporting", href: "/reporting", icon: BarChart3 },
];

const instructorNav = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Courses", href: "/courses", icon: BookOpen },
  { label: "Reporting", href: "/reporting", icon: BarChart3 },
];

const learnerNav = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Browse Courses", href: "/browse", icon: Library },
  { label: "My Courses", href: "/my-courses", icon: GraduationCap },
  { label: "Payments", href: "/payments", icon: CreditCard },
];

function getNavItems(role) {
  if (role === "ADMIN") return adminNav;
  if (role === "INSTRUCTOR") return instructorNav;
  return learnerNav;
}

function getRoleBadgeClass(role) {
  if (role === "ADMIN") return styles.roleBadgeAdmin;
  if (role === "INSTRUCTOR") return styles.roleBadgeInstructor;
  return styles.roleBadgeLearner;
}

export default function Sidebar({ user, collapsed, onToggle }) {
  const location = useLocation();
  const navigate = useNavigate();
  const navItems = getNavItems(user?.role);

  return (
    <aside
      className={`${styles.sidebar} ${collapsed ? styles.sidebarCollapsed : ""}`}
    >
      <div className={styles.sidebarHeader}>
        <Link to="/dashboard" className={styles.sidebarLogo}>
          <img
            src="/logo.svg"
            alt="Learnova"
            className={`${styles.sidebarLogoImg} dark:invert`}
          />
          {!collapsed && <span className={styles.sidebarLogoText}>Learnova</span>}
        </Link>
        <button
          className={styles.collapseBtn}
          onClick={onToggle}
          aria-label="Toggle sidebar"
        >
          {collapsed ? (
            <PanelLeft className="h-4 w-4" />
          ) : (
            <PanelLeftClose className="h-4 w-4" />
          )}
        </button>
      </div>

      <nav className={styles.sidebarNav}>
        <div className={styles.navSection}>
          {!collapsed && (
            <div className={styles.navSectionTitle}>
              {user?.role === "LEARNER" ? "Learning" : "Management"}
            </div>
          )}
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`${styles.navLink} ${isActive ? styles.navLinkActive : ""}`}
                title={collapsed ? item.label : undefined}
              >
                <Icon className={styles.navIcon} />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </div>
      </nav>

      <div className={styles.sidebarFooter}>
        {user?.role === "LEARNER" && !collapsed && (
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "8px 12px", marginBottom: 8,
            borderRadius: 8, background: "var(--muted, #f4f4f5)",
          }}>
            <Award style={{ width: 16, height: 16, color: user?.badgeLevel ? "#a855f7" : "#9ca3af", flexShrink: 0 }} />
            <span style={{ fontSize: 12, fontWeight: 600 }}>{user?.badgeLevel || "No Badge"}</span>
            <span style={{ marginLeft: "auto", fontSize: 11, display: "flex", alignItems: "center", gap: 2 }}>
              <Star style={{ width: 12, height: 12, color: "#eab308" }} />
              {user?.totalPoints ?? 0}
            </span>
          </div>
        )}
        {user?.role === "LEARNER" && collapsed && (
          <div title={`${user?.badgeLevel || "No Badge"} - ${user?.totalPoints ?? 0} pts`} style={{
            display: "flex", justifyContent: "center", marginBottom: 8,
          }}>
            <Award style={{ width: 20, height: 20, color: user?.badgeLevel ? "#a855f7" : "#9ca3af" }} />
          </div>
        )}
        <div
          className={styles.userCard}
          onClick={() => navigate("/profile")}
          style={{ cursor: "pointer" }}
          title="Profile Settings"
        >
          <div className={styles.userAvatar}>
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt="avatar"
                style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }}
              />
            ) : (
              <>{user?.firstName?.[0]}{user?.lastName?.[0]}</>
            )}
          </div>
          {!collapsed && (
            <div className={styles.userInfo}>
              <span className={styles.userName}>
                {user?.firstName} {user?.lastName}
              </span>
              <span className={`${styles.roleBadge} ${getRoleBadgeClass(user?.role)}`}>
                {user?.role}
              </span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
