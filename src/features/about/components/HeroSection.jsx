import { Link } from 'react-router-dom';
import { ArrowRightIcon } from '../../../shared/ui/icons';
import { ChatPreview } from './ChatPreview';
import styles from './HeroSection.module.css';

export function HeroSection() {
  return (
    <section className={styles.hero}>
      <div className={styles.content}>
        <h1 className={styles.title}>
          Student Mentor — цифровой{' '}
          <span className={styles.accent}>помощник для студенческой жизни</span>
        </h1>
        <p className={styles.subtitle}>
          Вся важная информация об учёбе, документах, сервисах и жизни в университете в одном
          месте. Быстрые ответы, официальные материалы, удобная навигация.
        </p>
        <Link to="/register" className={styles.cta}>
          Зарегистрироваться
          <ArrowRightIcon className={styles.ctaArrow} />
        </Link>
      </div>

      <ChatPreview />
    </section>
  );
}
