import { PLACES, SLOTS_PER_FLOOR, SLOTS_PER_ROW, roomNumber } from '../data/campusMock';
import styles from './FloorPlan.module.css';

const WIDTH = 720;
const PAD = 20;
const GAP = 6;
const COL = (WIDTH - PAD * 2) / SLOTS_PER_ROW;
const ROW_H = 115;
const CORRIDOR_Y = PAD + ROW_H + GAP;
const CORRIDOR_H = 48;
const HEIGHT = CORRIDOR_Y + CORRIDOR_H + GAP + ROW_H + PAD;

const CATEGORY_CLASS = {
  study: styles.study,
  food: styles.food,
  service: styles.service,
};

function cellsForFloor(floor) {
  const places = PLACES.filter((place) => place.floor === floor);
  const cells = [];
  for (let slot = 0; slot < SLOTS_PER_FLOOR; slot += 1) {
    const place = places.find((p) => slot >= p.slot && slot < p.slot + (p.span ?? 1));
    if (place && place.slot !== slot) continue;
    const row = Math.floor(slot / SLOTS_PER_ROW);
    const col = slot % SLOTS_PER_ROW;
    const span = place?.span ?? 1;
    cells.push({
      key: `${floor}-${place ? place.id : slot}`,
      place,
      slot,
      x: PAD + col * COL + GAP / 2,
      y: row === 0 ? PAD : CORRIDOR_Y + CORRIDOR_H + GAP,
      width: COL * span - GAP,
    });
  }
  return cells;
}

// Схема условная: сетка из 12 помещений вокруг коридора, пока нет настоящих планов этажей.
export function FloorPlan({ floor, selected, onSelectPlace, onSelectRoom }) {
  const cells = cellsForFloor(floor);

  const isSelected = (cell) =>
    cell.place
      ? selected?.type === 'place' && selected.id === cell.place.id
      : selected?.type === 'room' && selected.floor === floor && selected.slot === cell.slot;

  return (
    <div className={styles.scroller}>
      <svg
        className={styles.plan}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role="img"
        aria-label={`Схема ${floor} этажа`}
      >
        <rect
          className={styles.corridor}
          x={PAD}
          y={CORRIDOR_Y}
          width={WIDTH - PAD * 2}
          height={CORRIDOR_H}
          rx="8"
        />
        <text className={styles.corridorLabel} x={PAD + 14} y={CORRIDOR_Y + CORRIDOR_H / 2}>
          Лестница
        </text>
        <text className={styles.corridorLabel} x={WIDTH / 2} y={CORRIDOR_Y + CORRIDOR_H / 2} textAnchor="middle">
          Коридор
        </text>
        <text
          className={styles.corridorLabel}
          x={WIDTH - PAD - 14}
          y={CORRIDOR_Y + CORRIDOR_H / 2}
          textAnchor="end"
        >
          Лифт
        </text>

        {cells.map((cell) => (
          <g
            key={cell.key}
            className={`${styles.cell} ${cell.place ? CATEGORY_CLASS[cell.place.category] : styles.room} ${
              isSelected(cell) ? styles.selected : ''
            }`}
            onClick={() => (cell.place ? onSelectPlace(cell.place) : onSelectRoom(floor, cell.slot))}
          >
            <rect x={cell.x} y={cell.y} width={cell.width} height={ROW_H} rx="10" />
            <text x={cell.x + cell.width / 2} y={cell.y + ROW_H / 2} textAnchor="middle">
              {cell.place ? cell.place.name : roomNumber(floor, cell.slot)}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
