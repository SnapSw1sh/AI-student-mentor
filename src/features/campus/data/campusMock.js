// TODO(backend): макет раздела — этажи, аудитории и места условные. В БД есть только
// core.buildings с адресами и map_url, API для навигации нет (PROBLEMS.md#23).
export const CAMPUS_ADDRESS = 'МИЭМ НИУ ВШЭ · ул. Таллинская, 34';

export const FLOORS = [1, 2, 3, 4, 5];

// На каждом этаже 12 мест под помещения: 0–5 — над коридором, 6–11 — под ним.
// span занимает соседние места в том же ряду.
export const SLOTS_PER_ROW = 6;
export const SLOTS_PER_FLOOR = SLOTS_PER_ROW * 2;

export const CATEGORIES = [
  { id: 'all', label: 'Все' },
  { id: 'study', label: 'Учёба' },
  { id: 'food', label: 'Еда' },
  { id: 'service', label: 'Сервисы' },
];

export const PLACES = [
  { id: 'entrance', name: 'Главный вход', category: 'service', floor: 1, slot: 0 },
  { id: 'cloakroom', name: 'Гардероб', category: 'service', floor: 1, slot: 1 },
  { id: 'cafe', name: 'Кофейня', category: 'food', floor: 1, slot: 4, span: 2 },
  { id: 'canteen', name: 'Столовая', category: 'food', floor: 1, slot: 6, span: 3 },
  { id: 'library', name: 'Библиотека', category: 'study', floor: 2, slot: 2, span: 2 },
  { id: 'medical', name: 'Медпункт', category: 'service', floor: 2, slot: 10 },
  { id: 'office', name: 'Учебный офис', category: 'service', floor: 3, slot: 0, span: 2 },
  { id: 'coworking', name: 'Коворкинг', category: 'study', floor: 3, slot: 8, span: 2 },
  { id: 'lab', name: 'Лаборатория электроники', category: 'study', floor: 4, slot: 3, span: 2 },
  { id: 'hall', name: 'Актовый зал', category: 'study', floor: 5, slot: 6, span: 3 },
];

export function roomNumber(floor, slot) {
  return `${floor}${String(slot + 1).padStart(2, '0')}`;
}

export function findRoom(query) {
  const match = /^([1-9])(\d{2})$/.exec(query.trim());
  if (!match) return null;
  const floor = Number(match[1]);
  const slot = Number(match[2]) - 1;
  if (!FLOORS.includes(floor) || slot < 0 || slot >= SLOTS_PER_FLOOR) return null;
  const covered = PLACES.some(
    (place) => place.floor === floor && slot >= place.slot && slot < place.slot + (place.span ?? 1),
  );
  return covered ? null : { floor, slot };
}
