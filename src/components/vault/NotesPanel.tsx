"use client";
import { useState, useRef } from "react";
import { useToast, ToastContainer } from "@/lib/useToast";
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
  const { toasts, show } = useToast();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  async function handleAdd() {
    if (!draft.trim()) return;
    setSaving(true);

    // Optimistic add
    const tempId = `temp-${Date.now()}`;
    const optimistic: Note = {
      id: tempId,
      content: draft.trim(),
      timestampSecs: null,
      createdAt: new Date().toISOString(),
    };
    setNotes((prev) => [...prev, optimistic]);
    const savedDraft = draft;
    setDraft("");

    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, content: savedDraft.trim() }),
      });
      const data = await res.json();
      if (data.ok) {
        // Replace temp with real
        setNotes((prev) =>
          prev.map((n) => (n.id === tempId ? { ...data.data, createdAt: data.data.createdAt } : n))
        );
        show("Note saved", "success");
      } else {
        // Roll back
        setNotes((prev) => prev.filter((n) => n.id !== tempId));
        setDraft(savedDraft);
        show(data.error ?? "Could not save note", "error");
      }
    } catch {
      setNotes((prev) => prev.filter((n) => n.id !== tempId));
      setDraft(savedDraft);
      show("Network error", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleEdit(id: string) {
    if (!editContent.trim()) return;
    const original = notes.find((n) => n.id === id)?.content ?? "";

    // Optimistic update
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, content: editContent.trim() } : n))
    );
    setEditingId(null);

    try {
      const res = await fetch(`/api/notes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editContent.trim() }),
      });
      const data = await res.json();
      if (data.ok) {
        show("Note updated", "success");
      } else {
        setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, content: original } : n)));
        show("Could not update note", "error");
      }
    } catch {
      setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, content: original } : n)));
      show("Network error", "error");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this note?")) return;

    // Optimistic remove
    const removed = notes.find((n) => n.id === id);
    setNotes((prev) => prev.filter((n) => n.id !== id));
    show("Note deleted", "success");

    try {
      const res = await fetch(`/api/notes/${id}`, { method: "DELETE" });
      if (!res.ok && removed) {
        setNotes((prev) => [...prev, removed]);
        show("Could not delete note", "error");
      }
    } catch {
      if (removed) setNotes((prev) => [...prev, removed]);
      show("Network error", "error");
    }
  }

  return (
    <section className={styles.root}>
      <ToastContainer toasts={toasts} />
      <h2 className={styles.title}>My Notes</h2>

      {/* Add note */}
      <div className={styles.addArea}>
        <textarea
          ref={textareaRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Write a note about this session…"
          className={styles.textarea}
          rows={3}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleAdd();
          }}
        />
        <div className={styles.addFooter}>
          <span className={styles.hint}>⌘ + Enter to save</span>
          <button
            onClick={handleAdd}
            disabled={saving || !draft.trim()}
            className={`${styles.saveBtn} btn-press`}
          >
            {saving
              ? <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span className="spinner spinner-sm" />Saving…
              </span>
              : "Save note"}
          </button>
        </div>
      </div>

      {/* Notes list */}
      {notes.length > 0 ? (
        <ul className={`${styles.list} fade-up-children`}>
          {notes.map((note) => (
            <li key={note.id} className={`${styles.noteCard} ${note.id.startsWith("temp-") ? styles.noteOptimistic : ""}`}>
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
                    <button onClick={() => setEditingId(null)} className={styles.cancelBtn}>Cancel</button>
                    <button onClick={() => handleEdit(note.id)} className={`${styles.saveBtn} btn-press`}>Save</button>
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
                    {!note.id.startsWith("temp-") && (
                      <div className={styles.noteActions}>
                        <button onClick={() => { setEditingId(note.id); setEditContent(note.content); }} className={styles.actionBtn}>Edit</button>
                        <button onClick={() => handleDelete(note.id)} className={`${styles.actionBtn} ${styles.deleteBtn}`}>Delete</button>
                      </div>
                    )}
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