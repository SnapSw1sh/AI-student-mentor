import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../features/auth/context/AuthProvider';
import { NotificationProvider } from '../shared/notifications/NotificationProvider';
import { AppRoutes } from './routes';

export function App() {
  return (
    <BrowserRouter>
      <NotificationProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </NotificationProvider>
    </BrowserRouter>
  );
}
