// TODO(backend): PROBLEMS.md#20 — хранить шаблоны пользователя в аккаунте. Пока они лежат
// в localStorage этого браузера под id пользователя: на другом устройстве их не будет.
// Замена на API — только здесь, интерфейс (load/save) останется тем же.

const keyFor = (userId) => `student-mentor:grade-templates:${userId}`;

export const myTemplatesApi = {
  load(userId) {
    if (!userId) return [];
    try {
      const parsed = JSON.parse(window.localStorage.getItem(keyFor(userId)) ?? '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      // Повреждённая запись или запрещённое хранилище: начинаем с пустого списка.
      return [];
    }
  },

  save(userId, templates) {
    if (!userId) throw new Error('Нет пользователя — шаблон некуда сохранить.');
    window.localStorage.setItem(keyFor(userId), JSON.stringify(templates));
  },
};
