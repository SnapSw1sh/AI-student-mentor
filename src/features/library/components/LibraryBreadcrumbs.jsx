import { Link } from 'react-router-dom';
import { ChevronDownIcon } from '../../../shared/ui/icons';
import styles from './LibraryBreadcrumbs.module.css';

export function LibraryBreadcrumbs({ path, showRoot = true }) {
  return (
    <nav className={styles.breadcrumbs} aria-label="Хлебные крошки">
      {showRoot && (
        <Link to="/library" className={styles.link}>
          Библиотека
        </Link>
      )}
      {path.map((item, index) => (
        <span key={item.id} className={styles.segment}>
          {(showRoot || index > 0) && <ChevronDownIcon className={styles.separator} />}
          <Link to={`/library/topics/${item.id}`} className={styles.link}>
            {item.name}
          </Link>
        </span>
      ))}
    </nav>
  );
}
