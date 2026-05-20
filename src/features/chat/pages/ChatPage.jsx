import { useChatSocket } from '../hooks/useChatSocket';
import { ChatInput } from '../components/ChatInput';
import { MessageList } from '../components/MessageList';
import { SuggestionChips } from '../components/SuggestionChips';
import { WelcomeBlock } from '../components/WelcomeBlock';
import styles from './ChatPage.module.css';

export function ChatPage() {
  const { messages, streamingId, error, sendQuestion, isStreaming } = useChatSocket();

  const hasMessages = messages.length > 0;

  const handleSend = (text) => sendQuestion(text);
  const handleChipClick = (query) => {
    if (isStreaming) return;
    sendQuestion(query);
  };

  return (
    <div className={styles.page}>
      <div
        className={`${styles.container} ${hasMessages ? '' : styles.containerEmpty}`}
      >
        {hasMessages && (
          <div className={styles.scroll}>
            <MessageList messages={messages} streamingId={streamingId} />
          </div>
        )}

        {!hasMessages && <WelcomeBlock />}

        {error && <div className={styles.errorBanner}>{error}</div>}

        <div className={styles.composer}>
          <ChatInput onSend={handleSend} disabled={isStreaming} />
          <SuggestionChips onPick={handleChipClick} disabled={isStreaming} />
        </div>
      </div>
    </div>
  );
}
