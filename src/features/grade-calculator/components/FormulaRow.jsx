import { Fragment } from 'react';
import { formatWeight } from '../lib/gradeMath';
import styles from './FormulaRow.module.css';

export function FormulaRow({ components, weights }) {
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
            <span className={styles.weight}>{formatWeight(weights[component.key])}</span>
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
