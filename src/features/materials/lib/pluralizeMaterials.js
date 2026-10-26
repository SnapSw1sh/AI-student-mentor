export function pluralizeMaterials(count) {
  const mod10 = count % 10;
  const mod100 = count % 100;
  let word = 'материалов';
  if (mod10 === 1 && mod100 !== 11) word = 'материал';
  else if (mod10 >= 2 && mod10 <= 4 && !(mod100 >= 12 && mod100 <= 14)) word = 'материала';
  return `${count} ${word}`;
}
