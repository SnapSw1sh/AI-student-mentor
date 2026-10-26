import { Link } from 'react-router-dom';
import styles from './LibraryBackLink.module.css';

// «Назад» ведёт на уровень выше по дереву библиотеки, а не по истории браузера: после перехода
// по хлебным крошкам история вела бы обратно вглубь — туда, откуда пользователь только что ушёл.
export function LibraryBackLink({ path }) {
  const parent = path.at(-1);
  return (
    <Link to={parent ? `/library/topics/${parent.id}` : '/library'} className={styles.back}>
      ← Назад
    </Link>
  );
}
