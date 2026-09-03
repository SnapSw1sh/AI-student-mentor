import styles from './LibraryStatusMessage.module.css';

export function LibraryStatusMessage({ status, error, onRetry, loadingText }) {
  if (status === 'loading') {
    return <p className={styles.text}>{loadingText}</p>;
  }

  if (status === 'error') {
    return (
      <div className={styles.errorBlock}>
        <p className={styles.errorText}>
          {error?.message || 'Не удалось загрузить данные. Попробуйте ещё раз.'}
        </p>
        {onRetry && (
          <button type="button" onClick={onRetry} className={styles.retryBtn}>
            Повторить
          </button>
        )}
      </div>
    );
  }

  return null;
}
