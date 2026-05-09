import type { AppTypes } from '@repo/types/index';
import type { ComponentType, JSX, ReactElement, ReactNode } from 'react';
import { Navigate, Outlet, Route, type Location, type RouteProps, type UIMatch, useLocation } from 'react-router';
import { useAuthContext } from '../authentication/useAuthContext';
import SpinnerLoader from '../components/SpinnerLoader';
export type T_Route_Path = (typeof ROUTE_PATHS)[keyof typeof ROUTE_PATHS];
export type T_Route_UseMatches = UIMatch<unknown, T_Route_Handle | undefined>[];
export type T_RouteProps = Omit<RouteProps, 'children' | 'handle' | 'path'> & { path?: T_Route_Path; children?: ReactNode; handle?: T_Route_Handle };
export type T_Route_Handle = {
   header?: { hide?: boolean; Icon?: ComponentType; title?: string | ComponentType; showBack?: boolean; RightElement?: ComponentType };
   nav?: { hide?: boolean; inBottomNav?: boolean };
};

export const ROUTE_PATHS = {
   notFound: '*',
   forbidden: '/403',
   landing: '/',
   auth: '/auth',
   auth_login: '/auth/login',
   auth_logout: '/auth/logout',
   main: '/main',
   main_routine: '/main/routine',
   main_routine_morning: '/main/routine/morning',
   main_routine_evening: '/main/routine/evening',
   main_tags: '/main/tags',
   main_tags_tagId: '/main/tags/:tagId',
   main_settings: '/main/settings',
} as const;

export const SafeRoute = Route as (props: T_RouteProps) => ReactElement | null;

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
