import styles from "./InfoTooltip.module.scss";
import { ReactNode } from "react";

interface InfoTooltipProps {
  content: ReactNode;
}

export default function InfoTooltip({ content }: InfoTooltipProps) {
  return (
    <div className={styles.tooltipContainer}>
      <svg
        className={styles.infoIcon}
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M8 0C3.6 0 0 3.6 0 8C0 12.4 3.6 16 8 16C12.4 16 16 12.4 16 8C16 3.6 12.4 0 8 0ZM9 12H7V7H9V12ZM8 6C7.4 6 7 5.6 7 5C7 4.4 7.4 4 8 4C8.6 4 9 4.4 9 5C9 5.6 8.6 6 8 6Z"
          fill="currentColor"
        />
      </svg>
      <div className={styles.tooltip}>{content}</div>
    </div>
  );
}
