import type { Metadata } from "next";
import styles from "./home.module.css";

export const metadata: Metadata = {
  title: "Arjun Sharma",
  description: "Reader, learner, occasional writer. Based in India.",
  robots: { index: false, follow: false },
};

export default function HomePage() {
  return (
    <main className={styles.root}>
      <div className={styles.container}>

        {/* Header */}
        <header className={styles.header}>
          <div className={styles.avatar}>AS</div>
          <div>
            <h1 className={styles.name}>Arjun Sharma</h1>
            <p className={styles.tagline}>Reader · Learner · Occasional writer</p>
          </div>
        </header>

        {/* About */}
        <section className={styles.section}>
          <p className={styles.bio}>
            I spend most of my time reading, thinking, and trying to understand
            things a little better than I did yesterday. Interested in philosophy,
            the nature of mind, and how we actually go about living well.
          </p>
          <p className={styles.bio}>
            This is a quiet corner of the internet. Not updated very often.
          </p>
        </section>

        {/* Sparse "writing" section - gives the site a reason to exist */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Notes</h2>
          <ul className={styles.postList}>
            <li className={styles.postItem}>
              <span className={styles.postDate}>Mar 2024</span>
              <span className={styles.postTitle}>On the difficulty of paying attention</span>
            </li>
            <li className={styles.postItem}>
              <span className={styles.postDate}>Nov 2023</span>
              <span className={styles.postTitle}>What reading slowly taught me</span>
            </li>
            <li className={styles.postItem}>
              <span className={styles.postDate}>Jun 2023</span>
              <span className={styles.postTitle}>A few thoughts on consistency</span>
            </li>
          </ul>
          <p className={styles.muted}>More someday, perhaps.</p>
        </section>

        {/* Footer */}
        <footer className={styles.footer}>
          <p>© {new Date().getFullYear()}</p>
        </footer>

      </div>
    </main>
  );
}
