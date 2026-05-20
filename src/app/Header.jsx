import { Link, NavLink } from 'react-router-dom';
import { AvatarPlaceholderIcon } from '../shared/ui/icons';
import { Logo } from '../shared/ui/Logo';
import styles from './Header.module.css';

const navLinks = [
  { label: 'ИИ-помощник', to: '/' },
  { label: 'Библиотека', to: '/library' },
  { label: 'Навигация по кампусу', to: '/campus' },
  { label: 'Техническая поддержка', to: '/support' },
];

export function Header() {
  return (
    <header className={styles.header}>
      <Link to="/" className={styles.logoLink} aria-label="На главную">
        <Logo className={styles.logo} />
      </Link>

      <nav className={styles.nav}>
        {navLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/'}
            className={({ isActive }) =>
              isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>

      <Link to="/profile" className={styles.avatar} aria-label="Профиль">
        <AvatarPlaceholderIcon className={styles.avatarIcon} />
      </Link>
    </header>
  );
}
