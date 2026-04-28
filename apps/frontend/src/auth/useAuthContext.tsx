import type { T_User_Role } from '@repo/types/user.types';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { auth } from '../firebase/config';

type T_Auth_Context = { isLoading: boolean; isAuthenticated: boolean; user: User | null; userRole?: T_User_Role };

const AuthContext = createContext<T_Auth_Context>({ isLoading: true, isAuthenticated: false, user: null });

export function AuthProvider({ children }: { children: ReactNode }): ReactNode {
   const [isAuthenticated, setIsAuthenticated] = useState<T_Auth_Context['isAuthenticated']>(false);
   const [user, setUser] = useState<T_Auth_Context['user']>(null);
   const [userRole, setUserRole] = useState<T_Auth_Context['userRole']>(undefined);
   const [isLoading, setIsLoading] = useState<T_Auth_Context['isLoading']>(true);

   useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
         setUser(currentUser);
         setUserRole('user');
         setIsAuthenticated(Boolean(currentUser));
         setIsLoading(false);
      });
      return unsubscribe;
   }, []);

   return <AuthContext value={{ isAuthenticated, isLoading, user, userRole }}>{children}</AuthContext>;
}

export const useAuthContext = (): T_Auth_Context => useContext(AuthContext);
