import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AvatarPlaceholderIcon,
  SidebarUserIcon,
  LogoutIcon,
} from '../../../shared/ui/icons';
import { useAuth } from '../../auth/hooks/useAuth';
import styles from './ProfileSidebar.module.css';

const MAX_AVATAR_SIZE = 4 * 1024 * 1024;

export function ProfileSidebar({ activeTab = 'personal', onTabChange, fullName }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [avatarError, setAvatarError] = useState('');

  useEffect(() => {
    return () => {
      if (avatarUrl) URL.revokeObjectURL(avatarUrl);
    };
  }, [avatarUrl]);

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
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

        <button type="button" onClick={handleLogout} className={styles.logout}>
          <LogoutIcon className={styles.tabIcon} />
          <span>Выйти</span>
        </button>
      </div>
    </aside>
  );
}
