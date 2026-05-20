import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Logo } from '../../../shared/ui/Logo';
import { Button } from '../../../shared/ui/Button';
import { FormError } from '../../../shared/ui/FormError';
import { ApiError } from '../../../shared/api/httpClient';
import { isValidEmail } from '../../../shared/lib/validators';
import { useAuth } from '../hooks/useAuth';
import { AuthWrapper } from '../components/AuthWrapper';
import { EmailField } from '../components/EmailField';
import { PasswordField } from '../components/PasswordField';
import authStyles from '../components/authStyles.module.css';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login, loginAsTestUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Неверная почта или пароль. Проверьте и попробуйте снова.');
      return;
    }
    if (!isValidEmail(email)) {
      setError('Неверная почта или пароль. Проверьте и попробуйте снова.');
      return;
    }

    // ======================================================================
    // DELETE TEST USER BEFORE PRODUCTION
    // ----------------------------------------------------------------------
    // Bypass для визуального тестирования защищённых страниц без поднятого
    // бэкенда. Пара `admin@edu.hse.ru` / `admin` мгновенно логинит фейкового
    // пользователя и редиректит на /profile, не дёргая `/api/auth/login`.
    // При продакшен-сборке убрать этот блок целиком, а в AuthProvider —
    // метод `loginAsTestUser` (помечен таким же баннером).
    // ======================================================================
    if (email.trim() === 'admin@edu.hse.ru' && password === 'admin') {
      loginAsTestUser();
      navigate('/profile', { replace: true });
      return;
    }

    setSubmitting(true);
    try {
      await login(email.trim(), password);
      navigate('/', { replace: true });
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setError('Неверная почта или пароль. Проверьте и попробуйте снова.');
      } else {
        setError('Не удалось войти. Попробуйте позже.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Logo />
      <AuthWrapper>
        <form onSubmit={handleSubmit} noValidate>
          <h1 className={authStyles.formTitle}>Вход</h1>
          <h2 className={authStyles.emailTitle}>Почта</h2>
          <p className={authStyles.helpText}>
            Вход только через корпоративную электронную почту студента.
          </p>
          <EmailField
            value={email}
            onChange={(v) => {
              setEmail(v);
              if (error) setError('');
            }}
            error={Boolean(error)}
          />
          <h3 className={authStyles.passTitle}>Пароль</h3>
          <PasswordField
            value={password}
            onChange={(v) => {
              setPassword(v);
              if (error) setError('');
            }}
            error={Boolean(error)}
            placeholder="Пароль"
            autoComplete="current-password"
          />
          <div className={authStyles.links}>
            <Link to="/forgot-password">Забыли пароль?</Link>
            <Link to="/register">Зарегистрироваться</Link>
          </div>
          <FormError message={error} />
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Вход…' : 'Войти'}
          </Button>
        </form>
      </AuthWrapper>
    </>
  );
}
