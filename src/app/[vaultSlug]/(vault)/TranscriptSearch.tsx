// components/vault/TranscriptSearch.tsx
"use client";

import { useState, useRef, useTransition } from "react";
import styles from "./TranscriptSearch.module.css";

interface Result {
    index: number;
    text: string;
}

interface Props {
    sessionId: string;
    vaultSlug: string;
    onJumpTo?: (paragraphIndex: number) => void;
}

export default function TranscriptSearch({ sessionId, vaultSlug, onJumpTo }: Props) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<Result[]>([]);
    const [searched, setSearched] = useState(false);
    const [isPending, startTransition] = useTransition();
    const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    const search = (q: string) => {
        clearTimeout(debounceRef.current);
        if (q.length < 2) { setResults([]); setSearched(false); return; }

        debounceRef.current = setTimeout(() => {
            startTransition(async () => {
                const res = await fetch(
                    `/api/vault/${vaultSlug}/sessions/${sessionId}/transcript-search?q=${encodeURIComponent(q)}`
                );
                const data = await res.json();
                setResults(data.results ?? []);
                setSearched(true);
            });
        }, 300);
    };

    const highlight = (text: string, q: string) => {
        if (!q) return text;
        const parts = text.split(new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi"));
        return parts.map((part, i) =>
            part.toLowerCase() === q.toLowerCase()
                ? <mark key={i} className={styles.mark}>{part}</mark>
                : part
        );
    };

    return (
        <div className={styles.root}>
            <div className={styles.inputWrap}>
                <svg className={styles.icon} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <circle cx="8.5" cy="8.5" r="5.5" />
                    <line x1="13" y1="13" x2="18" y2="18" />
                </svg>
                <input
                    className={styles.input}
                    type="search"
                    placeholder="Search transcript…"
                    value={query}
                    onChange={(e) => { setQuery(e.target.value); search(e.target.value); }}
                    aria-label="Search transcript"
                />
                {isPending && <span className={styles.spinner} />}
                {query && (
                    <button className={styles.clear} onClick={() => { setQuery(""); setResults([]); setSearched(false); }} aria-label="Clear">✕</button>
                )}
            </div>

            {searched && (
                <p className={styles.count}>
                    {results.length === 0
                        ? "No matches"
                        : `${results.length} passage${results.length !== 1 ? "s" : ""} found`}
                </p>
            )}

            {results.length > 0 && (
                <ul className={styles.list}>
                    {results.map(({ index, text }) => (
                        <li key={index} className={styles.item}>
                            <button
                                className={styles.passage}
                                onClick={() => onJumpTo?.(index)}
                                title="Jump to this passage in transcript"
                            >
                                {highlight(text, query)}
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}