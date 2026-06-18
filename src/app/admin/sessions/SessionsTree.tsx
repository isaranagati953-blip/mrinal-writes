"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./sessions.module.css";

type SessionRow = {
  id: string;
  title: string;
  recordedAt: string;
  durationSecs: number | null;
  isPublished: boolean;
  sortOrder: number;
  hasTranscript: boolean;
  transcriptVerified: boolean;
};

export default function SessionsTree({ sessions }: { sessions: SessionRow[] }) {
  const router = useRouter();
  const [rows, setRows] = useState(sessions);
  const [busy, setBusy] = useState<string | null>(null);

  async function togglePublish(id: string, current: boolean) {
    setBusy(id);
    const res = await fetch(`/api/admin/sessions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPublished: !current }),
    });
    if (res.ok) {
      setRows((prev) =>
        prev.map((r) => (r.id === id ? { ...r, isPublished: !current } : r))
      );
    }
    setBusy(null);
  }

  async function deleteSession(id: string, title: string) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setBusy(id);
    await fetch(`/api/admin/sessions/${id}`, { method: "DELETE" });
    setRows((prev) => prev.filter((r) => r.id !== id));
    setBusy(null);
    router.refresh();
  }

  return (
    <div className={styles.tree}>
      {rows.map((s) => (
        <div key={s.id} className={`${styles.row} ${s.isPublished ? styles.published : styles.draft}`}>

          {/* Status dot */}
          <span
            className={styles.dot}
            title={s.isPublished ? "Published" : "Draft"}
          />

          {/* Info */}
          <div className={styles.info}>
            <span className={styles.sessionTitle}>{s.title}</span>
            <div className={styles.badges}>
              {s.durationSecs && (
                <span className={styles.badge}>{fmt(s.durationSecs)}</span>
              )}
              {s.hasTranscript && (
                <span className={`${styles.badge} ${s.transcriptVerified ? styles.badgeGreen : styles.badgeYellow}`}>
                  {s.transcriptVerified ? "✓ Transcript" : "~ Transcript"}
                </span>
              )}
              <span className={styles.badge}>
                {new Date(s.recordedAt).toLocaleDateString("en-IN", {
                  day: "numeric", month: "short",
                })}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className={styles.actions}>
            <button
              onClick={() => togglePublish(s.id, s.isPublished)}
              disabled={busy === s.id}
              className={`${styles.btn} ${s.isPublished ? styles.btnUnpublish : styles.btnPublish}`}
            >
              {busy === s.id ? "…" : s.isPublished ? "Unpublish" : "Publish"}
            </button>
            <a href={`/admin/sessions/${s.id}/edit`} className={`${styles.btn} ${styles.btnEdit}`}>
              Edit
            </a>
            <button
              onClick={() => deleteSession(s.id, s.title)}
              disabled={busy === s.id}
              className={`${styles.btn} ${styles.btnDelete}`}
            >
              Delete
            </button>
          </div>
        </div>
      ))}

      {rows.length === 0 && (
        <p className={styles.empty}>No sessions this month.</p>
      )}
    </div>
  );
}

function fmt(secs: number) {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}
