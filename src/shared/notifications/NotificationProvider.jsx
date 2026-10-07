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
  // «Скачать») перезапускает таймер уже показанного.
  const push = useCallback((type, title, text) => {
    nextId.current += 1;
    const id = nextId.current;
    setToasts((list) => {
      const rest = list.filter((t) => !(t.type === type && t.title === title && t.text === text));
      return [...rest, { id, type, title, text }].slice(-MAX_VISIBLE);
    });
  }, []);

  const value = useMemo(
    () => ({
      error: (title, error) => push('error', title, error === undefined ? '' : describeError(error)),
      success: (title, text = '') => push('success', title, text),
      info: (title, text = '') => push('info', title, text),
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
