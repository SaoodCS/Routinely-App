import type { T_Settings, T_Tag, T_Task } from '@repo/types/app.types';
import { createContext, useContext, useState, type ReactNode } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';

type T_LocalStorage_Context = {
   isLoading: boolean;
   morningTasks: T_Task[];
   eveningTasks: T_Task[];
   tags: T_Tag[];
   settings: T_Settings;
   setMorningTasks: ReturnType<typeof useLocalStorage<T_LocalStorage_Context['morningTasks']>>[1];
   setEveningTasks: ReturnType<typeof useLocalStorage<T_LocalStorage_Context['eveningTasks']>>[1];
   setTags: ReturnType<typeof useLocalStorage<T_LocalStorage_Context['tags']>>[1];
   setSettings: ReturnType<typeof useLocalStorage<T_LocalStorage_Context['settings']>>[1];
   setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
};

const LocalStorageContext = createContext<T_LocalStorage_Context>({
   isLoading: true,
   morningTasks: [],
   eveningTasks: [],
   tags: [],
   settings: {},
   setMorningTasks: () => {},
   setEveningTasks: () => {},
   setTags: () => {},
   setSettings: () => {},
   setIsLoading: () => {},
});

export function LocalStorageProvider({ children }: { children: ReactNode }): ReactNode {
   const [isLoading, setIsLoading] = useState<T_LocalStorage_Context['isLoading']>(true);
   const [morningTasks, setMorningTasks] = useLocalStorage<T_LocalStorage_Context['morningTasks']>('morning-routine-tasks', []);
   const [eveningTasks, setEveningTasks] = useLocalStorage<T_LocalStorage_Context['eveningTasks']>('evening-routine-tasks', []);
   const [tags, setTags] = useLocalStorage<T_LocalStorage_Context['tags']>('tags', []);
   const [settings, setSettings] = useLocalStorage<T_LocalStorage_Context['settings']>('settings', {});

   return (
      <LocalStorageContext
         value={{ isLoading, morningTasks, eveningTasks, tags, settings, setMorningTasks, setEveningTasks, setTags, setIsLoading, setSettings }}
      >
         {children}
      </LocalStorageContext>
   );
}

export const useLocalStorageContext = (): T_LocalStorage_Context => useContext(LocalStorageContext);
