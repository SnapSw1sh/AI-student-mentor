import { useEffect, useRef, useState } from 'react';

// За сколько кадров догоняется накопившийся хвост: большая пачка чанков открывается
// примерно за треть секунды, маленькая — по символу за кадр.
const CATCH_UP_FRAMES = 20;

// Печатает текст ровно, по символам, независимо от того, какими пачками приходят чанки.
// active учитывается только при первом рендере: сообщения из истории показываются сразу.
export function useTypewriter(text, active) {
  const [shownLength, setShownLength] = useState(() => (active ? 0 : text.length));
  const shownRef = useRef(shownLength);

  useEffect(() => {
    if (shownRef.current >= text.length) return undefined;

    let frameId = requestAnimationFrame(function tick() {
      const backlog = text.length - shownRef.current;
      shownRef.current += Math.max(1, Math.ceil(backlog / CATCH_UP_FRAMES));
      setShownLength(shownRef.current);
      if (shownRef.current < text.length) frameId = requestAnimationFrame(tick);
    });

    return () => cancelAnimationFrame(frameId);
  }, [text]);

  return text.slice(0, Math.min(shownLength, text.length));
}
