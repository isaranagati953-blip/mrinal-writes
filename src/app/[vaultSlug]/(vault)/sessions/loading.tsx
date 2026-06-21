import styles from "./sessions.module.css";

export default function SessionsLoading() {
    return (
        <div className={styles.root}>
            <div className={styles.inner}>

                {/* Header */}
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <span className="skeleton" style={{ height: 28, width: 120, borderRadius: 6 }} />
                    <span className="skeleton" style={{ height: 14, width: 80, borderRadius: 4 }} />
                </div>

                {/* Search bar */}
                <div className={styles.searchRow}>
                    <span className="skeleton" style={{ flex: 1, height: 40, borderRadius: 6 }} />
                    <span className="skeleton" style={{ width: 80, height: 40, borderRadius: 6 }} />
                </div>

                {/* Year blocks */}
                {[1, 2].map((year) => (
                    <div key={year} style={{ border: "1px solid #1a1a1a", borderRadius: 8, overflow: "hidden" }}>
                        {/* Year header */}
                        <div style={{ padding: "16px 20px", background: "#1a1a1a", display: "flex", alignItems: "center", gap: 12 }}>
                            <span className="skeleton" style={{ height: 22, width: 60, borderRadius: 4 }} />
                            <span className="skeleton" style={{ height: 14, width: 80, borderRadius: 4 }} />
                        </div>

                        {/* Month + sessions */}
                        <div style={{ padding: "12px 20px 16px 28px", display: "flex", flexDirection: "column", gap: 12 }}>
                            <span className="skeleton" style={{ height: 14, width: 100, borderRadius: 4 }} />
                            {[1, 2, 3].map((s) => (
                                <div key={s} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0" }}>
                                    <span className="skeleton" style={{ width: 28, height: 28, borderRadius: "50%", flexShrink: 0 }} />
                                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 5 }}>
                                        <span className="skeleton" style={{ height: 15, width: `${55 + s * 10}%`, borderRadius: 4 }} />
                                        <span className="skeleton" style={{ height: 12, width: 60, borderRadius: 3 }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}