import { useState } from 'react';
import { MockupNotice } from '../../../shared/ui/MockupNotice';
import { SearchIcon } from '../../../shared/ui/icons';
import { FloorPlan } from '../components/FloorPlan';
import {
  CAMPUS_ADDRESS,
  CATEGORIES,
  FLOORS,
  PLACES,
  findRoom,
  roomNumber,
} from '../data/campusMock';
import styles from './CampusPage.module.css';

const CATEGORY_LABEL = Object.fromEntries(CATEGORIES.map(({ id, label }) => [id, label]));

export function CampusPage() {
  const [floor, setFloor] = useState(1);
  const [selected, setSelected] = useState(null);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');

  const normalized = query.trim().toLowerCase();
  const room = findRoom(query);
  const places = PLACES.filter(
    (place) =>
      (category === 'all' || place.category === category) &&
      (!normalized || place.name.toLowerCase().includes(normalized)),
  );

  const selectPlace = (place) => {
    setFloor(place.floor);
    setSelected({ type: 'place', id: place.id });
  };

  const selectRoom = (roomFloor, slot) => {
    setFloor(roomFloor);
    setSelected({ type: 'room', floor: roomFloor, slot });
  };

  const selectedPlace = selected?.type === 'place' ? PLACES.find((p) => p.id === selected.id) : null;
  const selectedTitle = selectedPlace
    ? `${selectedPlace.name} · ${selectedPlace.floor} этаж`
    : selected?.type === 'room'
      ? `Аудитория ${roomNumber(selected.floor, selected.slot)} · ${selected.floor} этаж`
      : 'Выберите место в списке или на схеме';

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Навигация по кампусу</h1>
        <p className={styles.subtitle}>{CAMPUS_ADDRESS}</p>
      </header>

      <MockupNotice>
        Это макет раздела: схема этажей и расположение мест условные, по ним пока нельзя
        ориентироваться.
      </MockupNotice>

      <div className={styles.layout}>
        <aside className={styles.panel} aria-label="Поиск мест">
          <label className={styles.search}>
            <SearchIcon className={styles.searchIcon} />
            <input
              className={styles.searchInput}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Аудитория или место"
              aria-label="Найти аудиторию или место"
            />
          </label>

          <div className={styles.chips}>
            {CATEGORIES.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                className={`${styles.chip} ${category === id ? styles.chipActive : ''}`}
                aria-pressed={category === id}
                onClick={() => setCategory(id)}
              >
                {label}
              </button>
            ))}
          </div>

          <ul className={styles.list}>
            {room && (
              <li>
                <button
                  type="button"
                  className={styles.item}
                  onClick={() => selectRoom(room.floor, room.slot)}
                >
                  <span className={styles.itemTitle}>
                    Аудитория {roomNumber(room.floor, room.slot)}
                  </span>
                  <span className={styles.itemMeta}>{room.floor} этаж</span>
                </button>
              </li>
            )}
            {places.map((place) => (
              <li key={place.id}>
                <button
                  type="button"
                  className={`${styles.item} ${
                    selected?.type === 'place' && selected.id === place.id ? styles.itemActive : ''
                  }`}
                  onClick={() => selectPlace(place)}
                >
                  <span className={styles.itemTitle}>{place.name}</span>
                  <span className={styles.itemMeta}>
                    {place.floor} этаж · {CATEGORY_LABEL[place.category]}
                  </span>
                </button>
              </li>
            ))}
            {!room && places.length === 0 && <li className={styles.empty}>Ничего не нашлось</li>}
          </ul>
        </aside>

        <section className={styles.map} aria-label="Схема этажа">
          <div className={styles.mapHeader}>
            <p className={styles.selection}>{selectedTitle}</p>
            <div className={styles.floors} role="group" aria-label="Этаж">
              {FLOORS.map((n) => (
                <button
                  key={n}
                  type="button"
                  className={`${styles.floor} ${floor === n ? styles.floorActive : ''}`}
                  aria-pressed={floor === n}
                  aria-label={`${n} этаж`}
                  onClick={() => setFloor(n)}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <FloorPlan
            floor={floor}
            selected={selected}
            onSelectPlace={selectPlace}
            onSelectRoom={selectRoom}
          />

          <ul className={styles.legend}>
            <li className={styles.legendStudy}>Учёба</li>
            <li className={styles.legendFood}>Еда</li>
            <li className={styles.legendService}>Сервисы</li>
            <li className={styles.legendRoom}>Аудитории</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
