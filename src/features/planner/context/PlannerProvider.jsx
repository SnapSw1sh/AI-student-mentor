import { useMemo, useRef, useState } from 'react';
import { useNotify } from '../../../shared/notifications/useNotify';
import { plannerApi } from '../api/plannerApi';
import { TAG_PALETTE, UNTAGGED_COLOR, toneFromColor } from '../lib/color';
import { diffInDays, formatNoteDates } from '../lib/dates';
import { PlannerContext } from './PlannerContext';

let sequence = 0;
const newId = (prefix) => `${prefix}-${Date.now().toString(36)}-${(sequence += 1)}`;

// Заметки, созданные до тегов, хранят один из пяти цветов — показываем их тем же цветом.
const LEGACY_COLORS = {
  blue: '#1466ED',
  pink: '#E52957',
  green: '#1CA857',
  yellow: '#B7791F',
  gray: '#5D5E5E',
};

// Одни заметки и теги на все виджеты: календарь недели, месяц и дедлайны должны видеть одно и
// то же. Провайдер живёт в AppLayout, а не на странице: «Отменить» в уведомлении о переносе
// можно нажать уже на другой странице, и оно должно менять тот же список. Родитель пересоздаёт
// провайдер при смене пользователя (key), так что заметки одного не попадут к другому.
export function PlannerProvider({ userId, children }) {
  const notify = useNotify();
  const [notes, setNotes] = useState(() => plannerApi.load(userId));
  const [tags, setTags] = useState(() => plannerApi.loadTags(userId));
  // Изменения считаются от последнего сохранённого списка, а не от того, что был при рендере:
  // «Отменить» срабатывает позже, и старый список затёр бы всё, что поменяли после.
  const latest = useRef({ notes, tags });

  const value = useMemo(() => {
    const persist = (kind, makeNext) => {
      const next = makeNext(latest.current[kind]);
      try {
        if (kind === 'notes') plannerApi.save(userId, next);
        else plannerApi.saveTags(userId, next);
        latest.current = { ...latest.current, [kind]: next };
        (kind === 'notes' ? setNotes : setTags)(next);
        return true;
      } catch (err) {
        notify.error(kind === 'notes' ? 'Не удалось сохранить заметку' : 'Не удалось сохранить тег', err);
        return false;
      }
    };

    const update = (id, fields) =>
      persist('notes', (list) => list.map((n) => (n.id === id ? { ...n, ...fields } : n)));

    // Перенос легко сделать случайно, поэтому после него — уведомление с «Отменить».
    const move = (note, dates) => {
      const before = { start: note.start, end: note.end };
      if (!update(note.id, dates)) return;
      const resized = diffInDays(dates.start, dates.end) !== diffInDays(note.start, note.end);
      notify.info(
        resized ? 'Даты заметки изменены' : 'Заметка перенесена',
        `${note.title}: ${formatNoteDates(dates.start, dates.end)}`,
        { key: 'planner-move', action: { label: 'Отменить', onClick: () => update(note.id, before) } },
      );
    };

    const tagsById = new Map(tags.map((t) => [t.id, t]));
    const noteTags = (note) => (note.tagIds ?? []).map((id) => tagsById.get(id)).filter(Boolean);

    const createTag = (name) => {
      const tag = {
        id: newId('tag'),
        name,
        color: TAG_PALETTE[latest.current.tags.length % TAG_PALETTE.length],
      };
      return persist('tags', (list) => [...list, tag]) ? tag : null;
    };

    return {
      notes,
      tags,
      create: (fields) => persist('notes', (list) => [...list, { ...fields, id: newId('note') }]),
      update,
      remove: (id) => persist('notes', (list) => list.filter((n) => n.id !== id)),
      move,
      noteTags,
      // Цвет заметки — цвет её первого тега: порядок тегов в заметке задаёт их приоритет.
      noteTone: (note) =>
        toneFromColor(noteTags(note)[0]?.color ?? LEGACY_COLORS[note.color] ?? UNTAGGED_COLOR),
      createTag,
      updateTag: (id, fields) =>
        persist('tags', (list) => list.map((t) => (t.id === id ? { ...t, ...fields } : t))),
      // Тег удаляется и из всех заметок, где он стоял.
      deleteTag: (id) =>
        persist('tags', (list) => list.filter((t) => t.id !== id)) &&
        persist('notes', (list) =>
          list.map((n) => (n.tagIds?.includes(id) ? { ...n, tagIds: n.tagIds.filter((t) => t !== id) } : n)),
        ),
    };
  }, [notes, tags, userId, notify]);

  return <PlannerContext.Provider value={value}>{children}</PlannerContext.Provider>;
}
