import type { T_Settings, T_Tag, T_Task } from '@repo/types/app.types';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { getFirestorePathAndField } from '@repo/utils/database.helper';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { useAuthContext } from '../auth/useAuthContext';
import { db } from '../firebase/config';

type T_FirestoreContext = {
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
   const { uid } = useAuthContext().user ?? {};
   const [morningTasks, setMorningTasksState] = useState<T_FirestoreContext['morningTasks']>([]);
   const [eveningTasks, setEveningTasksState] = useState<T_FirestoreContext['eveningTasks']>([]);
   const [tags, setTagsState] = useState<T_FirestoreContext['tags']>([]);
   const [settings, setSettingsState] = useState<T_FirestoreContext['settings']>({});

   useEffect(() => {
      if (!uid) return;
      const { path: morningPath, field: morningField } = getFirestorePathAndField('routine_morning_tasks', uid);
      const unsubMorningRoutine = onSnapshot(
         doc(db, morningPath),
         (snapshot) => setMorningTasksState((snapshot.data()?.[morningField] as typeof morningTasks) ?? []),
         console.error,
      );
      const { path: eveningPath, field: eveningField } = getFirestorePathAndField('routine_evening_tasks', uid);
      const unsubEveningRoutine = onSnapshot(
         doc(db, eveningPath),
         (snapshot) => setEveningTasksState((snapshot.data()?.[eveningField] as typeof eveningTasks | undefined) ?? []),
         console.error,
      );
      const { path: tagsPath, field: tagsField } = getFirestorePathAndField('tags_list_tags', uid);
      const unsubTags = onSnapshot(
         doc(db, tagsPath),
         (snapshot) => setTagsState((snapshot.data()?.[tagsField] as typeof tags | undefined) ?? []),
         console.error,
      );
      const { path: settingsPath, field: settingsField } = getFirestorePathAndField('settings_app_settings', uid);
      const unsubSettings = onSnapshot(
         doc(db, settingsPath),
         (snapshot) => setSettingsState((snapshot.data()?.[settingsField] as typeof settings | undefined) ?? {}),
         console.error,
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
         morningTasks: uid ? morningTasks : [],
         eveningTasks: uid ? eveningTasks : [],
         tags: uid ? tags : [],
         settings: uid ? settings : {},
         setMorningTasks,
         setEveningTasks,
         setTags,
         setSettings,
      }),
      [uid, morningTasks, eveningTasks, tags, settings, setMorningTasks, setEveningTasks, setTags, setSettings],
   );
   return <FirestoreContext value={value}>{children}</FirestoreContext>;
}

export const useFirestoreContext = (): T_FirestoreContext => useContext(FirestoreContext);
