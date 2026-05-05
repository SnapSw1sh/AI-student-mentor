import { Link } from 'react-router-dom';
import styles from './Button.module.css';

export function Button({ children, type = 'button', disabled, onClick, className }) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${styles.btn} ${className ?? ''}`.trim()}
    >
      {children}
    </button>
  );
}

export function ButtonLink({ to, children, className }) {
  return (
    <Link to={to} className={`${styles.btn} ${className ?? ''}`.trim()}>
      {children}
    </Link>
  );
}
