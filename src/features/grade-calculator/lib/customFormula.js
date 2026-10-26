import { AGGREGATES, areWeightsValid, componentScore, formatWeight, parseWeight } from './gradeMath';

// «Своя формула» — редактируемый список компонентов. Строка хранит введённый текст как есть
// (вес и оценки — строки из полей), а в формат calculate() переводится только при расчёте.

let sequence = 0;
const uid = (prefix) => `${prefix}-${Date.now().toString(36)}-${(sequence += 1)}`;

export const newItem = (name = '') => ({ id: uid('item'), name, score: '' });

export const newRow = (fields = {}) => ({
  id: uid('row'),
  name: '',
  weight: '',
  score: '',
  dot: null,
  isExam: false,
  aggregate: 'mean',
  items: [],
  ...fields,
});

export function createDefaultRows() {
  return [
    newRow({ name: 'Активность', weight: '0.1', dot: 'activity' }),
    newRow({ name: 'Лабораторные работы', weight: '0.25', dot: 'labs' }),
    newRow({ name: 'Домашние задания', weight: '0.3', dot: 'homework' }),
    newRow({ name: 'Тесты', weight: '0.1', dot: 'tests' }),
    newRow({ name: 'Экзамен', weight: '0.25', dot: 'exam', isExam: true }),
  ];
}

// Строка с разбивкой на оценки считается по ним, а не по общему полю оценки.
const toComponent = (row) => ({
  key: row.id,
  label: row.name || 'Без названия',
  isExam: row.isExam,
  items: row.items.length ? { count: row.items.length, aggregate: row.aggregate } : undefined,
});

const toScore = (row) => (row.items.length ? row.items.map((item) => item.score) : row.score);

export function rowValue(row) {
  return componentScore(toComponent(row), toScore(row)).value;
}

export function rowsToCalculation(rows) {
  return {
    components: rows.map(toComponent),
    weights: Object.fromEntries(rows.map((row) => [row.id, parseWeight(row.weight)])),
    scores: Object.fromEntries(rows.map((row) => [row.id, toScore(row)])),
  };
}

export function rowsWeights(rows) {
  return rowsToCalculation(rows).weights;
}

export function validateForSave(rows, name) {
  const errors = {};
  if (!name.trim()) errors.name = 'Введите название шаблона.';
  else if (name.trim().length > 60) errors.name = 'Название — не длиннее 60 символов.';
  if (rows.length === 0) errors.rows = 'Добавьте хотя бы один компонент.';
  else if (rows.some((row) => !row.name.trim())) errors.rows = 'У каждого компонента должно быть название.';
  else if (!areWeightsValid(rowsWeights(rows))) errors.rows = 'Сумма коэффициентов должна быть равна 1.';
  return errors;
}

// Сохранённый шаблон — в том же формате, что шаблоны предметов, чтобы вкладка «Шаблон»
// показывала его так же. Оценки в шаблон не попадают, только состав и коэффициенты.
export function rowsToTemplate(rows, name, id = uid('my')) {
  return {
    id,
    name: name.trim(),
    custom: true,
    components: rows.map((row) => ({
      key: row.id,
      label: row.name.trim(),
      weight: parseWeight(row.weight),
      dot: row.dot,
      isExam: row.isExam,
      items: row.items.length
        ? {
            count: row.items.length,
            aggregate: row.aggregate,
            itemLabel: 'Оценка',
            title: row.name.trim(),
            names: row.items.map((item) => item.name.trim()),
          }
        : undefined,
    })),
  };
}

export function templateToRows(template) {
  return template.components.map((component) =>
    newRow({
      name: component.label,
      weight: formatWeight(component.weight),
      dot: component.dot ?? null,
      isExam: Boolean(component.isExam),
      aggregate: AGGREGATES.some((a) => a.id === component.items?.aggregate)
        ? component.items.aggregate
        : 'mean',
      items: component.items
        ? Array.from({ length: component.items.count }, (_, i) =>
            newItem(component.items.names?.[i] ?? ''),
          )
        : [],
    }),
  );
}
