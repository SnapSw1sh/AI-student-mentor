import { addDays, parseISODate, toISODate } from './dates';

const shiftDate = (iso, days) => toISODate(addDays(parseISODate(iso), days));

// mode: 'move' — заметка целиком на days дней с той же длиной; 'start' / 'end' — сдвиг
// одного края, но не дальше другого: заметка не короче одного дня.
export function shiftNote(note, mode, days) {
  if (mode === 'start') {
    const start = shiftDate(note.start, days);
    return { start: start > note.end ? note.end : start, end: note.end };
  }
  if (mode === 'end') {
    const end = shiftDate(note.end, days);
    return { start: note.start, end: end < note.start ? note.start : end };
  }
  return { start: shiftDate(note.start, days), end: shiftDate(note.end, days) };
}
