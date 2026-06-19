import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import styles from "./notes.module.css";

export const dynamic = "force-dynamic";

export default async function MyNotesPage({
  params,
}: {
  params: Promise<{ vaultSlug: string }>;
}) {
  const { vaultSlug } = await params;
  const user = await getCurrentUser();
  if (!user) redirect(`/${vaultSlug}/enter`);

  const notes = await db.note.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      audioSession: { select: { id: true, title: true, recordedAt: true } },
    },
  });

  const slug = vaultSlug;

  // Group by session
  const grouped = notes.reduce<Record<string, typeof notes>>((acc, note) => {
    const key = note.audioSessionId;
    if (!acc[key]) acc[key] = [];
    acc[key].push(note);
    return acc;
  }, {});

  return (
    <div className={styles.root}>
      <div className={styles.inner}>
        <header className={styles.header}>
          <h1 className={styles.title}>My Notes</h1>
          <p className={styles.subtitle}>{notes.length} notes across {Object.keys(grouped).length} sessions</p>
        </header>

        {Object.entries(grouped).length === 0 && (
          <p className={styles.empty}>
            You haven&apos;t written any notes yet. Open a session to start.
          </p>
        )}

        {Object.entries(grouped).map(([sessionId, sessionNotes]) => {
          const session = sessionNotes[0].audioSession;
          return (
            <section key={sessionId} className={styles.group}>
              <Link
                href={`/${slug}/sessions/${sessionId}`}
                className={styles.groupHeader}
              >
                <span className={styles.groupDate}>
                  {new Date(session.recordedAt).toLocaleDateString("en-IN", {
                    day: "numeric", month: "short", year: "numeric",
                  })}
                </span>
                <h2 className={styles.groupTitle}>{session.title} →</h2>
              </Link>

              <ul className={styles.noteList}>
                {sessionNotes.map((note) => (
                  <li key={note.id} className={styles.noteCard}>
                    <p className={styles.noteContent}>{note.content}</p>
                    <span className={styles.noteDate}>
                      {new Date(note.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric", month: "short",
                        hour: "2-digit", minute: "2-digit",
                      })}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
