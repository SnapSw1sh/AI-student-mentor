# ИИ-помощник студента — фронтенд

Веб-приложение для НИУ ВШЭ МИЭМ: LLM-чат и база знаний для адаптации первокурсников. Сервис даёт фактически точные ответы, опираясь только на верифицированную базу знаний ВШЭ.

Этот репозиторий — **только фронтенд**. Бэкенд подключается по контрактам.

## Стек

- React 19 + Vite 8
- React Router v6
- CSS Modules + CSS-переменные
- React Context для аутентификации
- Нативный `fetch` + `WebSocket`

## Команды

```bash
pnpm install       # установить зависимости
pnpm run dev       # dev-сервер на http://localhost:5173
pnpm run build     # production-сборка в dist/
pnpm run preview   # локальный просмотр сборки
pnpm run lint      # ESLint
```

## Запуск локально (фронт + бэк)

1. Поднять бэк (nginx на `:80` + микросервисы) — из папки с бэкенд-репозиторием:
   ```bash
   docker compose up -d
   ```

2. Запустить фронт:
   ```bash
   pnpm install
   pnpm run dev
   ```

3. Открыть `http://localhost:5173`. Vite проксирует `/api/*` и `/ws` к nginx на `:80`.

Проверка, что бэк живой: `curl http://localhost/ping` → `pong`.

## Тестовый аккаунт

В `LoginPage` захардкожена кнопка быстрого входа (только в dev-режиме):

| Поле | Значение |
|------|----------|
| Email | `admin@edu.hse.ru` |
| Пароль | `admin` |

> Перед релизом надо убрать тестовый акк из `LoginPage.jsx` и `AuthProvider.jsx`.

## Структура

```
src/
├── app/                  роутер, шапка, layout
├── features/
│   ├── auth/             страницы входа/регистрации, контекст, хуки, API
│   ├── chat/             WebSocket-чат (страница, компоненты, хук useChatSocket)
│   └── profile/          страница профиля с формой редактирования
└── shared/
    ├── api/              httpClient, config (API_BASE_URL, WS_URL)
    ├── lib/              validators (email, password)
    ├── ui/               общие компоненты и SVG-иконки
    └── styles/           design-токены (variables.css) и global.css
```
