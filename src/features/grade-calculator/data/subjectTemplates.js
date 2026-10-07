// TODO(backend): PROBLEMS.md#20 — шаблонов предметов в бэке нет. Пока это единственный предмет
// из макета; когда появится API, список заменяется здесь, формат записей — тот же.
// Экзамен в каждой формуле помечен isExam: от него считается, сколько нужно набрать.

export const COURSES = [1, 2, 3, 4];

export const DEFAULT_COURSE = 2;

export const SUBJECT_TEMPLATES = [
  {
    id: 'databases',
    name: 'Базы данных',
    course: 2,
    components: [
      { key: 'activity', label: 'Активность', weight: 0.1, dot: 'activity' },
      {
        key: 'labs',
        label: 'ЛР',
        weight: 0.25,
        dot: 'labs',
        items: { count: 8, itemLabel: 'ЛР', title: 'Оценки за лабораторные работы' },
      },
      { key: 'homework', label: 'ДЗ', weight: 0.3, dot: 'homework' },
      {
        key: 'tests',
        label: 'Тесты',
        weight: 0.1,
        dot: 'tests',
        items: { count: 3, itemLabel: 'Тест', title: 'Тесты' },
      },
      { key: 'exam', label: 'Экзамен', weight: 0.25, dot: 'exam', isExam: true },
    ],
  },
];

// «Своя формула» пока повторяет состав «Баз данных», меняются только коэффициенты.
export const CUSTOM_COMPONENTS = SUBJECT_TEMPLATES[0].components;
