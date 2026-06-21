import styles from "./dashboard.module.css";
import skeletonStyles from "./dashboard-skeleton.module.css";

export default function DashboardLoading() {
    return (
        <div className={styles.root}>
            <div className={styles.inner}>

                {/* Greeting skeleton */}
                <div className={skeletonStyles.headerGroup}>
                    <span className={`skeleton ${skeletonStyles.titleSkel}`} />
                    <span className={`skeleton ${skeletonStyles.dateSkel}`} />
                </div>

                {/* Stats */}
                <div className={styles.stats}>
                    {[1, 2, 3].map((i) => (
                        <div key={i} className={`${styles.statCard} ${skeletonStyles.statCard}`}>
                            <span className={`skeleton ${skeletonStyles.statNum}`} />
                            <span className={`skeleton ${skeletonStyles.statLabel}`} />
                        </div>
                    ))}
                </div>

                {/* Session cards */}
                <div className={styles.section}>
                    <span className={`skeleton ${skeletonStyles.sectionTitle}`} />
                    <div className={styles.sessionList}>
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className={`${styles.sessionCard} ${skeletonStyles.card}`}>
                                <span className={`skeleton ${skeletonStyles.cardDate}`} />
                                <span className={`skeleton ${skeletonStyles.cardTitle}`} />
                                <span className={`skeleton ${skeletonStyles.cardDesc}`} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}