import { ROUTE_PATHS, SafeRoute } from '../utils.route';
import NotFound from './NotFound';

export const notFoundRoute = <SafeRoute path={ROUTE_PATHS.notFound} element={<NotFound />} />;
