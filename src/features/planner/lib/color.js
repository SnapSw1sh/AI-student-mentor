// Цвет тега может быть любым (палитра + свой цвет), поэтому фон полосы и цвет текста
// на плашке считаются из него: фон — сильно разбавленный белым цвет тега, текст — сам цвет,
// затемнённый, если он слишком светлый, чтобы читаться на этом фоне.

const parseHex = (hex) => {
  const value = /^#?([0-9a-f]{6})$/i.exec(hex ?? '')?.[1];
  if (!value) return null;
  return [0, 2, 4].map((i) => parseInt(value.slice(i, i + 2), 16));
};

const toHex = (rgb) => `#${rgb.map((c) => Math.round(c).toString(16).padStart(2, '0')).join('')}`;

const mix = (rgb, target, amount) => rgb.map((c, i) => c + (target[i] - c) * amount);

const luminance = (rgb) => {
  const [r, g, b] = rgb.map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

export const isValidColor = (hex) => parseHex(hex) !== null;

export function toneFromColor(hex) {
  const rgb = parseHex(hex) ?? parseHex(DEFAULT_TAG_COLOR);
  let text = rgb;
  for (let step = 0; step < 10 && luminance(text) > 0.22; step += 1) text = mix(text, [0, 0, 0], 0.15);
  return { bg: toHex(mix(rgb, [255, 255, 255], 0.86)), text: toHex(text) };
}

export const DEFAULT_TAG_COLOR = '#1466ED';
// Цвет записи без тегов.
export const UNTAGGED_COLOR = '#8A94A6';

export const TAG_PALETTE = [
  '#1466ED', '#0FA1D7', '#1CA857', '#5FA319', '#F5A81F',
  '#E8890C', '#E52957', '#ED5259', '#8554ED', '#6B2EDB', '#8A94A6', '#5D5E5E',
];
