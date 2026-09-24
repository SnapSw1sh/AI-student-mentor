import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  setAccessToken as setHttpToken,
  setRefreshHandler,
  setUnauthorizedHandler,
} from '../../../shared/api/httpClient';
import { authApi } from '../api/authApi';
import { AuthContext } from './AuthContext.js';

export function AuthProvider({ children }) {
  const [accessToken, setAccessTokenState] = useState(null);
  const [user, setUser] = useState(null);
  const [bootstrapped, setBootstrapped] = useState(false);
  const tokenRef = useRef(null);

  const setAccessToken = useCallback((token) => {
    tokenRef.current = token;
    setAccessTokenState(token);
    setHttpToken(token);
  }, []);

  const refresh = useCallback(async () => {
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
    }
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
        try {
          const profile = await authApi.getProfile();
          if (!cancelled) setUser(profile);
        } catch {
          /* профиль не критичен для bootstrap */
        }
      }
      if (!cancelled) setBootstrapped(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [refresh]);

  const login = useCallback(
    async (email, password) => {
      const data = await authApi.login(email, password);
      setAccessToken(data.access_token);
      try {
        const profile = await authApi.getProfile();
        setUser(profile);
      } catch {
        setUser(null);
      }
      return data;
    },
    [setAccessToken],
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
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
