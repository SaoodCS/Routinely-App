import { WbTwilightOutlined, NightsStayOutlined } from '@mui/icons-material';
import { Navigate } from 'react-router';
import SearchParamField from '../../../components/SearchParamField';
import { ROUTE_PATHS, SafeRoute } from '../../index.route';
import RoutineActionsMenuButton from './RoutineActionsMenuButton';
import RoutinePage from './RoutinePage';

export const routineRoute = (
   <SafeRoute path={ROUTE_PATHS.main_routine}>
      <SafeRoute index element={<Navigate to={ROUTE_PATHS.main_routine_morning} replace />} />
      <SafeRoute
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
      <SafeRoute
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
   </SafeRoute>
);
