import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useLibrary } from '../hooks/useLibrary';
import { searchLibraryTree } from '../lib/searchLibraryTree';
import { renderTopicIcon } from '../lib/topicIcons';
import { renderDocumentIcon } from '../lib/documentIcons';
import { LibraryEmptyState } from './LibraryEmptyState';
import { LibraryStatusMessage } from './LibraryStatusMessage';
import styles from './LibrarySearchResults.module.css';

export function LibrarySearchResults({ query }) {
  const { tree, status, error, refetch } = useLibrary();
  const [, setSearchParams] = useSearchParams();

  const results = useMemo(
    () => (status === 'success' ? searchLibraryTree(tree, query) : []),
    [tree, status, query],
  );

  if (status !== 'success') {
    return (
      <LibraryStatusMessage
        status={status}
        error={error}
        onRetry={refetch}
        loadingText="Дождитесь загрузки библиотеки…"
      />
    );
  }

  if (results.length === 0) {
    return <LibraryEmptyState message={`Ничего не найдено по запросу «${query}».`} />;
  }

  const handleSelect = () => setSearchParams({}, { replace: true });

  return (
    <div className={styles.list}>
      {results.map((result) => {
        const to =
          result.type === 'topic'
            ? `/library/topics/${result.id}`
            : `/library/documents/${result.id}`;

        return (
          <Link
            key={`${result.type}-${result.id}`}
            to={to}
            onClick={handleSelect}
            className={styles.item}
          >
            {result.type === 'topic'
              ? renderTopicIcon(result.title, styles.icon)
              : renderDocumentIcon(null, styles.icon)}
            <span className={styles.body}>
              <span className={styles.title}>{result.title}</span>
              {result.path.length > 0 && (
                <span className={styles.path}>{result.path.map((item) => item.name).join(' / ')}</span>
              )}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
