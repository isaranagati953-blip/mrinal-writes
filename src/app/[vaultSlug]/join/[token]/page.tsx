"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import styles from "./join.module.css";

export default function JoinPage() {
  const router = useRouter();
  const params = useParams();
  const token = params.token as string;
  const vaultSlug = params.vaultSlug as string;

  const [inviteData, setInviteData] = useState<{ name: string; email: string } | null>(null);
  const [inviteError, setInviteError] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Validate the invite token on mount
  useEffect(() => {
    fetch(`/api/auth/invite/${token}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.ok) setInviteData(data.data);
        else setInviteError(data.error);
      })
      .catch(() => setInviteError("Could not verify invitation."));
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 12) {
      setError("Password must be at least 12 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password, confirmPassword }),
      });

      const data = await res.json();
      if (!data.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }

      router.push(`/${vaultSlug}/dashboard`);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (inviteError) {
    return (
      <div className={styles.root}>
        <div className={styles.card}>
          <div className={styles.symbol}>॥</div>
          <p className={styles.invalidMsg}>{inviteError}</p>
        </div>
      </div>
    );
  }

  if (!inviteData) {
    return (
      <div className={styles.root}>
        <div className={styles.card}>
          <div className={styles.symbol}>॥</div>
          <p className={styles.loading}>Verifying invitation…</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.root}>
      <div className={styles.card}>
        <div className={styles.symbol}>॥</div>
        <h1 className={styles.heading}>Set up your access</h1>
        <p className={styles.sub}>
          Welcome, {inviteData.name}. Choose a strong password to continue.
        </p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label}>Email</label>
            <div className={styles.emailDisplay}>{inviteData.email}</div>
          </div>

          <div className={styles.field}>
            <label htmlFor="password" className={styles.label}>Password</label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={12}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
              placeholder="At least 12 characters"
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="confirm" className={styles.label}>Confirm Password</label>
            <input
              id="confirm"
              type="password"
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={styles.input}
              placeholder="Repeat password"
            />
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <button type="submit" disabled={loading} className={styles.btn}>
            {loading ? "Creating access…" : "Complete setup"}
          </button>
        </form>
      </div>
    </div>
  );
}
