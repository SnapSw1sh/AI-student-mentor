import { useId, useState } from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import { useNotify } from '../../../shared/notifications/useNotify';
import { Modal } from '../../../shared/ui/Modal';
import { ChevronDownIcon } from '../../../shared/ui/icons';
import { myTemplatesApi } from '../api/myTemplatesApi';
import { COURSES, DEFAULT_COURSE, SUBJECT_TEMPLATES } from '../data/subjectTemplates';
import {
  areWeightsValid,
  calculate,
  createEmptyScores,
  isGradeInput,
  isTargetInput,
  parseTarget,
} from '../lib/gradeMath';
import {
  createDefaultRows,
  rowsToCalculation,
  rowsToTemplate,
  templateToRows,
  validateForSave,
} from '../lib/customFormula';
import { CustomFormulaEditor } from './CustomFormulaEditor';
import { FormulaRow } from './FormulaRow';
import { ResultPanel } from './ResultPanel';
import { ScoreInputs } from './ScoreInputs';
import styles from './GradeCalculator.module.css';

const TABS = [
  { id: 'template', label: 'Шаблон' },
  { id: 'custom', label: 'Своя формула' },
];

const subjectsForCourse = (course) => SUBJECT_TEMPLATES.filter((s) => s.course === course);

const hasAnyScore = (scores) =>
  Object.values(scores).some((v) => (Array.isArray(v) ? v.some(Boolean) : Boolean(v)));

const sameName = (a, b) => a.trim().toLowerCase() === b.trim().toLowerCase();

