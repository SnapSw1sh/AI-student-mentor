import { useEffect, useState } from 'react';
import { UserFacingError } from '../../../shared/notifications/describeError';
import { useNotify } from '../../../shared/notifications/useNotify';
import { CheckIcon, CopyIcon } from '../../../shared/ui/icons';
import { markdownToPlainText } from '../lib/markdownToPlainText';
import styles from './CopyAnswerButton.module.css';

const COPIED_MS = 2000;

export function CopyAnswerButton({ markdown }) {
  const notify = useNotify();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return undefined;
    const timer = setTimeout(() => setCopied(false), COPIED_MS);
    return () => clearTimeout(timer);
  }, [copied]);

  // Буфер обмена в браузере доступен только по HTTPS и на localhost — по обычному HTTP
  // navigator.clipboard нет, и это тоже показываем как ошибку, а не молчим.
  const handleCopy = async () => {
    try {
      if (!navigator.clipboard) throw new UserFacingError('Браузер не дал доступ к буферу обмена: копирование работает только на сайте по HTTPS.');
      await navigator.clipboard.writeText(markdownToPlainText(markdown));
      setCopied(true);
    } catch (err) {
      notify.error('Не удалось скопировать ответ', err);
    }
  };

  return (
    <button
      type="button"
      className={`${styles.button} ${copied ? styles.copied : ''}`.trim()}
      onClick={handleCopy}
      aria-label={copied ? 'Ответ скопирован' : 'Копировать ответ'}
      title={copied ? 'Скопировано' : 'Копировать ответ'}
    >
      {copied ? <CheckIcon className={styles.icon} /> : <CopyIcon className={styles.icon} />}
      {copied && <span className={styles.label}>Скопировано</span>}
    </button>
  );
}
