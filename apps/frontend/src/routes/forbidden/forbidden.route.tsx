import { ROUTE_PATHS } from '../routes.constants';
import { SafeRoute } from '../routes.components';
import Forbidden from './Forbidden';

export const forbiddenRoute = <SafeRoute path={ROUTE_PATHS.forbidden} element={<Forbidden />} />;
