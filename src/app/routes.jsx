import { lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { LoginPage } from '../features/auth/pages/LoginPage';
import { RegisterPage } from '../features/auth/pages/RegisterPage';
import { RegisterSuccessPage } from '../features/auth/pages/RegisterSuccessPage';
import { ForgotPasswordPage } from '../features/auth/pages/ForgotPasswordPage';
import { EmailSentPage } from '../features/auth/pages/EmailSentPage';
import { NewPasswordPage } from '../features/auth/pages/NewPasswordPage';
import { NewPasswordSuccessPage } from '../features/auth/pages/NewPasswordSuccessPage';
import { LinkErrorPage } from '../features/auth/pages/LinkErrorPage';
import { VerifyEmailPage } from '../features/auth/pages/VerifyEmailPage';
import { ProtectedRoute } from '../features/auth/components/ProtectedRoute';
import { GuestGate } from '../features/auth/components/GuestGate';
import { useAuth } from '../features/auth/hooks/useAuth';
import { AppLayout } from './AppLayout';

// Разделы приложения загружаются при первом переходе в них, а не все сразу при открытии сайта.
// Страницы входа и регистрации остаются в основном файле: с них начинает новый пользователь.
const lazyNamed = (load, name) => lazy(() => load().then((module) => ({ default: module[name] })));

const HomePage = lazyNamed(() => import('../features/home/pages/HomePage'), 'HomePage');
const AboutPage = lazyNamed(() => import('../features/about/pages/AboutPage'), 'AboutPage');
const ProfilePage = lazyNamed(() => import('../features/profile/pages/ProfilePage'), 'ProfilePage');
const ChatPage = lazyNamed(() => import('../features/chat/pages/ChatPage'), 'ChatPage');
const CampusPage = lazyNamed(() => import('../features/campus/pages/CampusPage'), 'CampusPage');
const SupportPage = lazyNamed(() => import('../features/support/pages/SupportPage'), 'SupportPage');
const CalendarPage = lazyNamed(() => import('../features/planner/pages/CalendarPage'), 'CalendarPage');
const MaterialsPage = lazyNamed(() => import('../features/materials/pages/MaterialsPage'), 'MaterialsPage');
const loadLibrary = () => import('../features/library/pages');
const LibraryProvider = lazyNamed(loadLibrary, 'LibraryProvider');
const LibraryLayout = lazyNamed(loadLibrary, 'LibraryLayout');
const LibraryHomePage = lazyNamed(loadLibrary, 'LibraryHomePage');
const LibraryTopicPage = lazyNamed(loadLibrary, 'LibraryTopicPage');
const LibraryDocumentPage = lazyNamed(loadLibrary, 'LibraryDocumentPage');

// Один адрес на два состояния: у «О проекте» нет своего URL, поэтому вошедший пользователь
// попасть на неё не может, а гость не видит главную.
function RootPage() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <HomePage /> : <AboutPage />;
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/register-success" element={<RegisterSuccessPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/email-sent" element={<EmailSentPage />} />
      <Route path="/reset-password" element={<NewPasswordPage />} />
      <Route path="/new-password-success" element={<NewPasswordSuccessPage />} />
      <Route path="/link-error" element={<LinkErrorPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />

      {/* Гостю доступна только «О проекте»: в остальных разделах — плашка «Войдите». */}
      <Route element={<AppLayout />}>
        <Route path="/" element={<RootPage />} />
        <Route
          path="/chat"
          element={
            <GuestGate
              title="ИИ-помощник"
              text="Чтобы задать вопрос, войдите или зарегистрируйтесь."
            >
              <ChatPage />
            </GuestGate>
          }
        />
        <Route
          path="/library"
          element={
            <GuestGate title="Библиотека" text="Библиотека доступна только после входа.">
              <LibraryProvider>
                <LibraryLayout />
              </LibraryProvider>
            </GuestGate>
          }
        >
          <Route index element={<LibraryHomePage />} />
          <Route path="topics/:topicId" element={<LibraryTopicPage />} />
          <Route path="documents/:documentId" element={<LibraryDocumentPage />} />
        </Route>
        <Route
          path="/materials"
          element={
            <GuestGate title="Материалы" text="Материалы доступны только после входа.">
              <MaterialsPage />
            </GuestGate>
          }
        />
        <Route
          path="/calendar"
          element={
            <GuestGate title="Календарь" text="Календарь доступен только после входа.">
              <CalendarPage />
            </GuestGate>
          }
        />
        <Route
          path="/campus"
          element={
            <GuestGate
              title="Навигация по кампусу"
              text="Навигация по кампусу доступна только после входа."
            >
              <CampusPage />
            </GuestGate>
          }
        />
        <Route
          path="/support"
          element={
            <GuestGate
              title="Техническая поддержка"
              text="Техническая поддержка доступна только после входа."
            >
              <SupportPage />
            </GuestGate>
          }
        />
        <Route element={<ProtectedRoute />}>
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
