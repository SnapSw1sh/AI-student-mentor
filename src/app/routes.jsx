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
import { ProfilePage } from '../features/profile/pages/ProfilePage';
import { AppLayout } from './AppLayout';
import styles from './Placeholder.module.css';

function Placeholder({ title, text }) {
  return (
    <div className={styles.placeholder}>
      <h1>{title}</h1>
      <p>{text}</p>
    </div>
  );
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

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route
            path="/"
            element={
              <Placeholder
                title="ИИ-помощник студента"
                text="Чат с ИИ-помощником появится на Этапе 3."
              />
            }
          />
          <Route path="/profile" element={<ProfilePage />} />
          <Route
            path="/library"
            element={<Placeholder title="Библиотека" text="Появится на Этапе 4." />}
          />
          <Route
            path="/campus"
            element={<Placeholder title="Навигация по кампусу" text="В разработке." />}
          />
          <Route
            path="/support"
            element={<Placeholder title="Техническая поддержка" text="В разработке." />}
          />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
