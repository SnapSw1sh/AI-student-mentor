import ReactMarkdown from 'react-markdown';
import styles from './Message.module.css';

export function Message({ role, content, streaming }) {
  const isUser = role === 'user';
  const rowClass = `${styles.row} ${isUser ? styles.rowUser : styles.rowAssistant}`;
  const bubbleClass = `${styles.bubble} ${isUser ? styles.bubbleUser : styles.bubbleAssistant}`;

  return (
    <div className={rowClass}>
      <div className={bubbleClass}>
        {isUser ? (
          <p>{content}</p>
        ) : (
          <>
            <ReactMarkdown
              components={{
                a: (props) => (
                  <a {...props} target="_blank" rel="noopener noreferrer" />
                ),
              }}
            >
              {content || ''}
            </ReactMarkdown>
            {streaming && <span className={styles.cursor} aria-hidden="true" />}
          </>
        )}
      </div>
    </div>
  );
}
