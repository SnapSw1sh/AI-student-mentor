import { useEffect, useState } from 'react';
import { libraryApi } from '../api/libraryApi';
import { ApiError } from '../../../shared/api/httpClient';
import { DownloadIcon } from '../../../shared/ui/icons';
import styles from './LibraryDocumentPreview.module.css';

function renderPreview(mode, url, styleClasses) {
  switch (mode) {
    case 'image':
      return <img src={url} alt="" className={styleClasses.image} />;
    case 'audio':
      return <audio src={url} controls className={styleClasses.media} />;
    case 'video':
      return <video src={url} controls className={styleClasses.media} />;
    default:
      return <iframe src={url} title="Предпросмотр документа" className={styleClasses.frame} />;
  }
}

export function LibraryDocumentPreview({ document: doc }) {
  const [previewStatus, setPreviewStatus] = useState('idle');
  const [previewUrl, setPreviewUrl] = useState(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let objectUrl = null;

    (async () => {
      if (doc.preview_mode === 'download') {
        if (!cancelled) setPreviewStatus('unsupported');
        return;
      }

      if (!cancelled) setPreviewStatus('loading');

      try {
        const { blob } = await libraryApi.getDocumentPreview(doc.id);
        if (cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        setPreviewUrl(objectUrl);
        setPreviewStatus('ready');
      } catch (err) {
        if (cancelled) return;
        setPreviewStatus(err instanceof ApiError && err.status === 415 ? 'unsupported' : 'error');
      }
    })();

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [doc.id, doc.preview_mode]);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const { blob } = await libraryApi.getDocumentDownload(doc.id);
      const objectUrl = URL.createObjectURL(blob);
      const link = window.document.createElement('a');
      link.href = objectUrl;
      link.download = doc.filename || doc.title;
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
      URL.revokeObjectURL(objectUrl);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      {previewStatus === 'loading' && <p className={styles.status}>Загружаем предпросмотр…</p>}
      {previewStatus === 'error' && (
        <p className={styles.statusError}>Не удалось загрузить предпросмотр.</p>
      )}
      {previewStatus === 'unsupported' && (
        <p className={styles.status}>Предпросмотр недоступен для этого типа файла.</p>
      )}
      {previewStatus === 'ready' && renderPreview(doc.preview_mode, previewUrl, styles)}

      <button
        type="button"
        onClick={handleDownload}
        disabled={downloading}
        className={styles.downloadBtn}
      >
        <DownloadIcon className={styles.downloadIcon} />
        {downloading ? 'Скачивание…' : 'Скачать'}
      </button>
    </div>
  );
}
