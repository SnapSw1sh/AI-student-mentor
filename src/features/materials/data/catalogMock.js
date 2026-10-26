import {
  AtomIcon,
  BookIcon,
  CalculatorIcon,
  ChipIcon,
  CodeIcon,
  DatabaseIcon,
  DocumentIcon,
  EditPencilIcon,
  FlaskIcon,
  GlobeIcon,
  LinkIcon,
  NoteIcon,
  PlayIcon,
  UsersIcon,
} from '../../../shared/ui/icons';

// TODO(backend): API материалов нет (PROBLEMS.md#23). Каталог — макет: предметы по курсам,
// в предмете — разделы по типу материала с числом материалов. Сами файлы не открываются.

export const COURSES = [1, 2, 3, 4];

export const MATERIAL_TYPES = [
  { id: 'lectures', label: 'Лекции', icon: DocumentIcon, tone: 'blue' },
  { id: 'labs', label: 'Лабораторные', icon: FlaskIcon, tone: 'purple' },
  { id: 'manuals', label: 'Методички', icon: BookIcon, tone: 'purple' },
  { id: 'cheatsheets', label: 'Шпаргалки', icon: NoteIcon, tone: 'orange' },
  { id: 'notes', label: 'Конспекты', icon: EditPencilIcon, tone: 'orange' },
  { id: 'reports', label: 'Отчёты', icon: DocumentIcon, tone: 'blue' },
  { id: 'practice', label: 'Практика', icon: PlayIcon, tone: 'red' },
  { id: 'reviews', label: 'Разборы', icon: UsersIcon, tone: 'purple' },
  { id: 'links', label: 'Полезные ссылки', icon: LinkIcon, tone: 'blue' },
];

// Общие материалы не привязаны к курсу и показываются первыми на любом курсе.
export const GENERAL_SECTION = {
  id: 'general',
  title: 'Общие материалы',
  icon: DocumentIcon,
  tone: 'blue',
  categories: [
    { id: 'general-reports', type: 'reports', title: 'Оформление отчётов', count: 4 },
    { id: 'general-links', type: 'links', title: 'Полезные сервисы', count: 4 },
    { id: 'general-git', type: 'manuals', title: 'Git и GitHub', count: 3 },
  ],
};

export const SUBJECTS = [
  {
    id: 'calculus',
    course: 1,
    title: 'Математический анализ',
    icon: CalculatorIcon,
    tone: 'blue',
    categories: [
      { id: 'calculus-lectures', type: 'lectures', count: 14 },
      { id: 'calculus-practice', type: 'practice', count: 6 },
      { id: 'calculus-cheatsheets', type: 'cheatsheets', count: 2 },
    ],
  },
  {
    id: 'programming',
    course: 1,
    title: 'Программирование',
    icon: CodeIcon,
    tone: 'green',
    categories: [
      { id: 'programming-lectures', type: 'lectures', count: 3 },
      { id: 'programming-practice', type: 'practice', count: 3 },
      { id: 'programming-reviews', type: 'reviews', count: 2 },
      { id: 'programming-notes', type: 'notes', count: 1 },
    ],
  },
  {
    id: 'physics',
    course: 1,
    title: 'Физика',
    icon: AtomIcon,
    tone: 'red',
    categories: [
      { id: 'physics-lectures', type: 'lectures', count: 8 },
      { id: 'physics-labs', type: 'labs', count: 5 },
    ],
  },
  {
    id: 'english',
    course: 1,
    title: 'Английский язык',
    icon: GlobeIcon,
    tone: 'purple',
    categories: [
      { id: 'english-manuals', type: 'manuals', count: 2 },
      { id: 'english-links', type: 'links', count: 3 },
    ],
  },
  {
    id: 'databases',
    course: 2,
    title: 'Базы данных',
    icon: DatabaseIcon,
    tone: 'blue',
    categories: [
      { id: 'databases-lectures', type: 'lectures', count: 3 },
      { id: 'databases-labs', type: 'labs', count: 4 },
      { id: 'databases-manuals', type: 'manuals', count: 2 },
      { id: 'databases-cheatsheets', type: 'cheatsheets', count: 2 },
      { id: 'databases-links', type: 'links', count: 3 },
    ],
  },
  {
    id: 'circuits',
    course: 2,
    title: 'Схемотехника',
    icon: ChipIcon,
    tone: 'purple',
    categories: [
      { id: 'circuits-labs', type: 'labs', count: 3 },
      { id: 'circuits-notes', type: 'notes', count: 2 },
      { id: 'circuits-manuals', type: 'manuals', count: 2 },
      { id: 'circuits-reports', type: 'reports', count: 1 },
    ],
  },
  {
    id: 'sql',
    course: 2,
    title: 'SQL',
    icon: DatabaseIcon,
    tone: 'orange',
    categories: [
      { id: 'sql-practice', type: 'practice', count: 2 },
      { id: 'sql-cheatsheets', type: 'cheatsheets', count: 1 },
      { id: 'sql-links', type: 'links', count: 2 },
    ],
  },
  {
    id: 'os',
    course: 3,
    title: 'Операционные системы',
    icon: CodeIcon,
    tone: 'green',
    categories: [
      { id: 'os-lectures', type: 'lectures', count: 10 },
      { id: 'os-labs', type: 'labs', count: 6 },
    ],
  },
  {
    id: 'ml',
    course: 3,
    title: 'Машинное обучение',
    icon: ChipIcon,
    tone: 'orange',
    categories: [
      { id: 'ml-lectures', type: 'lectures', count: 12 },
      { id: 'ml-practice', type: 'practice', count: 8 },
      { id: 'ml-links', type: 'links', count: 5 },
    ],
  },
];
