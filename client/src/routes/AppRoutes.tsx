import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import { authUtils } from '../utils/auth';
import {authRoutes, protectedRoutes} from './routes';
import Login from '../pages/Login';
import Signup from '../pages/Signup';
import { useEffect, useState } from 'react';
import { getMe } from '@/services/user';
import { useDispatch } from 'react-redux';
import { authActions } from '@/store/store';
import { toast } from 'sonner';
import Loader from '@/components/ui/loader';
import Home from '@/pages/Home';
// Import other protected pages as needed

const AppRoutes: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const dispatch = useDispatch()
  const location = useLocation()
  const fetchMe = async () => {
    try {
      const response = await getMe()
      dispatch(authActions.setUserData(response.data.user))
      setIsAuthenticated(true)
    } catch (error) {
      toast.error("Failed to fetch user data")
      authUtils.logout()
    }
    finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    if(location.pathname !== authRoutes.LOGIN && location.pathname !== authRoutes.SIGNUP){
      fetchMe()
    }
    else setLoading(false)
  }, []);

  if (loading) {
    return (
      <Loader showLoader={loading}/>
    )
  }
  return (
    <Routes>
      {/* Public Routes - Redirect to dashboard if already authenticated */}
      <Route
        path={authRoutes.LOGIN}
        element={
          isAuthenticated ? <Navigate to={protectedRoutes.HOME} replace /> : <Login/>   
        }
      />
      <Route
        path={authRoutes.SIGNUP}
        element={
          isAuthenticated ? <Navigate to={protectedRoutes.HOME} replace /> : <Signup/>
        }
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
      <Route path="*" element={<Navigate to={protectedRoutes.HOME} replace />} />
    </Routes>
  );
};

export default AppRoutes;
