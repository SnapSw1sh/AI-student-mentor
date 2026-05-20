import { EmailIcon } from '../../../shared/ui/icons';
import styles from './EmailField.module.css';

export function EmailField({
  value,
  onChange,
  error,
  placeholder = 'name@edu.hse.ru',
  id = 'email',
  autoComplete = 'email',
}) {
  return (
    <div className={styles.inputBox}>
      <EmailIcon className={styles.inputIcon} />
      <input
        id={id}
        type="email"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={error ? styles.error : undefined}
      />
    </div>
  );
}
