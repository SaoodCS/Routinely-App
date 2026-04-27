import type { T_Tag, T_Task } from '@repo/types/app.types';
import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
const FIRESTORE_PATHS = {
   morningRoutine: ['routines', 'morning'],
   eveningRoutine: ['routines', 'evening'],
   tags: ['tags'],
} as const;

type T_Database_Context = {
   isLoading: boolean;
   morningTasks: T_Task[];
   eveningTasks: T_Task[];
   tags: T_Tag[];
};

const DatabaseContext = createContext<T_Database_Context>({
   isLoading: true,
   morningTasks: [],
   eveningTasks: [],
   tags: [],
});

export function DatabaseProvider({ children }: { children: ReactNode }): ReactNode {
   const [isLoading, setIsLoading] = useState<T_Database_Context['isLoading']>(true);
   const [morningTasks, setMorningTasks] = useLocalStorage<T_Database_Context['morningTasks']>('morning-routine-tasks', []);
   const [eveningTasks, setEveningTasks] = useLocalStorage<T_Database_Context['eveningTasks']>('evening-routine-tasks', []);
   const [tags, setTags] = useLocalStorage<T_Database_Context['tags']>('tags', []);

   const value = useMemo(() => ({ isLoading, morningTasks, eveningTasks, tags }), [isLoading, morningTasks, eveningTasks, tags]);

   return <DatabaseContext value={value}>{children}</DatabaseContext>;
}

export const useDatabase = (): T_Database_Context => useContext(DatabaseContext);
