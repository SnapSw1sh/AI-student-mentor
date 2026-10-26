import { useEffect, useId, useRef, useState } from 'react';
import { CloseIcon, MoreIcon, PlusIcon } from '../../../shared/ui/icons';
import { usePlannerNotes } from '../hooks/usePlannerNotes';
import { toneFromColor } from '../lib/color';
import { toneStyle } from '../lib/noteTone';
import { TagEditor } from './TagEditor';
import styles from './TagInput.module.css';

const TAG_NAME_MAX = 30;
const DRAG_THRESHOLD_PX = 4;

const sameName = (a, b) => a.trim().toLocaleLowerCase('ru') === b.trim().toLocaleLowerCase('ru');

// Теги заметки, как в Notion: строка выбранных тегов и поле, в котором тег ищется или сразу
// создаётся. Порядок тегов — их приоритет (первый задаёт цвет заметки), поэтому теги
// переставляются перетаскиванием или Alt+← / →; размер тегов при этом не меняется.
export function TagInput({ value, onChange }) {
  const { tags, createTag } = usePlannerNotes();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [editingId, setEditingId] = useState(null);
  const [draggingId, setDraggingId] = useState(null);
  const rootRef = useRef(null);
  const inputRef = useRef(null);
  const valueRef = useRef(value);
  const listboxId = useId();

  useEffect(() => {
    valueRef.current = value;
  });

  const tagsById = new Map(tags.map((t) => [t.id, t]));
  const selected = value.map((id) => tagsById.get(id)).filter(Boolean);
  const trimmed = query.trim();
  const options = tags.filter(
    (t) => !value.includes(t.id) && t.name.toLocaleLowerCase('ru').includes(trimmed.toLocaleLowerCase('ru')),
  );
  const canCreate = trimmed.length > 0 && !tags.some((t) => sameName(t.name, trimmed));
  const items = [...options.map((tag) => ({ kind: 'tag', tag })), ...(canCreate ? [{ kind: 'create' }] : [])];
  const activeIndex = Math.min(active, items.length - 1);

  const add = (id) => {
    onChange([...value, id]);
    setQuery('');
    setActive(0);
  };

  const choose = (item) => {
    if (item.kind === 'tag') add(item.tag.id);
    else {
      const tag = createTag(trimmed.slice(0, TAG_NAME_MAX));
      if (tag) add(tag.id);
    }
  };

  const removeAt = (index) => onChange(value.filter((_, i) => i !== index));

  const moveTo = (id, index) => {
    const rest = valueRef.current.filter((t) => t !== id);
    const next = [...rest.slice(0, index), id, ...rest.slice(index)];
    if (next.join() !== valueRef.current.join()) onChange(next);
  };

  const handleInputKeyDown = (event) => {
    if (event.key === 'ArrowDown' && items.length) {
      event.preventDefault();
      setOpen(true);
      setActive((activeIndex + 1) % items.length);
    } else if (event.key === 'ArrowUp' && items.length) {
      event.preventDefault();
      setActive((activeIndex - 1 + items.length) % items.length);
    } else if (event.key === 'Enter') {
      // Enter в поле тегов не должен отправлять форму заметки.
      event.preventDefault();
      if (open && items[activeIndex]) choose(items[activeIndex]);
    } else if (event.key === 'Escape' && open) {
      // Первый Esc закрывает только список тегов, а не всё окно заметки.
      event.preventDefault();
      event.stopPropagation();
      setOpen(false);
    } else if (event.key === 'Backspace' && !query && value.length) {
      removeAt(value.length - 1);
    }
  };

  const handleChipKeyDown = (index, event) => {
    if (event.altKey && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) {
      event.preventDefault();
      const target = index + (event.key === 'ArrowLeft' ? -1 : 1);
      if (target >= 0 && target < value.length) moveTo(value[index], target);
    } else if (event.key === 'Backspace' || event.key === 'Delete') {
      event.preventDefault();
      removeAt(index);
      inputRef.current?.focus();
    }
  };

  // Перестановка тегов. Слушаем окно, а не сам тег: при перестановке React переносит его
  // узел в DOM, и захват указателя на нём теряется.
  const handleChipPointerDown = (id, event) => {
    if (event.button !== 0 || event.target.closest('button')) return;
    const x0 = event.clientX;
    const y0 = event.clientY;
    let dragging = false;

    const onMove = (e) => {
      if (!dragging) {
        if (Math.hypot(e.clientX - x0, e.clientY - y0) < DRAG_THRESHOLD_PX) return;
        dragging = true;
        setDraggingId(id);
      }
      e.preventDefault();
      const others = [...rootRef.current.querySelectorAll('[data-tag-id]')].filter((el) => el.dataset.tagId !== id);
      const index = others.filter((el) => {
        const r = el.getBoundingClientRect();
        return e.clientY > r.bottom || (e.clientY >= r.top && e.clientX > r.left + r.width / 2);
      }).length;
      moveTo(id, index);
    };
    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
      setDraggingId(null);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
  };

  const editingTag = editingId && tagsById.get(editingId);

  return (
    <div className={styles.root} ref={rootRef}>
      <div
        className={`${styles.box} ${draggingId ? styles.boxDragging : ''}`.trim()}
        onClick={(e) => {
          if (e.target === e.currentTarget) inputRef.current?.focus();
        }}
      >
        {selected.map((tag, index) => (
          <span
            key={tag.id}
            data-tag-id={tag.id}
            className={`${styles.chip} ${draggingId === tag.id ? styles.chipDragging : ''}`.trim()}
            style={toneStyle(toneFromColor(tag.color))}
            tabIndex={0}
            aria-label={`Тег «${tag.name}», ${index + 1} из ${selected.length}. Alt и стрелки — переставить, Delete — убрать`}
            onPointerDown={(e) => handleChipPointerDown(tag.id, e)}
            onKeyDown={(e) => handleChipKeyDown(index, e)}
          >
            <span className={styles.chipName}>{tag.name}</span>
            <button
              type="button"
              className={styles.chipButton}
              aria-label={`Настроить тег «${tag.name}»`}
              onClick={() => setEditingId(tag.id)}
            >
              <MoreIcon className={styles.chipIcon} />
            </button>
            <button
              type="button"
              className={styles.chipButton}
              aria-label={`Убрать тег «${tag.name}»`}
              onClick={() => removeAt(index)}
            >
              <CloseIcon className={styles.chipIcon} />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          className={styles.input}
          value={query}
          maxLength={TAG_NAME_MAX}
          placeholder={selected.length ? 'Ещё тег…' : 'Найти или создать тег'}
          role="combobox"
          aria-expanded={open && items.length > 0}
          aria-controls={listboxId}
          aria-activedescendant={open && items.length ? `${listboxId}-${activeIndex}` : undefined}
          aria-label="Теги"
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(0);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
          onKeyDown={handleInputKeyDown}
        />
      </div>

      {open && items.length > 0 && (
        // mousedown не уводит фокус из поля — иначе список закрылся бы до клика.
        <ul id={listboxId} role="listbox" className={styles.options} onMouseDown={(e) => e.preventDefault()}>
          {items.map((item, index) => (
            <li
              key={item.kind === 'tag' ? item.tag.id : 'create'}
              id={`${listboxId}-${index}`}
              role="option"
              aria-selected={index === activeIndex}
              className={`${styles.option} ${index === activeIndex ? styles.optionActive : ''}`.trim()}
              onMouseEnter={() => setActive(index)}
              onClick={() => choose(item)}
            >
              {item.kind === 'tag' ? (
                <>
                  <span className={styles.optionChip} style={toneStyle(toneFromColor(item.tag.color))}>
                    {item.tag.name}
                  </span>
                  <button
                    type="button"
                    tabIndex={-1}
                    className={styles.optionEdit}
                    aria-label={`Настроить тег «${item.tag.name}»`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingId(item.tag.id);
                    }}
                  >
                    <MoreIcon className={styles.chipIcon} />
                  </button>
                </>
              ) : (
                <span className={styles.create}>
                  <PlusIcon className={styles.createIcon} />
                  Создать тег «{trimmed}»
                </span>
              )}
            </li>
          ))}
        </ul>
      )}

      {editingTag && <TagEditor key={editingTag.id} tag={editingTag} onClose={() => setEditingId(null)} />}
    </div>
  );
}
