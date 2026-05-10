import { Navigate } from 'react-router';
import { ProtectedRoute, ROUTE_PATHS, SafeRoute } from '../utils.route';
import MainLayout from './MainLayout';
import { routineRoute } from './routine/routine.route';
import { settingsRoute } from './settings/settings.route';
import { tagsRoute } from './tags/tags.route';

export const mainRoute = (
   <SafeRoute path={ROUTE_PATHS.main}>
      <SafeRoute index element={<Navigate to={ROUTE_PATHS.main_routine} replace />} />
      <SafeRoute element={<ProtectedRoute />}>
         <SafeRoute element={<MainLayout />}>
            {routineRoute}
            {tagsRoute}
            {settingsRoute}
         </SafeRoute>
      </SafeRoute>
   </SafeRoute>
);
