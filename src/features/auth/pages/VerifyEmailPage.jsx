import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authApi } from '../api/authApi';

export function VerifyEmailPage() {
  const [params] = useSearchParams();
  const token = params.get('token');
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate('/link-error', { replace: true });
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        await authApi.verifyEmail(token);
        if (!cancelled) navigate('/register-success', { replace: true });
      } catch {
        if (!cancelled) navigate('/link-error', { replace: true });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token, navigate]);

  return null;
}
