import { ApiError } from '../api/httpClient';

// Ошибка, текст которой можно показать пользователю как есть.
export class UserFacingError extends Error {
  constructor(message) {
    super(message);
    this.name = 'UserFacingError';
  }
}

const NETWORK_ERROR = 'Нет соединения с сервером. Проверьте интернет и попробуйте ещё раз.';

const isNetworkError = (error) =>
  error instanceof TypeError && /fetch|network|load failed/i.test(error.message);

// Общие тексты для типовых случаев: один раз здесь, а не копией в каждом компоненте.
export function describeError(error) {
  if (error instanceof UserFacingError) return error.message;
  if (isNetworkError(error)) return NETWORK_ERROR;
  if (error instanceof ApiError) {
    if (error.status === 401) return 'Сессия истекла — войдите снова.';
    if (error.status === 403) return 'Недостаточно прав для этого действия.';
    if (error.status === 404) return 'Не найдено — возможно, это уже удалено.';
    if (error.status === 413) return 'Файл слишком большой.';
    if (error.status === 429) return 'Слишком много запросов. Подождите немного и попробуйте снова.';
    if (error.status >= 500) return 'Сервер временно недоступен. Попробуйте позже.';
    return 'Сервер отклонил запрос. Попробуйте ещё раз.';
  }
  return 'Что-то пошло не так. Попробуйте ещё раз.';
}
