import type { RouteProps, UIMatch } from 'react-router';
import type { ROUTE_PATHS } from './routes.constants';

export type T_Route_Path = (typeof ROUTE_PATHS)[keyof typeof ROUTE_PATHS];
export type T_Route_UseMatches = UIMatch<unknown, T_Route_Handle | undefined>[];
export type T_RouteProps = Omit<RouteProps, 'children' | 'handle' | 'path'> & {
   path?: T_Route_Path;
   children?: React.ReactNode;
   handle?: T_Route_Handle;
};

export type T_Route_Handle = {
   header?: {
      hide?: boolean;
      Icon?: React.ComponentType;
      title?: string | React.ComponentType;
      showBack?: boolean;
      RightElement?: React.ComponentType;
   };
   nav?: { hide?: boolean; inBottomNav?: boolean };
};
