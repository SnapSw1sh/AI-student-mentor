import { Link, useNavigate, useParams } from 'react-router-dom';
import { useLibrary } from '../hooks/useLibrary';
import { LibraryBreadcrumbs } from '../components/LibraryBreadcrumbs';
import { LibraryTopicGrid } from '../components/LibraryTopicGrid';
import { LibraryDocumentList } from '../components/LibraryDocumentList';
import { LibraryStatusMessage } from '../components/LibraryStatusMessage';
import { LibraryEmptyState } from '../components/LibraryEmptyState';
import styles from './LibraryTopicPage.module.css';

export function LibraryTopicPage() {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const { status, error, refetch, getTopic, getPath } = useLibrary();

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

  const topic = getTopic(topicId);

  if (!topic) {
    return <LibraryEmptyState message="Раздел не найден." />;
  }

  const ancestors = getPath(topicId).slice(0, -1);
  const hasContent = topic.subtopics.length > 0 || topic.documents.length > 0;

  return (
    <div className={styles.page}>
      <div className={styles.topRow}>
        <button type="button" onClick={() => navigate(-1)} className={styles.back}>
          ← Назад
        </button>
        <Link to="/library" className={styles.libraryLink}>
          Библиотека
        </Link>
      </div>
      {ancestors.length > 0 && <LibraryBreadcrumbs path={ancestors} showRoot={false} />}
      <h2 className={styles.title}>{topic.name}</h2>

      {!hasContent && <LibraryEmptyState message="В этом разделе пока нет материалов." />}
      {topic.subtopics.length > 0 && <LibraryTopicGrid topics={topic.subtopics} />}
      {topic.documents.length > 0 && <LibraryDocumentList documents={topic.documents} />}
    </div>
  );
}
