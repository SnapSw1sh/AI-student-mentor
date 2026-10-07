import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ButtonLink } from '../../../shared/ui/Button';
import styles from './GuestGate.module.css';

// Разделы доступны только после входа. Гость видит не перенаправление на вход, а плашку
// на месте раздела — так понятно, куда он попадёт. После входа вернётся на эту же страницу.
export function GuestGate({ title, text, children }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (isAuthenticated) return children;

  const from = location.pathname + location.search;

  return (
    <div className={styles.gate}>
      <div className={styles.card}>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.text}>{text}</p>
        <ButtonLink to="/login" state={{ from }}>
          Войти
        </ButtonLink>
        <p className={styles.register}>
          Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
        </p>
      </div>
    </div>
  );
}
