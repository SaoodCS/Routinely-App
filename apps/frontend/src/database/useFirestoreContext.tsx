import type { T_Settings, T_Tag, T_Task } from '@repo/types/app.types';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { getFirestorePathAndField } from '@repo/utils/database.helper';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { useAuthContext } from '../auth/useAuthContext';
import { db } from '../firebase/config';

type T_FirestoreContext = {
   isSnapshotLoading: boolean | undefined;
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
   isSnapshotLoading: undefined,
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
   const [isSnapshotLoading, setIsSnapshotLoading] = useState<T_FirestoreContext['isSnapshotLoading']>();
   const { uid } = useAuthContext().user ?? {};
   const [morningTasks, setMorningTasksState] = useState<T_FirestoreContext['morningTasks']>([]);
   const [eveningTasks, setEveningTasksState] = useState<T_FirestoreContext['eveningTasks']>([]);
   const [tags, setTagsState] = useState<T_FirestoreContext['tags']>([]);
   const [settings, setSettingsState] = useState<T_FirestoreContext['settings']>({});

   useEffect(() => {
      if (!uid) return;
      const { path: morningPath, field: morningField } = getFirestorePathAndField('routine_morning_tasks', uid);
      const unsubMorningRoutine = onSnapshot(doc(db, morningPath), (snapshot) => {
         setIsSnapshotLoading(true);
         const data = snapshot.data()?.[morningField] as T_FirestoreContext['morningTasks'] | undefined;
         if (data) setMorningTasksState(data);
         setIsSnapshotLoading(false);
      });
      const { path: eveningPath, field: eveningField } = getFirestorePathAndField('routine_evening_tasks', uid);
      const unsubEveningRoutine = onSnapshot(doc(db, eveningPath), (snapshot) => {
         setIsSnapshotLoading(true);
         const data = snapshot.data()?.[eveningField] as T_FirestoreContext['eveningTasks'] | undefined;
         if (data) setEveningTasksState(data);
         setIsSnapshotLoading(false);
      });
      const { path: tagsPath, field: tagsField } = getFirestorePathAndField('tags_list_tags', uid);
      const unsubTags = onSnapshot(doc(db, tagsPath), (snapshot) => {
         setIsSnapshotLoading(true);
         const data = snapshot.data()?.[tagsField] as T_FirestoreContext['tags'] | undefined;
         if (data) setTagsState(data);
         setIsSnapshotLoading(false);
      });
      const { path: settingsPath, field: settingsField } = getFirestorePathAndField('settings_app_settings', uid);
      const unsubSettings = onSnapshot(doc(db, settingsPath), (snapshot) => {
         setIsSnapshotLoading(true);
         const data = snapshot.data()?.[settingsField] as T_FirestoreContext['settings'] | undefined;
         if (data) setSettingsState(data);
         setIsSnapshotLoading(false);
      });
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
         isSnapshotLoading: uid ? isSnapshotLoading : undefined,
         morningTasks: uid ? morningTasks : [],
         eveningTasks: uid ? eveningTasks : [],
         tags: uid ? tags : [],
         settings: uid ? settings : {},
         setMorningTasks,
         setEveningTasks,
         setTags,
         setSettings,
      }),
      [uid, isSnapshotLoading, morningTasks, eveningTasks, tags, settings, setMorningTasks, setEveningTasks, setTags, setSettings],
   );
   return <FirestoreContext value={value}>{children}</FirestoreContext>;
}

export const useFirestoreContext = (): T_FirestoreContext => useContext(FirestoreContext);
