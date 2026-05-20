import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import styles from './AppLayout.module.css';

export function AppLayout() {
  return (
    <div className={styles.shell}>
      <Header />
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}
