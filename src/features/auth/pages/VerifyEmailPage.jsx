import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authApi } from '../api/authApi';

export function VerifyEmailPage() {
  const [params] = useSearchParams();
  const token = params.get('token');
  const navigate = useNavigate();
  const calledRef = useRef(false);

  useEffect(() => {
    if (!token) {
      navigate('/link-error', { replace: true });
      return;
    }
    if (calledRef.current) return;
    calledRef.current = true;

    (async () => {
      try {
        await authApi.verifyEmail(token);
        navigate('/register-success', { replace: true });
      } catch {
        navigate('/link-error', { replace: true });
      }
    })();
  }, [token, navigate]);

  return null;
}
