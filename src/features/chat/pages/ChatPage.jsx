import { useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useChat } from '../hooks/useChat';
import { useStickToBottom } from '../hooks/useStickToBottom';
import { useHeadroom } from '../hooks/useHeadroom';
import { ChatInput } from '../components/ChatInput';
import { MessageList } from '../components/MessageList';
import { SuggestionChips } from '../components/SuggestionChips';
import { WelcomeBlock } from '../components/WelcomeBlock';
import styles from './ChatPage.module.css';

export function ChatPage() {
  const { messages, streamingId, error, sendQuestion, isStreaming } = useChat();
  const { setHeaderCollapsed } = useOutletContext();
  const scrollRef = useRef(null);

  const hasMessages = messages.length > 0;

  useStickToBottom(scrollRef, messages);
  useHeadroom(scrollRef, setHeaderCollapsed, hasMessages);

  const handleSend = (text) => sendQuestion(text);
  const handleChipClick = (query) => {
    if (isStreaming) return;
    sendQuestion(query);
  };

  return (
    <div className={`${styles.page} ${hasMessages ? '' : styles.pageEmpty}`.trim()}>
      {hasMessages ? (
        <div className={styles.scroll} ref={scrollRef}>
          <div className={`${styles.column} ${styles.messagesColumn}`}>
            <MessageList messages={messages} streamingId={streamingId} />
          </div>
        </div>
      ) : (
        <div className={styles.column}>
          <WelcomeBlock />
        </div>
      )}

      <div className={styles.bottom}>
        <div className={`${styles.column} ${styles.composerColumn}`}>
          {error && <div className={styles.errorBanner}>{error}</div>}
          <div className={styles.composer}>
            <ChatInput onSend={handleSend} disabled={isStreaming} />
            <SuggestionChips onPick={handleChipClick} disabled={isStreaming} />
          </div>
        </div>
      </div>
    </div>
  );
}
