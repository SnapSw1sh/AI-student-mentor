import { Link } from 'react-router-dom';
import { renderDocumentIcon } from '../lib/documentIcons';
import styles from './LibraryDocumentListItem.module.css';

export function LibraryDocumentListItem({ document }) {
  return (
    <Link to={`/library/documents/${document.id}`} className={styles.item}>
      {renderDocumentIcon(document.content_type, styles.icon)}
      <span className={styles.title}>{document.title}</span>
    </Link>
  );
}
