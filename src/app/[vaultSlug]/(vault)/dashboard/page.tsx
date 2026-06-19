import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import styles from "./dashboard.module.css";

export const dynamic = "force-dynamic";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ vaultSlug: string }>;
}) {
  const { vaultSlug } = await params;
  const user = await getCurrentUser();
  if (!user) redirect(`/${vaultSlug}/enter`);

  // Fetch recent sessions + user's progress
  const [recentSessions, totalSessions, myNotes, inProgress] = await Promise.all([
    db.audioSession.findMany({
      where: { isPublished: true },
      orderBy: { recordedAt: "desc" },
      take: 5,
      include: {
        transcription: { select: { id: true } },
        _count: { select: { notes: true } },
      },
    }),
    db.audioSession.count({ where: { isPublished: true } }),
    db.note.count({ where: { userId: user.id } }),
    db.progress.findMany({
      where: {
        userId: user.id,
        completedAt: null,
        positionSecs: { gt: 0 },
      },
      include: { audioSession: true },
      orderBy: { updatedAt: "desc" },
      take: 3,
    }),
  ]);

  const slug = vaultSlug;

  return (
    <div className={styles.root}>
      <div className={styles.inner}>

        {/* Greeting */}
        <header className={styles.header}>
          <h1 className={styles.greeting}>
            Hare Krishna, {user.name.split(" ")[0]} 🙏
          </h1>
          <p className={styles.date}>
            {new Date().toLocaleDateString("en-IN", {
              weekday: "long", year: "numeric",
              month: "long", day: "numeric",
            })}
          </p>
        </header>

        {/* Stats row */}
        <div className={styles.stats}>
          <div className={styles.statCard}>
            <span className={styles.statNum}>{totalSessions}</span>
            <span className={styles.statLabel}>Sessions</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statNum}>{myNotes}</span>
            <span className={styles.statLabel}>My Notes</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statNum}>{inProgress.length}</span>
            <span className={styles.statLabel}>In Progress</span>
          </div>
        </div>

        {/* Continue listening */}
        {inProgress.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Continue listening</h2>
            <div className={styles.continueList}>
              {inProgress.map((p) => (
                <Link
                  key={p.id}
                  href={`/${slug}/sessions/${p.audioSessionId}`}
                  className={styles.continueCard}
                >
                  <div className={styles.continueIcon}>▶</div>
                  <div className={styles.continueInfo}>
                    <span className={styles.continueTitle}>{p.audioSession.title}</span>
                    <span className={styles.continuePos}>
                      {formatDuration(p.positionSecs)} in
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Recent sessions */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Recent sessions</h2>
            <Link href={`/${slug}/sessions`} className={styles.viewAll}>
              View all →
            </Link>
          </div>
          <div className={styles.sessionList}>
            {recentSessions.map((s) => (
              <Link
                key={s.id}
                href={`/${slug}/sessions/${s.id}`}
                className={styles.sessionCard}
              >
                <div className={styles.sessionMeta}>
                  <span className={styles.sessionDate}>
                    {new Date(s.recordedAt).toLocaleDateString("en-IN", {
                      day: "numeric", month: "short", year: "numeric",
                    })}
                  </span>
                  <div className={styles.sessionBadges}>
                    {s.transcription && (
                      <span className={styles.badge}>Transcript</span>
                    )}
                    {s._count.notes > 0 && (
                      <span className={styles.badge}>{s._count.notes} notes</span>
                    )}
                  </div>
                </div>
                <h3 className={styles.sessionTitle}>{s.title}</h3>
                {s.description && (
                  <p className={styles.sessionDesc}>{s.description}</p>
                )}
                {s.durationSecs && (
                  <span className={styles.sessionDuration}>
                    {formatDuration(s.durationSecs)}
                  </span>
                )}
              </Link>
            ))}

            {recentSessions.length === 0 && (
              <p className={styles.empty}>No sessions published yet.</p>
            )}
          </div>
        </section>

      </div>
    </div>
  );
}

function formatDuration(secs: number): string {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}
