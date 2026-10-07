import { useEffect, useId, useState } from 'react';
import { ChevronDownIcon } from '../../../shared/ui/icons';
import { componentScore, formatGrade } from '../lib/gradeMath';
import styles from './ScoreInputs.module.css';

const DOT_CLASS = {
  activity: styles.dotActivity,
  labs: styles.dotLabs,
  homework: styles.dotHomework,
  tests: styles.dotTests,
  exam: styles.dotExam,
};

// У ЛР и тестов несколько оценок: поле показывает их среднее и раскрывает панель с каждой
// оценкой. Панель встаёт под рядом полей, а не всплывает поверх: так она не наезжает на
// карточку результата и одинаково работает на узких экранах.
export function ScoreInputs({ components, scores, onScoreChange, onItemChange }) {
  const [openKey, setOpenKey] = useState(null);
  const panelId = useId();
  const openComponent = components.find((c) => c.key === openKey && c.items);

  useEffect(() => {
    if (!openKey) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setOpenKey(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [openKey]);

  return (
    <div className={styles.scores}>
      <div className={styles.row}>
        {components.map((component) => {
          const inputId = `${panelId}-${component.key}`;
          return (
            <div key={component.key} className={styles.field}>
              <label htmlFor={inputId} className={styles.label}>
                <span className={`${styles.dot} ${DOT_CLASS[component.dot] ?? ''}`.trim()} />
                {component.label}
              </label>
              {component.items ? (
                <MultiScoreButton
                  id={inputId}
                  component={component}
                  raw={scores[component.key]}
                  expanded={openKey === component.key}
                  controls={`${panelId}-panel`}
                  onToggle={() =>
                    setOpenKey((key) => (key === component.key ? null : component.key))
                  }
                />
              ) : (
                <span className={styles.box}>
                  <input
                    id={inputId}
                    type="text"
                    inputMode="decimal"
                    autoComplete="off"
                    className={styles.input}
                    value={scores[component.key] ?? ''}
                    placeholder="—"
                    onChange={(e) => onScoreChange(component.key, e.target.value)}
                  />
                  <span className={styles.max}>/ 10</span>
                </span>
              )}
            </div>
          );
        })}
      </div>

      {openComponent && (
        <ItemsPanel
          id={`${panelId}-panel`}
          component={openComponent}
          raw={scores[openComponent.key]}
          onItemChange={(index, value) => onItemChange(openComponent.key, index, value)}
        />
      )}
    </div>
  );
}

function MultiScoreButton({ id, component, raw, expanded, controls, onToggle }) {
  const { value, filled, total } = componentScore(component, raw);
  return (
    <button
      id={id}
      type="button"
      className={`${styles.box} ${styles.multi}`}
      aria-expanded={expanded}
      aria-controls={expanded ? controls : undefined}
      onClick={onToggle}
    >
      <span className={value === null ? styles.placeholder : styles.value}>
        {value === null ? '—' : formatGrade(value)}
      </span>
      <span className={styles.max}>/ 10</span>
      <span className={styles.counter}>
        {filled} из {total} внесено
      </span>
      <ChevronDownIcon className={`${styles.chevron} ${expanded ? styles.chevronOpen : ''}`.trim()} />
    </button>
  );
}

function ItemsPanel({ id, component, raw, onItemChange }) {
  const { value, filled, total } = componentScore(component, raw);
  const baseId = useId();

  return (
    <section id={id} className={styles.panel} aria-label={component.items.title}>
      <div className={styles.panelHeader}>
        <span className={styles.panelTitle}>{component.items.title}</span>
        <span className={styles.panelAverage}>
          Средний балл: {value === null ? '—' : formatGrade(value)} / 10
        </span>
      </div>
      <div className={styles.items}>
        {Array.from({ length: total }, (_, index) => {
          const itemId = `${baseId}-${index}`;
          return (
            <div key={itemId} className={styles.item}>
              <label htmlFor={itemId} className={styles.itemLabel}>
                {component.items.itemLabel} {index + 1}
              </label>
              <span className={`${styles.box} ${styles.itemBox}`}>
                <input
                  id={itemId}
                  type="text"
                  inputMode="decimal"
                  autoComplete="off"
                  className={`${styles.input} ${styles.itemInput}`}
                  value={raw?.[index] ?? ''}
                  placeholder="—"
                  onChange={(e) => onItemChange(index, e.target.value)}
                />
                <span className={styles.itemMax}>/ 10</span>
              </span>
            </div>
          );
        })}
      </div>
      <p className={styles.panelCounter}>
        {filled} из {total} внесено
      </p>
    </section>
  );
}
