import messagingIcon from '../assets/feature-messaging.png';
import bookShelfIcon from '../assets/feature-book-shelf.png';
import paperMapIcon from '../assets/feature-paper-map.png';
import eLearningIcon from '../assets/feature-e-learning.png';

export const FEATURES = [
  {
    id: 'chat',
    theme: 'blue',
    icon: messagingIcon,
    title: 'ИИ-помощник',
    description:
      'Быстрые и точные ответы на вопросы об учёбе, документах, деканатах, процедурах и студенческой жизни.',
    points: [
      'Разбирает учебные и административные вопросы',
      'Подсказывает по документам и процедурам',
      'Доступен в любое время',
    ],
    tags: ['Учёба', 'Документы', 'Бытовые вопросы', 'И многое другое'],
    action: { label: 'Перейти в чат', to: '/chat' },
  },
  {
    id: 'library',
    theme: 'red',
    icon: bookShelfIcon,
    title: 'Библиотека материалов',
    description:
      'Положения, правила, информация о стипендиях, учебном процессе и других важных темах. Все официальные документы в удобном формате.',
    points: [
      'Поиск по темам',
      'Краткое содержание перед открытием файла',
      'Ссылки на официальные источники',
    ],
    tags: ['Стипендии', 'Учебный процесс', 'Правила и регламенты'],
    action: { label: 'Открыть библиотеку', to: '/library' },
  },
  {
    id: 'campus',
    theme: 'green',
    icon: paperMapIcon,
    title: 'Навигация по кампусу',
    description: 'Информация о корпусах, отделах, полезных местах, расписании.',
    points: ['Нужные корпуса и отделы', 'Полезные места в кампусе'],
    tags: ['Корпуса', 'Маршруты', 'Полезные места'],
    action: { label: 'Открыть карту', to: '/campus' },
  },
  {
    id: 'materials',
    theme: 'purple',
    icon: eLearningIcon,
    title: 'Материалы',
    description: 'Полезные ссылки и материалы для учёбы.',
    points: [
      'Ссылки на лекции, конспекты и разборы',
      'Материалы по предметам и курсам',
      'Полезные подборки от студентов',
    ],
    tags: ['Конспекты', 'Ссылки', 'Подборки'],
    action: { label: 'Смотреть материалы', to: '/materials' },
  },
];
