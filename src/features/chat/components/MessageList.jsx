import { Message } from './Message';
import styles from './MessageList.module.css';

export function MessageList({ messages, streamingId }) {
  return (
    <div className={styles.list}>
      {messages.map((message) => (
        <Message
          key={message.id}
          role={message.role}
          content={message.content}
          streaming={message.id === streamingId}
        />
      ))}
    </div>
  );
}
