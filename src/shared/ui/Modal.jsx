import { useEffect, useId, useRef } from 'react';
import { CloseIcon } from './icons';
import styles from './Modal.module.css';

// Нативный <dialog> через showModal(): фокус удерживается внутри окна, Esc закрывает его,
// остальная страница становится недоступной — без своей ловушки фокуса и порталов.
// После закрытия браузер сам возвращает фокус на элемент, который окно открыл.
// Поле, которое должно получить фокус при открытии, помечается data-autofocus.
export function Modal({ open, title, onClose, children, footer, size = 'md' }) {
  const dialogRef = useRef(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      // React-овский autoFocus срабатывает до showModal, пока окно ещё скрыто, и теряется.
      dialog.querySelector('[data-autofocus]')?.focus();
    }
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const handleCancel = (event) => {
    event.preventDefault();
    onClose();
  };

  // Клик по самому <dialog>, а не по его содержимому, — это клик по затемнённому фону.
  const handleClick = (event) => {
    if (event.target === dialogRef.current) onClose();
  };

  return (
    <dialog
      ref={dialogRef}
      className={`${styles.dialog} ${size === 'sm' ? styles.small : ''}`.trim()}
      aria-labelledby={titleId}
      onCancel={handleCancel}
      onClick={handleClick}
    >
      {open && (
        <div className={styles.panel}>
          <header className={styles.header}>
            <h2 id={titleId} className={styles.title}>
              {title}
            </h2>
            <button type="button" className={styles.close} onClick={onClose} aria-label="Закрыть">
              <CloseIcon className={styles.closeIcon} />
            </button>
          </header>
          <div className={styles.body}>{children}</div>
          {footer && <footer className={styles.footer}>{footer}</footer>}
        </div>
      )}
    </dialog>
  );
}
