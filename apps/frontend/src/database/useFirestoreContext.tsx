import type { T_Settings, T_Tag, T_Task } from '@repo/types/app.types';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { FIRESTORE_PATHS } from '@repo/utils/database.helper';
import { getFirestorePathAndField } from '@repo/utils/database.helper';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { useAuthContext } from '../auth/useAuthContext';
import { db } from '../firebase/config';

type T_FirestoreContext = {
   isInitialFetch: boolean;
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
   isInitialFetch: true,
   morningTasks: [],
   eveningTasks: [],
   tags: [],
   settings: {},
   setMorningTasks: async () => {},
   setEveningTasks: async () => {},
   setTags: async () => {},
   setSettings: async () => {},
});

function FirestoreContextProvider({ children }: { children: ReactNode }): ReactNode {
   const { uid } = useAuthContext().user ?? {};
   const [morningTasks, setMorningTasksState] = useState<T_FirestoreContext['morningTasks']>([]);
   const [eveningTasks, setEveningTasksState] = useState<T_FirestoreContext['eveningTasks']>([]);
   const [tags, setTagsState] = useState<T_FirestoreContext['tags']>([]);
   const [settings, setSettingsState] = useState<T_FirestoreContext['settings']>({});
   const [initiallyLoaded, setInitiallyLoaded] = useState<Record<keyof typeof FIRESTORE_PATHS, boolean>>({
      routine_morning_tasks: false,
      routine_evening_tasks: false,
      tags_list_tags: false,
      settings_app_settings: false,
   });

   useEffect(() => {
      if (!uid) return;
      const { path: morningPath, field: morningField } = getFirestorePathAndField('routine_morning_tasks', uid);
      const unsubMorningRoutine = onSnapshot(
         doc(db, morningPath),
         (snapshot) => {
            setMorningTasksState((snapshot.data()?.[morningField] as typeof morningTasks) ?? []);
            setInitiallyLoaded((prev) => (prev.routine_morning_tasks ? prev : { ...prev, routine_morning_tasks: true }));
         },
         () => setInitiallyLoaded((prev) => (prev.routine_morning_tasks ? prev : { ...prev, routine_morning_tasks: true })),
      );
      const { path: eveningPath, field: eveningField } = getFirestorePathAndField('routine_evening_tasks', uid);
      const unsubEveningRoutine = onSnapshot(
         doc(db, eveningPath),
         (snapshot) => {
            setEveningTasksState((snapshot.data()?.[eveningField] as typeof eveningTasks | undefined) ?? []);
            setInitiallyLoaded((prev) => (prev.routine_evening_tasks ? prev : { ...prev, routine_evening_tasks: true }));
         },
         () => setInitiallyLoaded((prev) => (prev.routine_evening_tasks ? prev : { ...prev, routine_evening_tasks: true })),
      );
      const { path: tagsPath, field: tagsField } = getFirestorePathAndField('tags_list_tags', uid);
      const unsubTags = onSnapshot(
         doc(db, tagsPath),
         (snapshot) => {
            setTagsState((snapshot.data()?.[tagsField] as typeof tags | undefined) ?? []);
            setInitiallyLoaded((prev) => (prev.tags_list_tags ? prev : { ...prev, tags_list_tags: true }));
         },
         () => setInitiallyLoaded((prev) => (prev.tags_list_tags ? prev : { ...prev, tags_list_tags: true })),
      );
      const { path: settingsPath, field: settingsField } = getFirestorePathAndField('settings_app_settings', uid);
      const unsubSettings = onSnapshot(
         doc(db, settingsPath),
         (snapshot) => {
            setSettingsState((snapshot.data()?.[settingsField] as typeof settings | undefined) ?? {});
            setInitiallyLoaded((prev) => (prev.settings_app_settings ? prev : { ...prev, settings_app_settings: true }));
         },
         () => setInitiallyLoaded((prev) => (prev.settings_app_settings ? prev : { ...prev, settings_app_settings: true })),
      );
      return () => {
         unsubMorningRoutine();
         unsubEveningRoutine();
         unsubTags();
         unsubSettings();
      };
   }, [uid]);

   const setMorningTasks = useCallback(
      async (value: T_FirestoreContext['morningTasks']): Promise<void> => {
         if (!uid) return;
         const { path, field } = getFirestorePathAndField('routine_morning_tasks', uid);
         await setDoc(doc(db, path), { [field]: value }, { merge: true });
         setMorningTasksState(value);
      },
      [uid],
   );

   const setEveningTasks = useCallback(
      async (value: T_FirestoreContext['eveningTasks']): Promise<void> => {
         if (!uid) return;
         const { path, field } = getFirestorePathAndField('routine_evening_tasks', uid);
         await setDoc(doc(db, path), { [field]: value }, { merge: true });
         setEveningTasksState(value);
      },
      [uid],
   );

   const setTags = useCallback(
      async (value: T_FirestoreContext['tags']): Promise<void> => {
         if (!uid) return;
         const { path, field } = getFirestorePathAndField('tags_list_tags', uid);
         await setDoc(doc(db, path), { [field]: value }, { merge: true });
         setTagsState(value);
      },
      [uid],
   );

   const setSettings = useCallback(
      async (value: T_FirestoreContext['settings']): Promise<void> => {
         if (!uid) return;
         const { path, field } = getFirestorePathAndField('settings_app_settings', uid);
         await setDoc(doc(db, path), { [field]: value }, { merge: true });
         setSettingsState(value);
      },
      [uid],
   );

   const value: T_FirestoreContext = useMemo(
      () => ({
         isInitialFetch: !!uid && !Object.values(initiallyLoaded).every(Boolean),
         morningTasks,
         eveningTasks,
         tags,
         settings,
         setMorningTasks,
         setEveningTasks,
         setTags,
         setSettings,
      }),
      [uid, initiallyLoaded, morningTasks, eveningTasks, tags, settings, setMorningTasks, setEveningTasks, setTags, setSettings],
   );
   return <FirestoreContext value={value}>{children}</FirestoreContext>;
}

// This is needed so that all states reset in FirestoreContextProvider when user's uid changes (prevents data leakage)
export function FirestoreProvider({ children }: { children: ReactNode }): ReactNode {
   const { uid } = useAuthContext().user ?? {};
   return <FirestoreContextProvider key={uid ?? 'not-authenticated'}>{children}</FirestoreContextProvider>;
}

export const useFirestoreContext = (): T_FirestoreContext => useContext(FirestoreContext);
