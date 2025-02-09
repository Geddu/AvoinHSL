import styles from "./LoadingCard.module.scss";

interface LoadingCardProps {
  lines?: number;
}

export default function LoadingCard({ lines = 3 }: LoadingCardProps) {
  return (
    <div className={styles.loadingCard}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`loading-pulse ${styles.line}`}
          style={{ width: `${Math.random() * 30 + 70}%` }}
        />
      ))}
    </div>
  );
}
