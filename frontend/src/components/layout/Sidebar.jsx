import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
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
} from "lucide-react";
import styles from "./layout.module.css";

const adminNav = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Courses", href: "/courses", icon: BookOpen },
  { label: "Users", href: "/users", icon: Users },
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
        <div className={styles.userCard}>
          <div className={styles.userAvatar}>
            {user?.firstName?.[0]}
            {user?.lastName?.[0]}
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
