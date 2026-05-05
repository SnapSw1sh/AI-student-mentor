import { useState } from 'react';
import { PasswordIcon, EyeOpenIcon, EyeClosedIcon } from '../../../shared/ui/icons';
import styles from './PasswordField.module.css';

export function PasswordField({
  value,
  onChange,
  error,
  placeholder = 'Пароль',
  id = 'password',
  autoComplete = 'current-password',
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className={styles.inputBox}>
      <PasswordIcon className={styles.inputIcon} />
      <input
        id={id}
        type={visible ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={error ? styles.error : undefined}
      />
      <button
        type="button"
        className={styles.eyeBtn}
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? 'Скрыть пароль' : 'Показать пароль'}
      >
        {visible ? <EyeOpenIcon /> : <EyeClosedIcon />}
      </button>
    </div>
  );
}
