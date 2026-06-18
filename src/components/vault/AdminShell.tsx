"use client";
import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import styles from "./AdminShell.module.css";

const NAV = [
  { label: "Overview",  icon: "◈", path: "/admin" },
  { label: "Sessions",  icon: "▶", path: "/admin/sessions" },
  { label: "Upload",    icon: "↑", path: "/admin/upload" },
  { label: "Members",   icon: "◉", path: "/admin/members" },
  { label: "Invites",   icon: "✉", path: "/admin/invites" },
  { label: "Audit Log", icon: "◎", path: "/admin/audit" },
];

export default function AdminShell({
  children,
  userName,
}: {
  children: React.ReactNode;
  userName: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  }

  return (
    <div className={styles.root}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.top}>
          <div className={styles.brand}>
            <span className={styles.symbol}>॥</span>
            <span className={styles.brandLabel}>Admin</span>
          </div>
          <nav className={styles.nav}>
            {NAV.map((item) => {
              const active =
                item.path === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(item.path);
              return (
                <button
                  key={item.path}
                  onClick={() => { router.push(item.path); setMenuOpen(false); }}
                  className={`${styles.navItem} ${active ? styles.navActive : ""}`}
                >
                  <span className={styles.navIcon}>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className={styles.bottom}>
          <div className={styles.userRow}>
            <div className={styles.avatar}>{userName.charAt(0).toUpperCase()}</div>
            <div className={styles.userMeta}>
              <span className={styles.userName}>{userName}</span>
              <span className={styles.userRole}>Admin</span>
            </div>
          </div>
          <button onClick={handleLogout} disabled={loggingOut} className={styles.logoutBtn}>
            {loggingOut ? "…" : "Sign out"}
          </button>
        </div>
      </aside>

      {/* Mobile bar */}
      <div className={styles.mobileBar}>
        <span className={styles.symbol}>॥</span>
        <span className={styles.mobileBrandLabel}>Admin</span>
        <button className={styles.menuToggle} onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? "✕" : "☰"}
        </button>
      </div>

      {menuOpen && (
        <div className={styles.mobileDrawer}>
          {NAV.map((item) => (
            <button
              key={item.path}
              onClick={() => { router.push(item.path); setMenuOpen(false); }}
              className={styles.mobileNavItem}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              {item.label}
            </button>
          ))}
          <button onClick={handleLogout} className={styles.mobileLogout}>Sign out</button>
        </div>
      )}

      <main className={styles.main}>{children}</main>
    </div>
  );
}
