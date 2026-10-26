import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import { plannerApi } from '../api/plannerApi';
import { ChevronLeftIcon, ChevronRightIcon, PlusIcon } from '../../../shared/ui/icons';
import { useNoteDialogs } from '../hooks/useNoteDialogs';
import { useNoteDrag } from '../hooks/useNoteDrag';
import { usePlannerNotes } from '../hooks/usePlannerNotes';
import {
  addDays,
  addMonths,
  diffInDays,
  formatDayTitle,
  formatMonthTitle,
  formatNoteDates,
  monthWeeks,
  shortMonth,
  startOfMonth,
  startOfWeek,
  toISODate,
  weeksFrom,
} from '../lib/dates';
import { noteKeyShift } from '../lib/noteKeys';
import { toneStyle } from '../lib/noteTone';
import { shiftNote } from '../lib/shiftNote';
import { layoutWeek, notesOnDay } from '../lib/weekLayout';
import styles from './MonthCalendar.module.css';

const WEEKDAYS_SHORT = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
// Сколько строк заметок помещается в неделе; остальное — «ещё N».
const MAX_LANES = 4;
// На телефоне вместо полос — точки под числом, не больше этого количества.
const MAX_DOTS = 3;

// Лента: сколько недель показать вокруг сегодняшней и сколько добавлять при прокрутке к краю.
const FEED_WEEKS_BEFORE = 8;
const FEED_INITIAL_WEEKS = 24;
const FEED_CHUNK = 12;

const cx = (...names) => names.filter(Boolean).join(' ');

const initialFeed = () => ({
  start: addDays(startOfWeek(new Date()), -7 * FEED_WEEKS_BEFORE),
  count: FEED_INITIAL_WEEKS,
});

function scrollParent(element) {
  for (let el = element?.parentElement; el; el = el.parentElement) {
    if (/(auto|scroll)/.test(getComputedStyle(el).overflowY)) return el;
  }
  return document.scrollingElement;
}

// Свободная строка для «призрака» в неделе, куда заметку ещё только тянут.
function freeLane(visible, startCol, span, skipId) {
  for (let lane = 0; lane < MAX_LANES; lane += 1) {
    const busy = visible.some(
      (s) =>
        s.note.id !== skipId &&
        s.lane === lane &&
        s.startCol < startCol + span &&
        startCol < s.startCol + s.span,
    );
    if (!busy) return lane;
  }
  return MAX_LANES - 1;
}

