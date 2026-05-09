import { Navigate } from 'react-router';
import { SafeRoute } from '../routes.components';
import { ROUTE_PATHS } from '../routes.constants';

export const landingRoute = <SafeRoute path={ROUTE_PATHS.landing} element={<Navigate to={ROUTE_PATHS.main} replace />} />;
