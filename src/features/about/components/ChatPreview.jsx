import flowChartIcon from '../assets/chip-flow-chart.png';
import documentsIcon from '../assets/chip-documents.png';
import dollarBagIcon from '../assets/chip-dollar-bag.png';
import paperMapIcon from '../assets/chip-paper-map.png';
import backdrop01 from '../assets/backdrop-01.svg';
import backdrop02 from '../assets/backdrop-02.svg';
import backdrop03 from '../assets/backdrop-03.svg';
import backdropHalo from '../assets/backdrop-halo.svg';
import styles from './ChatPreview.module.css';

const CHIPS = [
  { label: 'Учебный процесс', icon: flowChartIcon },
  { label: 'Документы', icon: documentsIcon },
  { label: 'Стипендии и льготы', icon: dollarBagIcon },
  { label: 'Жизнь в кампусе', icon: paperMapIcon },
];

const GREETING = [
  'Привет! Я твой ИИ-помощник. 👋',
  'Я помогу разобраться с учёбой,',
  'документами и жизнью в университете.',
  'Спрашивай или выбирай тему ниже ↓',
];

// Иллюстрация, а не рабочий чат: ничего в ней не нажимается, поэтому она скрыта от
// экранных дикторов, чтобы они не зачитывали поле ввода, которым нельзя воспользоваться.
export function ChatPreview() {
  return (
    <div className={styles.stage} aria-hidden="true">
      <img src={backdropHalo} alt="" className={`${styles.backdrop} ${styles.halo}`} />
      <img src={backdrop01} alt="" className={`${styles.backdrop} ${styles.backdrop01}`} />
      <img src={backdrop02} alt="" className={`${styles.backdrop} ${styles.backdrop02}`} />
      <img src={backdrop03} alt="" className={`${styles.backdrop} ${styles.backdrop03}`} />

      <div className={styles.card}>
        <div className={styles.header}>ИИ-помощник</div>
        <div className={styles.body}>
          <div className={styles.bubble}>
            {GREETING.map((line) => (
              <span key={line} className={styles.line}>
                {line}
              </span>
            ))}
          </div>
          <div className={styles.chips}>
            {CHIPS.map((chip) => (
              <span key={chip.label} className={styles.chip}>
                <img src={chip.icon} alt="" className={styles.chipIcon} />
                {chip.label}
              </span>
            ))}
          </div>
          <div className={styles.input}>
            <span className={styles.placeholder}>Введите запрос...</span>
            <span className={styles.send}>➤</span>
          </div>
        </div>
      </div>
    </div>
  );
}
