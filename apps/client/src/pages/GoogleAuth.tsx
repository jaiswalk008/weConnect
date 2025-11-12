// src/pages/AuthCallback.tsx (or .jsx)
import { authRoutes, protectedRoutes } from '@/routes/routes';

import { authUtils } from '@/utils/auth';
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const GoogleAuth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Extract token from URL query parameter
        const token = searchParams.get('token');

        if (!token) {
          // console.error('No token found in callback URL');
          navigate(authRoutes.LOGIN);
          return;
        }

        authUtils.setAuthToken(token);
        navigate(protectedRoutes.HOME);
      } catch (error) {
        // console.error('Error handling OAuth callback:', error);
        navigate(authRoutes.LOGIN);
      }
    };

    handleCallback();
  }, [navigate, searchParams]);

  return (
    <div className='flex items-center justify-center min-h-screen'>
      <div className='text-center'>
        <h2>Authenticating...</h2>
        <p>Please wait while we log you in</p>
      </div>
    </div>
  );
};

export default GoogleAuth;
