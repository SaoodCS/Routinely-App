import type { T_Tag, T_Task } from '@repo/types/app.types';
import { createContext, useContext, useState, type ReactNode } from 'react';

type T_FirestoreContext = {
   isLoading: boolean;
   morningTasks: T_Task[];
   eveningTasks: T_Task[];
   tags: T_Tag[];
   setMorningTasks: (value: T_FirestoreContext['morningTasks']) => Promise<void>;
   setEveningTasks: (value: T_FirestoreContext['eveningTasks']) => Promise<void>;
   setTags: (value: T_FirestoreContext['tags']) => Promise<void>;
   setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
};

const FirestoreContext = createContext<T_FirestoreContext>({
   isLoading: true,
   morningTasks: [],
   eveningTasks: [],
   tags: [],
   setMorningTasks: async () => {},
   setEveningTasks: async () => {},
   setTags: async () => {},
   setIsLoading: () => {},
});

export function FirestoreProvider({ children }: { children: ReactNode }): ReactNode {
   const [isLoading, setIsLoading] = useState<T_FirestoreContext['isLoading']>(true);
   const [morningTasks, setMorningTasksState] = useState<T_FirestoreContext['morningTasks']>([]);
   const [eveningTasks, setEveningTasksState] = useState<T_FirestoreContext['eveningTasks']>([]);
   const [tags, setTagsState] = useState<T_FirestoreContext['tags']>([]);

   async function setMorningTasks(value: T_FirestoreContext['morningTasks']): Promise<void> {
      setMorningTasksState(value);
   }
   async function setEveningTasks(value: T_FirestoreContext['eveningTasks']): Promise<void> {
      setMorningTasksState(value);
   }
   async function setTags(value: T_FirestoreContext['tags']): Promise<void> {
      setMorningTasksState(value);
   }

   const value = { isLoading, morningTasks, eveningTasks, tags, setMorningTasks, setEveningTasks, setTags, setIsLoading };
   return <FirestoreContext value={value}>{children}</FirestoreContext>;
}

export const useFirestoreContext = (): T_FirestoreContext => useContext(FirestoreContext);
