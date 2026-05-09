import { LocalOfferOutlined, NightsStayOutlined, SettingsOutlined, WbTwilightOutlined } from '@mui/icons-material';
import { createBrowserRouter, createRoutesFromElements, Navigate, Outlet, Route as ReactRoute, useLocation } from 'react-router';
import type { RouteProps, UIMatch, Location } from 'react-router';
import type { AppTypes } from '@repo/types/index';
import type { JSX } from 'react';
import LoginPage from '../pages/auth/LoginPage';
import LogoutPage from '../pages/auth/LogoutPage';
import Forbidden from '../pages/error/Forbidden';
import NotFound from '../pages/error/NotFound';
import MainLayout from '../pages/main/MainLayout';
import RoutineActionsMenuButton from '../pages/main/routine/RoutineActionsMenuButton';
import RoutinePage from '../pages/main/routine/RoutinePage';
import SearchParamField from '../components/SearchParamField';
import SettingsPage from '../pages/main/settings/SettingsPage';
import TagsActionsMenuButton from '../pages/main/tags/TagsActionsMenuButton';
import TagsPage from '../pages/main/tags/TagsPage';
import TagIdPage from '../pages/main/tags/tagId/TagIdPage';
import TagTasksHeaderTitle from '../pages/main/tags/tagId/TagIdHeaderTitle';
import { useAuthContext } from '../authentication/useAuthContext';
import SpinnerLoader from '../components/SpinnerLoader';
export type T_Route_Path = (typeof ROUTE_PATHS)[keyof typeof ROUTE_PATHS];
export type T_Route_UseMatches = UIMatch<unknown, T_Route_Handle | undefined>[];
type T_RouteProps = Omit<RouteProps, 'children' | 'handle' | 'path'> & { path?: T_Route_Path; children?: React.ReactNode; handle?: T_Route_Handle };
const Route = ReactRoute as (props: T_RouteProps) => React.ReactElement | null;
type T_Route_Handle = {
   header?: {
      hide?: boolean;
      Icon?: React.ComponentType;
      title?: string | React.ComponentType;
      showBack?: boolean;
      RightElement?: React.ComponentType;
   };
   nav?: { hide?: boolean; inBottomNav?: boolean };
};
//
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
   // main/routine
   main_routine: '/main/routine',
   main_routine_morning: '/main/routine/morning',
   main_routine_evening: '/main/routine/evening',
   // main/tags
   main_tags: '/main/tags',
   main_tags_tagId: '/main/tags/:tagId',
   // main/settings
   main_settings: '/main/settings',
} as const;

function ProtectedRoute({ allowedRoles = 'all' }: { allowedRoles?: AppTypes.UserRole[] | 'all' }): JSX.Element {
   const location = useLocation();
   const { isLoading, isAuthenticated, userRole } = useAuthContext();
   if (isLoading) return <SpinnerLoader fullPage />;
   if (!isAuthenticated) return <Navigate to={ROUTE_PATHS.auth_login} replace state={{ from: location }} />;
   if (userRole && (allowedRoles === 'all' || allowedRoles.includes(userRole))) return <Outlet />;
   return <Navigate to={ROUTE_PATHS.forbidden} replace state={{ from: location }} />;
}

function PublicOnlyRoute({ fallbackRoute = ROUTE_PATHS.main }: { fallbackRoute?: T_Route_Path }): JSX.Element {
   const location = useLocation() as Location<{ from?: Location } | null>;
   const { isLoading, isAuthenticated } = useAuthContext();
   if (isLoading) return <SpinnerLoader fullPage />;
   if (!isAuthenticated) return <Outlet />;
   const from = location.state?.from;
   const redirectTo = from && from?.pathname !== ROUTE_PATHS.auth_logout ? from : fallbackRoute;
   return <Navigate to={redirectTo} replace />;
}

export const router = createBrowserRouter(
   createRoutesFromElements(
      <Route>
         {/* Error Routes */}
         <Route path={ROUTE_PATHS.notFound} element={<NotFound />} />
         <Route path={ROUTE_PATHS.forbidden} element={<Forbidden />} />
         {/* Landing Route */}
         <Route path={ROUTE_PATHS.landing} element={<Navigate to={ROUTE_PATHS.main} replace />} />
         {/* Auth Routes */}
         <Route path={ROUTE_PATHS.auth}>
            <Route index element={<Navigate to={ROUTE_PATHS.auth_login} replace />} />
            <Route element={<PublicOnlyRoute fallbackRoute={ROUTE_PATHS.main} />}>
               <Route path={ROUTE_PATHS.auth_login} element={<LoginPage />} />
            </Route>
            <Route element={<ProtectedRoute />}>
               <Route path={ROUTE_PATHS.auth_logout} element={<LogoutPage />} />
            </Route>
         </Route>
         {/* Main Routes */}
         <Route path={ROUTE_PATHS.main}>
            <Route index element={<Navigate to={ROUTE_PATHS.main_routine} replace />} />
            <Route element={<ProtectedRoute />}>
               <Route element={<MainLayout />}>
                  {/* Main/Routine Routes */}
                  <Route path={ROUTE_PATHS.main_routine}>
                     <Route index element={<Navigate to={ROUTE_PATHS.main_routine_morning} replace />} />
                     <Route
                        path={ROUTE_PATHS.main_routine_morning}
                        element={<RoutinePage section="morning" />}
                        handle={{
                           header: {
                              title: 'Morning',
                              Icon: () => <WbTwilightOutlined sx={{ color: 'warning.main' }} />,
                              RightElement: () => (
                                 <>
                                    <SearchParamField className={'SearchParamField-appHeader'} />
                                    <RoutineActionsMenuButton section="morning" />
                                 </>
                              ),
                           },
                           nav: { inBottomNav: true },
                        }}
                     />
                     <Route
                        path={ROUTE_PATHS.main_routine_evening}
                        element={<RoutinePage section="evening" />}
                        handle={{
                           header: {
                              title: 'Evening',
                              Icon: () => <NightsStayOutlined sx={{ color: 'error.main' }} />,
                              RightElement: () => (
                                 <>
                                    <SearchParamField className={'SearchParamField-appHeader'} />
                                    <RoutineActionsMenuButton section="evening" />
                                 </>
                              ),
                           },
                           nav: { inBottomNav: true },
                        }}
                     />
                  </Route>
                  <Route path={ROUTE_PATHS.main_tags} handle={{ nav: { inBottomNav: true } }}>
                     <Route
                        index
                        element={<TagsPage />}
                        handle={{
                           header: {
                              title: 'Tags',
                              Icon: () => <LocalOfferOutlined sx={{ color: 'primary.light' }} />,
                              RightElement: () => (
                                 <>
                                    <SearchParamField className={'SearchParamField-appHeader'} />
                                    <TagsActionsMenuButton />
                                 </>
                              ),
                           },
                        }}
                     />
                     <Route
                        path={ROUTE_PATHS.main_tags_tagId}
                        element={<TagIdPage />}
                        handle={{
                           header: {
                              showBack: true,
                              title: () => <TagTasksHeaderTitle />,
                              RightElement: () => <SearchParamField className={'SearchParamField-appHeader'} />,
                           },
                        }}
                     />
                  </Route>

                  {/* Settings Routes */}
                  <Route
                     path={ROUTE_PATHS.main_settings}
                     element={<SettingsPage />}
                     handle={{
                        header: { title: 'Settings', Icon: () => <SettingsOutlined sx={{ color: 'grey.400' }} /> },
                        nav: { inBottomNav: true },
                     }}
                  ></Route>
               </Route>
            </Route>
         </Route>
      </Route>,
   ),
);
