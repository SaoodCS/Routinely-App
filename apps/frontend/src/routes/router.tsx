import { createBrowserRouter, createRoutesFromElements, Navigate, Route as ReactRoute, type RouteProps, type UIMatch } from 'react-router';
import { Login } from '../pages/auth/Login';
import { Logout } from '../pages/auth/Logout';
import Forbidden from '../pages/error/Forbidden';
import NotFound from '../pages/error/NotFound';
import MainLayout from '../pages/main/MainLayout';
import EveningRoutine from '../pages/main/routine/EveningRoutine';
import MorningRoutine from '../pages/main/routine/MorningRoutine';
import ResetCheckedMenuButton from '../pages/main/routine/ResetCheckedMenuButton';
import RoutineLayout from '../pages/main/routine/RoutineLayout';
import TagToggleMenuButton from '../pages/main/routine/TagToggleMenuButton';
import SearchQueryMenuButton from '../pages/main/SearchQueryMenuButton';
import Settings from '../pages/main/settings/Settings';
import SortTagsButton from '../pages/main/tags/SortTagsButton';
import Tags from '../pages/main/tags/Tags';
import { ProtectedRoute, PublicOnlyRoute } from './guards';
export type T_Route_Path = (typeof ROUTE_PATHS)[keyof typeof ROUTE_PATHS];
export type T_Route_UseMatches = UIMatch<unknown, T_Route_Handle | undefined>[];
type T_RouteProps = Omit<RouteProps, 'children' | 'handle' | 'path'> & { path?: T_Route_Path; children?: React.ReactNode; handle?: T_Route_Handle };
const Route = ReactRoute as (props: T_RouteProps) => React.ReactElement | null;
type T_Route_Handle = {
   header?: { hide?: boolean; title?: string; showBack?: boolean; RightElement?: React.ComponentType };
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
   // main/settings
   main_settings: '/main/settings',
} as const;

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
               <Route path={ROUTE_PATHS.auth_login} element={<Login />} />
            </Route>
            <Route element={<ProtectedRoute />}>
               <Route path={ROUTE_PATHS.auth_logout} element={<Logout />} />
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
                     <Route element={<RoutineLayout />}>
                        <Route
                           path={ROUTE_PATHS.main_routine_morning}
                           element={<MorningRoutine />}
                           handle={{
                              header: {
                                 title: 'Morning',
                                 RightElement: () => (
                                    <>
                                       <ResetCheckedMenuButton section="morning" />
                                       <TagToggleMenuButton />
                                       <SearchQueryMenuButton />
                                    </>
                                 ),
                              },
                              nav: { inBottomNav: true },
                           }}
                        />
                        <Route
                           path={ROUTE_PATHS.main_routine_evening}
                           element={<EveningRoutine />}
                           handle={{
                              header: {
                                 title: 'Evening',
                                 RightElement: () => (
                                    <>
                                       <ResetCheckedMenuButton section="evening" />
                                       <TagToggleMenuButton />
                                       <SearchQueryMenuButton />
                                    </>
                                 ),
                              },
                              nav: { inBottomNav: true },
                           }}
                        />
                     </Route>
                  </Route>
                  <Route
                     path={ROUTE_PATHS.main_tags}
                     element={<Tags />}
                     handle={{
                        header: {
                           title: 'Tags',
                           RightElement: () => (
                              <>
                                 <SortTagsButton />
                                 <SearchQueryMenuButton />
                              </>
                           ),
                        },
                        nav: { inBottomNav: true },
                     }}
                  />

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
