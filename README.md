# ИИ-помощник студента — фронтенд

Веб-приложение для НИУ ВШЭ МИЭМ: LLM-чат и база знаний для адаптации первокурсников. Сервис даёт фактически точные ответы, опираясь только на верифицированную базу знаний ВШЭ.

Этот репозиторий — **только фронтенд**. Бэкенд подключается по контрактам.

## Стек

- React 19 + Vite 8
- React Router v7
- CSS Modules + CSS-переменные
- React Context для аутентификации
- Нативный `fetch` + `WebSocket`

## Требования

Перед началом работы установить:

1. **Node.js 20+(рек.: 24.15)** — [nodejs.org](https://nodejs.org) (выбрать LTS). Проверка: `node -v`
2. **pnpm 11+** — после установки Node.js выполнить терминале (PowerShell или CMD):
   ```bash
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser # эта настройка необходима для установки pnpm без npm, 
                                                                        # можете сами почитать про неё
   corepack enable
   corepack prepare pnpm@11.0.0 --activate
   ```
   Проверка: `pnpm -v`
3. **Docker Desktop** — нужен только для запуска бэкенда. [docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop). Проверка: `docker -v`
4. **Git** — [git-scm.com](https://git-scm.com). Проверка: `git -v`

## Команды

```bash
pnpm install       # установить зависимости
pnpm run dev       # dev-сервер на http://localhost:5173
pnpm run build     # production-сборка в dist/
pnpm run preview   # локальный просмотр сборки
pnpm run lint      # ESLint
```

## Запуск локально (фронт + бэк)

1. Поднять бэк:
   ```bash
   cd backend-con/pochemuchnic-miem-prj
   cp .env.example .env   # если .env ещё нет — там уже подставлены рабочие дефолты
   docker compose up -d
   ```
   Nginx поднимается на `:80`. Проверка: `curl http://localhost/ping` → `pong`.

2. Запустить фронт (из корня репозитория):
   ```bash
   pnpm install
   pnpm run dev
   ```

3. Открыть `http://localhost:5173`. Vite проксирует запросы `/api/*` к nginx на `:80` (включая WebSocket-чат — он живёт под `/api/chat/ws/...`, отдельного `/ws`-маршрута нет).

**Полезные команды Docker:**
```bash
docker compose down     # остановить, данные сохранятся
docker compose down -v  # остановить и удалить все данные локально (БД, MinIO и т.д.)
docker compose logs auth-svc  # посмотреть логи (например, ссылки верификации email)
```

## Тестовый аккаунт

В `LoginPage` захардкожена кнопка быстрого входа (только в dev-режиме):

| Поле | Значение |
|------|----------|
| Email | `admin@edu.hse.ru` |
| Пароль | `admin` |

> Перед релизом надо убрать тестовый акк из `LoginPage.jsx` и `AuthProvider.jsx`.

## Документация API

### auth-svc

- `POST /api/auth/register`
- `GET /api/auth/verify-email?token=...`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `POST /api/auth/forgot-password`
- `POST /api/auth/update-password`
- `GET /api/users/me`
- `PATCH /api/users/me`
- `DELETE /api/users/me`

### chat-svc

- `WS /api/chat/ws/chat?token=<access_token>`

### library-svc

- `GET /api/library/tree`
- `POST /api/library/refresh`
- `GET /api/documents/{document_id}`
- `GET /api/documents/{document_id}/preview`
- `GET /api/documents/{document_id}/download`

### nginx (служебные)

- `GET /ping` — healthcheck

### Не для фронта

- `POST /api/auth/resend-verification` — есть в auth-svc, но не проброшен через nginx (нет в whitelist regex)
- `WS /api/chat/ws/internal/llm`, `/internal/*` (auth-svc), `/health`/`/healthz` сервисов, весь `db-svc` — служебные/межсервисные, не для UI

## Структура

```
src/
├── app/                  роутер, шапка, layout
├── features/
│   ├── auth/             страницы входа/регистрации, контекст, хуки, API
│   ├── chat/             WebSocket-чат (страница, компоненты, хук useChatSocket)
│   ├── profile/          страница профиля с формой редактирования
│   └── library/          библиотека документов: дерево тем, поиск, просмотр/скачивание
├── shared/
│   ├── api/              httpClient, config (API_BASE_URL, WS_URL)
│   ├── lib/              validators (email, password)
│   └── ui/               общие компоненты и SVG-иконки
└── styles/               design-токены (variables.css) и global.css
```
