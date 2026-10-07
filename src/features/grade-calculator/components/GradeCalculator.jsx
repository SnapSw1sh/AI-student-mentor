import { useId, useState } from 'react';
import { ChevronDownIcon } from '../../../shared/ui/icons';
import {
  COURSES,
  CUSTOM_COMPONENTS,
  DEFAULT_COURSE,
  SUBJECT_TEMPLATES,
} from '../data/subjectTemplates';
import {
  areWeightsValid,
  calculate,
  createEmptyScores,
  formatWeight,
  isGradeInput,
  isTargetInput,
  isWeightInput,
  parseTarget,
  parseWeight,
  weightsSum,
} from '../lib/gradeMath';
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

// Введённые оценки пока живут только в памяти и пропадают при перезагрузке страницы —
// TODO(backend): PROBLEMS.md#20 — хранение в аккаунте появится вместе с API.
export function GradeCalculator() {
  const [tab, setTab] = useState('template');
  const [course, setCourse] = useState(DEFAULT_COURSE);
  const [subjectId, setSubjectId] = useState(() => subjectsForCourse(DEFAULT_COURSE)[0]?.id ?? '');
  const [customWeights, setCustomWeights] = useState(() =>
    Object.fromEntries(CUSTOM_COMPONENTS.map((c) => [c.key, formatWeight(c.weight)])),
  );
  const [scores, setScores] = useState(() =>
    createEmptyScores(subjectsForCourse(DEFAULT_COURSE)[0]?.components ?? CUSTOM_COMPONENTS),
  );
  const [mode, setMode] = useState('average');
  const [target, setTarget] = useState('');
  // Первый расчёт — по кнопке, дальше результат пересчитывается на каждое изменение.
  const [calculated, setCalculated] = useState(false);
  const subjectSelectId = useId();
  const courseSelectId = useId();

  const courseSubjects = subjectsForCourse(course);
  const subject = courseSubjects.find((s) => s.id === subjectId) ?? null;
  const isCustom = tab === 'custom';
  const components = isCustom ? CUSTOM_COMPONENTS : (subject?.components ?? null);

  const weights = components
    ? Object.fromEntries(
        components.map((c) => [c.key, isCustom ? parseWeight(customWeights[c.key]) : c.weight]),
      )
    : {};

  const weightsValid = !isCustom || areWeightsValid(weights);

  const result =
    calculated && components && weightsValid
      ? calculate({ components, weights, scores, target: parseTarget(target) })
      : null;

  const resetScores = (nextComponents) => {
    setScores(createEmptyScores(nextComponents ?? CUSTOM_COMPONENTS));
    setCalculated(false);
  };

  const handleCourseChange = (value) => {
    const nextCourse = Number(value);
    const nextSubject = subjectsForCourse(nextCourse)[0] ?? null;
    setCourse(nextCourse);
    setSubjectId(nextSubject?.id ?? '');
    if (nextSubject) resetScores(nextSubject.components);
  };

  const handleSubjectChange = (value) => {
    setSubjectId(value);
    resetScores(courseSubjects.find((s) => s.id === value)?.components);
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

  const handleWeightChange = (key, value) => {
    if (!isWeightInput(value)) return;
    setCustomWeights((prev) => ({ ...prev, [key]: value }));
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

  let emptyMessage = 'Заполните оценки, чтобы увидеть результат';
  if (!components) emptyMessage = 'Для этого курса пока нет шаблонов — попробуйте «Свою формулу»';
  else if (!weightsValid) emptyMessage = 'Сумма коэффициентов должна быть равна 1';
  else if (!calculated && hasAnyScore(scores)) emptyMessage = 'Нажмите «Посчитать», чтобы увидеть результат';

  const sum = weightsSum(weights);

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

        {!isCustom && (
          <div className={styles.selects}>
            <div className={`${styles.selectField} ${styles.subjectField}`}>
              <label htmlFor={subjectSelectId} className={styles.fieldLabel}>
                Предмет
              </label>
              <span className={styles.selectBox}>
                <select
                  id={subjectSelectId}
                  className={styles.select}
                  value={subjectId}
                  disabled={courseSubjects.length === 0}
                  onChange={(e) => handleSubjectChange(e.target.value)}
                >
                  {courseSubjects.length === 0 && <option value="">Нет шаблонов</option>}
                  {courseSubjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
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
        )}

        {components && (
          <>
            <div className={styles.block}>
              <span className={styles.fieldLabel}>
                {isCustom ? 'Ваша формула — коэффициенты можно менять' : 'Формула по предмету'}
              </span>
              <FormulaRow
                components={components}
                weights={weights}
                weightInputs={customWeights}
                editable={isCustom}
                onWeightChange={handleWeightChange}
              />
              {isCustom && (
                <p className={weightsValid ? styles.sum : `${styles.sum} ${styles.sumInvalid}`}>
                  Сумма коэффициентов: {formatWeight(sum)}
                  {!weightsValid && ' — должна быть 1'}
                </p>
              )}
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
      </div>

      <ResultPanel
        result={result}
        emptyMessage={emptyMessage}
        mode={mode}
        onModeChange={setMode}
        target={target}
        onTargetChange={handleTargetChange}
        onCalculate={() => setCalculated(true)}
        calculateDisabled={!components || !weightsValid}
      />
    </section>
  );
}
