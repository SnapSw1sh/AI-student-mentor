import { useContext } from 'react';
import { NotificationContext } from './NotificationContext';

// notify.error('Не удалось скачать документ', error) — заголовок говорит, что не вышло,
// текст под ним — почему (из describeError). Ошибки конкретного поля формы сюда не идут:
// они остаются под полем.
export function useNotify() {
  const notify = useContext(NotificationContext);
  if (!notify) throw new Error('useNotify must be used inside NotificationProvider');
  return notify;
}
