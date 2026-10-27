import { useEffect, useState } from 'react';
import { authApi } from '../../auth/api/authApi';
import { useAuth } from '../../auth/hooks/useAuth';

// Одна загрузка на один адрес аватара: шапка и профиль показывают его одновременно.
// avatar_url меняется вместе с картинкой (?v=…), так что старый адрес больше не понадобится.
const cache = new Map();

function loadAvatar(url) {
  if (!cache.has(url)) {
    const request = authApi.getAvatar(url).then(({ blob }) => URL.createObjectURL(blob));
    // Неудачная загрузка не кэшируется — следующий показ попробует снова.
    request.catch(() => cache.delete(url));
    cache.set(url, request);
  }
  return cache.get(url);
}

// Адрес картинки аватара текущего пользователя для <img src> или null, пока её нет. Если
// загрузить не вышло, остаётся заглушка: ошибку здесь не показываем, это не действие
// пользователя, а фон.
export function useAvatarSrc() {
  const { user } = useAuth();
  const url = user?.avatar_url ?? null;
  const [loaded, setLoaded] = useState({ url: null, src: null });

  useEffect(() => {
    if (!url) return undefined;
    let cancelled = false;
    loadAvatar(url)
      .then((src) => {
        if (!cancelled) setLoaded({ url, src });
      })
      .catch(() => {
        // см. комментарий к хуку: без картинки остаётся заглушка
      });
    return () => {
      cancelled = true;
    };
  }, [url]);

  return url && loaded.url === url ? loaded.src : null;
}
