import { createBrowserRouter, createRoutesFromElements, Navigate, Route as ReactRoute, type RouteProps, type UIMatch } from 'react-router';
import { Login } from '../pages/auth/Login';
import { Logout } from '../pages/auth/Logout';
import Forbidden from '../pages/error/Forbidden';
import NotFound from '../pages/error/NotFound';
import Home from '../pages/main/home/Home';
import MainLayout from '../pages/main/MainLayout';
import Settings from '../pages/main/settings/Settings';
import { ProtectedRoute, PublicOnlyRoute } from './guards';
export type T_Route_Path = (typeof ROUTE_PATHS)[keyof typeof ROUTE_PATHS];
export type T_Route_UseMatches = UIMatch<unknown, T_Route_Handle | undefined>[];
type T_RouteProps = Omit<RouteProps, 'children' | 'handle' | 'path'> & { path?: T_Route_Path; children?: React.ReactNode; handle?: T_Route_Handle };
const Route = ReactRoute as (props: T_RouteProps) => React.ReactElement | null;
//
// TODO: update handle prop type here w/ data you want to pass to pages
type T_Route_Handle = {
   header?: { hide?: boolean; title?: string; showBack?: boolean; RightElement?: React.ComponentType };
   nav?: { hide?: boolean; inBottomNav?: boolean };
};
//
//TODO: update ROUTE_PATHS w/ website's pages
export const ROUTE_PATHS = {
   notFound: '*',
   forbidden: '/403',
   landing: '/',
   // auth
   auth: '/auth',
   auth_login: '/auth/login',
   auth_logout: '/auth/logout',
   // main
   main: '/main',
   main_home: '/main/home',
   main_settings: '/main/settings',
   main_settings_account: '/main/settings/account',
   main_settings_account_profile: '/main/settings/account/profile',
} as const;

//TODO: update router with website's pages
export const router = createBrowserRouter(
   createRoutesFromElements(
      <Route>
         {/* Error Routes */}
         <Route path={ROUTE_PATHS.notFound} element={<NotFound />} />
         <Route path={ROUTE_PATHS.forbidden} element={<Forbidden />} />
         {/* Landing Route */}
         <Route path={ROUTE_PATHS.landing} element={<Navigate to={ROUTE_PATHS.main_home} replace />} />
         {/* Auth Routes */}
         <Route path={ROUTE_PATHS.auth}>
            <Route index element={<Navigate to={ROUTE_PATHS.auth_login} replace />} />
            <Route element={<PublicOnlyRoute fallbackRoute={ROUTE_PATHS.main_home} />}>
               <Route path={ROUTE_PATHS.auth_login} element={<Login />} />
            </Route>
            <Route element={<ProtectedRoute />}>
               <Route path={ROUTE_PATHS.auth_logout} element={<Logout />} />
            </Route>
         </Route>
         {/* Main Routes */}
         <Route path={ROUTE_PATHS.main}>
            <Route index element={<Navigate to={ROUTE_PATHS.main_home} replace />} />
            <Route element={<ProtectedRoute />}>
               <Route element={<MainLayout />}>
                  <Route path={ROUTE_PATHS.main_home} element={<Home />} handle={{ header: { title: 'Home' }, nav: { inBottomNav: true } }} />
                  {/* Settings Routes */}
                  <Route
                     path={ROUTE_PATHS.main_settings}
                     element={<Settings />}
                     handle={{ header: { title: 'Settings' }, nav: { inBottomNav: true } }}
                  ></Route>
               </Route>
            </Route>
         </Route>
      </Route>,
   ),
);
