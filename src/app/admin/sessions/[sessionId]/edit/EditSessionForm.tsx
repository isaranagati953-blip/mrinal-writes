"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../../../admin.module.css";

type Props = {
  session: {
    id: string;
    title: string;
    description: string;
    recordedAt: string;
    tags: string;
    durationSecs: number;
    isPublished: boolean;
    transcription: string;
    transcriptVerified: boolean;
  };
};

export default function EditSessionForm({ session }: Props) {
  const router = useRouter();
  const [form, setForm] = useState(session);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  function set(key: string, val: string | boolean | number) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  async function handleSave() {
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch(`/api/admin/sessions/${session.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          recordedAt: form.recordedAt,
          tags: form.tags,
          durationSecs: Number(form.durationSecs),
          isPublished: form.isPublished,
          transcription: form.transcription || null,
          transcriptVerified: form.transcriptVerified,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setMsg({ type: "ok", text: "Saved successfully." });
        router.refresh();
      } else {
        setMsg({ type: "err", text: data.error ?? "Save failed." });
      }
    } catch {
      setMsg({ type: "err", text: "Network error." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={styles.form}>
      <div className={styles.field}>
        <label className={styles.label}>Title</label>
        <input
          className={styles.input}
          value={form.title}
          onChange={(e) => set("title", e.target.value)}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Description</label>
        <textarea
          className={styles.textarea}
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          rows={3}
          placeholder="Brief summary of this session…"
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div className={styles.field}>
          <label className={styles.label}>Recorded date</label>
          <input
            type="date"
            className={styles.input}
            value={form.recordedAt}
            onChange={(e) => set("recordedAt", e.target.value)}
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Duration (seconds)</label>
          <input
            type="number"
            className={styles.input}
            value={form.durationSecs}
            onChange={(e) => set("durationSecs", e.target.value)}
            min={0}
          />
        </div>
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Tags (comma-separated)</label>
        <input
          className={styles.input}
          value={form.tags}
          onChange={(e) => set("tags", e.target.value)}
          placeholder="bhakti, meditation, 2022"
        />
        <span className={styles.hint}>Used for filtering on the sessions page.</span>
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Transcription</label>
        <textarea
          className={styles.textarea}
          value={form.transcription}
          onChange={(e) => set("transcription", e.target.value)}
          rows={12}
          placeholder="Paste Whisper output or manual transcript here…"
        />
        <span className={styles.hint}>
          Leave blank if no transcript yet. Each paragraph on its own line.
        </span>
      </div>

      <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--vault-muted)", cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={form.transcriptVerified}
            onChange={(e) => set("transcriptVerified", e.target.checked)}
          />
          Mark transcript as verified
        </label>

        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--vault-muted)", cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={form.isPublished}
            onChange={(e) => set("isPublished", e.target.checked)}
          />
          Published (visible to members)
        </label>
      </div>

      {msg && (
        <p className={msg.type === "ok" ? styles.success : styles.error}>{msg.text}</p>
      )}

      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={handleSave} disabled={saving} className={styles.submitBtn}>
          {saving ? "Saving…" : "Save changes"}
        </button>
        <button
          onClick={() => router.push("/admin/sessions")}
          style={{ background: "transparent", border: "1px solid var(--vault-border)", color: "var(--vault-muted)", borderRadius: "var(--radius-sm)", padding: "12px 20px", fontSize: 14, cursor: "pointer" }}
        >
          ← Back
        </button>
      </div>
    </div>
  );
}
