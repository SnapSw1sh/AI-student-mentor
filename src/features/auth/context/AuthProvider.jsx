import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  setAccessToken as setHttpToken,
  setRefreshHandler,
  setUnauthorizedHandler,
} from '../../../shared/api/httpClient';
import { useNotify } from '../../../shared/notifications/useNotify';
import { authApi } from '../api/authApi';
import { AuthContext } from './AuthContext.js';

export function AuthProvider({ children }) {
  const [accessToken, setAccessTokenState] = useState(null);
  const [user, setUser] = useState(null);
  const [bootstrapped, setBootstrapped] = useState(false);
  const tokenRef = useRef(null);
  const notify = useNotify();

  const setAccessToken = useCallback((token) => {
    tokenRef.current = token;
    setAccessTokenState(token);
    setHttpToken(token);
  }, []);

  const refreshInFlight = useRef(null);

  // Бэк на каждом обновлении выдаёт новый refresh-токен и отзывает старый. Два одновременных
  // запроса уходят с одной и той же кукой: второй получает 401 и разлогинивает пользователя,
  // хотя первый прошёл. Так бывает при старте (StrictMode запускает эффект дважды) и когда
  // несколько запросов страницы разом упираются в просроченный access-токен. Поэтому все
  // одновременные вызовы ждут один запрос.
  const refresh = useCallback(() => {
    if (!refreshInFlight.current) {
      refreshInFlight.current = (async () => {
        try {
          const data = await authApi.refresh();
          if (data?.access_token) {
            setAccessToken(data.access_token);
            return true;
          }
          return false;
        } catch {
          setAccessToken(null);
          setUser(null);
          return false;
        } finally {
          refreshInFlight.current = null;
        }
      })();
    }
    return refreshInFlight.current;
  }, [setAccessToken]);

  const handleUnauthorized = useCallback(() => {
    setAccessToken(null);
    setUser(null);
  }, [setAccessToken]);

  useEffect(() => {
    setRefreshHandler(refresh);
    setUnauthorizedHandler(handleUnauthorized);
  }, [refresh, handleUnauthorized]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const ok = await refresh();
      if (!cancelled && ok) {
        // Сессия при этом остаётся: без профиля работают все разделы, кроме самого профиля.
        try {
          const profile = await authApi.getProfile();
          if (!cancelled) setUser(profile);
        } catch (err) {
          if (!cancelled) notify.error('Не удалось загрузить профиль', err);
        }
      }
      if (!cancelled) setBootstrapped(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [refresh, notify]);

  const login = useCallback(
    async (email, password) => {
      const data = await authApi.login(email, password);
      setAccessToken(data.access_token);
      try {
        const profile = await authApi.getProfile();
        setUser(profile);
      } catch (err) {
        setUser(null);
        notify.error('Не удалось загрузить профиль', err);
      }
      return data;
    },
    [setAccessToken, notify],
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      setAccessToken(null);
      setUser(null);
    }
  }, [setAccessToken]);

  const refreshProfile = useCallback(async () => {
    const profile = await authApi.getProfile();
    setUser(profile);
    return profile;
  }, []);

  const updateProfile = useCallback(async (patch) => {
    const profile = await authApi.updateProfile(patch);
    setUser(profile);
    return profile;
  }, []);

  const uploadAvatar = useCallback(async (file) => {
    const profile = await authApi.uploadAvatar(file);
    setUser(profile);
    return profile;
  }, []);

  const removeAvatar = useCallback(async () => {
    await authApi.deleteAvatar();
    setUser((current) => (current ? { ...current, avatar_url: null } : current));
  }, []);

  const value = useMemo(
    () => ({
      accessToken,
      user,
      bootstrapped,
      isAuthenticated: Boolean(accessToken),
      login,
      logout,
      refresh,
      refreshProfile,
      updateProfile,
      uploadAvatar,
      removeAvatar,
    }),
    [
      accessToken,
      user,
      bootstrapped,
      login,
      logout,
      refresh,
      refreshProfile,
      updateProfile,
      uploadAvatar,
      removeAvatar,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
