import { ROUTE_PATHS, SafeRoute } from '../utils.route';
import Forbidden from './Forbidden';

export const forbiddenRoute = <SafeRoute path={ROUTE_PATHS.forbidden} element={<Forbidden />} />;
