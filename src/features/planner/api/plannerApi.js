// TODO(backend): PROBLEMS.md#21 — хранить заметки календаря в аккаунте. Пока они лежат
// в localStorage этого браузера под id пользователя: на другом устройстве их не будет.
// Замена на API — только здесь, интерфейс (load/save) останется тем же.

const keyFor = (kind, userId) => `student-mentor:planner-${kind}:${userId}`;

function read(kind, userId, fallback) {
  if (!userId) return fallback;
  try {
    const parsed = JSON.parse(window.localStorage.getItem(keyFor(kind, userId)) ?? 'null');
    return parsed ?? fallback;
  } catch {
    // Повреждённая запись или запрещённое хранилище: начинаем с пустого календаря.
    return fallback;
  }
}

function write(kind, userId, value) {
  if (!userId) throw new Error('Нет пользователя — заметку некуда сохранить.');
  window.localStorage.setItem(keyFor(kind, userId), JSON.stringify(value));
}

const asArray = (value) => (Array.isArray(value) ? value : []);

export const plannerApi = {
  load: (userId) => asArray(read('notes', userId, [])),
  save: (userId, notes) => write('notes', userId, notes),
  loadTags: (userId) => asArray(read('tags', userId, [])),
  saveTags: (userId, tags) => write('tags', userId, tags),
  // Выбор тегов в фильтре «Дедлайнов» — настройка вида, а не данные: при сбое просто не
  // запоминается.
  loadCalendarView: (userId) => (read('calendar-view', userId, 'month') === 'feed' ? 'feed' : 'month'),
  saveCalendarView(userId, view) {
    try {
      write('calendar-view', userId, view);
    } catch {
      // Вид календаря — настройка: не запомнился, значит в следующий раз будет «Месяц».
    }
  },
  loadDeadlineFilter: (userId) => asArray(read('deadline-filter', userId, [])),
  saveDeadlineFilter(userId, tagIds) {
    try {
      write('deadline-filter', userId, tagIds);
    } catch {
      // см. комментарий выше
    }
  },
};