// Введённые оценки пока живут только в памяти и пропадают при перезагрузке страницы —
// TODO(backend): PROBLEMS.md#20 — хранение в аккаунте появится вместе с API.
export function GradeCalculator() {
  const { user } = useAuth();
  const userId = user?.user_id;
  const notify = useNotify();

  const [tab, setTab] = useState('template');
  const [course, setCourse] = useState(DEFAULT_COURSE);
  const [myTemplates, setMyTemplates] = useState(() => myTemplatesApi.load(userId));
  const [templateId, setTemplateId] = useState(() => subjectsForCourse(DEFAULT_COURSE)[0]?.id ?? '');
  const [scores, setScores] = useState(() =>
    createEmptyScores(subjectsForCourse(DEFAULT_COURSE)[0]?.components ?? []),
  );
  const [customRows, setCustomRows] = useState(createDefaultRows);
  const [templateName, setTemplateName] = useState('');
  const [saveErrors, setSaveErrors] = useState({});
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [mode, setMode] = useState('average');
  const [target, setTarget] = useState('');
  // Первый расчёт — по кнопке, дальше результат пересчитывается на каждое изменение.
  const [calculated, setCalculated] = useState(false);
  const subjectSelectId = useId();
  const courseSelectId = useId();

  const courseSubjects = subjectsForCourse(course);
  const availableTemplates = [...courseSubjects, ...myTemplates];
  const selectedTemplate = availableTemplates.find((t) => t.id === templateId) ?? null;
  const isCustom = tab === 'custom';

  let components = null;
  let weights = {};
  let currentScores = scores;
  if (isCustom) {
    ({ components, weights, scores: currentScores } = rowsToCalculation(customRows));
  } else if (selectedTemplate) {
    components = selectedTemplate.components;
    weights = Object.fromEntries(components.map((c) => [c.key, c.weight]));
  }

  const weightsValid = !isCustom || areWeightsValid(weights);

  const result =
    calculated && components && weightsValid
      ? calculate({ components, weights, scores: currentScores, target: parseTarget(target) })
      : null;

  const selectTemplate = (id, list = availableTemplates) => {
    setTemplateId(id);
    setScores(createEmptyScores(list.find((t) => t.id === id)?.components ?? []));
    setCalculated(false);
  };

  const handleCourseChange = (value) => {
    const nextCourse = Number(value);
    const nextList = [...subjectsForCourse(nextCourse), ...myTemplates];
    setCourse(nextCourse);
    // Свой шаблон к курсу не привязан: если выбран он, при смене курса он и остаётся.
    if (!myTemplates.some((t) => t.id === templateId)) selectTemplate(nextList[0]?.id ?? '', nextList);
  };

  const handleScoreChange = (key, value) => {
    if (!isGradeInput(value)) return;
    setScores((prev) => ({ ...prev, [key]: value }));
  };

  const handleItemChange = (key, index, value) => {
    if (!isGradeInput(value)) return;
    setScores((prev) => {
      const items = [...(prev[key] ?? [])];
      items[index] = value;
      return { ...prev, [key]: items };
    });
  };

  // В поле одна оценка: если к «8» дописали «9», берём новую цифру, а не отбрасываем ввод —
  // иначе сменить оценку можно было только стерев старую.
  const handleTargetChange = (value) => {
    if (isTargetInput(value)) {
      setTarget(value);
      return;
    }
    const lastChar = value.slice(-1);
    if (isTargetInput(lastChar)) setTarget(lastChar);
  };

  const persistTemplates = (next) => {
    try {
      myTemplatesApi.save(userId, next);
      setMyTemplates(next);
      return true;
    } catch (err) {
      notify.error('Не удалось сохранить шаблоны', err);
      return false;
    }
  };

  const handleSave = () => {
    const errors = validateForSave(customRows, templateName);
    setSaveErrors(errors);
    if (Object.keys(errors).length) return;

    const existing = myTemplates.find((t) => sameName(t.name, templateName));
    const template = rowsToTemplate(customRows, templateName, existing?.id);
    const next = existing
      ? myTemplates.map((t) => (t.id === existing.id ? template : t))
      : [...myTemplates, template];
    if (!persistTemplates(next)) return;

    notify.success(
      existing ? `Шаблон «${template.name}» обновлён` : `Шаблон «${template.name}» сохранён`,
      'Он во вкладке «Шаблон», в группе «Мои шаблоны».',
    );
  };

  const handleEditTemplate = () => {
    setCustomRows(templateToRows(selectedTemplate));
    setTemplateName(selectedTemplate.name);
    setSaveErrors({});
    setTab('custom');
  };

  const confirmDelete = () => {
    const next = myTemplates.filter((t) => t.id !== deleteTarget.id);
    if (persistTemplates(next)) {
      notify.info(`Шаблон «${deleteTarget.name}» удалён`);
      const nextList = [...courseSubjects, ...next];
      if (templateId === deleteTarget.id) selectTemplate(nextList[0]?.id ?? '', nextList);
    }
    setDeleteTarget(null);
  };

  let emptyMessage = 'Заполните оценки, чтобы увидеть результат';
  if (!components) emptyMessage = 'Для этого курса пока нет шаблонов — попробуйте «Свою формулу»';
  else if (!weightsValid) emptyMessage = 'Сумма коэффициентов должна быть равна 1';
  else if (!calculated && hasAnyScore(currentScores)) emptyMessage = 'Нажмите «Посчитать», чтобы увидеть результат';

  const partialNote =
    result?.status === 'ok' && !result.allRegularFilled
      ? 'Сейчас считается только по введённым компонентам.'
      : null;

  return (
    <section className={styles.card} aria-labelledby={`${subjectSelectId}-title`}>
      <div className={styles.form}>
        <header className={styles.intro}>
          <h2 id={`${subjectSelectId}-title`} className={styles.title}>
            Калькулятор оценок
          </h2>
          <p className={styles.subtitle}>
            Рассчитайте текущий балл и узнайте, что нужно для желаемой оценки.
          </p>
        </header>

        <div className={styles.tabs} role="group" aria-label="Источник формулы">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`${styles.tab} ${tab === t.id ? styles.tabActive : ''}`.trim()}
              aria-pressed={tab === t.id}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {isCustom ? (
          <CustomFormulaEditor
            rows={customRows}
            onRowsChange={setCustomRows}
            templateName={templateName}
            onTemplateNameChange={(value) => {
              setTemplateName(value);
              if (saveErrors.name) setSaveErrors((prev) => ({ ...prev, name: undefined }));
            }}
            onSave={handleSave}
            saveErrors={saveErrors}
          />
        ) : (
          <>
            <div className={styles.selects}>
              <div className={`${styles.selectField} ${styles.subjectField}`}>
                <label htmlFor={subjectSelectId} className={styles.fieldLabel}>
                  Предмет
                </label>
                <span className={styles.selectBox}>
                  <select
                    id={subjectSelectId}
                    className={styles.select}
                    value={templateId}
                    disabled={availableTemplates.length === 0}
                    onChange={(e) => selectTemplate(e.target.value)}
                  >
                    {availableTemplates.length === 0 && <option value="">Нет шаблонов</option>}
                    {courseSubjects.length > 0 && (
                      <optgroup label={`${course} курс`}>
                        {courseSubjects.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                      </optgroup>
                    )}
                    {myTemplates.length > 0 && (
                      <optgroup label="Мои шаблоны">
                        {myTemplates.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name}
                          </option>
                        ))}
                      </optgroup>
                    )}
                  </select>
                  <ChevronDownIcon className={styles.selectIcon} />
                </span>
              </div>
              <div className={`${styles.selectField} ${styles.courseField}`}>
                <label htmlFor={courseSelectId} className={styles.fieldLabel}>
                  Курс
                </label>
                <span className={styles.selectBox}>
                  <select
                    id={courseSelectId}
                    className={styles.select}
                    value={course}
                    onChange={(e) => handleCourseChange(e.target.value)}
                  >
                    {COURSES.map((c) => (
                      <option key={c} value={c}>
                        {c} курс
                      </option>
                    ))}
                  </select>
                  <ChevronDownIcon className={styles.selectIcon} />
                </span>
              </div>
            </div>

            {selectedTemplate?.custom && (
              <div className={styles.templateActions}>
                <button type="button" className={styles.linkButton} onClick={handleEditTemplate}>
                  Изменить в «Своей формуле»
                </button>
                <button
                  type="button"
                  className={`${styles.linkButton} ${styles.linkDanger}`}
                  onClick={() => setDeleteTarget(selectedTemplate)}
                >
                  Удалить шаблон
                </button>
              </div>
            )}

            {components && (
              <>
                <div className={styles.block}>
                  <span className={styles.fieldLabel}>Формула по предмету</span>
                  <FormulaRow components={components} weights={weights} />
                </div>

                <div className={styles.block}>
                  <span className={styles.fieldLabel}>Ваши баллы</span>
                  <ScoreInputs
                    components={components}
                    scores={scores}
                    onScoreChange={handleScoreChange}
                    onItemChange={handleItemChange}
                  />
                </div>
              </>
            )}
          </>
        )}
      </div>

      <ResultPanel
        result={result}
        emptyMessage={emptyMessage}
        note={partialNote}
        mode={mode}
        onModeChange={setMode}
        target={target}
        onTargetChange={handleTargetChange}
        onCalculate={() => setCalculated(true)}
        calculateDisabled={!components || !weightsValid}
      />

      <Modal
        open={Boolean(deleteTarget)}
        size="sm"
        title="Удалить шаблон?"
        onClose={() => setDeleteTarget(null)}
        footer={
          <>
            <button type="button" className={styles.dangerButton} onClick={confirmDelete}>
              Удалить
            </button>
            <button type="button" className={styles.ghostButton} onClick={() => setDeleteTarget(null)}>
              Отмена
            </button>
          </>
        }
      >
        <p className={styles.modalText}>
          Шаблон «{deleteTarget?.name}» пропадёт из списка. Это действие нельзя отменить.
        </p>
      </Modal>
    </section>
  );
}
