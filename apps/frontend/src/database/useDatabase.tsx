import type { T_Tag, T_Task } from '@repo/types/app.types';
import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';

type T_Database_Context = {
   isLoading: boolean;
   morningTasks: T_Task[];
   eveningTasks: T_Task[];
   tags: T_Tag[];
   setMorningTasks: ReturnType<typeof useLocalStorage<T_Database_Context['morningTasks']>>[1];
   setEveningTasks: ReturnType<typeof useLocalStorage<T_Database_Context['eveningTasks']>>[1];
   setTags: ReturnType<typeof useLocalStorage<T_Database_Context['tags']>>[1];
   setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
};

const DatabaseContext = createContext<T_Database_Context>({
   isLoading: true,
   morningTasks: [],
   eveningTasks: [],
   tags: [],
   setMorningTasks: () => {},
   setEveningTasks: () => {},
   setTags: () => {},
   setIsLoading: () => {},
});

export function DatabaseProvider({ children }: { children: ReactNode }): ReactNode {
   const [isLoading, setIsLoading] = useState<T_Database_Context['isLoading']>(true);
   const [morningTasks, setMorningTasks] = useLocalStorage<T_Database_Context['morningTasks']>('morning-routine-tasks', []);
   const [eveningTasks, setEveningTasks] = useLocalStorage<T_Database_Context['eveningTasks']>('evening-routine-tasks', []);
   const [tags, setTags] = useLocalStorage<T_Database_Context['tags']>('tags', []);

   const value = useMemo(
      () => ({ isLoading, morningTasks, eveningTasks, tags, setMorningTasks, setEveningTasks, setTags, setIsLoading }),
      [isLoading, morningTasks, eveningTasks, tags, setMorningTasks, setEveningTasks, setTags, setIsLoading],
   );

   return <DatabaseContext value={value}>{children}</DatabaseContext>;
}

export const useDatabase = (): T_Database_Context => useContext(DatabaseContext);
