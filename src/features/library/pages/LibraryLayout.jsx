import { Outlet, useSearchParams } from 'react-router-dom';
import { LibrarySearchInput } from '../components/LibrarySearchInput';
import { LibrarySearchResults } from '../components/LibrarySearchResults';
import styles from './LibraryLayout.module.css';

export function LibraryLayout() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') ?? '';

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>
          <span className={styles.titleIcon} aria-hidden="true">
            📚
          </span>
          Библиотека
        </h1>
        <LibrarySearchInput />
      </div>

      {query.trim() ? <LibrarySearchResults query={query} /> : <Outlet />}
    </div>
  );
}
