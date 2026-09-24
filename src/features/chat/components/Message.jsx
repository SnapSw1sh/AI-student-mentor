import ReactMarkdown from 'react-markdown';
import { useTypewriter } from '../hooks/useTypewriter';
import styles from './Message.module.css';

function ThinkingIndicator() {
  return (
    <span className={styles.thinking} role="status" aria-label="ИИ-помощник думает">
      <span className={styles.thinkingDot} />
      <span className={styles.thinkingDot} />
      <span className={styles.thinkingDot} />
    </span>
  );
}

export function Message({ role, content, streaming }) {
  const isUser = role === 'user';
  const shown = useTypewriter(content, streaming);
  const isThinking = !isUser && streaming && !content;
  // Ответ, генерация которого когда-то сорвалась: в истории он остаётся пустым.
  const isMissing = !isUser && !streaming && !content;
  // Курсор виден, пока ответ приходит и пока допечатывается его хвост.
  const isTyping = streaming || shown.length < content.length;
  const rowClass = `${styles.row} ${isUser ? styles.rowUser : styles.rowAssistant}`;
  const bubbleClass = `${styles.bubble} ${isUser ? styles.bubbleUser : styles.bubbleAssistant}`;

  return (
    <div className={rowClass}>
      <div className={bubbleClass}>
        {isUser && <p>{content}</p>}
        {isThinking && <ThinkingIndicator />}
        {isMissing && <p className={styles.missing}>Ответ не получен.</p>}
        {!isUser && !isThinking && !isMissing && (
          <div className={isTyping ? styles.markdownTyping : undefined}>
            <ReactMarkdown
              components={{
                a: (props) => (
                  <a {...props} target="_blank" rel="noopener noreferrer" />
                ),
              }}
            >
              {shown}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}
