import { db } from "@/lib/db";
import MembersTable from "./MembersTable";
import styles from "../admin.module.css";

export const dynamic = "force-dynamic";

export default async function MembersPage() {
  const members = await db.user.findMany({
    where: { role: "MEMBER" },
    orderBy: { createdAt: "asc" },
    select: {
      id: true, name: true, email: true,
      isActive: true, createdAt: true, lastLoginAt: true,
      _count: { select: { notes: true } },
    },
  });

  return (
    <div className={styles.root}>
      <div className={styles.inner}>
        <h1 className={styles.title}>Members</h1>
        <p style={{ fontSize: 14, color: "var(--vault-muted)" }}>
          {members.length} members. Revoking access immediately invalidates all their sessions.
        </p>
        <MembersTable members={members.map((m) => ({
          id: m.id,
          name: m.name,
          email: m.email,
          isActive: m.isActive,
          createdAt: m.createdAt.toISOString(),
          lastLoginAt: m.lastLoginAt?.toISOString() ?? null,
          noteCount: m._count.notes,
        }))} />
      </div>
    </div>
  );
}
