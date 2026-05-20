import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Logo } from '../../../shared/ui/Logo';
import { Button } from '../../../shared/ui/Button';
import { FormError } from '../../../shared/ui/FormError';
import { isValidEmail } from '../../../shared/lib/validators';
import { authApi } from '../api/authApi';
import { AuthWrapper } from '../components/AuthWrapper';
import { EmailField } from '../components/EmailField';
import authStyles from '../components/authStyles.module.css';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!isValidEmail(email)) {
      setError('Неверная почта. Используйте @edu.hse.ru');
      return;
    }

    setSubmitting(true);
    try {
      await authApi.forgotPassword(email.trim());
      navigate('/email-sent', { replace: true });
    } catch {
      setError('Не удалось отправить письмо. Попробуйте позже.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Logo />
      <AuthWrapper>
        <form onSubmit={handleSubmit} noValidate>
          <h1 className={authStyles.formTitle}>Сброс Пароля</h1>
          <p className={authStyles.resetPasswordText}>
            Введите почту, которую вы использовали при регистрации. Мы отправим письмо с
            инструкцией по сбросу пароля.
          </p>
          <h2 className={authStyles.emailTitle}>Почта</h2>
          <EmailField
            value={email}
            onChange={(v) => {
              setEmail(v);
              if (error) setError('');
            }}
            error={Boolean(error)}
          />
          <FormError message={error} />
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Отправка…' : 'Отправить письмо'}
          </Button>
          <div className={authStyles.link}>
            <Link to="/login">Вернуться ко входу</Link>
          </div>
        </form>
      </AuthWrapper>
    </>
  );
}
