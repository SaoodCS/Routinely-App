import { Navigate } from 'react-router';
import { ProtectedRoute, PublicOnlyRoute, ROUTE_PATHS, SafeRoute } from '../utils.route';
import LoginPage from './LoginPage';
import LogoutPage from './LogoutPage';

export const authRoute = (
   <SafeRoute path={ROUTE_PATHS.auth}>
      <SafeRoute index element={<Navigate to={ROUTE_PATHS.auth_login} replace />} />
      <SafeRoute element={<PublicOnlyRoute fallbackRoute={ROUTE_PATHS.main} />}>
         <SafeRoute path={ROUTE_PATHS.auth_login} element={<LoginPage />} />
      </SafeRoute>
      <SafeRoute element={<ProtectedRoute />}>
         <SafeRoute path={ROUTE_PATHS.auth_logout} element={<LogoutPage />} />
      </SafeRoute>
   </SafeRoute>
);
