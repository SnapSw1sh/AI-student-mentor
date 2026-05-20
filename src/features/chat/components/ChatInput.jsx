import { useRef, useState } from 'react';
import { SendIcon } from '../../../shared/ui/icons';
import styles from './ChatInput.module.css';

export function ChatInput({ onSend, disabled }) {
  const [value, setValue] = useState('');
  const textareaRef = useRef(null);

  const handleSubmit = (event) => {
    event.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    const ok = onSend(trimmed);
    if (ok) setValue('');
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSubmit(event);
    }
  };

  const handleChange = (event) => {
    setValue(event.target.value);
    const node = textareaRef.current;
    if (node) {
      node.style.height = 'auto';
      node.style.height = `${Math.min(node.scrollHeight, 120)}px`;
    }
  };

  const canSend = value.trim().length > 0 && !disabled;

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <textarea
        ref={textareaRef}
        className={styles.input}
        placeholder="Введите запрос..."
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        rows={1}
        disabled={disabled}
      />
      <button
        type="submit"
        className={styles.sendButton}
        disabled={!canSend}
        aria-label="Отправить"
      >
        <SendIcon className={styles.sendIcon} />
      </button>
    </form>
  );
}
