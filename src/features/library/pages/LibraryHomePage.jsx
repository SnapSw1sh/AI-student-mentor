import { useLibrary } from '../hooks/useLibrary';
import { LibraryTopicGrid } from '../components/LibraryTopicGrid';
import { LibraryStatusMessage } from '../components/LibraryStatusMessage';
import { LibraryEmptyState } from '../components/LibraryEmptyState';

export function LibraryHomePage() {
  const { tree, status, error, refetch } = useLibrary();

  if (status !== 'success') {
    return (
      <LibraryStatusMessage
        status={status}
        error={error}
        onRetry={refetch}
        loadingText="Загружаем библиотеку…"
      />
    );
  }

  if (tree.length === 0) {
    return <LibraryEmptyState message="Библиотека пока пуста. Материалы скоро появятся." />;
  }

  return <LibraryTopicGrid topics={tree} />;
}
