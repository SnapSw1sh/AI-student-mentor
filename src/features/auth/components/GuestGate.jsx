import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ButtonLink } from '../../../shared/ui/Button';
import { GUEST_ACCESS } from '../../../shared/lib/guestAccess';
import styles from './GuestGate.module.css';

// Раздел открыт гостю, но пока бэк не поддерживает гостевой доступ, вместо содержимого
// показывается приглашение войти. После входа пользователь вернётся на эту же страницу.
export function GuestGate({ feature, title, text, children }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (isAuthenticated || GUEST_ACCESS[feature]) return children;

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
