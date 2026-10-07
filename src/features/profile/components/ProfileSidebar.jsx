import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AdminPanelIcon,
  AvatarPlaceholderIcon,
  SidebarUserIcon,
  LogoutIcon,
} from '../../../shared/ui/icons';
import { ApiError } from '../../../shared/api/httpClient';
import { UserFacingError } from '../../../shared/notifications/describeError';
import { useNotify } from '../../../shared/notifications/useNotify';
import { authApi } from '../../auth/api/authApi';
import { useAuth } from '../../auth/hooks/useAuth';
import styles from './ProfileSidebar.module.css';

const MAX_AVATAR_SIZE = 4 * 1024 * 1024;

export function ProfileSidebar({ activeTab = 'personal', onTabChange, fullName }) {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const notify = useNotify();
  const [openingAdmin, setOpeningAdmin] = useState(false);
  const isAdmin = user?.role === 'admin';
  const fileInputRef = useRef(null);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [avatarError, setAvatarError] = useState('');

  useEffect(() => {
    return () => {
      if (avatarUrl) URL.revokeObjectURL(avatarUrl);
    };
  }, [avatarUrl]);

  // Локальная сессия очищается в любом случае, поэтому на вход переходим и при ошибке.
  // Если сервер не ответил, refresh-кука могла остаться живой — об этом и предупреждаем.
  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      notify.error('Не удалось завершить сеанс на сервере', err);
    } finally {
      navigate('/login', { replace: true });
    }
  };

  // Админ-панель — отдельное приложение db-svc под /admin/, а не маршрут нашего SPA, поэтому
  // переход полной загрузкой страницы, а не через React Router. Кука, которую выдаёт
  // admin-session, ограничена путём /admin и уходит только туда.
  const handleOpenAdmin = async () => {
    setOpeningAdmin(true);
    try {
      const data = await authApi.openAdminSession();
      window.location.assign(data?.url || '/admin/');
    } catch (err) {
      // Бэк отвечает 404, а не 403, всем, у кого нет прав администратора.
      const reason =
        err instanceof ApiError && err.status === 404
          ? new UserFacingError('У этой учётной записи нет доступа к админ-панели.')
          : err;
      notify.error('Не удалось открыть админ-панель', reason);
      setOpeningAdmin(false);
    }
  };

  const openFilePicker = () => {
    setAvatarError('');
    fileInputRef.current?.click();
  };

  // TODO(backend): отправлять файл в `POST /api/users/me/avatar` или multipart-PATCH (PROBLEMS.md#4)
  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setAvatarError('Файл должен быть изображением.');
      return;
    }
    if (file.size > MAX_AVATAR_SIZE) {
      setAvatarError('Файл слишком большой (макс. 4 МБ).');
      return;
    }
    if (avatarUrl) URL.revokeObjectURL(avatarUrl);
    setAvatarUrl(URL.createObjectURL(file));
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.profile}>
        <button
          type="button"
          className={styles.avatar}
          onClick={openFilePicker}
          aria-label="Загрузить новый аватар"
        >
          {avatarUrl ? (
            <img src={avatarUrl} alt="Аватар" className={styles.avatarImage} />
          ) : (
            <AvatarPlaceholderIcon className={styles.avatarIcon} />
          )}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className={styles.fileInput}
          onChange={handleFileChange}
        />
        {avatarError && <span className={styles.avatarError}>{avatarError}</span>}
        <span className={styles.name}>{fullName || 'Имя Фамилия'}</span>
      </div>

      <div className={styles.menu}>
        <button
          type="button"
          onClick={() => onTabChange?.('personal')}
          className={`${styles.tab} ${activeTab === 'personal' ? styles.tabActive : ''}`.trim()}
        >
          <SidebarUserIcon className={styles.tabIcon} />
          <span>Персональные данные</span>
        </button>

        {isAdmin && (
          <button
            type="button"
            onClick={handleOpenAdmin}
            disabled={openingAdmin}
            className={styles.tab}
          >
            <AdminPanelIcon className={styles.tabIcon} />
            <span>{openingAdmin ? 'Открываем…' : 'Админ-панель'}</span>
          </button>
        )}

        <button type="button" onClick={handleLogout} className={styles.logout}>
          <LogoutIcon className={styles.tabIcon} />
          <span>Выйти</span>
        </button>
      </div>
    </aside>
  );
}
