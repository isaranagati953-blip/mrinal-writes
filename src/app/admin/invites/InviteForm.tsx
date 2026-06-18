"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../admin.module.css";

export default function InviteForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  async function handleSend() {
    if (!name.trim() || !email.trim()) {
      setMsg({ type: "err", text: "Name and email are required." });
      return;
    }
    setSending(true);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/invites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim() }),
      });
      const data = await res.json();
      if (data.ok) {
        setMsg({ type: "ok", text: `Invite sent to ${email}.` });
        setName(""); setEmail("");
        router.refresh();
      } else {
        setMsg({ type: "err", text: data.error ?? "Failed to send invite." });
      }
    } catch {
      setMsg({ type: "err", text: "Network error." });
    } finally {
      setSending(false);
    }
  }

  return (
    <div className={styles.form} style={{ maxWidth: 480 }}>
      <div className={styles.field}>
        <label className={styles.label}>Full name</label>
        <input
          className={styles.input}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Priya Sharma"
        />
      </div>
      <div className={styles.field}>
        <label className={styles.label}>Email address</label>
        <input
          type="email"
          className={styles.input}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="priya@example.com"
        />
        <span className={styles.hint}>
          They will receive a private invite link valid for 72 hours.
        </span>
      </div>
      {msg && <p className={msg.type === "ok" ? styles.success : styles.error}>{msg.text}</p>}
      <button onClick={handleSend} disabled={sending} className={styles.submitBtn}>
        {sending ? "Sending…" : "Send invite"}
      </button>
    </div>
  );
}
