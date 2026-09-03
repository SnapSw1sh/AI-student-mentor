import styles from './LibraryEmptyState.module.css';

export function LibraryEmptyState({ message }) {
  return <p className={styles.empty}>{message}</p>;
}
