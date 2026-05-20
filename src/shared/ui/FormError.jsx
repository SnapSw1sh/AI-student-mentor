import styles from './FormError.module.css';

export function FormError({ message }) {
  if (!message) return <div className={styles.error} />;
  return <div className={styles.error}>{message}</div>;
}
