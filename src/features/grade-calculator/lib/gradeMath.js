export const MAX_GRADE = 10;

// Округление арифметическое (0.5 — вверх), без правил конкретных ПУД — см. TODO.md.
// Поправка 1e-9 нужна из-за двоичной дроби: 0.1 * 8 + ... даёт 7.4999999 вместо 7.5.
const EPSILON = 1e-9;

const GRADE_INPUT = /^(10([.,]0{0,2})?|\d([.,]\d{0,2})?)?$/;
const WEIGHT_INPUT = /^(0?([.,]\d{0,3})?|0|1([.,]0{0,3})?)$/;
const TARGET_INPUT = /^(10|[1-9])?$/;

export const isGradeInput = (text) => GRADE_INPUT.test(text);
export const isWeightInput = (text) => WEIGHT_INPUT.test(text);
export const isTargetInput = (text) => TARGET_INPUT.test(text);

const parseDecimal = (text) => {
  if (text == null) return null;
  const normalized = String(text).replace(',', '.');
  if (normalized === '' || normalized === '.') return null;
  const value = Number(normalized);
  return Number.isFinite(value) ? value : null;
};

export const parseGrade = parseDecimal;
export const parseWeight = parseDecimal;
export const parseTarget = parseDecimal;

export const roundHalfUp = (value) => Math.floor(value + 0.5 + EPSILON);

export const formatGrade = (value) => (Math.round(value * 10) / 10).toFixed(1);

// Для итоговой оценки одного знака мало: 6.45 показалось бы как 6.5, а округлилось бы до 6.
export const formatPreciseGrade = (value) => String(Math.round(value * 100) / 100);

export const formatWeight = (value) => String(Math.round(value * 1000) / 1000);

export function gradeLevel(value) {
  const rounded = roundHalfUp(value);
  if (rounded >= 8) return 'excellent';
  if (rounded >= 6) return 'good';
  if (rounded >= 4) return 'fair';
  return 'poor';
}

export function createEmptyScores(components) {
  return Object.fromEntries(
    components.map((c) => [c.key, c.items ? Array(c.items.count).fill('') : '']),
  );
}

export function componentScore(component, raw) {
  if (!component.items) return { value: parseGrade(raw) };

  const values = Array.from({ length: component.items.count }, (_, i) => parseGrade(raw?.[i]))
    .filter((v) => v !== null);
  const value = values.length ? values.reduce((sum, v) => sum + v, 0) / values.length : null;
  return { value, filled: values.length, total: component.items.count };
}

export function weightsSum(weights) {
  return Object.values(weights).reduce((sum, w) => sum + (w ?? 0), 0);
}

export function areWeightsValid(weights) {
  const values = Object.values(weights);
  return values.every((w) => w !== null && w >= 0 && w <= 1) && Math.abs(weightsSum(weights) - 1) < 0.0005;
}

// Два режима карточки результата:
//   average — накоп без экзамена: взвешенное среднее по внесённым оценкам, приведённое к 10
//             (так считают в ВШЭ);
//   total   — итог: сколько баллов итоговой оценки набрано по всем внесённым оценкам, включая
//             экзамен, если он внесён. Без экзамена его максимум — сумма весов остальных частей.
// Цвет у каждого режима свой — по тому числу, которое показано.
export function calculate({ components, weights, scores, target }) {
  const rows = components.map((c) => ({
    ...c,
    weight: weights[c.key] ?? 0,
    ...componentScore(c, scores[c.key]),
  }));
  const exam = rows.find((r) => r.isExam);
  const regular = rows.filter((r) => !r.isExam);
  const filled = regular.filter((r) => r.value !== null);

  const filledWeight = filled.reduce((sum, r) => sum + r.weight, 0);
  if (filled.length === 0 || filledWeight <= 0) return { status: 'empty' };

  const earned = filled.reduce((sum, r) => sum + r.weight * r.value, 0);
  const average = earned / filledWeight;
  const maxEarned = regular.reduce((sum, r) => sum + r.weight, 0) * MAX_GRADE;
  const allRegularFilled = regular.every((r) => r.value !== null || r.weight === 0);
  const examIncluded = exam?.value != null;
  const total = earned + (examIncluded ? exam.weight * exam.value : 0);

  return {
    status: 'ok',
    average,
    averageLevel: gradeLevel(average),
    total,
    totalLevel: gradeLevel(total),
    examIncluded,
    allRegularFilled,
    maxEarned,
    outlook: examOutlook({ exam, earned, allRegularFilled, target }),
  };
}

function examOutlook({ exam, earned, allRegularFilled, target }) {
  if (exam?.value != null) {
    if (!allRegularFilled) return { type: 'incomplete' };
    const final = earned + exam.weight * exam.value;
    return { type: 'final', value: final, rounded: roundHalfUp(final) };
  }
  if (target == null) return { type: 'noTarget' };
  if (!allRegularFilled) return { type: 'incomplete' };
  if (!exam || exam.weight <= 0) return { type: 'noExam' };

  // Оценка «target» — это итог не ниже target − 0.5 (после арифметического округления).
  const need = (target - 0.5 - earned) / exam.weight;
  if (need <= EPSILON) return { type: 'guaranteed' };
  if (need > MAX_GRADE + EPSILON) {
    return { type: 'unreachable', best: roundHalfUp(earned + exam.weight * MAX_GRADE) };
  }
  return { type: 'need', value: Math.ceil(need * 10 - EPSILON) / 10 };
}
