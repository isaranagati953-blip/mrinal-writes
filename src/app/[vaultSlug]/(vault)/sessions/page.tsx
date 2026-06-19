import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import SessionsBrowser from "@/components/vault/SessionsBrowser";
import styles from "./sessions.module.css";

export const dynamic = "force-dynamic";

export default async function SessionsPage({
  params,
  searchParams,
}: {
  params: Promise<{ vaultSlug: string }>;
  searchParams: Promise<{ q?: string; tag?: string }>;
}) {
  const [{ vaultSlug }, filters] = await Promise.all([params, searchParams]);
  const user = await getCurrentUser();
  if (!user) redirect(`/${vaultSlug}/enter`);

  const { q, tag } = filters;

  const sessions = await db.audioSession.findMany({
    where: {
      isPublished: true,
      ...(q   ? { title: { contains: q } }   : {}),
      ...(tag ? { tags:  { contains: tag } }  : {}),
    },
    orderBy: [{ recordedAt: "asc" }, { sortOrder: "asc" }],
    include: {
      transcription: { select: { id: true } },
      progress: {
        where: { userId: user.id },
        select: { positionSecs: true, completedAt: true },
      },
    },
  });

  // All unique tags for filter chips
  const allTags = Array.from(
    new Set(
      sessions
        .flatMap((s) => (s.tags ? s.tags.split(",").map((t) => t.trim()) : []))
        .filter(Boolean)
    )
  );

  const slug = vaultSlug;

  return (
    <div className={styles.root}>
      <div className={styles.inner}>
        <header className={styles.header}>
          <h1 className={styles.title}>Sessions</h1>
          <p className={styles.subtitle}>{sessions.length} recordings</p>
        </header>

        {/* Search */}
        <form method="GET" className={styles.searchRow}>
          <input
            name="q"
            defaultValue={q ?? ""}
            placeholder="Search sessions…"
            className={styles.searchInput}
          />
          <button type="submit" className={styles.searchBtn}>Search</button>
          {(q || tag) && (
            <a href={`/${slug}/sessions`} className={styles.clearBtn}>Clear</a>
          )}
        </form>

        {/* Tag chips */}
        {allTags.length > 0 && (
          <div className={styles.tags}>
            {allTags.map((t) => (
              <a
                key={t}
                href={`/${slug}/sessions?tag=${encodeURIComponent(t)}`}
                className={`${styles.tag} ${tag === t ? styles.tagActive : ""}`}
              >
                {t}
              </a>
            ))}
          </div>
        )}

        {/* Year → Month → Sessions tree */}
        {sessions.length === 0 ? (
          <div className={styles.empty}>
            <p>No sessions found.</p>
          </div>
        ) : (
          <SessionsBrowser
            vaultSlug={slug}
            sessions={sessions.map((s) => ({
              id:           s.id,
              title:        s.title,
              description:  s.description,
              recordedAt:   s.recordedAt.toISOString(),
              durationSecs: s.durationSecs,
              isPublished:  s.isPublished,
              tags:         s.tags,
              hasTranscript: !!s.transcription,
              progress: s.progress[0]
                ? {
                    positionSecs: s.progress[0].positionSecs,
                    completedAt:  s.progress[0].completedAt?.toISOString() ?? null,
                  }
                : null,
            }))}
          />
        )}
      </div>
    </div>
  );
}
