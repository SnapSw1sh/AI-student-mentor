import { useEffect, useRef, useState } from 'react';
import { Modal } from '../../../shared/ui/Modal';
import { MinusIcon, PlusIcon } from '../../../shared/ui/icons';
import styles from './AvatarCropDialog.module.css';

// Круг (то, что попадёт в аватар) стоит в центре окна побольше: вокруг него видна
// затемнённая остальная часть фото — понятно, что картинку можно сдвинуть. Размеры в CSS px.
const VIEW = 220;
const STAGE = 300;
const INSET = (STAGE - VIEW) / 2;
const MAX_ZOOM = 4;
const ZOOM_STEP = 0.1;
const KEY_STEP_PX = 10;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

// Картинка всегда закрывает окно целиком: смещение ограничено так, чтобы не было пустых полей.
function clampOffset(offset, width, height, scale) {
  return {
    x: clamp(offset.x, VIEW - width * scale, 0),
    y: clamp(offset.y, VIEW - height * scale, 0),
  };
}

// Окно кадрирования аватара: картинку двигают мышью, пальцем или стрелками, масштаб —
// колёсиком, ползунком или кнопками «−/+». Круг показывает, что будет видно в профиле.
// Сохраняется квадрат под кругом; сама обрезка — у родителя (onSave получает область
// в пикселях исходной картинки).
export function AvatarCropDialog({ image, saving, onSave, onClose }) {
  const width = image.naturalWidth;
  const height = image.naturalHeight;
  const baseScale = VIEW / Math.min(width, height);
  const [zoom, setZoom] = useState(1);
  const scale = baseScale * zoom;
  const [offset, setOffset] = useState(() => ({
    x: (VIEW - width * baseScale) / 2,
    y: (VIEW - height * baseScale) / 2,
  }));
  const dragRef = useRef(null);
  const frameRef = useRef(null);

  // Масштаб меняется относительно центра окна: то, что в середине, там и остаётся.
  const changeZoom = (next) => {
    const nextZoom = clamp(next, 1, MAX_ZOOM);
    const nextScale = baseScale * nextZoom;
    const ratio = nextScale / scale;
    const center = VIEW / 2;
    setZoom(nextZoom);
    setOffset((o) =>
      clampOffset({ x: center - (center - o.x) * ratio, y: center - (center - o.y) * ratio }, width, height, nextScale),
    );
  };

  // Колёсико слушаем напрямую, а не через onWheel: React вешает его пассивным, и тогда
  // нельзя запретить прокрутку окна под курсором. Ссылка держит свежие zoom и changeZoom.
  const latest = useRef({ zoom, changeZoom });
  useEffect(() => {
    latest.current = { zoom, changeZoom };
  });
  useEffect(() => {
    const frame = frameRef.current;
    const handleWheel = (event) => {
      event.preventDefault();
      const { zoom: current, changeZoom: apply } = latest.current;
      apply(current * (event.deltaY < 0 ? 1.1 : 1 / 1.1));
    };
    frame?.addEventListener('wheel', handleWheel, { passive: false });
    return () => frame?.removeEventListener('wheel', handleWheel);
  }, []);

  const handlePointerDown = (event) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { x: event.clientX, y: event.clientY, start: offset };
  };

  const handlePointerMove = (event) => {
    const drag = dragRef.current;
    if (!drag) return;
    setOffset(
      clampOffset(
        { x: drag.start.x + event.clientX - drag.x, y: drag.start.y + event.clientY - drag.y },
        width,
        height,
        scale,
      ),
    );
  };

  const handlePointerUp = () => {
    dragRef.current = null;
  };

  const handleKeyDown = (event) => {
    const moves = {
      ArrowLeft: [KEY_STEP_PX, 0],
      ArrowRight: [-KEY_STEP_PX, 0],
      ArrowUp: [0, KEY_STEP_PX],
      ArrowDown: [0, -KEY_STEP_PX],
    };
    if (moves[event.key]) {
      event.preventDefault();
      const [dx, dy] = moves[event.key];
      setOffset((o) => clampOffset({ x: o.x + dx, y: o.y + dy }, width, height, scale));
    } else if (event.key === '+' || event.key === '=') {
      event.preventDefault();
      changeZoom(zoom + ZOOM_STEP * 2);
    } else if (event.key === '-') {
      event.preventDefault();
      changeZoom(zoom - ZOOM_STEP * 2);
    }
  };

  const handleSave = () =>
    onSave({ x: -offset.x / scale, y: -offset.y / scale, size: VIEW / scale });

  return (
    <Modal
      open
      size="sm"
      title="Фото профиля"
      onClose={saving ? () => {} : onClose}
      footer={
        <>
          <button type="button" className={styles.primary} onClick={handleSave} disabled={saving}>
            {saving ? 'Сохраняем…' : 'Сохранить'}
          </button>
          <button type="button" className={styles.secondary} onClick={onClose} disabled={saving}>
            Отмена
          </button>
        </>
      }
    >
      <div className={styles.body}>
        <div
          ref={frameRef}
          className={styles.frame}
          style={{ width: STAGE, height: STAGE }}
          tabIndex={0}
          role="application"
          aria-label="Кадрирование фото: перетащите картинку, стрелки — сдвиг, плюс и минус — масштаб"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onKeyDown={handleKeyDown}
          data-autofocus
        >
          <img
            src={image.src}
            alt=""
            draggable={false}
            className={styles.image}
            style={{
              width: width * scale,
              height: height * scale,
              transform: `translate(${INSET + offset.x}px, ${INSET + offset.y}px)`,
            }}
          />
          <span className={styles.mask} style={{ inset: INSET }} aria-hidden="true" />
        </div>

        <div className={styles.zoom}>
          <button
            type="button"
            className={styles.zoomButton}
            aria-label="Отдалить"
            onClick={() => changeZoom(zoom - ZOOM_STEP * 2)}
            disabled={zoom <= 1}
          >
            <MinusIcon className={styles.zoomIcon} />
          </button>
          <input
            type="range"
            className={styles.slider}
            min={1}
            max={MAX_ZOOM}
            step={0.01}
            value={zoom}
            aria-label="Масштаб"
            onChange={(e) => changeZoom(Number(e.target.value))}
          />
          <button
            type="button"
            className={styles.zoomButton}
            aria-label="Приблизить"
            onClick={() => changeZoom(zoom + ZOOM_STEP * 2)}
            disabled={zoom >= MAX_ZOOM}
          >
            <PlusIcon className={styles.zoomIcon} />
          </button>
        </div>
        <p className={styles.hint}>Перетащите фото, чтобы выбрать, что будет в круге.</p>
      </div>
    </Modal>
  );
}
