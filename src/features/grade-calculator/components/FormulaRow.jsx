import { Fragment } from 'react';
import { formatWeight } from '../lib/gradeMath';
import styles from './FormulaRow.module.css';

export function FormulaRow({ components, weights, weightInputs, editable, onWeightChange }) {
  return (
    <div className={styles.formula}>
      {components.map((component, index) => (
        <Fragment key={component.key}>
          {index > 0 && (
            <span className={styles.plus} aria-hidden="true">
              +
            </span>
          )}
          <span className={styles.chip}>
            {editable ? (
              <input
                type="text"
                inputMode="decimal"
                className={styles.weightInput}
                value={weightInputs[component.key]}
                onChange={(e) => onWeightChange(component.key, e.target.value)}
                aria-label={`Коэффициент: ${component.label}`}
                placeholder="0"
              />
            ) : (
              <span className={styles.weight}>{formatWeight(weights[component.key])}</span>
            )}
            <span className={styles.times} aria-hidden="true">
              ×
            </span>
            <span className={styles.name}>{component.label}</span>
          </span>
        </Fragment>
      ))}
    </div>
  );
}
