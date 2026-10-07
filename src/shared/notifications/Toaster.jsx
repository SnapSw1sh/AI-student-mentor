import { useEffect, useRef, useState } from 'react';
import { CloseIcon } from '../ui/icons';
import styles from './Toaster.module.css';

const DURATION = { error: 8000, success: 5000, info: 5000 };

const TYPE_CLASS = {
  error: styles.error,
  success: styles.success,
  info: styles.info,
};

export function Toaster({ toasts, onDismiss }) {
  return (
    <div className={styles.stack}>
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onDismiss={() => onDismiss(toast.id)} />
      ))}
    </div>
  );
}

// Таймер замирает, пока на уведомление наведён курсор или в нём фокус: иначе длинный текст
// исчезал бы посреди чтения.
function Toast({ toast, onDismiss }) {
  const [paused, setPaused] = useState(false);
  const remaining = useRef(DURATION[toast.type] ?? 5000);
  const dismissRef = useRef(onDismiss);

  useEffect(() => {
    dismissRef.current = onDismiss;
  });

  useEffect(() => {
    if (paused) return undefined;
    const startedAt = Date.now();
    const timer = setTimeout(() => dismissRef.current(), remaining.current);
    return () => {
      clearTimeout(timer);
      remaining.current -= Date.now() - startedAt;
    };
  }, [paused]);

  return (
    <div
      className={`${styles.toast} ${TYPE_CLASS[toast.type] ?? ''}`.trim()}
      role={toast.type === 'error' ? 'alert' : 'status'}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className={styles.body}>
        <p className={styles.title}>{toast.title}</p>
        {toast.text && <p className={styles.text}>{toast.text}</p>}
      </div>
      <button type="button" className={styles.close} onClick={onDismiss} aria-label="Закрыть уведомление">
        <CloseIcon className={styles.closeIcon} />
      </button>
    </div>
  );
}
