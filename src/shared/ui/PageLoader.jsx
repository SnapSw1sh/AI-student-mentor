import { useEffect, useState } from 'react';
import styles from './PageLoader.module.css';

// Показ раздела, который ещё загружается. Появляется с задержкой: на быстром соединении
// раздел приходит раньше, и вместо мигания надписи страница просто открывается.
const SHOW_AFTER_MS = 500;

export function PageLoader() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), SHOW_AFTER_MS);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;
  return (
    <div className={styles.loader} role="status">
      <span className={styles.spinner} aria-hidden="true" />
      Загрузка…
    </div>
  );
}
