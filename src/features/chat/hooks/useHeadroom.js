import { useEffect } from 'react';

const HIDE_AFTER_PX = 6;
const TOP_ZONE_PX = 80;

// Прячет хедер при прокрутке вниз и возвращает при любой прокрутке вверх.
// Слушаем колесо и свайпы, а не событие scroll: оно срабатывает и от автопрокрутки
// во время печати ответа, и тогда хедер прятался бы сам, без действий пользователя.
export function useHeadroom(scrollRef, setHidden, enabled) {
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !enabled) return undefined;

    let downDistance = 0;
    let lastTouchY = null;

    const applyDelta = (deltaY) => {
      if (deltaY < 0) {
        downDistance = 0;
        setHidden(false);
        return;
      }
      downDistance += deltaY;
      if (downDistance > HIDE_AFTER_PX && el.scrollTop + deltaY > TOP_ZONE_PX) {
        setHidden(true);
      }
    };

    const handleWheel = (event) => applyDelta(event.deltaY);
    const handleTouchStart = (event) => {
      lastTouchY = event.touches[0].clientY;
    };
    const handleTouchMove = (event) => {
      const y = event.touches[0].clientY;
      if (lastTouchY !== null) applyDelta(lastTouchY - y);
      lastTouchY = y;
    };
    // Вернуться к началу переписки можно и перетаскиванием полосы прокрутки — без колеса.
    const handleScroll = () => {
      if (el.scrollTop < TOP_ZONE_PX) setHidden(false);
    };

    el.addEventListener('wheel', handleWheel, { passive: true });
    el.addEventListener('touchstart', handleTouchStart, { passive: true });
    el.addEventListener('touchmove', handleTouchMove, { passive: true });
    el.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      el.removeEventListener('wheel', handleWheel);
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchmove', handleTouchMove);
      el.removeEventListener('scroll', handleScroll);
      setHidden(false);
    };
  }, [scrollRef, setHidden, enabled]);
}
