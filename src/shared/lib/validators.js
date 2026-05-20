const HSE_DOMAIN = '@edu.hse.ru';

export function isValidEmail(value) {
  const trimmed = value.trim();
  if (!trimmed) return false;
  return trimmed.toLowerCase().endsWith(HSE_DOMAIN);
}

export function isValidPassword(value) {
  if (value.length < 8) return false;
  return /^[a-zA-Z0-9]+$/.test(value);
}
