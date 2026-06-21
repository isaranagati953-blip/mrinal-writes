import styles from "../admin.module.css";

export default function AdminSessionsLoading() {
    return (
        <div className={styles.root}>
            <div className={styles.inner}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span className="skeleton" style={{ height: 28, width: 120, borderRadius: 6 }} />
                    <span className="skeleton" style={{ height: 36, width: 110, borderRadius: 6 }} />
                </div>

                {[1, 2].map((year) => (
                    <div key={year} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                        <span className="skeleton" style={{ height: 24, width: 60, borderRadius: 6 }} />
                        <div style={{ paddingLeft: 16, borderLeft: "2px solid #1e1e1e", display: "flex", flexDirection: "column", gap: 8 }}>
                            <span className="skeleton" style={{ height: 14, width: 90, borderRadius: 4 }} />
                            {[1, 2, 3].map((s) => (
                                <div key={s} style={{
                                    background: "#111", border: "1px solid #1a1a1a",
                                    borderRadius: 6, padding: "12px 14px",
                                    display: "flex", alignItems: "center", gap: 12,
                                }}>
                                    <span className="skeleton" style={{ width: 7, height: 7, borderRadius: "50%", flexShrink: 0 }} />
                                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 5 }}>
                                        <span className="skeleton" style={{ height: 14, width: `${50 + s * 12}%`, borderRadius: 4 }} />
                                        <span className="skeleton" style={{ height: 11, width: 80, borderRadius: 3 }} />
                                    </div>
                                    <div style={{ display: "flex", gap: 6 }}>
                                        {[1, 2, 3].map((b) => (
                                            <span key={b} className="skeleton" style={{ height: 26, width: 66, borderRadius: 4 }} />
                                        ))}
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