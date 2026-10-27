import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app/App';
import './styles/variables.css';
import './styles/global.css';

// После выкладки новой версии у открытой вкладки старые куски сборки пропадают с сервера,
// и переход в ещё не открытый раздел падает. Перезагружаем страницу — она возьмёт новую версию.
// Метка в sessionStorage не даёт уйти в бесконечную перезагрузку, если кусок не грузится вовсе.
const RELOAD_FLAG = 'student-mentor:chunk-reload';
window.addEventListener('vite:preloadError', (event) => {
  try {
    if (sessionStorage.getItem(RELOAD_FLAG)) return;
    sessionStorage.setItem(RELOAD_FLAG, '1');
  } catch {
    return; // хранилище недоступно — без метки перезагрузка могла бы повторяться бесконечно
  }
  event.preventDefault();
  window.location.reload();
});
window.addEventListener('load', () => {
  try {
    sessionStorage.removeItem(RELOAD_FLAG);
  } catch {
    // нечего снимать — метку и не удалось поставить
  }
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
