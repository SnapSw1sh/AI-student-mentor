import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { AdminPanelButton } from '../features/auth/components/AdminPanelButton';
import { useAuth } from '../features/auth/hooks/useAuth';
import { AvatarPlaceholderIcon, ChevronDownIcon, CloseIcon, MenuIcon } from '../shared/ui/icons';
import { Logo } from '../shared/ui/Logo';
import styles from './Header.module.css';

// Порядок — приоритет: что не помещается в ряд, уходит в «Ещё» с конца списка.
const sectionLinks = [
  { label: 'ИИ-помощник', to: '/chat' },
  { label: 'Библиотека', to: '/library' },
  { label: 'Календарь', to: '/calendar' },
  { label: 'Материалы', to: '/materials' },
  { label: 'Навигация по кампусу', to: '/campus' },
  { label: 'Техническая поддержка', to: '/support' },
];

// На `/` гость видит «О проекте», вошедший — главную; первый пункт меню называется по ней.
const guestLinks = [{ label: 'О проекте', to: '/', end: true }, ...sectionLinks];
const userLinks = [{ label: 'Главная', to: '/', end: true }, ...sectionLinks];

const navLinkClass = (base, active) => ({ isActive }) =>
  isActive ? `${base} ${active}` : base;

const isLinkActive = (link, pathname) =>
  link.end ? pathname === link.to : pathname === link.to || pathname.startsWith(`${link.to}/`);

// Сколько пунктов помещается в ряд. Ширины берутся из невидимой копии меню с теми же стилями,
// поэтому учитываются и шрифт, и отступы текущей ширины экрана. `variant` меняется, когда меню
// появляется (после проверки сессии) или меняется его состав, — тогда замер повторяется.
function useFittingCount(navRef, measureRef, total, variant) {
  const [count, setCount] = useState(total);

  useLayoutEffect(() => {
    const nav = navRef.current;
    const measure = measureRef.current;
    if (!nav || !measure) return undefined;
    const update = () => {
      const items = [...measure.children];
      const more = items.pop();
      const gap = parseFloat(getComputedStyle(measure).columnGap) || 0;
      const widths = items.map((el) => el.getBoundingClientRect().width);
      const available = nav.clientWidth;
      const rowWidth = (n) => widths.slice(0, n).reduce((sum, w) => sum + w, 0) + gap * Math.max(0, n - 1);
      let fit = widths.length;
      if (rowWidth(fit) > available) {
        const moreWidth = more.getBoundingClientRect().width + gap;
        while (fit > 0 && rowWidth(fit) + moreWidth > available) fit -= 1;
      }
      setCount(fit);
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(nav);
    return () => observer.disconnect();
  }, [navRef, measureRef, total, variant]);

  return Math.min(count, total);
}

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
  const navRef = useRef(null);
  const measureRef = useRef(null);
  const moreRef = useRef(null);
  const moreButtonRef = useRef(null);
  const moreId = useId();
  const [morePath, setMorePath] = useState(null);
  const moreOpen = morePath === pathname;
  const fitting = useFittingCount(
    navRef,
    measureRef,
    navLinks.length,
    `${bootstrapped}-${isAuthenticated}`,
  );
  const shownLinks = navLinks.slice(0, fitting);
  const overflowLinks = navLinks.slice(fitting);
  const overflowActive = overflowLinks.some((link) => isLinkActive(link, pathname));

  useEffect(() => {
    if (!moreOpen) return undefined;
    const handlePointerDown = (event) => {
      if (!moreRef.current?.contains(event.target)) setMorePath(null);
    };
    const handleKeyDown = (event) => {
      if (event.key !== 'Escape') return;
      setMorePath(null);
      moreButtonRef.current?.focus();
    };
    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [moreOpen]);

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
          <nav ref={navRef} className={styles.nav} aria-label="Разделы">
            <div className={styles.navRow}>
              {shownLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  className={navLinkClass(styles.navLink, styles.navLinkActive)}
                >
                  {link.label}
                </NavLink>
              ))}

              {overflowLinks.length > 0 && (
                <div ref={moreRef} className={styles.more}>
                  <button
                    ref={moreButtonRef}
                    type="button"
                    className={`${styles.navLink} ${styles.moreButton} ${overflowActive ? styles.navLinkActive : ''}`.trim()}
                    aria-expanded={moreOpen}
                    aria-controls={moreId}
                    onClick={() => setMorePath(moreOpen ? null : pathname)}
                  >
                    Ещё
                    <ChevronDownIcon className={styles.moreIcon} />
                  </button>
                  {moreOpen && (
                    <div id={moreId} className={styles.moreMenu}>
                      {overflowLinks.map((link) => (
                        <NavLink
                          key={link.to}
                          to={link.to}
                          end={link.end}
                          className={navLinkClass(styles.moreLink, styles.moreLinkActive)}
                          onClick={() => setMorePath(null)}
                        >
                          {link.label}
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Невидимая копия всех пунктов и кнопки «Ещё» — только для замера ширины. */}
            <div ref={measureRef} className={`${styles.navRow} ${styles.measure}`} aria-hidden="true">
              {navLinks.map((link) => (
                <span key={link.to} className={styles.navLink}>
                  {link.label}
                </span>
              ))}
              <span className={`${styles.navLink} ${styles.moreButton}`}>
                Ещё
                <ChevronDownIcon className={styles.moreIcon} />
              </span>
            </div>
          </nav>

          <div className={styles.actions}>
            {isAuthenticated ? (
              <>
                <AdminPanelButton />
                <Link to="/profile" className={styles.avatar} aria-label="Профиль">
                  <AvatarPlaceholderIcon className={styles.avatarIcon} />
                </Link>
              </>
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
