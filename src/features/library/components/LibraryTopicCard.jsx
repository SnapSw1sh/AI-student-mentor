import { Link } from 'react-router-dom';
import { renderTopicIcon } from '../lib/topicIcons';
import { countDocuments } from '../lib/countDocuments';
import { pluralizeDocuments } from '../lib/pluralizeDocuments';
import styles from './LibraryTopicCard.module.css';

export function LibraryTopicCard({ topic }) {
  const count = countDocuments(topic);

  return (
    <Link to={`/library/topics/${topic.id}`} className={styles.card}>
      {renderTopicIcon(topic.name, styles.icon)}
      <span className={styles.body}>
        <span className={styles.name}>{topic.name}</span>
        {count > 0 && <span className={styles.count}>{pluralizeDocuments(count)}</span>}
      </span>
    </Link>
  );
}
