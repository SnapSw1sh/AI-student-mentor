import { GradeCalculator } from '../../grade-calculator/components/GradeCalculator';
import styles from './HomePage.module.css';

// Главная вошедшего пользователя (гость на этом адресе видит «О проекте»). Макет пока
// неполный: готов только калькулятор, остальные блоки — пустые рамки, как в Figma.
export function HomePage() {
  return (
    <div className={styles.page}>
      <div className={styles.topRow}>
        <div className={styles.shortcuts}>
          <div className={`${styles.frame} ${styles.shortcut}`} />
          <div className={`${styles.frame} ${styles.shortcut}`} />
          <div className={`${styles.frame} ${styles.shortcut}`} />
        </div>
        <div className={`${styles.frame} ${styles.banner}`} />
      </div>

      <div className={styles.middleRow}>
        <div className={styles.reserved} />
        <section className={`${styles.frame} ${styles.materials}`} aria-labelledby="home-materials">
          <h2 id="home-materials" className={styles.frameTitle}>
            Материалы
          </h2>
        </section>
      </div>

      <div className={styles.bottomRow}>
        <div className={styles.calculator}>
          <GradeCalculator />
        </div>
        <section className={`${styles.frame} ${styles.deadlines}`} aria-labelledby="home-deadlines">
          <h2 id="home-deadlines" className={styles.frameTitle}>
            Дедлайны
          </h2>
        </section>
      </div>
    </div>
  );
}
