"use client";
import { useState } from "react";
import Link from "next/link";
import styles from "./SessionsBrowser.module.css";

type Session = {
  id: string; title: string; description: string | null;
  recordedAt: string; durationSecs: number | null;
  isPublished: boolean; tags: string | null;
  hasTranscript: boolean;
  progress: { positionSecs: number; completedAt: string | null } | null;
};

type Props = { sessions: Session[]; vaultSlug: string; };

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

function fmt(secs: number) {
  const h = Math.floor(secs / 3600), m = Math.floor((secs % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export default function SessionsBrowser({ sessions, vaultSlug }: Props) {
  // Build year→month tree
  const tree: Record<number, Record<number, Session[]>> = {};
  for (const s of sessions) {
    const d = new Date(s.recordedAt);
    const y = d.getFullYear(), m = d.getMonth();
    if (!tree[y]) tree[y] = {};
    if (!tree[y][m]) tree[y][m] = [];
    tree[y][m].push(s);
  }

  const years = Object.keys(tree).map(Number).sort((a, b) => b - a);
  const [openYears, setOpenYears] = useState<Record<number, boolean>>(
    Object.fromEntries(years.map((y, i) => [y, i === 0])) // first year open by default
  );
  const [openMonths, setOpenMonths] = useState<Record<string, boolean>>({});

  function toggleYear(y: number) {
    setOpenYears((p) => ({ ...p, [y]: !p[y] }));
  }
  function toggleMonth(key: string) {
    setOpenMonths((p) => ({ ...p, [key]: !p[key] }));
  }

  return (
    <div className={styles.root}>
      {years.map((year) => {
        const yOpen = openYears[year];
        const months = Object.keys(tree[year]).map(Number).sort((a, b) => b - a);
        const totalInYear = months.reduce((acc, m) => acc + tree[year][m].length, 0);

        return (
          <div key={year} className={styles.yearBlock}>
            <button className={styles.yearHeader} onClick={() => toggleYear(year)}>
              <span className={styles.yearTitle}>{year}</span>
              <span className={styles.yearMeta}>{totalInYear} sessions</span>
              <span className={styles.chevron}>{yOpen ? "▾" : "▸"}</span>
            </button>

            {yOpen && (
              <div className={styles.monthsContainer}>
                {months.map((month) => {
                  const key = `${year}-${month}`;
                  const mOpen = openMonths[key] ?? true;
                  const mSessions = tree[year][month];

                  return (
                    <div key={month} className={styles.monthBlock}>
                      <button className={styles.monthHeader} onClick={() => toggleMonth(key)}>
                        <span className={styles.monthDot} />
                        <span className={styles.monthTitle}>{MONTHS[month]}</span>
                        <span className={styles.monthCount}>{mSessions.length}</span>
                        <span className={styles.chevronSm}>{mOpen ? "▾" : "▸"}</span>
                      </button>

                      {mOpen && (
                        <div className={styles.sessionList}>
                          {mSessions.map((s) => {
                            const prog = s.progress;
                            const pct = prog && s.durationSecs
                              ? Math.min(100, Math.round((prog.positionSecs / s.durationSecs) * 100))
                              : 0;
                            const done = !!prog?.completedAt;

                            return (
                              <Link
                                key={s.id}
                                href={`/${vaultSlug}/sessions/${s.id}`}
                                className={styles.sessionCard}
                              >
                                {pct > 0 && (
                                  <div className={styles.progressBar}>
                                    <div className={styles.progressFill} style={{ width: `${pct}%` }} />
                                  </div>
                                )}

                                <div className={styles.cardInner}>
                                  <div className={styles.cardLeft}>
                                    <div className={styles.playDot}>
                                      {done ? <span className={styles.doneIcon}>✓</span> : <span className={styles.playIcon}>▶</span>}
                                    </div>
                                    <div className={styles.cardInfo}>
                                      <span className={styles.cardTitle}>{s.title}</span>
                                      {s.description && (
                                        <span className={styles.cardDesc}>{s.description}</span>
                                      )}
                                      <div className={styles.cardMeta}>
                                        {s.durationSecs && <span className={styles.metaItem}>{fmt(s.durationSecs)}</span>}
                                        {s.hasTranscript && <span className={styles.metaItem}>Transcript</span>}
                                        {pct > 0 && !done && <span className={styles.metaItem}>{pct}% listened</span>}
                                        {done && <span className={`${styles.metaItem} ${styles.metaDone}`}>Completed</span>}
                                      </div>
                                    </div>
                                  </div>
                                  <span className={styles.cardDate}>
                                    {new Date(s.recordedAt).toLocaleDateString("en-IN", { day:"numeric", month:"short" })}
                                  </span>
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