// Календарь в духе Notion: недели строками, многодневная заметка — полоса через дни, на
// неделе до MAX_LANES строк и «ещё N». Два вида: «Месяц» — шесть недель с переключением
// стрелками, и «Лента» — недели подряд, которые подгружаются при прокрутке вверх и вниз.
// Заметки тянутся мышью между любыми днями на экране, в том числе на другую неделю.
export function MonthCalendar() {
  const { user } = useAuth();
  const userId = user?.user_id;
  const { notes, move, noteTone } = usePlannerNotes();
  const { openCreate, openEdit, openDay, dialogs } = useNoteDialogs();
  const gridRef = useRef(null);
  const topRef = useRef(null);
  const feedStartRef = useRef(null);
  const feedEndRef = useRef(null);
  const pendingPrepend = useRef(null);
  const today = new Date();
  const todayISO = toISODate(today);
  const thisWeekISO = toISODate(startOfWeek(today));
  const [view, setView] = useState(() => plannerApi.loadCalendarView(userId));
  const [month, setMonth] = useState(() => startOfMonth(today));
  const [feed, setFeed] = useState(initialFeed);
  const [feedMonth, setFeedMonth] = useState(() => startOfMonth(today));
  const [scrollToToday, setScrollToToday] = useState(0);
  const isFeed = view === 'feed';

  const weeks = (isFeed ? weeksFrom(feed.start, feed.count) : monthWeeks(month)).map((dates) => {
    const days = dates.map(toISODate);
    return { dates, days, ...layoutWeek(notes, days, MAX_LANES) };
  });

  const changeView = (next) => {
    setView(next);
    plannerApi.saveCalendarView(userId, next);
    if (next === 'feed') {
      setFeed(initialFeed());
      setScrollToToday((n) => n + 1);
    }
  };

  const goToday = () => {
    if (isFeed) {
      setFeed(initialFeed());
      setScrollToToday((n) => n + 1);
    } else {
      setMonth(startOfMonth(new Date()));
    }
  };

  // Лента: сегодняшняя неделя — сразу под закреплённой шапкой.
  useLayoutEffect(() => {
    if (!isFeed) return;
    const row = gridRef.current?.querySelector(`[data-week="${thisWeekISO}"]`);
    const scroller = scrollParent(gridRef.current);
    if (!row || !scroller) return undefined;
    // Шапка прилипает, только когда страница уже прокручена, и её положение до прокрутки
    // другое — поэтому после первого сдвига выравниваем ещё раз по фактическому низу шапки.
    const alignBelowHeader = () => {
      const headerBottom = topRef.current?.getBoundingClientRect().bottom ?? scroller.getBoundingClientRect().top;
      scroller.scrollTop += row.getBoundingClientRect().top - headerBottom - 8;
    };
    alignBelowHeader();
    const frame = requestAnimationFrame(alignBelowHeader);
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- прокрутка только при входе в ленту и по «Сегодня»
  }, [isFeed, scrollToToday]);

  // Недели, добавленные сверху, не должны сдвигать то, на что пользователь смотрит.
  useLayoutEffect(() => {
    const pending = pendingPrepend.current;
    if (!pending) return;
    pendingPrepend.current = null;
    pending.scroller.scrollTop += pending.scroller.scrollHeight - pending.height;
  }, [feed.start]);

  // Подгрузка недель, когда к краю ленты остаётся около экрана. Наблюдатель пересоздаётся
  // после каждой подгрузки: если край всё ещё виден, он сразу сработает снова.
  useEffect(() => {
    if (!isFeed) return undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          if (entry.target === feedEndRef.current) {
            setFeed((f) => ({ ...f, count: f.count + FEED_CHUNK }));
          } else {
            const scroller = scrollParent(gridRef.current);
            pendingPrepend.current = { scroller, height: scroller.scrollHeight };
            setFeed((f) => ({ start: addDays(f.start, -7 * FEED_CHUNK), count: f.count + FEED_CHUNK }));
          }
          return;
        }
      },
      { rootMargin: '600px 0px' },
    );
    if (feedStartRef.current) observer.observe(feedStartRef.current);
    if (feedEndRef.current) observer.observe(feedEndRef.current);
    return () => observer.disconnect();
  }, [isFeed, feed]);

  // Заголовок ленты — месяц недели, которая сейчас первой под шапкой.
  useEffect(() => {
    if (!isFeed) return undefined;
    const scroller = scrollParent(gridRef.current);
    const target = scroller === document.scrollingElement ? window : scroller;
    const update = () => {
      const line = (topRef.current?.getBoundingClientRect().bottom ?? 0) + 1;
      const row = [...gridRef.current.querySelectorAll('[data-week]')].find(
        (r) => r.getBoundingClientRect().bottom > line,
      );
      if (!row) return;
      const thursday = addDays(new Date(`${row.dataset.week}T00:00:00`), 3);
      setFeedMonth((m) => (m.getTime() === startOfMonth(thursday).getTime() ? m : startOfMonth(thursday)));
    };
    update();
    target.addEventListener('scroll', update, { passive: true });
    return () => target.removeEventListener('scroll', update);
  }, [isFeed]);

  const { drag, noteHandlers, consumeClick } = useNoteDrag({
    gridRef,
    // Номер дня под курсором: неделя по вертикали × 7 + столбец по горизонтали.
    dayIndexAt: (clientX, clientY) => {
      const rows = [...gridRef.current.querySelectorAll('[data-week]')];
      const found = rows.findIndex((row) => clientY < row.getBoundingClientRect().bottom);
      const row = found === -1 ? rows.length - 1 : found;
      const rect = gridRef.current.getBoundingClientRect();
      const col = Math.min(6, Math.max(0, Math.floor(((clientX - rect.left) / rect.width) * 7)));
      return row * 7 + col;
    },
    onCommit: move,
  });

  const handleNoteKeyDown = (note, event) => {
    const shift = noteKeyShift(event, { vertical: true });
    if (!shift) return;
    event.preventDefault();
    move(note, shiftNote(note, shift.mode, shift.days));
  };

  const draggedNote = drag && notes.find((n) => n.id === drag.noteId);

  const ghostIn = (week) => {
    if (!draggedNote) return null;
    const first = week.days[0];
    const last = week.days[6];
    if (drag.end < first || drag.start > last) return null;
    const startCol = Math.max(0, diffInDays(first, drag.start));
    const span = Math.min(6, diffInDays(first, drag.end)) - startCol + 1;
    const own = week.visible.find((s) => s.note.id === draggedNote.id);
    return {
      startCol,
      span,
      lane: own?.lane ?? freeLane(week.visible, startCol, span, draggedNote.id),
      cutStart: drag.start < first,
      cutEnd: drag.end > last,
    };
  };

  return (
    <section className={cx(styles.calendar, isFeed && styles.feed)} aria-labelledby="calendar-title">
      <div ref={topRef} className={styles.top}>
        <header className={styles.header}>
          <div className={styles.titles}>
            <h1 id="calendar-title" className={styles.title}>
              Календарь
            </h1>
            <p className={styles.monthLabel} aria-live="polite">
              {formatMonthTitle(isFeed ? feedMonth : month)}
            </p>
          </div>
          <div className={styles.toolbar}>
            <div className={styles.views} role="group" aria-label="Вид календаря">
              <button
                type="button"
                className={cx(styles.viewButton, !isFeed && styles.viewActive)}
                aria-pressed={!isFeed}
                onClick={() => changeView('month')}
              >
                Месяц
              </button>
              <button
                type="button"
                className={cx(styles.viewButton, isFeed && styles.viewActive)}
                aria-pressed={isFeed}
                title="Недели подряд, листаются прокруткой"
                onClick={() => changeView('feed')}
              >
                Лента
              </button>
            </div>
            <button
              type="button"
              className={styles.create}
              onClick={() => openCreate({ start: todayISO, end: todayISO })}
            >
              <PlusIcon className={styles.createIcon} />
              Новая заметка
            </button>
            <div className={styles.nav}>
              {!isFeed && (
                <button
                  type="button"
                  className={styles.navButton}
                  aria-label="Предыдущий месяц"
                  onClick={() => setMonth((m) => addMonths(m, -1))}
                >
                  <ChevronLeftIcon className={styles.navIcon} />
                </button>
              )}
              <button type="button" className={cx(styles.navButton, styles.today)} onClick={goToday}>
                Сегодня
              </button>
              {!isFeed && (
                <button
                  type="button"
                  className={styles.navButton}
                  aria-label="Следующий месяц"
                  onClick={() => setMonth((m) => addMonths(m, 1))}
                >
                  <ChevronRightIcon className={styles.navIcon} />
                </button>
              )}
            </div>
          </div>
        </header>

        <div className={styles.weekdays} aria-hidden="true">
          {WEEKDAYS_SHORT.map((name) => (
            <span key={name}>{name}</span>
          ))}
        </div>
      </div>

      {isFeed && <div ref={feedStartRef} className={styles.sentinel} aria-hidden="true" />}

      <div
        ref={gridRef}
        className={cx(styles.month, drag && (drag.mode === 'move' ? styles.moving : styles.resizing))}
      >
        {weeks.map((week) => {
          const ghost = ghostIn(week);
          return (
            <div key={week.days[0]} className={styles.week} data-week={week.days[0]}>
              {week.dates.map((date, col) => {
                const day = week.days[col];
                const inMonth = isFeed || date.getMonth() === month.getMonth();
                const isToday = day === todayISO;
                const dayNotes = notesOnDay(notes, day);
                const label = date.getDate() === 1 ? `${date.getDate()} ${shortMonth(date)}` : date.getDate();
                return (
                  <div
                    key={day}
                    className={cx(styles.day, col >= 5 && styles.weekend, !inMonth && styles.outside)}
                    style={{ gridColumn: col + 1 }}
                  >
                    <div className={styles.dayHead}>
                      <button
                        type="button"
                        className={styles.add}
                        aria-label={`Добавить заметку на ${formatDayTitle(date)}`}
                        onClick={() => openCreate({ start: day, end: day })}
                      >
                        <PlusIcon className={styles.addIcon} />
                      </button>
                      <span className={cx(styles.dayNumber, isToday && styles.dayToday)} aria-current={isToday ? 'date' : undefined}>
                        {label}
                      </span>
                    </div>
                    {/* На телефоне полос нет: день целиком — кнопка со списком заметок. */}
                    <button
                      type="button"
                      className={styles.dayButton}
                      aria-label={`${formatDayTitle(date)}${dayNotes.length ? `, заметок: ${dayNotes.length}` : ''}`}
                      onClick={() => openDay(day)}
                    >
                      <span className={cx(styles.dayButtonNumber, isToday && styles.dayToday)}>{date.getDate()}</span>
                      <span className={styles.dots}>
                        {dayNotes.slice(0, MAX_DOTS).map((note) => (
                          <span key={note.id} className={styles.dot} style={toneStyle(noteTone(note))} />
                        ))}
                      </span>
                    </button>
                  </div>
                );
              })}

              {week.visible.map(({ note, startCol, span, lane, continuesBefore, continuesAfter }) => (
                <button
                  key={note.id}
                  type="button"
                  className={cx(
                    styles.note,
                    continuesBefore && styles.cutStart,
                    continuesAfter && styles.cutEnd,
                    drag?.noteId === note.id && styles.dragSource,
                  )}
                  style={{ ...toneStyle(noteTone(note)), gridColumn: `${startCol + 1} / span ${span}`, gridRow: lane + 2 }}
                  title={`${note.title} · ${formatNoteDates(note.start, note.end)}`}
                  aria-label={`${note.title}, ${formatNoteDates(note.start, note.end)}`}
                  aria-keyshortcuts="Alt+ArrowLeft Alt+ArrowRight Alt+ArrowUp Alt+ArrowDown Alt+Shift+ArrowLeft Alt+Shift+ArrowRight"
                  {...noteHandlers(note)}
                  onKeyDown={(event) => handleNoteKeyDown(note, event)}
                  onClick={() => {
                    if (!consumeClick()) openEdit(note);
                  }}
                >
                  {!continuesBefore && <span className={styles.handleStart} data-edge="start" aria-hidden="true" />}
                  <span className={styles.noteTitle}>{note.title}</span>
                  {!continuesAfter && <span className={styles.handleEnd} data-edge="end" aria-hidden="true" />}
                </button>
              ))}

              {ghost && (
                <div
                  className={cx(
                    styles.note,
                    styles.ghost,
                    ghost.cutStart && styles.cutStart,
                    ghost.cutEnd && styles.cutEnd,
                  )}
                  style={{
                    ...toneStyle(noteTone(draggedNote)),
                    gridColumn: `${ghost.startCol + 1} / span ${ghost.span}`,
                    gridRow: ghost.lane + 2,
                  }}
                  aria-hidden="true"
                >
                  <span className={styles.noteTitle}>{draggedNote.title}</span>
                </div>
              )}

              {week.hidden.map(
                (count, col) =>
                  count > 0 && (
                    <button
                      key={`more-${week.days[col]}`}
                      type="button"
                      className={styles.more}
                      style={{ gridColumn: col + 1, gridRow: MAX_LANES + 2 }}
                      onClick={() => openDay(week.days[col])}
                    >
                      ещё {count}
                    </button>
                  ),
              )}
            </div>
          );
        })}
      </div>

      {isFeed && <div ref={feedEndRef} className={styles.sentinel} aria-hidden="true" />}

      {dialogs}
    </section>
  );
}
