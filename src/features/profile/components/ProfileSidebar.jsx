import { useEffect, useId, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ApiError } from '../../../shared/api/httpClient';
import {
  AvatarPlaceholderIcon,
  CameraIcon,
  SidebarUserIcon,
  LogoutIcon,
} from '../../../shared/ui/icons';
import { useNotify } from '../../../shared/notifications/useNotify';
import { useAuth } from '../../auth/hooks/useAuth';
import { useAvatarSrc } from '../hooks/useAvatarSrc';
import { cropToBlob, loadImage } from '../lib/cropImage';
import { AvatarCropDialog } from './AvatarCropDialog';
import styles from './ProfileSidebar.module.css';

// Исходник только открывается в браузере и кадрируется — на сервер уходит уже обрезанный
// квадрат 512×512 (до 5 МБ), поэтому исходный файл может быть крупнее серверного лимита.
const MAX_SOURCE_SIZE = 20 * 1024 * 1024;

export function ProfileSidebar({ activeTab = 'personal', onTabChange, fullName }) {
  const { logout, uploadAvatar, removeAvatar } = useAuth();
  const avatarSrc = useAvatarSrc();
  const navigate = useNavigate();
  const notify = useNotify();
  const fileInputRef = useRef(null);
  const avatarRef = useRef(null);
  const menuRef = useRef(null);
  const menuId = useId();
  const [avatarError, setAvatarError] = useState('');
  const [avatarBusy, setAvatarBusy] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  // Картинка, открытая в окне кадрирования: { image, url }.
  const [cropping, setCropping] = useState(null);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const closeOutside = (event) => {
      if (!menuRef.current?.contains(event.target) && !avatarRef.current?.contains(event.target)) setMenuOpen(false);
    };
    const closeOnEscape = (event) => {
      if (event.key !== 'Escape') return;
      setMenuOpen(false);
      avatarRef.current?.focus();
    };
    document.addEventListener('pointerdown', closeOutside);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('pointerdown', closeOutside);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [menuOpen]);

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

  const openFilePicker = () => {
    setMenuOpen(false);
    setAvatarError('');
    fileInputRef.current?.click();
  };

  // Без фото клик сразу открывает выбор файла; с фото — меню «загрузить новое / удалить».
  const handleAvatarClick = () => {
    if (avatarSrc) setMenuOpen((open) => !open);
    else openFilePicker();
  };

  const closeCrop = () => {
    if (cropping) URL.revokeObjectURL(cropping.url);
    setCropping(null);
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setAvatarError('Выберите картинку.');
      return;
    }
    if (file.size > MAX_SOURCE_SIZE) {
      setAvatarError('Файл слишком большой (макс. 20 МБ).');
      return;
    }
    try {
      setCropping(await loadImage(file));
    } catch {
      // Браузер не смог открыть файл (например, HEIC с iPhone в Chrome) — это про сам файл.
      setAvatarError('Не удалось открыть картинку. Попробуйте PNG или JPEG.');
    }
  };

  const handleCropSave = async (area) => {
    setAvatarBusy(true);
    try {
      const blob = await cropToBlob(cropping.image, area);
      const extension = blob.type === 'image/webp' ? 'webp' : 'jpg';
      await uploadAvatar(new File([blob], `avatar.${extension}`, { type: blob.type }));
      closeCrop();
    } catch (err) {
      // 413 и 415 после кадрирования не ожидаются: на сервер уходит маленький WebP или JPEG.
      if (err instanceof ApiError && (err.status === 413 || err.status === 415)) {
        setAvatarError('Сервер не принял картинку. Попробуйте другой файл.');
        closeCrop();
      } else {
        notify.error('Не удалось загрузить фото', err);
      }
    } finally {
      setAvatarBusy(false);
    }
  };

  const handleRemove = async () => {
    setMenuOpen(false);
    setAvatarError('');
    setAvatarBusy(true);
    try {
      await removeAvatar();
    } catch (err) {
      notify.error('Не удалось удалить фото', err);
    } finally {
      setAvatarBusy(false);
    }
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.profile}>
        <div className={styles.avatarWrap}>
          <button
            ref={avatarRef}
            type="button"
            className={`${styles.avatar} ${avatarBusy ? styles.avatarBusy : ''}`.trim()}
            onClick={handleAvatarClick}
            disabled={avatarBusy}
            aria-busy={avatarBusy}
            aria-haspopup={avatarSrc ? 'menu' : undefined}
            aria-expanded={avatarSrc ? menuOpen : undefined}
            aria-controls={avatarSrc ? menuId : undefined}
            aria-label={avatarSrc ? 'Фото профиля: изменить или удалить' : 'Загрузить фото профиля'}
          >
            {avatarSrc ? (
              <img src={avatarSrc} alt="" className={styles.avatarImage} />
            ) : (
              <AvatarPlaceholderIcon className={styles.avatarIcon} />
            )}
            <span className={styles.avatarOverlay} aria-hidden="true">
              <CameraIcon className={styles.overlayIcon} />
              {avatarSrc ? 'Изменить' : 'Загрузить фото'}
            </span>
          </button>

          {menuOpen && (
            <div ref={menuRef} id={menuId} role="menu" className={styles.avatarMenu}>
              <button type="button" role="menuitem" className={styles.menuItem} onClick={openFilePicker}>
                Загрузить новое фото
              </button>
              <button
                type="button"
                role="menuitem"
                className={`${styles.menuItem} ${styles.menuItemDanger}`}
                onClick={handleRemove}
              >
                Удалить фото
              </button>
            </div>
          )}
        </div>
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
      {cropping && (
        <AvatarCropDialog
          key={cropping.url}
          image={cropping.image}
          saving={avatarBusy}
          onSave={handleCropSave}
          onClose={closeCrop}
        />
      )}
    </aside>
  );
}
