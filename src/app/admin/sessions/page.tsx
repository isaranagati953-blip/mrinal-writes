import { db } from "@/lib/db";
import Link from "next/link";
import SessionsTree from "./SessionsTree";
import styles from "../admin.module.css";
import treeStyles from "./sessions.module.css";

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

export default async function AdminSessionsPage() {
  const sessions = await db.audioSession.findMany({
    orderBy: [{ recordedAt: "asc" }, { sortOrder: "asc" }],
    include: { transcription: { select: { id: true, isVerified: true } } },
  });

  // Group: { year: { month: sessions[] } }
  const tree: Record<number, Record<number, typeof sessions>> = {};
  for (const s of sessions) {
    const y = new Date(s.recordedAt).getFullYear();
    const m = new Date(s.recordedAt).getMonth();
    if (!tree[y]) tree[y] = {};
    if (!tree[y][m]) tree[y][m] = [];
    tree[y][m].push(s);
  }

  const years = Object.keys(tree).map(Number).sort((a, b) => b - a);

  return (
    <div className={styles.root}>
      <div className={styles.inner}>
        <div className={treeStyles.pageHeader}>
          <h1 className={styles.title}>Sessions</h1>
          <Link href="/admin/upload" className={styles.actionBtn}>↑ Upload new</Link>
        </div>

        {years.length === 0 && (
          <p className={treeStyles.empty}>No sessions yet. Upload your first one.</p>
        )}

        {years.map((year) => (
          <section key={year} className={treeStyles.yearBlock}>
            <h2 className={treeStyles.yearLabel}>{year}</h2>

            {Object.keys(tree[year])
              .map(Number)
              .sort((a, b) => a - b)
              .map((month) => (
                <div key={month} className={treeStyles.monthBlock}>
                  <h3 className={treeStyles.monthLabel}>
                    {MONTHS[month]}
                    <span className={treeStyles.monthCount}>
                      {tree[year][month].length} sessions
                    </span>
                  </h3>

                  <SessionsTree
                    sessions={tree[year][month].map((s) => ({
                      id:                 s.id,
                      title:              s.title,
                      recordedAt:         s.recordedAt.toISOString(),
                      durationSecs:       s.durationSecs,
                      isPublished:        s.isPublished,
                      sortOrder:          s.sortOrder,
                      hasTranscript:      !!s.transcription,
                      transcriptVerified: s.transcription?.isVerified ?? false,
                    }))}
                  />
                </div>
              ))}
          </section>
        ))}
      </div>
    </div>
  );
}
