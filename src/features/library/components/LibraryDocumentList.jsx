import { LibraryDocumentListItem } from './LibraryDocumentListItem';
import styles from './LibraryDocumentList.module.css';

export function LibraryDocumentList({ documents }) {
  return (
    <div className={styles.list}>
      {documents.map((document) => (
        <LibraryDocumentListItem key={document.id} document={document} />
      ))}
    </div>
  );
}
