import type { T_Settings, T_Tag, T_Task } from '@repo/types/app.types';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { getFirestorePathAndField, type FIRESTORE_PATHS } from '@repo/utils/database.helper';

import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { useAuthContext } from '../auth/useAuthContext';
import { db } from '../firebase/config';

type T_FirestoreContext = {
   isLoading: keyof typeof FIRESTORE_PATHS | undefined;
   morningTasks: T_Task[];
   eveningTasks: T_Task[];
   tags: T_Tag[];
   settings: T_Settings;
   setMorningTasks: (value: T_FirestoreContext['morningTasks']) => Promise<void>;
   setEveningTasks: (value: T_FirestoreContext['eveningTasks']) => Promise<void>;
   setTags: (value: T_FirestoreContext['tags']) => Promise<void>;
   setSettings: (value: T_FirestoreContext['settings']) => Promise<void>;
};

const FirestoreContext = createContext<T_FirestoreContext>({
   isLoading: undefined,
   morningTasks: [],
   eveningTasks: [],
   tags: [],
   settings: {},
   setMorningTasks: async () => {},
   setEveningTasks: async () => {},
   setTags: async () => {},
   setSettings: async () => {},
});

export function FirestoreProvider({ children }: { children: ReactNode }): ReactNode {
   const [isLoading, setIsLoading] = useState<T_FirestoreContext['isLoading']>();
   const { user } = useAuthContext();
   const [morningTasks, setMorningTasksState] = useState<T_FirestoreContext['morningTasks']>([]);
   const [eveningTasks, setEveningTasksState] = useState<T_FirestoreContext['eveningTasks']>([]);
   const [tags, setTagsState] = useState<T_FirestoreContext['tags']>([]);
   const [settings, setSettingsState] = useState<T_FirestoreContext['settings']>({});

   useEffect(() => {
      if (!user?.uid) return;
      const { path: morningPath, field: morningField } = getFirestorePathAndField('settings_app_settings', user.uid);
      const unsubMorningRoutine = onSnapshot(doc(db, morningPath), (snapshot) => {
         setIsLoading('routine_morning_tasks');
         const data = snapshot.data()?.[morningField] as T_FirestoreContext['morningTasks'] | undefined;
         if (data) setMorningTasksState(data);
         setIsLoading(undefined);
      });
      const { path: eveningPath, field: eveningField } = getFirestorePathAndField('settings_app_settings', user.uid);
      const unsubEveningRoutine = onSnapshot(doc(db, eveningPath), (snapshot) => {
         setIsLoading('routine_evening_tasks');
         const data = snapshot.data()?.[eveningField] as T_FirestoreContext['eveningTasks'] | undefined;
         if (data) setEveningTasksState(data);
         setIsLoading(undefined);
      });
      const { path: tagsPath, field: tagsField } = getFirestorePathAndField('settings_app_settings', user.uid);
      const unsubTags = onSnapshot(doc(db, tagsPath), (snapshot) => {
         setIsLoading('tags_list_tags');
         const data = snapshot.data()?.[tagsField] as T_FirestoreContext['tags'] | undefined;
         if (data) setTagsState(data);
         setIsLoading(undefined);
      });
      const { path: settingsPath, field: settingsField } = getFirestorePathAndField('settings_app_settings', user.uid);
      const unsubSettings = onSnapshot(doc(db, settingsPath), (snapshot) => {
         setIsLoading('settings_app_settings');
         const data = snapshot.data()?.[settingsField] as T_FirestoreContext['settings'] | undefined;
         if (data) setSettingsState(data);
         setIsLoading(undefined);
      });
      return () => {
         unsubMorningRoutine();
         unsubEveningRoutine();
         unsubTags();
         unsubSettings();
      };
   }, [user?.uid]);

   const setMorningTasks = useCallback(
      async (value: T_FirestoreContext['morningTasks']): Promise<void> => {
         if (!user?.uid) return;
         setIsLoading('routine_morning_tasks');
         const { path, field } = getFirestorePathAndField('routine_morning_tasks', user.uid);
         await setDoc(doc(db, path), { [field]: value }, { merge: true });
         setMorningTasksState(value);
         setIsLoading(undefined);
      },
      [user],
   );

   const setEveningTasks = useCallback(
      async (value: T_FirestoreContext['eveningTasks']): Promise<void> => {
         if (!user?.uid) return;
         setIsLoading('routine_evening_tasks');
         const { path, field } = getFirestorePathAndField('routine_evening_tasks', user.uid);
         await setDoc(doc(db, path), { [field]: value }, { merge: true });
         setEveningTasksState(value);
         setIsLoading(undefined);
      },
      [user],
   );

   const setTags = useCallback(
      async (value: T_FirestoreContext['tags']): Promise<void> => {
         if (!user?.uid) return;
         setIsLoading('tags_list_tags');
         const { path, field } = getFirestorePathAndField('tags_list_tags', user.uid);
         await setDoc(doc(db, path), { [field]: value }, { merge: true });
         setMorningTasksState(value);
         setIsLoading(undefined);
      },
      [user],
   );

   const setSettings = useCallback(
      async (value: T_FirestoreContext['settings']): Promise<void> => {
         if (!user?.uid) return;
         setIsLoading('settings_app_settings');
         const { path, field } = getFirestorePathAndField('settings_app_settings', user.uid);
         await setDoc(doc(db, path), { [field]: value }, { merge: true });
         setSettingsState(value);
         setIsLoading(undefined);
      },
      [user],
   );

   const value: T_FirestoreContext = useMemo(
      () => ({ isLoading, morningTasks, eveningTasks, tags, settings, setMorningTasks, setEveningTasks, setTags, setSettings }),
      [isLoading, morningTasks, eveningTasks, tags, settings, setMorningTasks, setEveningTasks, setTags, setSettings],
   );
   return <FirestoreContext value={value}>{children}</FirestoreContext>;
}

export const useFirestoreContext = (): T_FirestoreContext => useContext(FirestoreContext);
