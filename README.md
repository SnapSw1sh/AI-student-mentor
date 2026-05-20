# ИИ-помощник студента — фронтенд

Веб-приложение для НИУ ВШЭ МИЭМ: LLM-чат и база знаний для адаптации первокурсников. Сервис даёт фактически точные ответы, опираясь только на верифицированную базу знаний ВШЭ.

Этот репозиторий — **только фронтенд**. Бэкенд лежит в отдельном репозитории и подключается по контрактам, описанным в `docs/API.md`.

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
   cd pochemuchnic-miem-prj  # из другого репозитория (main-svc)
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
├── .gitignore
├── eslint.config.js                  ESLint flat config
├── index.html                        Vite-шаблон с #root
├── package.json
├── package-lock.json
├── vite.config.js                    dev-прокси /api/*, /ws → http://localhost; алиас @ → src/
├── README.md
└── src/
    ├── main.jsx                      точка входа, импорт CSS-токенов
    ├── app/
    │   ├── App.jsx                   <BrowserRouter> + <AuthProvider> + <AppRoutes/>
    │   ├── routes.jsx                все маршруты приложения
    │   ├── Header.jsx                шапка с лого, навигацией и аватаркой
    │   ├── Header.module.css
    │   ├── AppLayout.jsx             обёртка с Header + <Outlet/> для protected-страниц
    │   ├── AppLayout.module.css
    │   └── Placeholder.module.css    стили для заглушек /, /library, /campus, /support
    ├── features/
    │   ├── auth/
    │   │   ├── api/
    │   │   │   └── authApi.js        login, register, refresh, logout, forgotPassword,
    │   │   │                         updatePassword, verifyEmail, getProfile, updateProfile
    │   │   ├── components/
    │   │   │   ├── AuthWrapper.jsx           белый бокс 408px с тенью
    │   │   │   ├── AuthWrapper.module.css
    │   │   │   ├── EmailField.jsx            input + email-иконка
    │   │   │   ├── EmailField.module.css
    │   │   │   ├── PasswordField.jsx         input + password-иконка + кнопка-«глаз»
    │   │   │   ├── PasswordField.module.css
    │   │   │   ├── ProtectedRoute.jsx        guard: нет токена → /login
    │   │   │   ├── StatusPage.jsx            общий шаблон 4 status-страниц
    │   │   │   ├── StatusPage.module.css
    │   │   │   └── authStyles.module.css     общие стили текстов формы
    │   │   ├── context/
    │   │   │   ├── AuthContext.js            createContext
    │   │   │   └── AuthProvider.jsx          silent-refresh, login, logout, updateProfile
    │   │   ├── hooks/
    │   │   │   └── useAuth.js                useContext(AuthContext)
    │   │   └── pages/
    │   │       ├── LoginPage.jsx
    │   │       ├── RegisterPage.jsx
    │   │       ├── RegisterSuccessPage.jsx
    │   │       ├── ForgotPasswordPage.jsx
    │   │       ├── EmailSentPage.jsx
    │   │       ├── NewPasswordPage.jsx
    │   │       ├── NewPasswordSuccessPage.jsx
    │   │       ├── LinkErrorPage.jsx
    │   │       └── VerifyEmailPage.jsx
    │   └── profile/
    │       ├── components/
    │       │   ├── ProfileSidebar.jsx              аватар, ФИО, табы, кнопка «Выйти»
    │       │   ├── ProfileSidebar.module.css
    │       │   ├── PersonalDataForm.jsx            форма редактирования
    │       │   └── PersonalDataForm.module.css
    │       └── pages/
    │           ├── ProfilePage.jsx
    │           └── ProfilePage.module.css
    ├── shared/
    │   ├── api/
    │   │   ├── config.js             API_BASE_URL, WS_URL
    │   │   └── httpClient.js         fetch-обёртка с авто-401 → refresh → retry
    │   ├── lib/
    │   │   └── validators.js         isValidEmail, isValidPassword
    │   └── ui/
    │       ├── Button.jsx + .module.css     основная кнопка + ButtonLink
    │       ├── FormError.jsx + .module.css  красное сообщение под формой
    │       ├── Logo.jsx + .module.css       SVG-логотип
    │       └── icons/
    │           ├── index.js                 баррель-экспорт
    │           ├── EmailIcon.jsx
    │           ├── PasswordIcon.jsx
    │           ├── EyeOpenIcon.jsx
    │           ├── EyeClosedIcon.jsx
    │           ├── SuccessCheckIcon.jsx
    │           ├── SuccessLockIcon.jsx
    │           ├── MailSentIcon.jsx
    │           ├── LinkErrorIcon.jsx
    │           ├── EditPencilIcon.jsx
    │           ├── ChevronDownIcon.jsx
    │           ├── AvatarPlaceholderIcon.jsx
    │           ├── SidebarUserIcon.jsx
    │           └── LogoutIcon.jsx
    └── styles/
        ├── variables.css             дизайн-токены
        └── global.css                reset + body + @import шрифтов
```
