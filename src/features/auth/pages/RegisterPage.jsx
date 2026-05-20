import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Logo } from '../../../shared/ui/Logo';
import { Button } from '../../../shared/ui/Button';
import { FormError } from '../../../shared/ui/FormError';
import { ApiError } from '../../../shared/api/httpClient';
import { isValidEmail, isValidPassword } from '../../../shared/lib/validators';
import { authApi } from '../api/authApi';
import { AuthWrapper } from '../components/AuthWrapper';
import { EmailField } from '../components/EmailField';
import { PasswordField } from '../components/PasswordField';
import authStyles from '../components/authStyles.module.css';

export function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [errorField, setErrorField] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const clearErrorOnEdit = () => {
    if (error) {
      setError('');
      setErrorField(null);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setErrorField(null);

    if (!isValidEmail(email)) {
      setError('Неверная почта для регистрации. Используйте @edu.hse.ru');
      setErrorField('email');
      return;
    }
    if (password.length < 8) {
      setError('Пароль должен содержать не менее 8 символов.');
      setErrorField('password');
      return;
    }
    if (!isValidPassword(password)) {
      setError('Пароль должен содержать только латинские буквы и цифры.');
      setErrorField('password');
      return;
    }
    if (password !== confirm) {
      setError('Пароли не совпадают.');
      setErrorField('confirm');
      return;
    }

    setSubmitting(true);
    try {
      await authApi.register(email.trim(), password);
      navigate('/register-success', { replace: true });
    } catch (err) {
      if (err instanceof ApiError && (err.status === 409 || err.status === 400)) {
        setError('Пользователь с такой почтой уже зарегистрирован.');
        setErrorField('email');
      } else {
        setError('Не удалось зарегистрироваться. Попробуйте позже.');
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
          <h1 className={authStyles.formTitle}>Регистрация</h1>
          <h2 className={authStyles.emailTitle}>Почта</h2>
          <p className={authStyles.helpText}>
            Вход только через корпоративную электронную почту студента.
          </p>
          <EmailField
            value={email}
            onChange={(v) => {
              setEmail(v);
              clearErrorOnEdit();
            }}
            error={errorField === 'email'}
            id="reg-email"
            autoComplete="email"
          />
          <h3 className={authStyles.passTitle}>Пароль</h3>
          <PasswordField
            value={password}
            onChange={(v) => {
              setPassword(v);
              clearErrorOnEdit();
            }}
            error={errorField === 'password'}
            placeholder="Придумайте пароль"
            id="reg-password"
            autoComplete="new-password"
          />
          <h3 className={authStyles.repassTitle}>Повторите пароль</h3>
          <PasswordField
            value={confirm}
            onChange={(v) => {
              setConfirm(v);
              clearErrorOnEdit();
            }}
            error={errorField === 'confirm'}
            placeholder="Еще раз пароль"
            id="reg-password-confirm"
            autoComplete="new-password"
          />
          <p className={authStyles.textForPass}>Не менее 8 символов, буквы и цифры.</p>
          <FormError message={error} />
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Отправка…' : 'Зарегистрироваться'}
          </Button>
          <div className={authStyles.links}>
            <p>Уже есть аккаунт ?</p>
            <Link to="/login">Войти</Link>
          </div>
        </form>
      </AuthWrapper>
    </>
  );
}
