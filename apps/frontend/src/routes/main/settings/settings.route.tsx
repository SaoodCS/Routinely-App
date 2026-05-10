import { SettingsOutlined } from '@mui/icons-material';
import { ROUTE_PATHS, SafeRoute } from '../../utils.route';
import SettingsPage from './SettingsPage';

export const settingsRoute = (
   <SafeRoute
      path={ROUTE_PATHS.main_settings}
      element={<SettingsPage />}
      handle={{
         header: { title: 'Settings', Icon: () => <SettingsOutlined sx={{ color: 'grey.400' }} /> },
         nav: { inBottomNav: true },
      }}
   ></SafeRoute>
);
