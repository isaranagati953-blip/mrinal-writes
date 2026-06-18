"use client";
import { useState } from "react";
import styles from "../admin.module.css";

type Member = {
  id: string; name: string; email: string;
  isActive: boolean; createdAt: string;
  lastLoginAt: string | null; noteCount: number;
};

export default function MembersTable({ members: initial }: { members: Member[] }) {
  const [members, setMembers] = useState(initial);
  const [busy, setBusy] = useState<string | null>(null);

  async function toggleAccess(id: string, current: boolean) {
    const action = current ? "revoke" : "restore";
    if (!confirm(`${action === "revoke" ? "Revoke" : "Restore"} access for this member?`)) return;
    setBusy(id);

    const res = await fetch(`/api/admin/members/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !current }),
    });

    if (res.ok) {
      setMembers((prev) =>
        prev.map((m) => (m.id === id ? { ...m, isActive: !current } : m))
      );
    }
    setBusy(null);
  }

  return (
    <div style={{ overflowX: "auto" }}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Notes</th>
            <th>Last login</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {members.map((m) => (
            <tr key={m.id}>
              <td>{m.name}</td>
              <td style={{ color: "var(--vault-muted)" }}>{m.email}</td>
              <td style={{ color: "var(--vault-muted)" }}>{m.noteCount}</td>
              <td style={{ color: "var(--vault-muted)", fontSize: 12 }}>
                {m.lastLoginAt
                  ? new Date(m.lastLoginAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
                  : "Never"}
              </td>
              <td>
                <span style={{ color: m.isActive ? "#34d399" : "#e05c5c", fontSize: 12 }}>
                  {m.isActive ? "Active" : "Revoked"}
                </span>
              </td>
              <td>
                <button
                  onClick={() => toggleAccess(m.id, m.isActive)}
                  disabled={busy === m.id}
                  style={{
                    background: "transparent",
                    border: `1px solid ${m.isActive ? "#e05c5c" : "#34d399"}`,
                    color: m.isActive ? "#e05c5c" : "#34d399",
                    borderRadius: 4, padding: "4px 10px",
                    fontSize: 12, cursor: "pointer", fontFamily: "var(--font)",
                  }}
                >
                  {busy === m.id ? "…" : m.isActive ? "Revoke" : "Restore"}
                </button>
              </td>
            </tr>
          ))}
          {members.length === 0 && (
            <tr><td colSpan={6} style={{ textAlign: "center", color: "var(--vault-muted)" }}>No members yet.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
