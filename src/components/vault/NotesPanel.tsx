"use client";
import { useState } from "react";
import styles from "./NotesPanel.module.css";

type Note = {
  id: string;
  content: string;
  timestampSecs: number | null;
  createdAt: string;
};

type Props = {
  sessionId: string;
  initialNotes: Note[];
};

export default function NotesPanel({ sessionId, initialNotes }: Props) {
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [error, setError] = useState("");

  async function handleAdd() {
    if (!draft.trim()) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, content: draft.trim() }),
      });
      const data = await res.json();
      if (data.ok) {
        setNotes((prev) => [...prev, data.data]);
        setDraft("");
      } else {
        setError(data.error ?? "Could not save note.");
      }
    } catch {
      setError("Network error.");
    } finally {
      setSaving(false);
    }
  }

  async function handleEdit(id: string) {
    if (!editContent.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/notes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editContent.trim() }),
      });
      const data = await res.json();
      if (data.ok) {
        setNotes((prev) =>
          prev.map((n) => (n.id === id ? { ...n, content: editContent.trim() } : n))
        );
        setEditingId(null);
      }
    } catch { /* silent */ }
    finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this note?")) return;
    try {
      await fetch(`/api/notes/${id}`, { method: "DELETE" });
      setNotes((prev) => prev.filter((n) => n.id !== id));
    } catch { /* silent */ }
  }

  return (
    <section className={styles.root}>
      <h2 className={styles.title}>My Notes</h2>

      {/* Add note */}
      <div className={styles.addArea}>
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Write a note about this session…"
          className={styles.textarea}
          rows={3}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleAdd();
          }}
        />
        {error && <p className={styles.error}>{error}</p>}
        <div className={styles.addFooter}>
          <span className={styles.hint}>⌘ + Enter to save</span>
          <button
            onClick={handleAdd}
            disabled={saving || !draft.trim()}
            className={styles.saveBtn}
          >
            {saving ? "Saving…" : "Save note"}
          </button>
        </div>
      </div>

      {/* Notes list */}
      {notes.length > 0 ? (
        <ul className={styles.list}>
          {notes.map((note) => (
            <li key={note.id} className={styles.noteCard}>
              {editingId === note.id ? (
                <div className={styles.editArea}>
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className={styles.textarea}
                    rows={3}
                    autoFocus
                  />
                  <div className={styles.editActions}>
                    <button
                      onClick={() => setEditingId(null)}
                      className={styles.cancelBtn}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleEdit(note.id)}
                      disabled={saving}
                      className={styles.saveBtn}
                    >
                      {saving ? "Saving…" : "Save"}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className={styles.noteContent}>{note.content}</p>
                  <div className={styles.noteMeta}>
                    <span className={styles.noteDate}>
                      {new Date(note.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric", month: "short", year: "numeric",
                      })}
                    </span>
                    <div className={styles.noteActions}>
                      <button
                        onClick={() => {
                          setEditingId(note.id);
                          setEditContent(note.content);
                        }}
                        className={styles.actionBtn}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(note.id)}
                        className={`${styles.actionBtn} ${styles.deleteBtn}`}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className={styles.empty}>No notes yet. Start writing above.</p>
      )}
    </section>
  );
}
