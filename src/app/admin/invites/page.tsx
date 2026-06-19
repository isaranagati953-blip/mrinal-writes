import { db } from "@/lib/db";
import InviteForm from "./InviteForm";
import styles from "../admin.module.css";

export const dynamic = "force-dynamic";

export default async function InvitesPage() {
  const invites = await db.invite.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className={styles.root}>
      <div className={styles.inner}>
        <h1 className={styles.title}>Invites</h1>

        {/* Send new invite */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Send new invite</h2>
          <InviteForm />
        </section>

        {/* Existing invites */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>All invites ({invites.length})</h2>
          <div style={{ overflowX: "auto" }}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Expires</th>
                  <th>Sent</th>
                </tr>
              </thead>
              <tbody>
                {invites.map((inv) => {
                  const expired = !inv.usedAt && inv.expiresAt < new Date();
                  const status = inv.usedAt ? "Used" : expired ? "Expired" : "Pending";
                  const statusColor = inv.usedAt
                    ? "#34d399"
                    : expired ? "#e05c5c" : "var(--vault-accent)";

                  return (
                    <tr key={inv.id}>
                      <td>{inv.name}</td>
                      <td style={{ color: "var(--vault-muted)" }}>{inv.email}</td>
                      <td>
                        <span style={{ color: statusColor, fontSize: 12 }}>{status}</span>
                      </td>
                      <td style={{ color: "var(--vault-muted)", fontSize: 12 }}>
                        {inv.expiresAt.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </td>
                      <td style={{ color: "var(--vault-muted)", fontSize: 12 }}>
                        {inv.createdAt.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      </td>
                    </tr>
                  );
                })}
                {invites.length === 0 && (
                  <tr><td colSpan={5} style={{ textAlign: "center", color: "var(--vault-muted)" }}>No invites yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
