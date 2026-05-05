import styles from './AuthWrapper.module.css';

export function AuthWrapper({ children, className }) {
  return <div className={`${styles.wrapper} ${className ?? ''}`.trim()}>{children}</div>;
}
