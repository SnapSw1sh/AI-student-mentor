import { Link } from 'react-router-dom';
import { Logo } from '../../../shared/ui/Logo';
import styles from './AuthLogoLink.module.css';

export function AuthLogoLink() {
  return (
    <Link to="/" className={styles.link} aria-label="На главную">
      <Logo />
    </Link>
  );
}
