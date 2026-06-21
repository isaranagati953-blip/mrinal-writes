import styles from "./session.module.css";

export default function SessionLoading() {
    return (
        <div className={styles.root}>
            <div className={styles.inner}>

                {/* Header */}
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <span className="skeleton" style={{ height: 13, width: 120, borderRadius: 4 }} />
                    <span className="skeleton" style={{ height: 28, width: "80%", borderRadius: 6 }} />
                    <span className="skeleton" style={{ height: 28, width: "55%", borderRadius: 6 }} />
                    <span className="skeleton" style={{ height: 16, width: "65%", borderRadius: 4 }} />
                </div>

                {/* Player */}
                <div style={{
                    background: "#1a1a1a",
                    border: "1px solid #2a2a2a",
                    borderRadius: 8,
                    padding: "24px 20px 20px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 16,
                }}>
                    {/* Progress bar */}
                    <span className="skeleton" style={{ height: 4, width: "100%", borderRadius: 2 }} />

                    {/* Time */}
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span className="skeleton" style={{ height: 12, width: 36, borderRadius: 3 }} />
                        <span className="skeleton" style={{ height: 12, width: 36, borderRadius: 3 }} />
                    </div>

                    {/* Controls */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 24 }}>
                        <span className="skeleton" style={{ width: 40, height: 36, borderRadius: 6 }} />
                        <span className="skeleton" style={{ width: 56, height: 56, borderRadius: "50%" }} />
                        <span className="skeleton" style={{ width: 40, height: 36, borderRadius: 6 }} />
                    </div>

                    {/* Speed + volume row */}
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", gap: 4 }}>
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <span key={i} className="skeleton" style={{ width: 32, height: 24, borderRadius: 4 }} />
                            ))}
                        </div>
                        <span className="skeleton" style={{ width: 100, height: 24, borderRadius: 4 }} />
                    </div>
                </div>

                {/* Transcript placeholder */}
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    <span className="skeleton" style={{ height: 13, width: 90, borderRadius: 4 }} />
                    <div style={{
                        background: "#1a1a1a", border: "1px solid #2a2a2a",
                        borderRadius: 8, padding: "24px",
                        display: "flex", flexDirection: "column", gap: 12
                    }}>
                        {[100, 85, 92, 78, 88, 65].map((w, i) => (
                            <span key={i} className="skeleton" style={{ height: 14, width: `${w}%`, borderRadius: 4 }} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}