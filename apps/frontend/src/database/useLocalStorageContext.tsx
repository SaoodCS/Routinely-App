import type { AppTypes } from '@repo/types/index';
import { createContext, useContext, useMemo, type ReactNode } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';

type T_LocalStorageContext = {
   morningTasks: AppTypes.Task[];
   eveningTasks: AppTypes.Task[];
   tags: AppTypes.Tag[];
   settings: AppTypes.Settings;
   setMorningTasksDb: ReturnType<typeof useLocalStorage<T_LocalStorageContext['morningTasks']>>[1];
   setEveningTasksDb: ReturnType<typeof useLocalStorage<T_LocalStorageContext['eveningTasks']>>[1];
   setTagsDb: ReturnType<typeof useLocalStorage<T_LocalStorageContext['tags']>>[1];
   setSettingsDb: ReturnType<typeof useLocalStorage<T_LocalStorageContext['settings']>>[1];
};

const LocalStorageContext = createContext<T_LocalStorageContext>({
   morningTasks: [],
   eveningTasks: [],
   tags: [],
   settings: {},
   setMorningTasksDb: () => {},
   setEveningTasksDb: () => {},
   setTagsDb: () => {},
   setSettingsDb: () => {},
});

export function LocalStorageProvider({ children }: { children: ReactNode }): ReactNode {
   const [morningTasks, setMorningTasksDb] = useLocalStorage<T_LocalStorageContext['morningTasks']>('morning-routine-tasks', []);
   const [eveningTasks, setEveningTasksDb] = useLocalStorage<T_LocalStorageContext['eveningTasks']>('evening-routine-tasks', []);
   const [tags, setTagsDb] = useLocalStorage<T_LocalStorageContext['tags']>('tags', []);
   const [settings, setSettingsDb] = useLocalStorage<T_LocalStorageContext['settings']>('settings', {});

   const value: T_LocalStorageContext = useMemo(
      () => ({ morningTasks, eveningTasks, tags, settings, setMorningTasksDb, setEveningTasksDb, setTagsDb, setSettingsDb }),
      [morningTasks, eveningTasks, tags, settings, setMorningTasksDb, setEveningTasksDb, setTagsDb, setSettingsDb],
   );

   return <LocalStorageContext value={value}>{children}</LocalStorageContext>;
}

export const useLocalStorageContext = (): T_LocalStorageContext => useContext(LocalStorageContext);
