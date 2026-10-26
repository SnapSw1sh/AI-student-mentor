import { MonthCalendar } from '../components/MonthCalendar';
import styles from './CalendarPage.module.css';

export function CalendarPage() {
  return (
    <div className={styles.page}>
      <MonthCalendar />
    </div>
  );
}
