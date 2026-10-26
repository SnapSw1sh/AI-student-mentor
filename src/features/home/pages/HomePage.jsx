import { GradeCalculator } from '../../grade-calculator/components/GradeCalculator';
import { MaterialsWidget } from '../../materials/components/MaterialsWidget';
import { DeadlinesWidget } from '../../planner/components/DeadlinesWidget';
import { WeekCalendar } from '../../planner/components/WeekCalendar';
import { AskBar } from '../components/AskBar';
import { ShortcutCard } from '../components/ShortcutCard';
import booksIcon from '../assets/books.png';
import calendarIcon from '../assets/calendar.png';
import styles from './HomePage.module.css';

// Главная вошедшего пользователя (гость на этом адресе видит «О проекте»).
export function HomePage() {
  return (
    <div className={styles.page}>
      <div className={styles.topRow}>
        <ShortcutCard
          icon={calendarIcon}
          tone="blue"
          title="Календарь"
          subtitle="Распланируй месяц"
          to="/calendar"
        />
        <ShortcutCard
          icon={booksIcon}
          tone="pink"
          title="Материалы"
          subtitle="Конспекты и ресурсы"
          to="/materials"
        />
        <div className={styles.ask}>
          <AskBar />
        </div>
      </div>

      <div className={styles.middleRow}>
        <div className={styles.calendar}>
          <WeekCalendar />
        </div>
        <div className={styles.materials}>
          <MaterialsWidget />
        </div>
      </div>

      <div className={styles.bottomRow}>
        <div className={styles.calculator}>
          <GradeCalculator />
        </div>
        <div className={styles.deadlines}>
          <DeadlinesWidget />
        </div>
      </div>
    </div>
  );
}
