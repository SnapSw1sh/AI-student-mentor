# ИИ-помощник студента — фронтенд

Веб-приложение для НИУ ВШЭ МИЭМ: LLM-чат (аналог робота Макса) и база знаний для адаптации первокурсников. Сервис даёт фактически точные ответы, опираясь только на верифицированную базу знаний ВШЭ.

Этот репозиторий — **только фронтенд**. Бэкенд лежит в [backend-con/](backend-con/) read-only и используется как контекст для интеграции.

## Стек

- React 19 + Vite 8
- React Router v6
- CSS Modules + CSS-переменные
- React Context для аутентификации
- Нативный `fetch` + `WebSocket`

## Команды

```bash
npm install        # установить зависимости
npm run dev        # dev-сервер на http://localhost:5173
npm run build      # production-сборка в dist/
npm run preview    # локальный просмотр сборки
npm run lint       # ESLint
```

## Запуск локально (фронт + бэк)

1. Поднять бэк (nginx на `:80` + микросервисы):
   ```bash
   cd backend-con/pochemuchnic-miem-prj
   docker compose up -d
   ```

2. Запустить фронт:
   ```bash
   npm install
   npm run dev
   ```

3. Открыть `http://localhost:5173`. Vite проксирует `/api/*` и `/ws` к nginx на `:80`.

Проверка, что бэк живой: `curl http://localhost/ping` → `pong`.

## Структура

```
├── CLAUDE.md           правила проекта для Claude Code
├── TODO.md             поэтапная дорожная карта
├── docs/
│   ├── API.md          контракты бэкенда
│   └── LOGIC.md        логика поведения кнопок
├── legacy/             старый HTML-фронт (дизайн-эталон, read-only)
├── backend-con/        бэкенд (read-only, для контекста)
└── src/                React-приложение (см. CLAUDE.md §3)
```

## Документация

- [CLAUDE.md](CLAUDE.md) — контекст, стек, структура, правила работы.
- [TODO.md](TODO.md) — поэтапная дорожная карта миграции.
- [docs/API.md](docs/API.md) — REST + WebSocket контракты с примерами JSON.
- [docs/LOGIC.md](docs/LOGIC.md) — логика поведения кнопок (заполняется по ходу реализации).
