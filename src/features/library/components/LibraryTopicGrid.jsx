import { LibraryTopicCard } from './LibraryTopicCard';
import styles from './LibraryTopicGrid.module.css';

export function LibraryTopicGrid({ topics }) {
  return (
    <div className={styles.grid}>
      {topics.map((topic) => (
        <LibraryTopicCard key={topic.id} topic={topic} />
      ))}
    </div>
  );
}
