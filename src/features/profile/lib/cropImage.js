// Квадрат, который вырезается из картинки и уходит на сервер. Аватар показывается
// максимум в 150 px, 512 хватает и для экранов с высокой плотностью пикселей.
const OUTPUT_SIZE = 512;

export function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => resolve({ image, url });
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Не удалось открыть картинку'));
    };
    image.src = url;
  });
}

const toBlob = (canvas, type, quality) =>
  new Promise((resolve) => canvas.toBlob(resolve, type, quality));

// area — вырезаемый квадрат в пикселях исходной картинки: { x, y, size }.
// WebP заметно легче; браузер, который не умеет его кодировать, вернёт PNG — тогда JPEG.
export async function cropToBlob(image, area) {
  const canvas = document.createElement('canvas');
  canvas.width = OUTPUT_SIZE;
  canvas.height = OUTPUT_SIZE;
  const context = canvas.getContext('2d');
  context.imageSmoothingQuality = 'high';
  context.drawImage(image, area.x, area.y, area.size, area.size, 0, 0, OUTPUT_SIZE, OUTPUT_SIZE);

  const webp = await toBlob(canvas, 'image/webp', 0.9);
  if (webp?.type === 'image/webp') return webp;
  const jpeg = await toBlob(canvas, 'image/jpeg', 0.92);
  if (!jpeg) throw new Error('Не удалось подготовить картинку');
  return jpeg;
}
