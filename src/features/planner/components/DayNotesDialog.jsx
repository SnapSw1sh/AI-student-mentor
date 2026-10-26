import { Modal } from '../../../shared/ui/Modal';
import { PlusIcon } from '../../../shared/ui/icons';
import { formatDayTitle, formatNoteDates, parseISODate } from '../lib/dates';
import { usePlannerNotes } from '../hooks/usePlannerNotes';
import { toneStyle } from '../lib/noteTone';
import styles from './DayNotesDialog.module.css';

export function DayNotesDialog({ day, notes, onEdit, onCreate, onClose }) {
  const { noteTone, noteTags } = usePlannerNotes();
  return (
    <Modal open size="sm" title={formatDayTitle(parseISODate(day))} onClose={onClose}>
      <div className={styles.list}>
        {notes.length === 0 && <p className={styles.empty}>В этот день ничего нет.</p>}
        {notes.map((note) => (
          <button
            key={note.id}
            type="button"
            className={styles.note}
            style={toneStyle(noteTone(note))}
            onClick={() => onEdit(note)}
          >
            <span className={styles.title}>{note.title}</span>
            {(note.start !== note.end || noteTags(note).length > 0) && (
              <span className={styles.meta}>
                {[noteTags(note).map((t) => t.name).join(', '), note.start !== note.end && formatNoteDates(note.start, note.end)]
                  .filter(Boolean)
                  .join(' · ')}
              </span>
            )}
          </button>
        ))}
        <button type="button" className={styles.add} onClick={() => onCreate(day)}>
          <PlusIcon className={styles.addIcon} />
          Добавить заметку
        </button>
      </div>
    </Modal>
  );
}
