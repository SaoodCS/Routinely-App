import type { T_User_Role } from '@repo/types/user';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

type T_Auth_Context = { isLoading: boolean; isAuthenticated: boolean; userRole?: T_User_Role };

const AuthContext = createContext<T_Auth_Context>({ isLoading: true, isAuthenticated: false, userRole: undefined });

export function AuthProvider({ children }: { children: ReactNode }): ReactNode {
   const [isAuthenticated, setIsAuthenticated] = useState<T_Auth_Context['isAuthenticated']>(false);
   const [userRole, setUserRole] = useState<T_Auth_Context['userRole']>(undefined);
   const [isLoading, setIsLoading] = useState<T_Auth_Context['isLoading']>(true);

   useEffect(() => {
      //TODO: add authentication state listener here -> then set isAuthenticated and isLoading once it responds
      const unsubscribe = (): void => {
         setIsAuthenticated(true);
         setIsLoading(false);
         setUserRole('admin');
      };
      return unsubscribe;
   }, []);

   return <AuthContext value={{ isAuthenticated, isLoading, userRole }}>{children}</AuthContext>;
}

export const useAuth = (): T_Auth_Context => useContext(AuthContext);
