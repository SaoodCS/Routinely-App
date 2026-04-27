import type { JSX } from 'react';
import { Navigate, Outlet, useLocation, type Location } from 'react-router';
import type { T_User_Role } from '@repo/types/user';
import { useAuth } from '../auth/useAuth';
import SpinnerLoader from '../components/SpinnerLoader';
import { ROUTE_PATHS, type T_Route_Path } from './router';

export function ProtectedRoute({ allowedRoles = 'all' }: { allowedRoles?: T_User_Role[] | 'all' }): JSX.Element {
   const location = useLocation();
   const { isLoading, isAuthenticated, userRole } = useAuth();
   if (isLoading) return <SpinnerLoader fullPage />;
   if (!isAuthenticated) return <Navigate to={ROUTE_PATHS.auth_login} replace state={{ from: location }} />;
   if (userRole && (allowedRoles === 'all' || allowedRoles.includes(userRole))) return <Outlet />;
   return <Navigate to={ROUTE_PATHS.forbidden} replace state={{ from: location }} />;
}

export function PublicOnlyRoute({ fallbackRoute = ROUTE_PATHS.main }: { fallbackRoute?: T_Route_Path }): JSX.Element {
   const location = useLocation() as Location<{ from?: Location } | null>;
   const { isLoading, isAuthenticated } = useAuth();
   if (isLoading) return <SpinnerLoader fullPage />;
   if (!isAuthenticated) return <Outlet />;
   return <Navigate to={location?.state?.from ?? fallbackRoute} replace state={{ from: location }} />;
}
