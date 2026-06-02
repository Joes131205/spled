import { createFileRoute, useNavigate, useSearch } from '@tanstack/react-router';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { authApi } from '../utils/api';

export const Route = createFileRoute('/auth-callback')({
  component: AuthCallback,
});

function AuthCallback() {
  const navigate = useNavigate();
  const search = useSearch({ from: '/auth-callback' }) as { 
    token?: string; 
    userId?: string; 
  };

  useEffect(() => {
    const { token, userId } = search;

    if (token && userId) {
      // Save basic info first
      localStorage.setItem('token', token);
      localStorage.setItem('userId', userId);

      // Fetch full profile info securely
      const fetchProfile = async () => {
        try {
          const response = await authApi.get('/auth/me', {
            headers: { Authorization: `Bearer ${token}` }
          });
          const user = response.data;

          localStorage.setItem('email', user.email || '');
          localStorage.setItem('username', user.username || '');
          localStorage.setItem('role', user.role || 'MEMBER');
          localStorage.setItem('displayName', user.displayName || user.username || '');
          localStorage.setItem('avatarUrl', user.avatarUrl || '');

          navigate({ to: '/dashboard' });
        } catch (error) {
          console.error('Failed to fetch user profile during callback', error);
          navigate({ to: '/login' });
        }
      };

      fetchProfile();
    } else {
      console.error('Missing token or userId in callback', search);
      navigate({ to: '/login' });
    }
  }, [search, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      <Loader2 className="h-10 w-10 animate-spin text-[#00008B] mb-4" />
      <h2 className="text-xl font-bold text-gray-900">Completing login...</h2>
      <p className="text-gray-500 mt-2">Please wait while we set up your session.</p>
    </div>
  );
}
