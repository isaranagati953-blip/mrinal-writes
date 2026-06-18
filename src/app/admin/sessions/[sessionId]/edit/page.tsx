import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import EditSessionForm from "./EditSessionForm";
import styles from "../../admin.module.css";

export default async function EditSessionPage({
  params,
}: { params: { sessionId: string } }) {
  const session = await db.audioSession.findUnique({
    where: { id: params.sessionId },
    include: { transcription: true },
  });

  if (!session) notFound();

  return (
    <div className={styles.root}>
      <div className={styles.inner}>
        <h1 className={styles.title}>Edit session</h1>
        <EditSessionForm
          session={{
            id: session.id,
            title: session.title,
            description: session.description ?? "",
            recordedAt: session.recordedAt.toISOString().split("T")[0],
            tags: session.tags ?? "",
            durationSecs: session.durationSecs ?? 0,
            isPublished: session.isPublished,
            transcription: session.transcription?.content ?? "",
            transcriptVerified: session.transcription?.isVerified ?? false,
          }}
        />
      </div>
    </div>
  );
}
