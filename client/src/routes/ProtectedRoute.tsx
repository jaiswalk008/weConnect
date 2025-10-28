import { Navigate, Outlet } from 'react-router-dom';
import { authUtils } from '../utils/auth';
import { authRoutes } from './routes';

interface ProtectedRouteProps {
  redirectPath?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ redirectPath = authRoutes.LOGIN }) => {
  const isAuthenticated = authUtils.isAuthenticated();

  if (!isAuthenticated) {
    // Redirect to login if not authenticated
    return <Navigate to={redirectPath} replace />;
  }

  // Render child routes if authenticated
  return <Outlet />;
};

export default ProtectedRoute;
