import { ButtonLink } from '../../../shared/ui/Button';
import { AuthWrapper } from './AuthWrapper';
import styles from './StatusPage.module.css';

export function StatusPage({ icon, title, text, titleVariant = 'success', action }) {
  const titleClass = titleVariant === 'newPassword' ? styles.titleNewPass : styles.titleSuccess;
  return (
    <AuthWrapper>
      <div className={styles.icon}>{icon}</div>
      <h1 className={titleClass}>{title}</h1>
      {text && <p className={styles.text}>{text}</p>}
      {action && <ButtonLink to={action.to}>{action.label}</ButtonLink>}
    </AuthWrapper>
  );
}
