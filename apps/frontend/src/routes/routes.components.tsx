import type { AppTypes } from '@repo/types/index';
import type { JSX } from 'react';
import type { Location } from 'react-router';
import { Navigate, Outlet, Route, useLocation } from 'react-router';
import { useAuthContext } from '../authentication/useAuthContext';
import SpinnerLoader from '../components/SpinnerLoader';
import { ROUTE_PATHS } from './routes.constants';
import type { T_Route_Path, T_RouteProps } from './routes.types';

export const SafeRoute = Route as (props: T_RouteProps) => React.ReactElement | null;

export function ProtectedRoute({ allowedRoles = 'all' }: { allowedRoles?: AppTypes.UserRole[] | 'all' }): JSX.Element {
   const location = useLocation();
   const { isLoading, isAuthenticated, userRole } = useAuthContext();
   if (isLoading) return <SpinnerLoader fullPage />;
   if (!isAuthenticated) return <Navigate to={ROUTE_PATHS.auth_login} replace state={{ from: location }} />;
   if (userRole && (allowedRoles === 'all' || allowedRoles.includes(userRole))) return <Outlet />;
   return <Navigate to={ROUTE_PATHS.forbidden} replace state={{ from: location }} />;
}

export function PublicOnlyRoute({ fallbackRoute = ROUTE_PATHS.main }: { fallbackRoute?: T_Route_Path }): JSX.Element {
   const location = useLocation() as Location<{ from?: Location } | null>;
   const { isLoading, isAuthenticated } = useAuthContext();
   if (isLoading) return <SpinnerLoader fullPage />;
   if (!isAuthenticated) return <Outlet />;
   const from = location.state?.from;
   const redirectTo = from && from?.pathname !== ROUTE_PATHS.auth_logout ? from : fallbackRoute;
   return <Navigate to={redirectTo} replace />;
}
