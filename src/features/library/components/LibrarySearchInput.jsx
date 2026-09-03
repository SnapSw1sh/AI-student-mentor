import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SearchIcon } from '../../../shared/ui/icons';
import styles from './LibrarySearchInput.module.css';

const DEBOUNCE_MS = 250;

function commitQuery(setSearchParams, value) {
  setSearchParams(
    (prev) => {
      const next = new URLSearchParams(prev);
      const trimmed = value.trim();
      if (trimmed) next.set('q', trimmed);
      else next.delete('q');
      return next;
    },
    { replace: true },
  );
}

export function LibrarySearchInput() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [value, setValue] = useState(searchParams.get('q') ?? '');

  useEffect(() => {
    const timer = setTimeout(() => commitQuery(setSearchParams, value), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [value, setSearchParams]);

  const handleSubmit = (event) => {
    event.preventDefault();
    commitQuery(setSearchParams, value);
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.wrapper}>
        <SearchIcon className={styles.icon} />
        <input
          type="text"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Поиск по библиотеке"
          className={styles.input}
        />
        {value && (
          <button
            type="button"
            onClick={() => setValue('')}
            className={styles.clear}
            aria-label="Очистить поиск"
          >
            ×
          </button>
        )}
      </div>
      <button type="submit" className={styles.submit}>
        Искать
      </button>
    </form>
  );
}
