import { db } from "@/lib/db";
import styles from "../admin.module.css";

const PAGE_SIZE = 50;

export default async function AuditPage({
  searchParams,
}: {
  searchParams: { page?: string; action?: string };
}) {
  const page = Math.max(1, parseInt(searchParams.page ?? "1"));
  const action = searchParams.action ?? "";

  const [logs, total] = await Promise.all([
    db.auditLog.findMany({
      where: action ? { action: { contains: action.toUpperCase() } } : undefined,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { user: { select: { name: true, email: true } } },
    }),
    db.auditLog.count({
      where: action ? { action: { contains: action.toUpperCase() } } : undefined,
    }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const ACTION_COLORS: Record<string, string> = {
    LOGIN_SUCCESS: "#34d399", LOGIN_FAILED: "#e05c5c",
    LOGOUT: "#6b7280", SIGNUP_COMPLETE: "#34d399",
    AUDIO_OPEN: "var(--vault-accent)", NOTE_CREATE: "#60a5fa",
    NOTE_EDIT: "#60a5fa", NOTE_DELETE: "#e05c5c",
    SESSION_UPLOAD_COMPLETE: "#34d399", SESSION_EDIT: "var(--vault-accent)",
    SESSION_DELETE: "#e05c5c", MEMBER_REVOKED: "#e05c5c",
    MEMBER_RESTORED: "#34d399", INVITE_SENT: "#a78bfa",
  };

  return (
    <div className={styles.root}>
      <div className={styles.inner}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12 }}>
          <h1 className={styles.title}>Audit Log</h1>
          <span style={{ fontSize:13, color:"var(--vault-muted)" }}>{total} entries</span>
        </div>

        <form method="GET" style={{ display:"flex", gap:8 }}>
          <input name="action" defaultValue={action} placeholder="Filter by action…" className={styles.input} style={{ maxWidth:260 }} />
          <button type="submit" className={styles.submitBtn} style={{ padding:"10px 16px" }}>Filter</button>
          {action && <a href="/admin/audit" style={{ fontSize:13, color:"var(--vault-muted)", alignSelf:"center", padding:"4px" }}>Clear</a>}
        </form>

        <div style={{ overflowX:"auto" }}>
          <table className={styles.table}>
            <thead>
              <tr><th>Action</th><th>Who</th><th>IP</th><th>Detail</th><th>When</th></tr>
            </thead>
            <tbody>
              {logs.map((log) => {
                let detail = "";
                try { detail = log.detail ? JSON.stringify(JSON.parse(log.detail)) : ""; } catch { detail = log.detail ?? ""; }
                return (
                  <tr key={log.id}>
                    <td><span style={{ fontSize:11, fontWeight:600, letterSpacing:"0.04em", color: ACTION_COLORS[log.action] ?? "var(--vault-muted)" }}>{log.action}</span></td>
                    <td style={{ fontSize:13 }}>
                      {log.user ? <div><div style={{ color:"var(--vault-fg)" }}>{log.user.name}</div><div style={{ color:"var(--vault-muted)", fontSize:11 }}>{log.user.email}</div></div> : <span style={{ color:"#333" }}>—</span>}
                    </td>
                    <td style={{ fontSize:11, color:"#444", fontFamily:"monospace" }}>{log.ipAddress ?? "—"}</td>
                    <td style={{ fontSize:11, color:"var(--vault-muted)", maxWidth:220, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{detail}</td>
                    <td style={{ fontSize:11, color:"#444", whiteSpace:"nowrap" }}>
                      {new Date(log.createdAt).toLocaleString("en-IN", { day:"numeric", month:"short", year:"numeric", hour:"2-digit", minute:"2-digit" })}
                    </td>
                  </tr>
                );
              })}
              {logs.length === 0 && <tr><td colSpan={5} style={{ textAlign:"center", color:"var(--vault-muted)" }}>No entries found.</td></tr>}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div style={{ display:"flex", gap:8, alignItems:"center", justifyContent:"center" }}>
            {page > 1 && <a href={`/admin/audit?page=${page-1}${action ? `&action=${action}` : ""}`} className={styles.actionBtn}>← Prev</a>}
            <span style={{ fontSize:13, color:"var(--vault-muted)" }}>Page {page} of {totalPages}</span>
            {page < totalPages && <a href={`/admin/audit?page=${page+1}${action ? `&action=${action}` : ""}`} className={styles.actionBtn}>Next →</a>}
          </div>
        )}
      </div>
    </div>
  );
}
