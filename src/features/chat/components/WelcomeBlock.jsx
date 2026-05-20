import styles from './WelcomeBlock.module.css';

export function WelcomeBlock() {
  return (
    <div className={styles.welcome}>
      <h1 className={styles.title}>О чём хотите узнать?</h1>
    </div>
  );
}
