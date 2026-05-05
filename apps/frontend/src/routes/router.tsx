import { createBrowserRouter, createRoutesFromElements, Navigate, Route as ReactRoute, type RouteProps, type UIMatch } from 'react-router';
import { ProtectedRoute, PublicOnlyRoute } from '../guards/guards';
import { Login } from '../pages/auth/Login';
import { Logout } from '../pages/auth/Logout';
import Forbidden from '../pages/error/Forbidden';
import NotFound from '../pages/error/NotFound';
import MainLayout from '../pages/main/MainLayout';
import ResetAllCheckedTasksButton from '../pages/main/routine/ResetAllCheckedTasksButton';
import Routine from '../pages/main/routine/Routine';
import SearchQueryMenuButton from '../pages/main/SearchQueryMenuButton';
import Settings from '../pages/main/settings/Settings';
import SortTagsButton from '../pages/main/tags/SortTagsButton';
import TagTasks from '../pages/main/tags/TagTasks';
import Tags from '../pages/main/tags/Tags';
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
   main_tags_tasks: '/main/tags/:tagId',
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
                     <Route
                        path={ROUTE_PATHS.main_routine_morning}
                        element={<Routine section="morning" />}
                        handle={{
                           header: {
                              title: 'Morning',
                              RightElement: () => (
                                 <>
                                    <ResetAllCheckedTasksButton section="morning" />
                                    <SearchQueryMenuButton />
                                 </>
                              ),
                           },
                           nav: { inBottomNav: true },
                        }}
                     />
                     <Route
                        path={ROUTE_PATHS.main_routine_evening}
                        element={<Routine section="evening" />}
                        handle={{
                           header: {
                              title: 'Evening',
                              RightElement: () => (
                                 <>
                                    <ResetAllCheckedTasksButton section="evening" />
                                    <SearchQueryMenuButton />
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
                        }}
                     />
                     <Route
                        path={ROUTE_PATHS.main_tags_tasks}
                        element={<TagTasks />}
                        handle={{
                           header: {
                              title: 'Tag Tasks',
                              showBack: true,
                           },
                        }}
                     />
                  </Route>

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
