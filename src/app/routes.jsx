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
import { ChatPage } from '../features/chat/pages/ChatPage';
import { LibraryProvider } from '../features/library/context/LibraryProvider';
import { LibraryLayout } from '../features/library/pages/LibraryLayout';
import { LibraryHomePage } from '../features/library/pages/LibraryHomePage';
import { LibraryTopicPage } from '../features/library/pages/LibraryTopicPage';
import { LibraryDocumentPage } from '../features/library/pages/LibraryDocumentPage';
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
          <Route path="/" element={<ChatPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route
            path="/library"
            element={
              <LibraryProvider>
                <LibraryLayout />
              </LibraryProvider>
            }
          >
            <Route index element={<LibraryHomePage />} />
            <Route path="topics/:topicId" element={<LibraryTopicPage />} />
            <Route path="documents/:documentId" element={<LibraryDocumentPage />} />
          </Route>
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
