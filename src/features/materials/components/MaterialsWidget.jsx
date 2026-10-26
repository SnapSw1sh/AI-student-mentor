import { useState } from 'react';
import { Link } from 'react-router-dom';
import arrowRightIcon from '../assets/arrow-right.png';
import { SAVED_MATERIALS, SUBJECT_FOLDERS } from '../data/mockMaterials';
import styles from './MaterialsWidget.module.css';

const TABS = [
  { id: 'subjects', label: 'По предметам' },
  { id: 'saved', label: 'Сохранённые' },
];

function pluralizeMaterials(count) {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return `${count} материал`;
  if (mod10 >= 2 && mod10 <= 4 && !(mod100 >= 12 && mod100 <= 14)) return `${count} материала`;
  return `${count} материалов`;
}

// Раздела «Материалы» ещё нет, поэтому все переходы из виджета ведут на его заглушку.
export function MaterialsWidget() {
  const [tab, setTab] = useState('subjects');
  const items = tab === 'subjects' ? SUBJECT_FOLDERS : SAVED_MATERIALS;

  return (
    <section className={styles.card} aria-labelledby="materials-widget-title">
      <header className={styles.header}>
        <h2 id="materials-widget-title" className={styles.title}>
          Материалы
        </h2>
        <Link to="/materials" className={styles.all}>
          Все
          <img src={arrowRightIcon} alt="" className={styles.allIcon} />
        </Link>
      </header>

      <div className={styles.tabs}>
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            className={`${styles.tab} ${tab === id ? styles.tabActive : ''}`}
            aria-pressed={tab === id}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </div>

      {items.length > 0 ? (
        <ul className={styles.list}>
          {items.map((item) => (
            <li key={item.id}>
              <Link to="/materials" className={styles.item}>
                <img src={item.icon} alt="" className={styles.itemIcon} />
                <span className={styles.itemText}>
                  <span className={styles.itemTitle}>{item.title}</span>
                  <span className={styles.itemCount}>{pluralizeMaterials(item.count)}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className={styles.empty}>
          Здесь появятся материалы, которые вы сохраните из библиотеки и чата.
        </p>
      )}
    </section>
  );
}
