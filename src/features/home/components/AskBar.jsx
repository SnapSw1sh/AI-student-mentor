import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChat } from '../../chat/hooks/useChat';
import { SearchIcon, SendIcon } from '../../../shared/ui/icons';
import styles from './AskBar.module.css';

// Быстрый вопрос с главной: уходит в тот же чат, что и на странице ИИ-помощника, и
// пользователь сразу попадает туда смотреть ответ. Если отправить не удалось, ошибку
// покажет сам чат — как при обычной отправке.
export function AskBar() {
  const { sendQuestion, isStreaming } = useChat();
  const navigate = useNavigate();
  const [value, setValue] = useState('');
  const canSend = value.trim().length > 0 && !isStreaming;

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!canSend) return;
    sendQuestion(value);
    setValue('');
    navigate('/chat');
  };

  return (
    <form className={styles.bar} onSubmit={handleSubmit} role="search">
      <div className={styles.field}>
        <SearchIcon className={styles.searchIcon} />
        <input
          className={styles.input}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={isStreaming ? 'ИИ-помощник ещё отвечает на прошлый вопрос…' : 'Спросить Student Mentor …'}
          aria-label="Вопрос ИИ-помощнику"
          maxLength={2000}
        />
        <button type="submit" className={styles.send} disabled={!canSend} aria-label="Спросить">
          <SendIcon className={styles.sendIcon} />
        </button>
      </div>
    </form>
  );
}
