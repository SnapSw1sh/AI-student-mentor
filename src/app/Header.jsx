import { useEffect, useId, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../features/auth/hooks/useAuth';
import { AvatarPlaceholderIcon, CloseIcon, MenuIcon } from '../shared/ui/icons';
import { Logo } from '../shared/ui/Logo';
import styles from './Header.module.css';

const sectionLinks = [
  { label: 'ИИ-помощник', to: '/chat' },
  { label: 'Библиотека', to: '/library' },
  { label: 'Навигация по кампусу', to: '/campus' },
  { label: 'Техническая поддержка', to: '/support' },
];

// На `/` гость видит «О проекте», вошедший — главную; первый пункт меню называется по ней.
const guestLinks = [{ label: 'О проекте', to: '/', end: true }, ...sectionLinks];
const userLinks = [{ label: 'Главная', to: '/', end: true }, ...sectionLinks];

const navLinkClass = (base, active) => ({ isActive }) =>
  isActive ? `${base} ${active}` : base;

export function Header({ collapsed = false }) {
  const { bootstrapped, isAuthenticated } = useAuth();
  const navLinks = isAuthenticated ? userLinks : guestLinks;
  const { pathname } = useLocation();
  const headerRef = useRef(null);
  const menuButtonRef = useRef(null);
  const menuId = useId();
  // Меню помнит страницу, на которой его открыли: после перехода по ссылке оно закрывается
  // само, без эффекта на смену маршрута.
  const [menuPath, setMenuPath] = useState(null);
  const menuOpen = menuPath === pathname;

  useEffect(() => {
    if (!menuOpen) return undefined;
    const handlePointerDown = (event) => {
      if (!headerRef.current?.contains(event.target)) setMenuPath(null);
    };
    const handleKeyDown = (event) => {
      if (event.key !== 'Escape') return;
      setMenuPath(null);
      menuButtonRef.current?.focus();
    };
    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [menuOpen]);

  return (
    <header
      ref={headerRef}
      className={`${styles.header} ${collapsed ? styles.headerCollapsed : ''}`.trim()}
    >
      <Link to="/" className={styles.logoLink} aria-label="На главную">
        <Logo className={styles.logo} />
      </Link>

      {/* До окончания проверки сессии неизвестно, гость это или нет: без этого вошедший
          пользователь на мгновение видел бы «О проекте» и кнопку «Войти». */}
      {bootstrapped && (
        <>
          <nav className={styles.nav} aria-label="Разделы">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={navLinkClass(styles.navLink, styles.navLinkActive)}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className={styles.actions}>
            {isAuthenticated ? (
              <Link to="/profile" className={styles.avatar} aria-label="Профиль">
                <AvatarPlaceholderIcon className={styles.avatarIcon} />
              </Link>
            ) : (
              <Link to="/login" className={styles.loginButton}>
                Войти
              </Link>
            )}

            <button
              ref={menuButtonRef}
              type="button"
              className={styles.menuButton}
              aria-expanded={menuOpen}
              aria-controls={menuId}
              aria-label={menuOpen ? 'Закрыть меню' : 'Открыть меню'}
              onClick={() => setMenuPath(menuOpen ? null : pathname)}
            >
              {menuOpen ? (
                <CloseIcon className={styles.menuIcon} />
              ) : (
                <MenuIcon className={styles.menuIcon} />
              )}
            </button>
          </div>

          <nav
            id={menuId}
            className={`${styles.mobileMenu} ${menuOpen ? styles.mobileMenuOpen : ''}`.trim()}
            aria-label="Разделы"
          >
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={navLinkClass(styles.mobileLink, styles.mobileLinkActive)}
                onClick={() => setMenuPath(null)}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        </>
      )}
    </header>
  );
}
