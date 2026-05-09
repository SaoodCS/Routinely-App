import { SafeRoute } from '../routes.components';
import { ROUTE_PATHS } from '../routes.constants';
import NotFound from './NotFound';

export const notFoundRoute = <SafeRoute path={ROUTE_PATHS.notFound} element={<NotFound />} />;
