"use client";
import { useState, useRef } from "react";
import Link from "next/link";
import styles from "../admin.module.css";

type Stage = "form" | "uploading" | "done" | "error";

export default function UploadPage() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [stage, setStage] = useState<Stage>("form");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "",
    description: "",
    recordedAt: "",
    tags: "",
  });

  function set(k: string, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function handleUpload() {
    const file = fileRef.current?.files?.[0];
    if (!file) { setError("Please choose an audio file."); return; }
    if (!form.title.trim()) { setError("Title is required."); return; }
    if (!form.recordedAt) { setError("Recorded date is required."); return; }

    setError("");
    setStage("uploading");
    setProgress(0);

    try {
      // 1. Get a pre-signed upload URL from our server
      const metaRes = await fetch("/api/admin/upload/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: file.name,
          mimeType: file.type || "audio/mpeg",
          fileSize: file.size,
          title: form.title.trim(),
          description: form.description.trim(),
          recordedAt: form.recordedAt,
          tags: form.tags.trim(),
        }),
      });

      const meta = await metaRes.json();
      if (!meta.ok) throw new Error(meta.error ?? "Failed to get upload URL");

      const { uploadUrl, sessionId } = meta.data;

      // 2. Upload directly to R2 using XMLHttpRequest (for progress tracking)
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) {
            setProgress(Math.round((e.loaded / e.total) * 100));
          }
        });
        xhr.addEventListener("load", () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve();
          else reject(new Error(`Upload failed: ${xhr.status}`));
        });
        xhr.addEventListener("error", () => reject(new Error("Upload failed")));
        xhr.open("PUT", uploadUrl);
        xhr.setRequestHeader("Content-Type", file.type || "audio/mpeg");
        xhr.send(file);
      });

      // 3. Confirm upload complete on server (saves to DB, sets duration etc.)
      await fetch("/api/admin/upload/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });

      setStage("done");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Upload failed.");
      setStage("error");
    }
  }

  if (stage === "done") {
    return (
      <div className={styles.root}>
        <div className={styles.inner}>
          <h1 className={styles.title}>Upload complete ✓</h1>
          <p className={styles.success}>
            Session saved. Go to Sessions to add a transcript and publish it.
          </p>
          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <Link href="/admin/sessions" className={styles.submitBtn} style={{ textDecoration: "none", display: "inline-block" }}>
              View sessions
            </Link>
            <button
              onClick={() => { setStage("form"); setForm({ title:"", description:"", recordedAt:"", tags:"" }); if (fileRef.current) fileRef.current.value = ""; }}
              style={{ background:"transparent", border:"1px solid #1e1e1e", color:"var(--vault-muted)", borderRadius:"var(--radius-sm)", padding:"12px 20px", fontSize:14, cursor:"pointer" }}
            >
              Upload another
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.root}>
      <div className={styles.inner}>
        <h1 className={styles.title}>Upload session</h1>

        <div className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label}>Audio file</label>
            <input
              ref={fileRef}
              type="file"
              accept="audio/*,.mp3,.m4a,.wav,.ogg,.aac"
              className={styles.input}
              disabled={stage === "uploading"}
            />
            <span className={styles.hint}>
              MP3, M4A, WAV, AAC supported. Large files upload directly to secure storage.
            </span>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Session title</label>
            <input
              className={styles.input}
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="e.g. Bhakti and surrender — morning session"
              disabled={stage === "uploading"}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Recorded date</label>
            <input
              type="date"
              className={styles.input}
              value={form.recordedAt}
              onChange={(e) => set("recordedAt", e.target.value)}
              disabled={stage === "uploading"}
            />
            <span className={styles.hint}>
              This controls which Year → Month folder it appears in.
            </span>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Description (optional)</label>
            <textarea
              className={styles.textarea}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              rows={3}
              placeholder="Brief summary of what was discussed…"
              disabled={stage === "uploading"}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Tags (optional, comma-separated)</label>
            <input
              className={styles.input}
              value={form.tags}
              onChange={(e) => set("tags", e.target.value)}
              placeholder="bhakti, meditation, Q&A"
              disabled={stage === "uploading"}
            />
          </div>

          {/* Progress bar */}
          {stage === "uploading" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ height: 4, background: "#1e1e1e", borderRadius: 2, overflow: "hidden" }}>
                <div
                  style={{
                    height: "100%",
                    width: `${progress}%`,
                    background: "var(--vault-accent)",
                    borderRadius: 2,
                    transition: "width 0.2s",
                  }}
                />
              </div>
              <span style={{ fontSize: 13, color: "var(--vault-muted)" }}>
                Uploading… {progress}%
              </span>
            </div>
          )}

          {(stage === "form" || stage === "error") && (
            <>
              {error && <p className={styles.error}>{error}</p>}
              <button
                onClick={handleUpload}
                className={styles.submitBtn}
              >
                Upload session
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
