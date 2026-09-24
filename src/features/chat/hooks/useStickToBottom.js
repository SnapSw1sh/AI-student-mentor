import { useEffect, useLayoutEffect, useRef } from 'react';

const BOTTOM_THRESHOLD_PX = 80;

// Держит область сообщений прижатой к низу, но только пока пользователь сам у низа:
// если он прокрутил вверх почитать, новые чанки ответа его не утаскивают.
// Двигает только scrollTop контейнера — scrollIntoView прокручивал ещё и окно.
export function useStickToBottom(scrollRef, messages) {
  const atBottomRef = useRef(true);
  const filledRef = useRef(false);
  const hasMessages = messages.length > 0;

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return undefined;
    const handleScroll = () => {
      atBottomRef.current =
        el.scrollHeight - el.scrollTop - el.clientHeight <= BOTTOM_THRESHOLD_PX;
    };
    el.addEventListener('scroll', handleScroll, { passive: true });

    // Ответ допечатывается по символам между обновлениями messages (useTypewriter),
    // поэтому следить надо за ростом высоты содержимого, а не только за списком сообщений.
    const content = el.firstElementChild;
    const observer = content
      ? new ResizeObserver(() => {
        if (atBottomRef.current) el.scrollTop = el.scrollHeight;
      })
      : null;
    if (content) observer.observe(content);

    return () => {
      el.removeEventListener('scroll', handleScroll);
      observer?.disconnect();
    };
  }, [scrollRef, hasMessages]);

  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el || !hasMessages) return;

    const isFirstFill = !filledRef.current;
    filledRef.current = true;
    const justAsked = messages[messages.length - 1].role === 'user';

    if (isFirstFill || justAsked || atBottomRef.current) {
      el.scrollTop = el.scrollHeight;
      atBottomRef.current = true;
    }
  }, [scrollRef, messages, hasMessages]);
}
