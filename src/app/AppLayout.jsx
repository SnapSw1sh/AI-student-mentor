import { Suspense, useMemo, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { useAuth } from '../features/auth/hooks/useAuth';
import { ChatProvider } from '../features/chat/context/ChatProvider';
import { PlannerProvider } from '../features/planner/context/PlannerProvider';
import { PageLoader } from '../shared/ui/PageLoader';
import styles from './AppLayout.module.css';

export function AppLayout() {
  const { bootstrapped, user } = useAuth();
  const [headerCollapsed, setHeaderCollapsed] = useState(false);
  // Мемоизация, чтобы переключение хедера не перерисовывало страницу, читающую контекст.
  const outletContext = useMemo(() => ({ setHeaderCollapsed }), []);

  return (
    <div className={styles.shell}>
      <Header collapsed={headerCollapsed} />
      <main className={styles.main}>
        {/* Страницы ждут окончания начального refresh. Иначе их запросы на 401 запустят
            второй refresh параллельно, а бэк ротирует refresh-токен — второй со старой
            кукой выкинет пользователя из сессии. */}
        {bootstrapped && (
          <ChatProvider>
            <PlannerProvider key={user?.user_id ?? 'guest'} userId={user?.user_id}>
              {/* Разделы загружаются лениво (routes.jsx) — пока грузится, шапка остаётся на месте. */}
              <Suspense fallback={<PageLoader />}>
                <Outlet context={outletContext} />
              </Suspense>
            </PlannerProvider>
          </ChatProvider>
        )}
      </main>
    </div>
  );
}
