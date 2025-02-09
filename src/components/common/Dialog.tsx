import { useEffect, useRef } from "react";
import styles from "./Dialog.module.scss";

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title: string;
}

export default function Dialog({
  isOpen,
  onClose,
  children,
  title,
}: DialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [isOpen]);

  return (
    <dialog ref={dialogRef} className={styles.dialog} onClose={onClose}>
      <div className={styles.header}>
        <h2>{title}</h2>
        <button onClick={onClose} className={styles.closeButton}>
          ×
        </button>
      </div>
      <div className={styles.content}>{children}</div>
    </dialog>
  );
}
