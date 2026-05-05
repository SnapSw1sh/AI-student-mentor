import { useNavigate } from 'react-router-dom';
import {
  AvatarPlaceholderIcon,
  SidebarUserIcon,
  LogoutIcon,
} from '../../../shared/ui/icons';
import { useAuth } from '../../auth/hooks/useAuth';
import styles from './ProfileSidebar.module.css';

export function ProfileSidebar({ activeTab = 'personal', onTabChange, fullName }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.profile}>
        <div className={styles.avatar}>
          <AvatarPlaceholderIcon className={styles.avatarIcon} />
        </div>
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
