import { useId, useState } from 'react';
import {
  CheckCircleIcon,
  ChevronDownIcon,
  MinusIcon,
  PlusIcon,
  TrashIcon,
} from '../../../shared/ui/icons';
import { AGGREGATES, areWeightsValid, formatGrade, isGradeInput, isWeightInput, weightsSum } from '../lib/gradeMath';
import { newItem, newRow, rowValue, rowsWeights } from '../lib/customFormula';
import styles from './CustomFormulaEditor.module.css';

const DOT_CLASS = {
  activity: styles.dotActivity,
  labs: styles.dotLabs,
  homework: styles.dotHomework,
  tests: styles.dotTests,
  exam: styles.dotExam,
};

const NAME_MAX = 40;

export function CustomFormulaEditor({
  rows,
  onRowsChange,
  templateName,
  onTemplateNameChange,
  onSave,
  saveErrors,
}) {
  const [expandedIds, setExpandedIds] = useState(() => new Set());
  const nameId = useId();

  const weights = rowsWeights(rows);
  const sum = weightsSum(weights);
  const valid = areWeightsValid(weights);

  const updateRow = (id, patch) =>
    onRowsChange((list) => list.map((row) => (row.id === id ? { ...row, ...patch } : row)));

  const updateItem = (rowId, itemId, patch) =>
    onRowsChange((list) =>
      list.map((row) =>
        row.id === rowId
          ? { ...row, items: row.items.map((item) => (item.id === itemId ? { ...item, ...patch } : item)) }
          : row,
      ),
    );

  const toggleExpanded = (id) =>
    setExpandedIds((set) => {
      const next = new Set(set);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const removeRow = (id) => onRowsChange((list) => list.filter((row) => row.id !== id));

  // Экзамен в формуле один: от него считается «сколько нужно на экзамене».
  const setExam = (id, checked) =>
    onRowsChange((list) => list.map((row) => ({ ...row, isExam: row.id === id ? checked : false })));

  const addItem = (rowId) =>
    onRowsChange((list) =>
      list.map((row) =>
        row.id === rowId ? { ...row, items: [...row.items, newItem()] } : row,
      ),
    );

  const removeItem = (rowId, itemId) =>
    onRowsChange((list) =>
      list.map((row) =>
        row.id === rowId ? { ...row, items: row.items.filter((item) => item.id !== itemId) } : row,
      ),
    );

  return (
    <div className={styles.editor}>
      <p className={styles.hint}>
        Названия и коэффициенты можно редактировать. Сумма коэффициентов должна быть равна 1.00.
      </p>

      {/* Заголовки колонок — только визуальные: у каждого поля в строке своя подпись
          для экранных дикторов («Коэффициент: Тесты» и т.п.). */}
      <div className={styles.table}>
        <div className={`${styles.row} ${styles.head}`} aria-hidden="true">
          <span />
          <span>Компонент</span>
          <span>Коэффициент</span>
          <span>Оценка</span>
          <span>Вклад в итог</span>
          <span className={styles.headActions}>
            <TrashIcon className={styles.headTrash} />
          </span>
        </div>

        {rows.map((row) => {
          const expanded = expandedIds.has(row.id);
          const value = rowValue(row);
          const weight = weights[row.id];
          const hasItems = row.items.length > 0;
          const contribution = value !== null && weight !== null ? (value * weight).toFixed(2) : '—';
          const label = row.name.trim() || 'компонент без названия';
          const panelId = `${row.id}-panel`;

          return (
            <div key={row.id} className={styles.group}>
              <div className={styles.row}>
                <span
                  className={`${styles.dot} ${DOT_CLASS[row.dot] ?? styles.dotNone}`}
                  aria-hidden="true"
                />
                <input
                  className={styles.input}
                  value={row.name}
                  maxLength={NAME_MAX}
                  placeholder="Название"
                  aria-label="Название компонента"
                  onChange={(e) => updateRow(row.id, { name: e.target.value })}
                />
                <span className={styles.cell}>
                  <span className={styles.cellLabel} aria-hidden="true">
                    Коэффициент
                  </span>
                  <input
                    className={styles.input}
                    inputMode="decimal"
                    value={row.weight}
                    placeholder="0"
                    aria-label={`Коэффициент: ${label}`}
                    onChange={(e) => isWeightInput(e.target.value) && updateRow(row.id, { weight: e.target.value })}
                  />
                </span>
                <span className={styles.cell}>
                  <span className={styles.cellLabel} aria-hidden="true">
                    Оценка
                  </span>
                  <span className={styles.score}>
                    {hasItems ? (
                      <span className={`${styles.input} ${styles.scoreInput} ${styles.computed}`} title="Считается по оценкам ниже">
                        {value === null ? '—' : formatGrade(value)}
                      </span>
                    ) : (
                      <input
                        className={`${styles.input} ${styles.scoreInput}`}
                        inputMode="decimal"
                        value={row.score}
                        placeholder="—"
                        aria-label={`Оценка: ${label}`}
                        onChange={(e) => isGradeInput(e.target.value) && updateRow(row.id, { score: e.target.value })}
                      />
                    )}
                    <span className={styles.outOf}>/ 10</span>
                  </span>
                </span>
                <span className={styles.cell}>
                  <span className={styles.cellLabel} aria-hidden="true">
                    Вклад
                  </span>
                  <span className={styles.contribution} aria-label={`Вклад в итог: ${contribution}`}>
                    {contribution}
                  </span>
                </span>
                <span className={styles.actions}>
                  <button
                    type="button"
                    className={styles.iconButton}
                    aria-expanded={expanded}
                    aria-controls={expanded ? panelId : undefined}
                    aria-label={expanded ? `Свернуть: ${label}` : `Разбить на оценки и настроить: ${label}`}
                    onClick={() => toggleExpanded(row.id)}
                  >
                    {expanded ? <MinusIcon className={styles.icon} /> : <PlusIcon className={styles.icon} />}
                  </button>
                  <button
                    type="button"
                    className={`${styles.iconButton} ${styles.danger}`}
                    aria-label={`Удалить: ${label}`}
                    onClick={() => removeRow(row.id)}
                  >
                    <TrashIcon className={styles.icon} />
                  </button>
                </span>
              </div>

              {expanded && (
                <div id={panelId} className={styles.details}>
                  <p className={styles.detailsTitle}>{row.name.trim() || 'Без названия'}</p>

                  <div className={styles.detailsControls}>
                    <label className={styles.selectField}>
                      <span className={styles.label}>Как считать результат</span>
                      <span className={styles.selectBox}>
                        <select
                          className={styles.select}
                          value={row.aggregate}
                          onChange={(e) => updateRow(row.id, { aggregate: e.target.value })}
                        >
                          {AGGREGATES.map((a) => (
                            <option key={a.id} value={a.id}>
                              {a.label}
                            </option>
                          ))}
                        </select>
                        <ChevronDownIcon className={styles.selectIcon} />
                      </span>
                    </label>
                    <label className={styles.checkbox}>
                      <input
                        type="checkbox"
                        checked={row.isExam}
                        onChange={(e) => setExam(row.id, e.target.checked)}
                      />
                      Это экзамен
                    </label>
                  </div>

                  {row.items.map((item, index) => (
                    <div key={item.id} className={styles.itemRow}>
                      <input
                        className={styles.input}
                        value={item.name}
                        maxLength={NAME_MAX}
                        placeholder={`Оценка ${index + 1}`}
                        aria-label={`Название оценки ${index + 1}`}
                        onChange={(e) => updateItem(row.id, item.id, { name: e.target.value })}
                      />
                      <span className={styles.score}>
                        <input
                          className={`${styles.input} ${styles.scoreInput}`}
                          inputMode="decimal"
                          value={item.score}
                          placeholder="—"
                          aria-label={`Балл: ${item.name.trim() || `оценка ${index + 1}`}`}
                          onChange={(e) => isGradeInput(e.target.value) && updateItem(row.id, item.id, { score: e.target.value })}
                        />
                        <span className={styles.outOf}>/ 10</span>
                      </span>
                      <button
                        type="button"
                        className={`${styles.iconButton} ${styles.danger}`}
                        aria-label={`Удалить оценку ${item.name.trim() || index + 1}`}
                        onClick={() => removeItem(row.id, item.id)}
                      >
                        <TrashIcon className={styles.icon} />
                      </button>
                    </div>
                  ))}

                  <button type="button" className={`${styles.addButton} ${styles.addSmall}`} onClick={() => addItem(row.id)}>
                    <PlusIcon className={styles.icon} />
                    Добавить оценку
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <button
        type="button"
        className={styles.addButton}
        onClick={() => onRowsChange((list) => [...list, newRow()])}
      >
        <PlusIcon className={styles.icon} />
        Добавить компонент
      </button>

      <div className={styles.summary}>
        <span className={styles.sumLabel}>Сумма коэффициентов</span>
        <span className={styles.sumValue}>{sum.toFixed(2)}</span>
        <span className={valid ? styles.statusOk : styles.statusBad} aria-live="polite">
          {valid && <CheckCircleIcon className={styles.statusIcon} />}
          {valid ? 'Формула корректна' : 'Сумма должна быть равна 1.00'}
        </span>
      </div>

      <form
        className={styles.save}
        onSubmit={(e) => {
          e.preventDefault();
          onSave();
        }}
        noValidate
      >
        <label htmlFor={nameId} className={styles.label}>
          Название шаблона
        </label>
        <div className={styles.saveRow}>
          <input
            id={nameId}
            className={`${styles.input} ${styles.nameInput} ${saveErrors.name ? styles.inputError : ''}`.trim()}
            value={templateName}
            maxLength={60}
            placeholder="Например, «Матанализ, 1 модуль»"
            aria-invalid={Boolean(saveErrors.name)}
            aria-describedby={`${nameId}-error`}
            onChange={(e) => onTemplateNameChange(e.target.value)}
          />
          <button type="submit" className={styles.saveButton}>
            Сохранить в шаблоны
          </button>
        </div>
        <p id={`${nameId}-error`} className={styles.error} aria-live="polite">
          {saveErrors.name || saveErrors.rows || ''}
        </p>
      </form>
    </div>
  );
}
