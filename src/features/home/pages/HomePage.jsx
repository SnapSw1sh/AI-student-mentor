import styles from './HomePage.module.css';

// Точка входа для всех пользователей, включая гостей. Пока заглушка: сюда будут
// добавляться блоки новых разделов проекта.
export function HomePage() {
  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Главная</h1>
      <p className={styles.text}>Заглушка главной страницы. Здесь появятся разделы проекта.</p>
    </div>
  );
}
