import { useRef, useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, PlusIcon } from '../../../shared/ui/icons';
import { useNoteDialogs } from '../hooks/useNoteDialogs';
import { useNoteDrag } from '../hooks/useNoteDrag';
import { usePlannerNotes } from '../hooks/usePlannerNotes';
import {
  WEEKDAYS,
  addDays,
  diffInDays,
  formatDayTitle,
  formatNoteDates,
  formatWeekRange,
  startOfWeek,
  toISODate,
  weekCaption,
} from '../lib/dates';
import { noteKeyShift } from '../lib/noteKeys';
import { toneStyle } from '../lib/noteTone';
import { shiftNote } from '../lib/shiftNote';
import { layoutWeek, notesOnDay } from '../lib/weekLayout';
import styles from './WeekCalendar.module.css';

// Сколько строк заметок помещается под днём; остальное — «ещё N».
const MAX_LANES = 5;

const noteClass = (extra = '') => [styles.note, extra].filter(Boolean).join(' ');

export function WeekCalendar() {
  const { notes, move, noteTone } = usePlannerNotes();
  const { openCreate: openNoteDialog, openEdit, openDay, dialogs } = useNoteDialogs();
  const gridRef = useRef(null);
  const today = new Date();
  const todayISO = toISODate(today);
  const [weekStart, setWeekStart] = useState(() => startOfWeek(today));

  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const dayISOs = days.map(toISODate);
  const { visible, hidden } = layoutWeek(notes, dayISOs, MAX_LANES);

  const openCreate = (day) => openNoteDialog({ start: day, end: day });

  const { drag, noteHandlers, consumeClick } = useNoteDrag({
    gridRef,
    dayIndexAt: (clientX) => {
      const rect = gridRef.current.getBoundingClientRect();
      return Math.min(6, Math.max(0, Math.floor(((clientX - rect.left) / rect.width) * 7)));
    },
    onCommit: move,
  });

  const handleNoteKeyDown = (note, event) => {
    const shift = noteKeyShift(event);
    if (!shift) return;
    event.preventDefault();
    move(note, shiftNote(note, shift.mode, shift.days));
  };

  const ghost = (() => {
    if (!drag) return null;
    const source = visible.find((segment) => segment.note.id === drag.noteId);
    const startCol = Math.max(0, diffInDays(dayISOs[0], drag.start));
    const endCol = Math.min(6, diffInDays(dayISOs[0], drag.end));
    if (!source || endCol < 0 || startCol > 6) return null;
    return {
      note: source.note,
      lane: source.lane,
      startCol,
      span: endCol - startCol + 1,
      continuesBefore: drag.start < dayISOs[0],
      continuesAfter: drag.end > dayISOs[6],
    };
  })();

  return (
    <section className={styles.card} aria-labelledby="week-calendar-title">
      <header className={styles.header}>
        <div className={styles.titles}>
          <h2 id="week-calendar-title" className={styles.title}>
            Календарь на неделю
          </h2>
          <p className={styles.caption}>{weekCaption(weekStart, today)}</p>
          <p className={styles.range} aria-live="polite">
            {formatWeekRange(days[0], days[6])}
          </p>
        </div>
        <div className={styles.nav}>
          <button
            type="button"
            className={styles.navButton}
            aria-label="Предыдущая неделя"
            onClick={() => setWeekStart((d) => addDays(d, -7))}
          >
            <ChevronLeftIcon className={styles.navIcon} />
          </button>
          <button
            type="button"
            className={`${styles.navButton} ${styles.today}`}
            onClick={() => setWeekStart(startOfWeek(new Date()))}
          >
            Сегодня
          </button>
          <button
            type="button"
            className={styles.navButton}
            aria-label="Следующая неделя"
            onClick={() => setWeekStart((d) => addDays(d, 7))}
          >
            <ChevronRightIcon className={styles.navIcon} />
          </button>
        </div>
      </header>

      {/* Сетка недели — от планшета и шире; на телефоне вместо неё список по дням ниже. */}
      <div className={styles.week}>
        <div className={styles.weekdays} aria-hidden="true">
          {WEEKDAYS.map((name) => (
            <span key={name}>{name}</span>
          ))}
        </div>
        <div
          ref={gridRef}
          className={[
            styles.grid,
            drag && (drag.mode === 'move' ? styles.gridMoving : styles.gridResizing),
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {dayISOs.map((day, col) => (
            <div key={`bg-${day}`} className={styles.column} style={{ gridColumn: col + 1 }} />
          ))}

          {days.map((date, col) => {
            const day = dayISOs[col];
            const isToday = day === todayISO;
            return (
              <div key={`head-${day}`} className={styles.dayHead} style={{ gridColumn: col + 1 }}>
                <button
                  type="button"
                  className={styles.addButton}
                  aria-label={`Добавить заметку на ${formatDayTitle(date)}`}
                  onClick={() => openCreate(day)}
                >
                  <PlusIcon className={styles.addIcon} />
                </button>
                <span
                  className={isToday ? `${styles.dayNumber} ${styles.dayToday}` : styles.dayNumber}
                  aria-current={isToday ? 'date' : undefined}
                >
                  {date.getDate()}
                </span>
              </div>
            );
          })}

          {visible.map(({ note, startCol, span, lane, continuesBefore, continuesAfter }) => (
            <button
              key={note.id}
              type="button"
              className={noteClass(
                [
                  continuesBefore && styles.cutStart,
                  continuesAfter && styles.cutEnd,
                  drag?.noteId === note.id && styles.dragSource,
                ]
                  .filter(Boolean)
                  .join(' '),
              )}
              style={{ ...toneStyle(noteTone(note)), gridColumn: `${startCol + 1} / span ${span}`, gridRow: lane + 2 }}
              title={`${note.title} · ${formatNoteDates(note.start, note.end)}`}
              aria-label={`${note.title}, ${formatNoteDates(note.start, note.end)}`}
              aria-keyshortcuts="Alt+ArrowLeft Alt+ArrowRight Alt+Shift+ArrowLeft Alt+Shift+ArrowRight"
              {...noteHandlers(note)}
              onKeyDown={(event) => handleNoteKeyDown(note, event)}
              onClick={() => {
                if (!consumeClick()) openEdit(note);
              }}
            >
              {/* Края заметки тянутся, чтобы сдвинуть начало или конец. У полосы, обрезанной
                  краем недели, ручки с этой стороны нет — тот край в другой неделе. */}
              {!continuesBefore && <span className={styles.handleStart} data-edge="start" aria-hidden="true" />}
              <span className={styles.noteTitle}>{note.title}</span>
              {!continuesAfter && <span className={styles.handleEnd} data-edge="end" aria-hidden="true" />}
            </button>
          ))}

          {ghost && (
            <div
              className={noteClass(
                [styles.ghost, ghost.continuesBefore && styles.cutStart, ghost.continuesAfter && styles.cutEnd]
                  .filter(Boolean)
                  .join(' '),
              )}
              style={{
                ...toneStyle(noteTone(ghost.note)),
                gridColumn: `${ghost.startCol + 1} / span ${ghost.span}`,
                gridRow: ghost.lane + 2,
              }}
              aria-hidden="true"
            >
              <span className={styles.noteTitle}>{ghost.note.title}</span>
            </div>
          )}

          {hidden.map(
            (count, col) =>
              count > 0 && (
                <button
                  key={`more-${dayISOs[col]}`}
                  type="button"
                  className={styles.more}
                  style={{ gridColumn: col + 1, gridRow: MAX_LANES + 2 }}
                  onClick={() => openDay(dayISOs[col])}
                >
                  ещё {count}
                </button>
              ),
          )}
        </div>
      </div>

      <ol className={styles.agenda}>
        {days.map((date, col) => {
          const day = dayISOs[col];
          const dayNotes = notesOnDay(notes, day);
          const isToday = day === todayISO;
          return (
            <li key={`agenda-${day}`} className={styles.agendaDay}>
              <div className={styles.agendaHead}>
                <span className={isToday ? `${styles.agendaDate} ${styles.agendaToday}` : styles.agendaDate}>
                  {formatDayTitle(date)}
                  {isToday && <span className={styles.todayBadge}>сегодня</span>}
                </span>
                <button
                  type="button"
                  className={styles.addButton}
                  aria-label={`Добавить заметку на ${formatDayTitle(date)}`}
                  onClick={() => openCreate(day)}
                >
                  <PlusIcon className={styles.addIcon} />
                </button>
              </div>
              {dayNotes.length > 0 ? (
                <div className={styles.agendaNotes}>
                  {dayNotes.map((note) => (
                    <button
                      key={note.id}
                      type="button"
                      className={noteClass(styles.agendaNote)}
                      style={toneStyle(noteTone(note))}
                      onClick={() => openEdit(note)}
                    >
                      {note.title}
                      {note.start !== note.end && (
                        <span className={styles.noteDates}>{formatNoteDates(note.start, note.end)}</span>
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                <p className={styles.agendaEmpty}>Нет заметок</p>
              )}
            </li>
          );
        })}
      </ol>

      {dialogs}
    </section>
  );
}
