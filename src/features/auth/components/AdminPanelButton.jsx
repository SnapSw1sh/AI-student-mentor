import { useState } from 'react';
import { ApiError } from '../../../shared/api/httpClient';
import { UserFacingError } from '../../../shared/notifications/describeError';
import { useNotify } from '../../../shared/notifications/useNotify';
import { authApi } from '../api/authApi';
import { useAuth } from '../hooks/useAuth';
import styles from './AdminPanelButton.module.css';

// Кнопка видна только администратору, но это удобство, а не защита: доступ в /admin/
// закрывает бэк — admin-session выдаёт куку лишь роли admin (остальным 404), а nginx
// пускает в панель только с этой кукой, перепроверяя роль в базе на каждом запросе.
export function AdminPanelButton({ className }) {
  const { user } = useAuth();
  const notify = useNotify();
  const [opening, setOpening] = useState(false);

  if (user?.role !== 'admin') return null;

  // Админ-панель — отдельное приложение db-svc под /admin/, а не маршрут нашего SPA, поэтому
  // переход полной загрузкой страницы, а не через React Router.
  const handleClick = async () => {
    setOpening(true);
    try {
      const data = await authApi.openAdminSession();
      window.location.assign(data?.url || '/admin/');
    } catch (err) {
      const reason =
        err instanceof ApiError && err.status === 404
          ? new UserFacingError('У этой учётной записи нет доступа к админ-панели.')
          : err;
      notify.error('Не удалось открыть админ-панель', reason);
      setOpening(false);
    }
  };

  return (
    <button
      type="button"
      className={`${styles.button} ${className ?? ''}`.trim()}
      onClick={handleClick}
      disabled={opening}
      aria-busy={opening}
      aria-label="Админ-панель"
      title="Админ-панель"
    >
      <span className={styles.fullLabel}>Админ-панель</span>
      <span className={styles.shortLabel}>Админ</span>
    </button>
  );
}
