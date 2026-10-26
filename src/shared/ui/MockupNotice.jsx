import { InfoIcon } from './icons';
import styles from './MockupNotice.module.css';

// Плашка для разделов-макетов: показывает интерфейс будущего раздела и честно
// предупреждает, что данные в нём условные и ничего не сохраняется.
export function MockupNotice({ children }) {
  return (
    <p className={styles.notice}>
      <InfoIcon className={styles.icon} />
      <span>{children}</span>
    </p>
  );
}
