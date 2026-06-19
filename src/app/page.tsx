import type { Metadata } from "next";
import styles from "./home.module.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Mrinal Writes",
  description: "The world of Mrinal - learning web development one div at a time.",
  robots: { index: true, follow: true },
};

export default function HomePage() {
  return (
    <main className={styles.root}>
      <div className={styles.container}>

        {/* Header */}
        <header className={styles.header}>
          <div className={styles.avatar}>MW</div>
          <div>
            <h1 className={styles.name}>Mrinal</h1>
            <p className={styles.tagline}>Class 12 Student · Web Dev Explorer</p>
          </div>
        </header>

        {/* About */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Welcome to my World! 🌍</h2>
          <p className={styles.bio}>
            Hey there! I'm Mrinal, a 12th grader who recently stumbled into the fascinating world of web development. 
            Before this, my screen time was mostly games and YouTube, but now I'm obsessed with figuring out how the web actually works!
          </p>
          <p className={styles.bio}>
            I built this static website completely from scratch to practice the things I'm learning. 
            No WordPress or site builders—just me, a code editor, and a whole lot of trial and error (and Googling errors late at night 😅).
          </p>
          <p className={styles.bio}>
            I even managed to deploy this entirely by myself on Vercel! Seeing my code go live on the actual internet was one of the coolest feelings ever.
          </p>
        </section>

        {/* Learning log section */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>My Learning Log</h2>
          <ul className={styles.postList}>
            <li className={styles.postItem}>
              <span className={styles.postDate}>Recently</span>
              <span className={styles.postTitle}>Figured out how to deploy to Vercel!</span>
            </li>
            <li className={styles.postItem}>
              <span className={styles.postDate}>Recently</span>
              <span className={styles.postTitle}>Understanding how Next.js routing works</span>
            </li>
            <li className={styles.postItem}>
              <span className={styles.postDate}>A while ago</span>
              <span className={styles.postTitle}>Writing my first "Hello World" in React</span>
            </li>
          </ul>
          <p className={styles.muted}>More updates coming as I keep exploring...</p>
        </section>

        {/* Footer */}
        <footer className={styles.footer}>
          <p>© {new Date().getFullYear()} Mrinal. Built while learning.</p>
        </footer>

      </div>
    </main>
  );
}
