import styles from "./not-found.module.css";

export default function NotFound() {
  return (
    <div className={styles.root}>
      <h1 className={styles.code}>404</h1>
      <p className={styles.msg}>Page not found.</p>
      <a href="/" className={styles.link}>Go home</a>
    </div>
  );
}
