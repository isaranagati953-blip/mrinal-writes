"use client";
import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import styles from "./VaultShell.module.css";

type Props = {
  children: React.ReactNode;
  user: { name: string; email: string; role: string };
};

const NAV = [
  { label: "Sessions", icon: "▶", path: "sessions" },
  { label: "My Notes", icon: "✦", path: "notes" },
];

export default function VaultShell({ children, user }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // Extract vault slug from current path
  const slug = pathname.split("/")[1];

  async function handleLogout() {
    setLoggingOut(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push(`/${slug}/enter`);
  }

  function navTo(path: string) {
    router.push(`/${slug}/${path}`);
    setMenuOpen(false);
  }

  return (
    <div className={styles.root}>

      {/* ── Sidebar (desktop) ── */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarTop}>
          <div className={styles.logoMark}>॥</div>

          <nav className={styles.nav}>
            {NAV.map((item) => (
              <button
                key={item.path}
                onClick={() => navTo(item.path)}
                className={`${styles.navItem} ${pathname.includes(item.path) ? styles.navActive : ""}`}
              >
                <span className={styles.navIcon}>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
            {user.role === "ADMIN" && (
              <button
                onClick={() => router.push("/admin")}
                className={`${styles.navItem} ${pathname.startsWith("/admin") ? styles.navActive : ""}`}
              >
                <span className={styles.navIcon}>⚙</span>
                <span>Admin</span>
              </button>
            )}
          </nav>
        </div>

        <div className={styles.sidebarBottom}>
          <div className={styles.userInfo}>
            <div className={styles.userAvatar}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className={styles.userMeta}>
              <span className={styles.userName}>{user.name}</span>
              <span className={styles.userEmail}>{user.email}</span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className={styles.logoutBtn}
          >
            {loggingOut ? "…" : "Sign out"}
          </button>
        </div>
      </aside>

      {/* ── Mobile top bar ── */}
      <div className={styles.mobileBar}>
        <div className={styles.logoMark}>॥</div>
        <button
          className={styles.menuToggle}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* ── Mobile drawer ── */}
      {menuOpen && (
        <div className={styles.mobileDrawer}>
          <nav className={styles.mobileNav}>
            {NAV.map((item) => (
              <button
                key={item.path}
                onClick={() => navTo(item.path)}
                className={`${styles.mobileNavItem} ${pathname.includes(item.path) ? styles.navActive : ""}`}
              >
                <span className={styles.navIcon}>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
            {user.role === "ADMIN" && (
              <button
                onClick={() => { router.push("/admin"); setMenuOpen(false); }}
                className={styles.mobileNavItem}
              >
                <span className={styles.navIcon}>⚙</span>
                <span>Admin</span>
              </button>
            )}
            <div className={styles.mobileDivider} />
            <button onClick={handleLogout} className={styles.mobileLogout}>
              Sign out
            </button>
          </nav>
        </div>
      )}

      {/* ── Main content ── */}
      <main className={styles.main}>
        {children}
      </main>

    </div>
  );
}
