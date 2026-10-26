import { useState } from 'react';
import { CheckIcon } from '../../../shared/ui/icons';
import { usePlannerNotes } from '../hooks/usePlannerNotes';
import { TAG_PALETTE, toneFromColor } from '../lib/color';
import { toneStyle } from '../lib/noteTone';
import styles from './TagEditor.module.css';

const TAG_NAME_MAX = 30;

// Настройки тега: название, цвет из палитры или любой свой, удаление. Меняет сам тег, а не
// заметку, поэтому изменения сразу видны во всех заметках с ним — как в Notion.
export function TagEditor({ tag, onClose }) {
  const { tags, updateTag, deleteTag } = usePlannerNotes();
  const [name, setName] = useState(tag.name);
  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  const commitName = () => {
    const trimmed = name.trim();
    if (trimmed === tag.name) return true;
    if (!trimmed) {
      setError('Введите название.');
      return false;
    }
    const taken = tags.some(
      (t) => t.id !== tag.id && t.name.toLocaleLowerCase('ru') === trimmed.toLocaleLowerCase('ru'),
    );
    if (taken) {
      setError('Такой тег уже есть.');
      return false;
    }
    setError('');
    return updateTag(tag.id, { name: trimmed });
  };

  const handleDone = () => {
    if (commitName()) onClose();
  };

  const handleDelete = () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    if (deleteTag(tag.id)) onClose();
  };

  return (
    <div className={styles.panel} role="group" aria-label={`Настройки тега «${tag.name}»`}>
      <div className={styles.head}>
        <span className={styles.preview} style={toneStyle(toneFromColor(tag.color))}>
          {name.trim() || tag.name}
        </span>
      </div>

      <label className={styles.field}>
        <span className={styles.label}>Название</span>
        <input
          className={`${styles.input} ${error ? styles.invalid : ''}`.trim()}
          value={name}
          maxLength={TAG_NAME_MAX}
          onChange={(e) => {
            setName(e.target.value);
            setError('');
          }}
          onBlur={commitName}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleDone();
            }
          }}
          aria-invalid={Boolean(error)}
        />
        {error && <span className={styles.error}>{error}</span>}
      </label>

      <div className={styles.field}>
        <span className={styles.label}>Цвет</span>
        <div className={styles.palette}>
          {TAG_PALETTE.map((color) => {
            const current = color.toLowerCase() === tag.color.toLowerCase();
            return (
              <button
                key={color}
                type="button"
                className={styles.swatch}
                style={{ background: color }}
                aria-label={`Цвет ${color}`}
                aria-pressed={current}
                onClick={() => updateTag(tag.id, { color })}
              >
                {current && <CheckIcon className={styles.swatchCheck} />}
              </button>
            );
          })}
          <label className={styles.custom} title="Свой цвет">
            <input
              type="color"
              value={tag.color}
              onChange={(e) => updateTag(tag.id, { color: e.target.value })}
              aria-label="Свой цвет"
            />
            <span>Свой</span>
          </label>
        </div>
      </div>

      <div className={styles.actions}>
        <button type="button" className={styles.done} onClick={handleDone}>
          Готово
        </button>
        <button type="button" className={styles.delete} onClick={handleDelete}>
          {confirmDelete ? 'Удалить из всех заметок?' : 'Удалить тег'}
        </button>
      </div>
    </div>
  );
}
