import { db } from "@/lib/db";
import Link from "next/link";
import styles from "./admin.module.css";

export default async function AdminPage() {
  const [totalSessions, published, unpublished, totalUsers, totalNotes, recentAudit] =
    await Promise.all([
      db.audioSession.count(),
      db.audioSession.count({ where: { isPublished: true } }),
      db.audioSession.count({ where: { isPublished: false } }),
      db.user.count({ where: { role: "MEMBER" } }),
      db.note.count(),
      db.auditLog.findMany({
        orderBy: { createdAt: "desc" },
        take: 8,
        include: { user: { select: { name: true } } },
      }),
    ]);

  const cards = [
    { label: "Total Sessions", value: totalSessions, sub: `${published} published`, link: "/admin/sessions" },
    { label: "Unpublished",    value: unpublished,   sub: "awaiting publish",        link: "/admin/sessions" },
    { label: "Members",        value: totalUsers,    sub: "active accounts",          link: "/admin/members" },
    { label: "Notes written",  value: totalNotes,    sub: "across all members",       link: "/admin/audit" },
  ];

  return (
    <div className={styles.root}>
      <div className={styles.inner}>
        <h1 className={styles.title}>Overview</h1>

        {/* Stat cards */}
        <div className={styles.grid}>
          {cards.map((c) => (
            <Link key={c.label} href={c.link} className={styles.card}>
              <span className={styles.cardVal}>{c.value}</span>
              <span className={styles.cardLabel}>{c.label}</span>
              <span className={styles.cardSub}>{c.sub}</span>
            </Link>
          ))}
        </div>

        {/* Quick actions */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Quick actions</h2>
          <div className={styles.actions}>
            <Link href="/admin/upload" className={styles.actionBtn}>
              ↑ Upload new session
            </Link>
            <Link href="/admin/invites" className={styles.actionBtn}>
              ✉ Send invite
            </Link>
            <Link href="/admin/sessions" className={styles.actionBtn}>
              ◈ Manage sessions
            </Link>
          </div>
        </section>

        {/* Recent activity */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Recent activity</h2>
          <div className={styles.auditList}>
            {recentAudit.map((log) => (
              <div key={log.id} className={styles.auditRow}>
                <span className={styles.auditAction}>{formatAction(log.action)}</span>
                <span className={styles.auditWho}>{log.user?.name ?? "—"}</span>
                <span className={styles.auditTime}>
                  {new Date(log.createdAt).toLocaleString("en-IN", {
                    day: "numeric", month: "short",
                    hour: "2-digit", minute: "2-digit",
                  })}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function formatAction(action: string): string {
  return action
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/^\w/, (c) => c.toUpperCase());
}
