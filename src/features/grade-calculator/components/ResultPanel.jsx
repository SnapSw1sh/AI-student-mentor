import { useId } from 'react';
import { MAX_GRADE, formatGrade, formatPreciseGrade } from '../lib/gradeMath';
import styles from './ResultPanel.module.css';

const LEVEL_CLASS = {
  excellent: styles.excellent,
  good: styles.good,
  fair: styles.fair,
  poor: styles.poor,
};

const MODES = [
  { id: 'average', label: 'Без экзамена', hint: 'Взвешенное среднее по внесённым оценкам, из 10' },
  { id: 'total', label: 'Итог', hint: 'Баллы итоговой оценки по всем внесённым оценкам, с экзаменом' },
];

function totalCaption(result) {
  if (!result.examIncluded) return `Без экзамена максимум — ${formatGrade(result.maxEarned)}`;
  if (!result.allRegularFilled) return 'С экзаменом, но внесены не все оценки';
  return 'С учётом экзамена';
}

export function ResultPanel({
  result,
  emptyMessage,
  mode,
  onModeChange,
  target,
  onTargetChange,
  onCalculate,
  calculateDisabled,
}) {
  const isOk = result?.status === 'ok';
  const isTotal = mode === 'total';
  const shown = isOk ? (isTotal ? result.total : result.average) : null;
  const level = isOk ? (isTotal ? result.totalLevel : result.averageLevel) : null;
  const panelClass = [styles.panel, level ? LEVEL_CLASS[level] : styles.empty].join(' ');

  return (
    <div className={panelClass}>
      <div className={styles.header}>
        <span className={styles.title}>Текущий накоп</span>
        <div className={styles.modes} role="group" aria-label="Как считать накоп">
          {MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              className={`${styles.mode} ${mode === m.id ? styles.modeActive : ''}`.trim()}
              aria-pressed={mode === m.id}
              title={m.hint}
              onClick={() => onModeChange(m.id)}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.score} aria-live="polite">
        <span className={styles.value}>{shown === null ? '—' : formatGrade(shown)}</span>
        <span className={styles.outOf}>/ 10</span>
      </div>
      <div className={styles.track}>
        <div
          className={styles.bar}
          style={{ width: `${shown === null ? 0 : Math.min(shown / MAX_GRADE, 1) * 100}%` }}
        />
      </div>
      <p className={styles.caption}>
        {isOk && (isTotal ? totalCaption(result) : 'Среднее по внесённым оценкам без экзамена')}
      </p>

      <div className={styles.divider} />

      <div className={styles.hint}>
        {isOk ? (
          <Outlook outlook={result.outlook} target={target} onTargetChange={onTargetChange} />
        ) : (
          <p className={styles.hintText}>{emptyMessage}</p>
        )}
      </div>

      <button
        type="button"
        className={styles.calculate}
        onClick={onCalculate}
        disabled={calculateDisabled}
      >
        Посчитать
      </button>
    </div>
  );
}

function Outlook({ outlook, target, onTargetChange }) {
  const inputId = useId();

  if (outlook.type === 'final') {
    return (
      <div className={styles.hintBody}>
        <span className={styles.hintLine}>Итоговая оценка</span>
        <span className={styles.hintResult}>
          <span className={styles.hintAccent}>{formatPreciseGrade(outlook.value)}</span> → {outlook.rounded}
        </span>
      </div>
    );
  }

  return (
    <div className={styles.hintBody}>
      <span className={styles.hintLine}>
        <label htmlFor={inputId}>Чтобы получить</label>
        <input
          id={inputId}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          className={styles.targetInput}
          value={target}
          placeholder="?"
          onFocus={(e) => e.target.select()}
          onChange={(e) => onTargetChange(e.target.value)}
          aria-describedby={`${inputId}-result`}
        />
        <span>, нужно</span>
      </span>
      <span id={`${inputId}-result`} className={styles.hintResult}>
        <OutlookText outlook={outlook} />
      </span>
    </div>
  );
}

function OutlookText({ outlook }) {
  switch (outlook.type) {
    case 'need':
      return (
        <>
          <span className={styles.hintAccent}>{formatGrade(outlook.value)}</span> на экзамене
        </>
      );
    case 'guaranteed':
      return 'любой балл на экзамене';
    case 'unreachable':
      return (
        <>
          <span className={styles.hintWarning}>недостижимо</span>
          <span className={styles.hintNote}>максимум с 10 на экзамене — {outlook.best}</span>
        </>
      );
    case 'incomplete':
      return <span className={styles.hintNote}>внесите все оценки, кроме экзамена</span>;
    case 'noExam':
      return <span className={styles.hintNote}>в формуле нет экзамена</span>;
    default:
      return <span className={styles.hintNote}>введите желаемую оценку от 1 до 10</span>;
  }
}
