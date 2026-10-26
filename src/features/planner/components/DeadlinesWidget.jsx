import { useEffect, useId, useRef, useState } from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import { FilterIcon } from '../../../shared/ui/icons';
import { plannerApi } from '../api/plannerApi';
import { useNoteDialogs } from '../hooks/useNoteDialogs';
import { usePlannerNotes } from '../hooks/usePlannerNotes';
import { toneFromColor } from '../lib/color';
import { formatNoteDates, parseISODate, shortMonth, toISODate } from '../lib/dates';
import { toneStyle } from '../lib/noteTone';
import styles from './DeadlinesWidget.module.css';

// Ближайшие записи календаря: всё, у чего дата окончания сегодня или позже, по сроку.
// Отдельно дедлайны не создаются — какие записи считать дедлайнами, пользователь выбирает
// фильтром по тегам (например, оставляет только тег «Дедлайн»). Выбор запоминается.
export function DeadlinesWidget() {
  const { user } = useAuth();
  const userId = user?.user_id;
  const { notes, tags, noteTone, noteTags } = usePlannerNotes();
  const { openEdit, dialogs } = useNoteDialogs();
  const [filter, setFilter] = useState(() => plannerApi.loadDeadlineFilter(userId));
  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useRef(null);
  const popoverId = useId();
  const todayISO = toISODate(new Date());

  // Удалённые теги в фильтре не учитываются.
  const activeFilter = filter.filter((id) => tags.some((t) => t.id === id));
  const upcoming = notes
    .filter((note) => note.end >= todayISO)
    .filter((note) => !activeFilter.length || note.tagIds?.some((id) => activeFilter.includes(id)))
    .sort((a, b) => a.end.localeCompare(b.end) || a.title.localeCompare(b.title, 'ru'));

  const changeFilter = (next) => {
    setFilter(next);
    plannerApi.saveDeadlineFilter(userId, next);
  };

  const toggleTag = (id) =>
    changeFilter(activeFilter.includes(id) ? activeFilter.filter((t) => t !== id) : [...activeFilter, id]);

  useEffect(() => {
    if (!filterOpen) return undefined;
    const closeOutside = (event) => {
      if (!filterRef.current?.contains(event.target)) setFilterOpen(false);
    };
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setFilterOpen(false);
    };
    document.addEventListener('pointerdown', closeOutside);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('pointerdown', closeOutside);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [filterOpen]);

  let emptyText = 'Ближайших записей в календаре нет.';
  if (activeFilter.length) emptyText = 'Нет ближайших записей с выбранными тегами.';

  return (
    <section className={styles.card} aria-labelledby="deadlines-title">
      <header className={styles.header}>
        <h2 id="deadlines-title" className={styles.title}>
          Дедлайны
        </h2>
        <div className={styles.filter} ref={filterRef}>
          <button
            type="button"
            className={`${styles.filterButton} ${activeFilter.length ? styles.filterActive : ''}`.trim()}
            aria-expanded={filterOpen}
            aria-controls={popoverId}
            aria-label={activeFilter.length ? `Фильтр по тегам, выбрано: ${activeFilter.length}` : 'Фильтр по тегам'}
            title="Фильтр по тегам"
            onClick={() => setFilterOpen((o) => !o)}
          >
            <FilterIcon className={styles.filterIcon} />
            {activeFilter.length > 0 && <span className={styles.filterCount}>{activeFilter.length}</span>}
          </button>

          {filterOpen && (
            <div id={popoverId} className={styles.popover} role="group" aria-label="Фильтр по тегам">
              <p className={styles.popoverTitle}>Показывать записи с тегами</p>
              {tags.length === 0 ? (
                <p className={styles.popoverEmpty}>Тегов пока нет — их создают в окне заметки календаря.</p>
              ) : (
                <ul className={styles.tagList}>
                  {tags.map((tag) => (
                    <li key={tag.id}>
                      <label className={styles.tagOption}>
                        <input
                          type="checkbox"
                          checked={activeFilter.includes(tag.id)}
                          onChange={() => toggleTag(tag.id)}
                        />
                        <span className={styles.tagChip} style={toneStyle(toneFromColor(tag.color))}>
                          {tag.name}
                        </span>
                      </label>
                    </li>
                  ))}
                </ul>
              )}
              {activeFilter.length > 0 && (
                <button type="button" className={styles.reset} onClick={() => changeFilter([])}>
                  Показать все записи
                </button>
              )}
            </div>
          )}
        </div>
      </header>

      {upcoming.length > 0 ? (
        <ul className={styles.list}>
          {upcoming.map((note) => {
            const due = parseISODate(note.end);
            const tagNames = noteTags(note)
              .map((t) => t.name)
              .join(', ');
            return (
              <li key={note.id}>
                <button
                  type="button"
                  className={styles.item}
                  onClick={() => openEdit(note)}
                  aria-label={`${note.title}${tagNames ? `, ${tagNames}` : ''}, срок ${formatNoteDates(note.end, note.end)}`}
                >
                  <span className={styles.date} style={toneStyle(noteTone(note))} aria-hidden="true">
                    <span className={styles.dateDay}>{due.getDate()}</span>
                    <span className={styles.dateMonth}>{shortMonth(due)}</span>
                  </span>
                  <span className={styles.text}>
                    <span className={styles.itemTitle}>{note.title}</span>
                    {tagNames && <span className={styles.subject}>{tagNames}</span>}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className={styles.emptyText}>{emptyText}</p>
      )}

      {dialogs}
    </section>
  );
}
