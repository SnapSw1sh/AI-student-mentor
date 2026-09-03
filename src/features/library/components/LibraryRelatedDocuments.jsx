import { Link } from 'react-router-dom';
import { DocumentIcon } from '../../../shared/ui/icons';
import styles from './LibraryRelatedDocuments.module.css';

export function LibraryRelatedDocuments({ relatedDocuments }) {
  return (
    <div className={styles.wrapper}>
      <h2 className={styles.heading}>Связанные документы</h2>
      <div className={styles.list}>
        {relatedDocuments.map((related) => (
          <Link
            key={related.id}
            to={`/library/documents/${related.id}`}
            className={styles.item}
          >
            <DocumentIcon className={styles.icon} />
            <span className={styles.body}>
              <span className={styles.title}>{related.title}</span>
              {related.label && <span className={styles.label}>{related.label}</span>}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
