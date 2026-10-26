import { Link } from 'react-router-dom';
import styles from './ShortcutCard.module.css';

const TONES = {
  blue: styles.iconBlue,
  pink: styles.iconPink,
};

export function ShortcutCard({ icon, tone, title, subtitle, to, onClick }) {
  const content = (
    <>
      <span className={`${styles.iconBox} ${TONES[tone]}`}>
        <img src={icon} alt="" className={styles.icon} />
      </span>
      <span className={styles.text}>
        <span className={styles.title}>{title}</span>
        <span className={styles.subtitle}>{subtitle}</span>
      </span>
    </>
  );

  return to ? (
    <Link to={to} className={styles.card}>
      {content}
    </Link>
  ) : (
    <button type="button" className={styles.card} onClick={onClick}>
      {content}
    </button>
  );
}
