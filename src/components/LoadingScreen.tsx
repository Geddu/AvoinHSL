"use client";

import styles from "./LoadingScreen.module.scss";

export default function LoadingScreen() {
  return (
    <div className={styles.loadingScreen}>
      <div className={styles.content}>
        <div className={styles.tramTrack}>
          <div className={styles.tram}>🚋</div>
        </div>
        <h2>Welcome to</h2>
        <h1 className={styles.title}>HSL Stop Inspector</h1>
      </div>
    </div>
  );
}
