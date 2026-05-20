import { SUGGESTION_CHIPS } from '../data/suggestions';
import styles from './SuggestionChips.module.css';

export function SuggestionChips({ onPick, disabled }) {
  return (
    <div className={styles.chips}>
      {SUGGESTION_CHIPS.map((chip) => (
        <button
          key={chip.label}
          type="button"
          className={styles.chip}
          onClick={() => onPick(chip.query)}
          disabled={disabled}
        >
          {chip.label}
        </button>
      ))}
    </div>
  );
}
