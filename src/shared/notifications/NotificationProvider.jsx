import { useCallback, useMemo, useRef, useState } from 'react';
import { NotificationContext } from './NotificationContext';
import { describeError } from './describeError';
import { Toaster } from './Toaster';

const MAX_VISIBLE = 4;

export function NotificationProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const nextId = useRef(0);

  const dismiss = useCallback((id) => {
    setToasts((list) => list.filter((t) => t.id !== id));
  }, []);

  // Одинаковое уведомление не дублируется: повторная ошибка (например, двойной клик по
  // «Скачать») перезапускает таймер уже показанного. `key` заменяет предыдущее уведомление
  // того же действия, даже если текст другой (например, «Заметка перенесена» на каждый шаг).
  // `action` — кнопка в уведомлении: { label, onClick }, после нажатия уведомление закрывается.
  const push = useCallback((type, title, text, { key, action } = {}) => {
    nextId.current += 1;
    const id = nextId.current;
    setToasts((list) => {
      const rest = list.filter((t) =>
        key ? t.key !== key : !(t.type === type && t.title === title && t.text === text),
      );
      return [...rest, { id, type, title, text, key, action }].slice(-MAX_VISIBLE);
    });
  }, []);

  const value = useMemo(
    () => ({
      error: (title, error) => push('error', title, error === undefined ? '' : describeError(error)),
      success: (title, text = '', options) => push('success', title, text, options),
      info: (title, text = '', options) => push('info', title, text, options),
    }),
    [push],
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <Toaster toasts={toasts} onDismiss={dismiss} />
    </NotificationContext.Provider>
  );
}
