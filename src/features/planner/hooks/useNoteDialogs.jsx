import { useState } from 'react';
import { DayNotesDialog } from '../components/DayNotesDialog';
import { NoteDialog } from '../components/NoteDialog';
import { notesOnDay } from '../lib/weekLayout';
import { usePlannerNotes } from './usePlannerNotes';

// Окна заметок, общие для недели, месяца и дедлайнов: создание и правка заметки и список
// всех заметок дня («ещё N»). Компонент рендерит `dialogs` у себя в разметке.
export function useNoteDialogs() {
  const { notes, create, update, remove } = usePlannerNotes();
  const [dialog, setDialog] = useState(null);

  const openCreate = (fields) => setDialog({ kind: 'note', note: fields });
  const openEdit = (note) => setDialog({ kind: 'note', note });
  const openDay = (day) => setDialog({ kind: 'day', day });
  const close = () => setDialog(null);

  const handleSave = (fields) => {
    const { note } = dialog;
    const ok = note.id ? update(note.id, fields) : create(fields);
    if (ok) close();
  };

  const handleDelete = () => {
    if (remove(dialog.note.id)) close();
  };

  const dialogs = (
    <>
      {dialog?.kind === 'note' && (
        <NoteDialog
          key={dialog.note.id ?? `new-${dialog.note.start}`}
          note={dialog.note}
          onSave={handleSave}
          onDelete={handleDelete}
          onClose={close}
        />
      )}
      {dialog?.kind === 'day' && (
        <DayNotesDialog
          day={dialog.day}
          notes={notesOnDay(notes, dialog.day)}
          onEdit={openEdit}
          onCreate={(day) => openCreate({ start: day, end: day })}
          onClose={close}
        />
      )}
    </>
  );

  return { openCreate, openEdit, openDay, dialogs };
}
