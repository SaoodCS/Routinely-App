import { Navigate } from 'react-router';
import { ROUTE_PATHS, SafeRoute } from '../index.route';

export const landingRoute = <SafeRoute path={ROUTE_PATHS.landing} element={<Navigate to={ROUTE_PATHS.main} replace />} />;
