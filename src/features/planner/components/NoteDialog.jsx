import { useId, useState } from 'react';
import { Modal } from '../../../shared/ui/Modal';
import { usePlannerNotes } from '../hooks/usePlannerNotes';
import { TagInput } from './TagInput';
import styles from './NoteDialog.module.css';

const TITLE_MAX = 80;
const DESCRIPTION_MAX = 500;

// Своё окно до макета дизайнера: название, даты (заметка на несколько дней — это начало и
// конец), теги и описание. Цвет заметки — цвет её первого тега. Компонент монтируется заново на каждое открытие (key у родителя),
// поэтому поля берутся из заметки только при старте.
export function NoteDialog({ note, onSave, onDelete, onClose }) {
  const isEdit = Boolean(note.id);
  const [title, setTitle] = useState(note.title ?? '');
  const [start, setStart] = useState(note.start);
  const [end, setEnd] = useState(note.end ?? note.start);
  const [tagIds, setTagIds] = useState(note.tagIds ?? []);
  const [description, setDescription] = useState(note.description ?? '');
  const { tags } = usePlannerNotes();
  const [errors, setErrors] = useState({});
  const formId = useId();

  const handleStartChange = (value) => {
    setStart(value);
    // Сдвинули начало позже конца — конец едет следом, чтобы не ловить ошибку на ровном месте.
    if (value && end && value > end) setEnd(value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (!title.trim()) nextErrors.title = 'Введите название.';
    if (!start) nextErrors.start = 'Укажите дату начала.';
    if (!end) nextErrors.end = 'Укажите дату окончания.';
    else if (start && end < start) nextErrors.end = 'Окончание не может быть раньше начала.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    // Тег могли удалить, пока окно было открыто, — в заметку он не попадает.
    const existing = new Set(tags.map((t) => t.id));
    onSave({ title: title.trim(), start, end, tagIds: tagIds.filter((id) => existing.has(id)), description: description.trim() });
  };

  return (
    <Modal
      open
      title={isEdit ? 'Заметка' : 'Новая заметка'}
      onClose={onClose}
      footer={
        <>
          <button type="submit" form={formId} className={styles.primary}>
            {isEdit ? 'Сохранить' : 'Добавить'}
          </button>
          <button type="button" className={styles.secondary} onClick={onClose}>
            Отмена
          </button>
          {isEdit && (
            <button type="button" className={styles.delete} onClick={onDelete}>
              Удалить
            </button>
          )}
        </>
      }
    >
      <form id={formId} className={styles.form} onSubmit={handleSubmit} noValidate>
        <label className={styles.field}>
          <span className={styles.label}>Название</span>
          <input
            className={`${styles.input} ${errors.title ? styles.invalid : ''}`.trim()}
            value={title}
            maxLength={TITLE_MAX}
            placeholder="Например, «Сдать отчёт по БД»"
            aria-invalid={Boolean(errors.title)}
            onChange={(e) => setTitle(e.target.value)}
            data-autofocus
          />
          {errors.title && <span className={styles.error}>{errors.title}</span>}
        </label>

        <div className={styles.dates}>
          <label className={styles.field}>
            <span className={styles.label}>Начало</span>
            <input
              type="date"
              className={`${styles.input} ${errors.start ? styles.invalid : ''}`.trim()}
              value={start}
              aria-invalid={Boolean(errors.start)}
              onChange={(e) => handleStartChange(e.target.value)}
            />
            {errors.start && <span className={styles.error}>{errors.start}</span>}
          </label>
          <label className={styles.field}>
            <span className={styles.label}>Окончание</span>
            <input
              type="date"
              className={`${styles.input} ${errors.end ? styles.invalid : ''}`.trim()}
              value={end}
              min={start || undefined}
              aria-invalid={Boolean(errors.end)}
              onChange={(e) => setEnd(e.target.value)}
            />
            {errors.end && <span className={styles.error}>{errors.end}</span>}
          </label>
        </div>

        <div className={styles.field}>
          <span className={styles.label}>Теги</span>
          <TagInput value={tagIds} onChange={setTagIds} />
          <span className={styles.hint}>Первый тег задаёт цвет заметки — порядок можно менять перетаскиванием.</span>
        </div>

        <label className={styles.field}>
          <span className={styles.label}>Описание</span>
          <textarea
            className={`${styles.input} ${styles.textarea}`}
            value={description}
            maxLength={DESCRIPTION_MAX}
            rows={3}
            placeholder="Необязательно"
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>
      </form>
    </Modal>
  );
}
