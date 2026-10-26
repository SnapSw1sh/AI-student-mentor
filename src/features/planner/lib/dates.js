// Даты заметок хранятся строкой «YYYY-MM-DD» в местном времени, без часов и часового пояса:
// через Date/ISO с временем заметка, созданная вечером, при пересчёте в UTC уезжала бы
// на день назад.

const MONTHS_GENITIVE = [
  'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
  'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря',
];

export const WEEKDAYS = [
  'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье',
];

const pad = (n) => String(n).padStart(2, '0');

export const toISODate = (date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

export function parseISODate(text) {
  const [y, m, d] = text.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export const addDays = (date, days) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);

export function startOfWeek(date) {
  const mondayBased = (date.getDay() + 6) % 7;
  return addDays(date, -mondayBased);
}

export const diffInDays = (from, to) =>
  Math.round((parseISODate(to) - parseISODate(from)) / 86_400_000);

const dayMonth = (date) => `${date.getDate()} ${MONTHS_GENITIVE[date.getMonth()]}`;

export function formatWeekRange(start, end) {
  const sameYear = start.getFullYear() === end.getFullYear();
  const now = new Date().getFullYear();
  const startText = sameYear ? dayMonth(start) : `${dayMonth(start)} ${start.getFullYear()}`;
  const endText = end.getFullYear() === now && sameYear ? dayMonth(end) : `${dayMonth(end)} ${end.getFullYear()}`;
  return `${startText} — ${endText}`;
}

export function formatNoteDates(startISO, endISO) {
  const start = parseISODate(startISO);
  if (startISO === endISO) return dayMonth(start);
  return `${dayMonth(start)} — ${dayMonth(parseISODate(endISO))}`;
}

export function formatDayTitle(date) {
  const weekday = WEEKDAYS[(date.getDay() + 6) % 7].toLowerCase();
  return `${dayMonth(date)}, ${weekday}`;
}

function plural(n, one, few, many) {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}

export function weekCaption(weekStart, today) {
  const offset = Math.round(diffInDays(toISODate(startOfWeek(today)), toISODate(weekStart)) / 7);
  if (offset === 0) return 'Ближайшая неделя';
  if (offset === -1) return 'Прошлая неделя';
  if (offset === 1) return 'Следующая неделя';
  const n = Math.abs(offset);
  const word = plural(n, 'неделю', 'недели', 'недель');
  return offset > 0 ? `Через ${n} ${word}` : `${n} ${word} назад`;
}

const MONTHS_NOMINATIVE = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',
];

const MONTHS_SHORT = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];

export const startOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1);

export const addMonths = (date, months) => new Date(date.getFullYear(), date.getMonth() + months, 1);

export const formatMonthTitle = (date) => `${MONTHS_NOMINATIVE[date.getMonth()]} ${date.getFullYear()}`;

export const shortMonth = (date) => MONTHS_SHORT[date.getMonth()];

export const weeksFrom = (weekStart, count) =>
  Array.from({ length: count }, (_, w) => Array.from({ length: 7 }, (_, d) => addDays(weekStart, w * 7 + d)));

// Месяц в сетке — всегда шесть недель с понедельника недели, где 1-е число: столько нужно
// самому длинному месяцу. Постоянная высота сетки — чтобы при переключении месяца она не
// прыгала. Соседние дни по краям тоже в сетке, как в Notion.
export const monthWeeks = (monthStart) => weeksFrom(startOfWeek(monthStart), 6);
