import { createContext, useContext, useMemo, type ReactNode } from 'react';
import type { AppTypes } from '@repo/types/index';
import useLocalStorage from '../hooks/useLocalStorage';

type T_LocalStorageContext = {
   morningTasks: AppTypes.Task[];
   eveningTasks: AppTypes.Task[];
   tags: AppTypes.Tag[];
   settings: AppTypes.Settings;
   setMorningTasks: ReturnType<typeof useLocalStorage<T_LocalStorageContext['morningTasks']>>[1];
   setEveningTasks: ReturnType<typeof useLocalStorage<T_LocalStorageContext['eveningTasks']>>[1];
   setTags: ReturnType<typeof useLocalStorage<T_LocalStorageContext['tags']>>[1];
   setSettings: ReturnType<typeof useLocalStorage<T_LocalStorageContext['settings']>>[1];
};

const LocalStorageContext = createContext<T_LocalStorageContext>({
   morningTasks: [],
   eveningTasks: [],
   tags: [],
   settings: {},
   setMorningTasks: () => {},
   setEveningTasks: () => {},
   setTags: () => {},
   setSettings: () => {},
});

export function LocalStorageProvider({ children }: { children: ReactNode }): ReactNode {
   const [morningTasks, setMorningTasks] = useLocalStorage<T_LocalStorageContext['morningTasks']>('morning-routine-tasks', []);
   const [eveningTasks, setEveningTasks] = useLocalStorage<T_LocalStorageContext['eveningTasks']>('evening-routine-tasks', []);
   const [tags, setTags] = useLocalStorage<T_LocalStorageContext['tags']>('tags', []);
   const [settings, setSettings] = useLocalStorage<T_LocalStorageContext['settings']>('settings', {});

   const value: T_LocalStorageContext = useMemo(
      () => ({ morningTasks, eveningTasks, tags, settings, setMorningTasks, setEveningTasks, setTags, setSettings }),
      [morningTasks, eveningTasks, tags, settings, setMorningTasks, setEveningTasks, setTags, setSettings],
   );

   return <LocalStorageContext value={value}>{children}</LocalStorageContext>;
}

export const useLocalStorageContext = (): T_LocalStorageContext => useContext(LocalStorageContext);
