import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Logo } from '../../../shared/ui/Logo';
import { Button } from '../../../shared/ui/Button';
import { FormError } from '../../../shared/ui/FormError';
import { isValidPassword } from '../../../shared/lib/validators';
import { authApi } from '../api/authApi';
import { AuthWrapper } from '../components/AuthWrapper';
import { PasswordField } from '../components/PasswordField';
import authStyles from '../components/authStyles.module.css';

export function NewPasswordPage() {
  const [params] = useSearchParams();
  const token = params.get('token');
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

    if (!token) {
      navigate('/link-error', { replace: true });
      return;
    }
    if (!password) {
      setError('Введите новый пароль.');
      setErrorField('password');
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
      await authApi.updatePassword(token, password);
      navigate('/new-password-success', { replace: true });
    } catch {
      navigate('/link-error', { replace: true });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Logo />
      <AuthWrapper>
        <form onSubmit={handleSubmit} noValidate>
          <h1 className={authStyles.formTitle}>Новый пароль</h1>
          <h2 className={authStyles.emailTitle}>Новый пароль</h2>
          <PasswordField
            value={password}
            onChange={(v) => {
              setPassword(v);
              clearErrorOnEdit();
            }}
            error={errorField === 'password'}
            placeholder="Придумайте новый пароль"
            id="new-password"
            autoComplete="new-password"
          />
          <p className={authStyles.newPasswordText}>не менее 8 символов, буквы и цифры.</p>
          <h3 className={authStyles.passTitle}>Повторите пароль</h3>
          <PasswordField
            value={confirm}
            onChange={(v) => {
              setConfirm(v);
              clearErrorOnEdit();
            }}
            error={errorField === 'confirm'}
            placeholder="Еще раз пароль"
            id="new-password-confirm"
            autoComplete="new-password"
          />
          <FormError message={error} />
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Сохранение…' : 'Сохранить пароль'}
          </Button>
        </form>
      </AuthWrapper>
    </>
  );
}
