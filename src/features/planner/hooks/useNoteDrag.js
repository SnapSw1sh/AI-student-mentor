import { useEffect, useRef, useState } from 'react';
import { shiftNote } from '../lib/shiftNote';

// Мышь: перенос начинается, когда курсор ушёл дальше нескольких пикселей, иначе это клик.
const DRAG_THRESHOLD_PX = 4;
// Касание: перенос — только после долгого нажатия, иначе он мешал бы прокручивать страницу.
const LONG_PRESS_MS = 400;
const TOUCH_SLOP_PX = 8;

// Перетаскивание заметок в сетке календаря. dayIndexAt(x, y) — порядковый номер дня под
// курсором (в неделе — столбец, в месяце — неделя × 7 + столбец); разница номеров даёт сдвиг
// в днях. Пока тянем, новое положение показывает drag; сохраняется только при отпускании.
export function useNoteDrag({ gridRef, dayIndexAt, onCommit }) {
  const [drag, setDrag] = useState(null);
  const session = useRef(null);
  const suppressClick = useRef(false);

  function finish(commit) {
    const s = session.current;
    if (!s) return;
    session.current = null;
    clearTimeout(s.timer);
    if (s.onKeyDown) document.removeEventListener('keydown', s.onKeyDown);
    if (!s.active) return;
    setDrag(null);
    // После отпускания браузер присылает click по заметке — он не должен открывать окно.
    suppressClick.current = true;
    setTimeout(() => {
      suppressClick.current = false;
    });
    const { note, preview } = s;
    if (commit && (preview.start !== note.start || preview.end !== note.end)) onCommit(note, preview);
  }

  const activate = (s) => {
    s.active = true;
    s.preview = { start: s.note.start, end: s.note.end };
    s.onKeyDown = (event) => {
      if (event.key === 'Escape') finish(false);
    };
    document.addEventListener('keydown', s.onKeyDown);
    setDrag({ noteId: s.note.id, mode: s.mode, ...s.preview });
  };

  // Пока заметку тащат пальцем, страница не должна прокручиваться. Отменить прокрутку можно
  // только из обработчика, который висел уже в момент касания: Chrome решает, ждать ли
  // touchmove, при touchstart. Поэтому слушаем всегда, а мешаем прокрутке только во время переноса.
  useEffect(() => {
    const grid = gridRef.current;
    const blockScrollWhileDragging = (event) => {
      if (session.current?.active) event.preventDefault();
    };
    grid?.addEventListener('touchmove', blockScrollWhileDragging, { passive: false });
    return () => {
      grid?.removeEventListener('touchmove', blockScrollWhileDragging);
      const s = session.current;
      if (!s) return;
      clearTimeout(s.timer);
      if (s.onKeyDown) document.removeEventListener('keydown', s.onKeyDown);
    };
  }, [gridRef]);

  const onPointerDown = (note, event) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    const s = {
      note,
      mode: event.target.dataset.edge ?? 'move',
      pointerId: event.pointerId,
      pointerType: event.pointerType,
      x0: event.clientX,
      y0: event.clientY,
      day0: dayIndexAt(event.clientX, event.clientY),
      active: false,
    };
    if (s.pointerType === 'touch') s.timer = setTimeout(() => activate(s), LONG_PRESS_MS);
    session.current = s;
  };

  const onPointerMove = (event) => {
    const s = session.current;
    if (!s || s.pointerId !== event.pointerId) return;
    if (!s.active) {
      const distance = Math.hypot(event.clientX - s.x0, event.clientY - s.y0);
      if (s.pointerType === 'touch') {
        // Палец поехал до конца долгого нажатия — это прокрутка, а не перенос.
        if (distance > TOUCH_SLOP_PX) finish(false);
        return;
      }
      if (distance < DRAG_THRESHOLD_PX) return;
      activate(s);
    }
    const next = shiftNote(s.note, s.mode, dayIndexAt(event.clientX, event.clientY) - s.day0);
    if (next.start !== s.preview.start || next.end !== s.preview.end) {
      s.preview = next;
      setDrag({ noteId: s.note.id, mode: s.mode, ...next });
    }
  };

  return {
    drag,
    noteHandlers: (note) => ({
      onPointerDown: (event) => onPointerDown(note, event),
      onPointerMove,
      onPointerUp: () => finish(true),
      onPointerCancel: () => finish(false),
      onContextMenu: (event) => {
        // Долгое нажатие на телефоне иначе открывает контекстное меню и обрывает перенос.
        if (session.current?.pointerType === 'touch') event.preventDefault();
      },
    }),
    consumeClick: () => suppressClick.current,
  };
}
