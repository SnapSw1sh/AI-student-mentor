import { useState } from 'react';
import { useNotify } from '../../../shared/notifications/useNotify';
import { MockupNotice } from '../../../shared/ui/MockupNotice';
import { SearchIcon } from '../../../shared/ui/icons';
import { MaterialSubjectCard } from '../components/MaterialSubjectCard';
import { COURSES, GENERAL_SECTION, MATERIAL_TYPES, SUBJECTS } from '../data/catalogMock';
import styles from './MaterialsPage.module.css';

const normalize = (text) => text.trim().toLocaleLowerCase('ru');
const typeLabel = (typeId) => MATERIAL_TYPES.find((t) => t.id === typeId)?.label ?? '';
const categoryTitle = (category) => category.title ?? typeLabel(category.type);

// Если запрос совпал с названием предмета, показываем предмет целиком; иначе — только
// разделы, совпавшие по названию. Фильтр по типу оставляет разделы нужного типа.
function filterSection(section, query, type) {
  const byType = type ? section.categories.filter((c) => c.type === type) : section.categories;
  if (!query || normalize(section.title).includes(query)) return { ...section, categories: byType };
  return {
    ...section,
    categories: byType.filter((c) => normalize(categoryTitle(c)).includes(query)),
  };
}

export function MaterialsPage() {
  const notify = useNotify();
  const [course, setCourse] = useState(COURSES[0]);
  const [query, setQuery] = useState('');
  const [type, setType] = useState('');
  const [subject, setSubject] = useState('');

  const normalized = normalize(query);
  // Поиск и выбранный предмет работают по всем курсам сразу — в этом их смысл; кнопки курса
  // действуют, только когда ни того ни другого нет.
  const acrossCourses = Boolean(normalized || subject);
  let pool = [GENERAL_SECTION, ...SUBJECTS];
  if (subject) pool = pool.filter((s) => s.id === subject);
  else if (!normalized) pool = pool.filter((s) => s === GENERAL_SECTION || s.course === course);
  const sections = pool
    .map((section) => filterSection(section, normalized, type))
    .filter((section) => section.categories.length > 0);
  const hasCourseSubjects = SUBJECTS.some((s) => s.course === course);

  const selectCourse = (c) => {
    setCourse(c);
    setSubject('');
    setQuery('');
  };

  const openMock = () =>
    notify.info('Материалы пока не открываются', 'Это макет раздела: настоящих файлов здесь ещё нет.', {
      key: 'materials-mock',
    });

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Материалы</h1>
        <p className={styles.subtitle}>Все учебные и общие материалы в одном месте</p>
      </header>

      <MockupNotice>Это макет раздела: предметы и материалы условные, открыть их пока нельзя.</MockupNotice>

      <form className={styles.search} role="search" onSubmit={(e) => e.preventDefault()}>
        <div className={styles.searchField}>
          <SearchIcon className={styles.searchIcon} />
          <input
            className={styles.searchInput}
            type="search"
            value={query}
            placeholder="Поиск по материалам"
            aria-label="Поиск по материалам"
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <button type="submit" className={styles.searchButton}>
          Искать
        </button>
      </form>

      <div className={styles.toolbar}>
        <div className={styles.courses} role="group" aria-label="Курс">
          {COURSES.map((c) => (
            <button
              key={c}
              type="button"
              className={`${styles.course} ${c === course && !acrossCourses ? styles.courseActive : ''}`.trim()}
              aria-pressed={c === course && !acrossCourses}
              onClick={() => selectCourse(c)}
            >
              {c} курс
            </button>
          ))}
        </div>
        <div className={styles.filters}>
          <label className={styles.typeField}>
            <span className={styles.typeLabel}>Предмет</span>
            <select
              className={styles.typeSelect}
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            >
              <option value="">Все предметы</option>
              <option value={GENERAL_SECTION.id}>{GENERAL_SECTION.title}</option>
              {COURSES.map((c) => {
                const courseSubjects = SUBJECTS.filter((s) => s.course === c);
                if (!courseSubjects.length) return null;
                return (
                  <optgroup key={c} label={`${c} курс`}>
                    {courseSubjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.title}
                      </option>
                    ))}
                  </optgroup>
                );
              })}
            </select>
          </label>
          <label className={styles.typeField}>
            <span className={styles.typeLabel}>Тип материала</span>
            <select className={styles.typeSelect} value={type} onChange={(e) => setType(e.target.value)}>
              <option value="">Все типы</option>
              {MATERIAL_TYPES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {acrossCourses && (
        <p className={styles.note}>
          {normalized ? 'Ищем по всем курсам.' : 'Предмет показан независимо от выбранного курса.'}{' '}
          <button type="button" className={styles.resetLink} onClick={() => selectCourse(course)}>
            Вернуться к {course} курсу
          </button>
        </p>
      )}

      {!hasCourseSubjects && !acrossCourses && !type && (
        <p className={styles.note}>Материалов по предметам {course} курса пока нет — есть только общие.</p>
      )}

      {sections.length > 0 ? (
        <div className={styles.grid}>
          {sections.map((section) => (
            <MaterialSubjectCard
              key={section.id}
              section={section}
              categoryTitle={categoryTitle}
              courseLabel={acrossCourses && section.course ? `${section.course} курс` : null}
              onOpen={openMock}
            />
          ))}
        </div>
      ) : (
        <p className={styles.empty}>Ничего не найдено. Попробуйте другой запрос, предмет или тип.</p>
      )}
    </div>
  );
}
