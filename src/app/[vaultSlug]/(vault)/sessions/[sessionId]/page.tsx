import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import { getSignedStreamUrl } from "@/lib/r2";
import AudioPlayer from "@/components/vault/AudioPlayer";
import NotesPanel from "@/components/vault/NotesPanel";
import styles from "./session.module.css";

export default async function SessionPage({
  params,
}: {
  params: { vaultSlug: string; sessionId: string };
}) {
  const user = await getCurrentUser();
  if (!user) redirect(`/${params.vaultSlug}/enter`);

  const session = await db.audioSession.findUnique({
    where: { id: params.sessionId, isPublished: true },
    include: {
      transcription: true,
      notes: {
        where: { userId: user.id },
        orderBy: { createdAt: "asc" },
      },
      progress: {
        where: { userId: user.id },
      },
    },
  });

  if (!session) notFound();

  // Generate a signed streaming URL — expires in 2 hours
  const streamUrl = await getSignedStreamUrl(session.r2Key, 7200);

  // Log the play event for audit
  await db.auditLog.create({
    data: {
      action: "AUDIO_OPEN",
      userId: user.id,
      detail: JSON.stringify({ sessionId: session.id, title: session.title }),
    },
  });

  const resumeAt = session.progress[0]?.positionSecs ?? 0;

  return (
    <div className={styles.root}>
      <div className={styles.inner}>

        {/* Header */}
        <header className={styles.header}>
          <div className={styles.meta}>
            <span className={styles.date}>
              {new Date(session.recordedAt).toLocaleDateString("en-IN", {
                weekday: "long", day: "numeric",
                month: "long", year: "numeric",
              })}
            </span>
            {session.tags && (
              <div className={styles.tags}>
                {session.tags.split(",").map((t) => (
                  <span key={t} className={styles.tag}>{t.trim()}</span>
                ))}
              </div>
            )}
          </div>
          <h1 className={styles.title}>{session.title}</h1>
          {session.description && (
            <p className={styles.desc}>{session.description}</p>
          )}
        </header>

        {/* Audio player — client component */}
        <AudioPlayer
          sessionId={session.id}
          streamUrl={streamUrl}
          durationSecs={session.durationSecs ?? 0}
          resumeAt={resumeAt}
        />

        {/* Transcript + Notes in tabs */}
        <div className={styles.panels}>
          {session.transcription && (
            <section className={styles.transcriptSection}>
              <h2 className={styles.panelTitle}>Transcript</h2>
              <div className={styles.transcriptBody}>
                {session.transcription.content
                  .split("\n")
                  .filter(Boolean)
                  .map((para, i) => (
                    <p key={i} className={styles.transPara}>{para}</p>
                  ))}
              </div>
            </section>
          )}

          {/* Notes — client component handles create/edit/delete */}
          <NotesPanel
            sessionId={session.id}
            initialNotes={session.notes.map((n) => ({
              id: n.id,
              content: n.content,
              timestampSecs: n.timestampSecs,
              createdAt: n.createdAt.toISOString(),
            }))}
          />
        </div>

      </div>
    </div>
  );
}
