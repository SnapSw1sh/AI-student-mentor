import { ArrowRightIcon, ChevronRightIcon } from '../../../shared/ui/icons';
import { MATERIAL_TYPES } from '../data/catalogMock';
import { pluralizeMaterials } from '../lib/pluralizeMaterials';
import styles from './MaterialSubjectCard.module.css';

const TONE = {
  blue: styles.blue,
  purple: styles.purple,
  green: styles.green,
  orange: styles.orange,
  red: styles.red,
};

const typeOf = (id) => MATERIAL_TYPES.find((t) => t.id === id) ?? MATERIAL_TYPES[0];

export function MaterialSubjectCard({ section, categoryTitle, courseLabel, onOpen }) {
  const SectionIcon = section.icon;
  const total = section.categories.reduce((sum, c) => sum + c.count, 0);

  return (
    <article className={styles.card} aria-labelledby={`materials-${section.id}`}>
      <header className={styles.header}>
        <span className={`${styles.iconBox} ${TONE[section.tone]}`}>
          <SectionIcon className={styles.icon} />
        </span>
        <span className={styles.titles}>
          <h2 id={`materials-${section.id}`} className={styles.title}>
            {section.title}
          </h2>
          <span className={styles.count}>
            {courseLabel ? `${courseLabel} · ` : ''}
            {pluralizeMaterials(total)}
          </span>
        </span>
        <button type="button" className={styles.open} aria-label={`Открыть «${section.title}»`} onClick={onOpen}>
          <ArrowRightIcon className={styles.openIcon} />
        </button>
      </header>

      <ul className={styles.categories}>
        {section.categories.map((category) => {
          const type = typeOf(category.type);
          const TypeIcon = type.icon;
          return (
            <li key={category.id}>
              <button type="button" className={styles.category} onClick={onOpen}>
                <TypeIcon className={`${styles.categoryIcon} ${TONE[type.tone]}`} />
                <span className={styles.categoryText}>
                  <span className={styles.categoryTitle}>{categoryTitle(category)}</span>
                  <span className={styles.categoryCount}>{pluralizeMaterials(category.count)}</span>
                </span>
                <ChevronRightIcon className={styles.chevron} />
              </button>
            </li>
          );
        })}
      </ul>
    </article>
  );
}
