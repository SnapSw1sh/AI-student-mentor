import { useState } from 'react';
import { useNotify } from '../../../shared/notifications/useNotify';
import { MockupNotice } from '../../../shared/ui/MockupNotice';
import { ChevronDownIcon } from '../../../shared/ui/icons';
import { FAQ, SUPPORT_TOPICS } from '../data/faq';
import styles from './SupportPage.module.css';

export function SupportPage() {
  const notify = useNotify();
  const [topic, setTopic] = useState(SUPPORT_TOPICS[0]);
  const [message, setMessage] = useState('');

  // TODO(backend): API обращений нет — форма пока ничего не отправляет (PROBLEMS.md#23).
  const handleSubmit = (event) => {
    event.preventDefault();
    notify.info('Обращение не отправлено', 'Это макет раздела: поддержка пока не принимает обращения.');
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Техническая поддержка</h1>
        <p className={styles.subtitle}>Поможем, если что-то не работает или непонятно</p>
      </header>

      <MockupNotice>Это макет раздела: обращения пока не отправляются.</MockupNotice>

      <div className={styles.layout}>
        <section className={styles.card} aria-labelledby="support-faq">
          <h2 id="support-faq" className={styles.cardTitle}>
            Частые вопросы
          </h2>
          <div className={styles.faq}>
            {FAQ.map(({ id, question, answer }) => (
              <details key={id} className={styles.faqItem}>
                <summary className={styles.question}>
                  <span>{question}</span>
                  <ChevronDownIcon className={styles.chevron} />
                </summary>
                <p className={styles.answer}>{answer}</p>
              </details>
            ))}
          </div>
        </section>

        <div className={styles.side}>
          <section className={styles.card} aria-labelledby="support-form">
            <h2 id="support-form" className={styles.cardTitle}>
              Написать в поддержку
            </h2>
            <form className={styles.form} onSubmit={handleSubmit}>
              <label className={styles.field}>
                <span className={styles.label}>Тема</span>
                <select className={styles.control} value={topic} onChange={(e) => setTopic(e.target.value)}>
                  {SUPPORT_TOPICS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </label>
              <label className={styles.field}>
                <span className={styles.label}>Сообщение</span>
                <textarea
                  className={`${styles.control} ${styles.textarea}`}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Опишите, что произошло и на какой странице"
                  rows={6}
                  maxLength={2000}
                />
              </label>
              <button type="submit" className={styles.submit} disabled={!message.trim()}>
                Отправить
              </button>
            </form>
          </section>

          <section className={styles.card} aria-labelledby="support-tickets">
            <h2 id="support-tickets" className={styles.cardTitle}>
              Мои обращения
            </h2>
            <p className={styles.empty}>Обращений пока нет. Здесь будет видно, на каком они этапе.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
