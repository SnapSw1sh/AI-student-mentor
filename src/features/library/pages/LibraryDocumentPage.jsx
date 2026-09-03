import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { libraryApi } from '../api/libraryApi';
import { ApiError } from '../../../shared/api/httpClient';
import { useLibrary } from '../hooks/useLibrary';
import { LibraryBreadcrumbs } from '../components/LibraryBreadcrumbs';
import { LibraryDocumentPreview } from '../components/LibraryDocumentPreview';
import { LibraryRelatedDocuments } from '../components/LibraryRelatedDocuments';
import { LibraryStatusMessage } from '../components/LibraryStatusMessage';
import { LibraryEmptyState } from '../components/LibraryEmptyState';
import { formatBytes } from '../lib/formatBytes';
import styles from './LibraryDocumentPage.module.css';

export function LibraryDocumentPage() {
  const { documentId } = useParams();
  const { getPath } = useLibrary();
  const [status, setStatus] = useState('loading');
  const [document, setDocument] = useState(null);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setStatus('loading');
    setError(null);
    try {
      const data = await libraryApi.getDocument(documentId);
      setDocument(data);
      setStatus('success');
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        setStatus('not_found');
      } else {
        setError(err);
        setStatus('error');
      }
    }
  }, [documentId]);

  useEffect(() => {
    (async () => {
      await load();
    })();
  }, [load]);

  if (status === 'not_found') {
    return <LibraryEmptyState message="Документ не найден." />;
  }

  if (status !== 'success') {
    return (
      <LibraryStatusMessage
        status={status}
        error={error}
        onRetry={load}
        loadingText="Загружаем документ…"
      />
    );
  }

  const treePath = getPath(documentId);
  const breadcrumbPath =
    treePath.length > 0
      ? treePath
      : document.topic
        ? [{ id: document.topic.id, name: document.topic.name }]
        : [];

  const sizeLabel = formatBytes(document.size_bytes);

  return (
    <div className={styles.page}>
      <LibraryBreadcrumbs path={breadcrumbPath} />
      <h2 className={styles.title}>{document.title}</h2>

      {(document.description || sizeLabel) && (
        <div className={styles.meta}>
          {document.description && <p className={styles.description}>{document.description}</p>}
          {sizeLabel && <span className={styles.size}>{sizeLabel}</span>}
        </div>
      )}

      <LibraryDocumentPreview document={document} />

      {document.related_documents.length > 0 && (
        <LibraryRelatedDocuments relatedDocuments={document.related_documents} />
      )}
    </div>
  );
}
