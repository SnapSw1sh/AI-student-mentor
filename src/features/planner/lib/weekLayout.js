import { diffInDays } from './dates';

// Раскладка заметок недели по строкам, как в Notion: многодневная заметка — одна полоса
// через несколько дней. Каждая заметка встаёт в первую строку, где все её дни свободны.
// Что не влезло в maxLanes строк, не рисуется, а считается в «ещё N» под каждым днём.
export function layoutWeek(notes, weekDays, maxLanes) {
  const first = weekDays[0];
  const last = weekDays[weekDays.length - 1];

  const segments = notes
    .filter((note) => note.start <= last && note.end >= first)
    .map((note) => {
      const startCol = Math.max(0, diffInDays(first, note.start));
      const endCol = Math.min(weekDays.length - 1, diffInDays(first, note.end));
      return {
        note,
        startCol,
        span: endCol - startCol + 1,
        continuesBefore: note.start < first,
        continuesAfter: note.end > last,
      };
    })
    .sort(
      (a, b) =>
        a.startCol - b.startCol || b.span - a.span || a.note.title.localeCompare(b.note.title, 'ru'),
    );

  const lanes = [];
  const visible = [];
  const hidden = Array(weekDays.length).fill(0);

  for (const segment of segments) {
    const cols = Array.from({ length: segment.span }, (_, i) => segment.startCol + i);
    let lane = lanes.findIndex((busy) => cols.every((c) => !busy[c]));
    if (lane === -1) {
      lane = lanes.length;
      lanes.push(Array(weekDays.length).fill(false));
    }
    cols.forEach((c) => {
      lanes[lane][c] = true;
    });
    if (lane < maxLanes) visible.push({ ...segment, lane });
    else cols.forEach((c) => (hidden[c] += 1));
  }

  return { visible, hidden };
}

export const notesOnDay = (notes, day) =>
  notes
    .filter((note) => note.start <= day && note.end >= day)
    .sort((a, b) => a.start.localeCompare(b.start) || a.title.localeCompare(b.title, 'ru'));
