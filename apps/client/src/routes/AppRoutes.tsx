import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import { authUtils } from '../utils/auth';
import { authRoutes, protectedRoutes } from './routes';
import Login from '../pages/Login';
import Signup from '../pages/Signup';
import Home from '@/pages/Home';
import GoogleAuth from '@/pages/GoogleAuth';

const AppRoutes: React.FC = () => {
  const isAuthenticated = authUtils.isAuthenticated();

  return (
    <Routes>
      {/* Public Routes - Redirect to dashboard if already authenticated */}
      <Route
        path={authRoutes.LOGIN}
        element={isAuthenticated ? <Navigate to={protectedRoutes.HOME} replace /> : <Login />}
      />
      <Route
        path={authRoutes.SIGNUP}
        element={isAuthenticated ? <Navigate to={protectedRoutes.HOME} replace /> : <Signup />}
      />
      <Route
        path={authRoutes.GOOGLE_CALLBACK}
        element={isAuthenticated ? <Navigate to={protectedRoutes.HOME} replace /> : <GoogleAuth />}
      />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path={protectedRoutes.HOME} element={<Home />} />
        {/* Add more protected routes here */}
        {/* <Route path="/profile" element={<Profile />} /> */}
        {/* <Route path="/settings" element={<Settings />} /> */}
      </Route>

      {/* Default redirect */}
      <Route
        path={protectedRoutes.HOME}
        element={
          <Navigate to={isAuthenticated ? protectedRoutes.HOME : authRoutes.LOGIN} replace />
        }
      />

      {/* 404 Not Found */}
      <Route path='*' element={<Navigate to={protectedRoutes.HOME} replace />} />
    </Routes>
  );
};

export default AppRoutes;
