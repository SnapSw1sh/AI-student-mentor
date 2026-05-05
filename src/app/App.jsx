import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../features/auth/context/AuthProvider';
import { AppRoutes } from './routes';

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
