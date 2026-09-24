// Какие разделы открыты гостю. Бэк пока не пускает гостей: nginx отдаёт /api/chat/,
// /api/library/ и /api/documents/ только с токеном, а у chat-svc нет гостевого режима.
// TODO(backend): PROBLEMS.md#19 — когда бэк откроет доступ, включить флаг раздела.
export const GUEST_ACCESS = {
  chat: false,
  library: false,
};
