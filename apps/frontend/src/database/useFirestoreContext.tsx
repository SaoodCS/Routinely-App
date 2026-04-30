import type { T_Settings, T_Tag, T_Task } from '@repo/types/app.types';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { FIRESTORE_PATHS_AND_FIELDS } from '@repo/utils/firestore.helper';
import { getFirestorePathAndField } from '@repo/utils/firestore.helper';

import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { Alert, LinearProgress, Snackbar } from '@mui/material';
import { useAuthContext } from '../auth/useAuthContext';
import { db } from '../firebase/config';
// TODO: extract out logic for snapshot and useCallbacks

type T_FirestoreContext = {
   morningTasks: T_Task[];
   eveningTasks: T_Task[];
   tags: T_Tag[];
   settings: T_Settings;
   setMorningTasks: (value: T_FirestoreContext['morningTasks']) => void;
   setEveningTasks: (value: T_FirestoreContext['eveningTasks']) => void;
   setTags: (value: T_FirestoreContext['tags']) => void;
   setSettings: (value: T_FirestoreContext['settings']) => void;
};

const FirestoreContext = createContext<T_FirestoreContext>({
   morningTasks: [],
   eveningTasks: [],
   tags: [],
   settings: {},
   setMorningTasks: () => {},
   setEveningTasks: () => {},
   setTags: () => {},
   setSettings: () => {},
});

function FirestoreContextProvider({ children }: { children: ReactNode }): ReactNode {
   const { uid } = useAuthContext().user ?? {};
   const [morningTasks, setMorningTasksState] = useState<T_FirestoreContext['morningTasks']>([]);
   const [eveningTasks, setEveningTasksState] = useState<T_FirestoreContext['eveningTasks']>([]);
   const [tags, setTagsState] = useState<T_FirestoreContext['tags']>([]);
   const [settings, setSettingsState] = useState<T_FirestoreContext['settings']>({});
   const [initialFetchDone, setInitialFetchDone] = useState<Record<keyof typeof FIRESTORE_PATHS_AND_FIELDS, boolean>>({
      routine_morning_tasks: false,
      routine_evening_tasks: false,
      tags_list_tags: false,
      settings_app_settings: false,
   });
   const [error, setError] = useState<string | undefined>(undefined);
   const isInitialFetchLoading = useMemo(() => !!uid && !Object.values(initialFetchDone).every(Boolean), [initialFetchDone, uid]);

   useEffect(() => {
      if (!uid) return;
      const { path: morningPath, field: morningField } = getFirestorePathAndField('routine_morning_tasks', uid);
      const unsubMorningRoutine = onSnapshot(
         doc(db, morningPath),
         (snapshot) => {
            setMorningTasksState((snapshot.data()?.[morningField] as typeof morningTasks) ?? []);
            setInitialFetchDone((prev) => (prev.routine_morning_tasks ? prev : { ...prev, routine_morning_tasks: true }));
         },
         (e) => {
            console.error(e);
            setInitialFetchDone((prev) => (prev.routine_morning_tasks ? prev : { ...prev, routine_morning_tasks: true }));
            setError(e.message);
         },
      );
      const { path: eveningPath, field: eveningField } = getFirestorePathAndField('routine_evening_tasks', uid);
      const unsubEveningRoutine = onSnapshot(
         doc(db, eveningPath),
         (snapshot) => {
            setEveningTasksState((snapshot.data()?.[eveningField] as typeof eveningTasks | undefined) ?? []);
            setInitialFetchDone((prev) => (prev.routine_evening_tasks ? prev : { ...prev, routine_evening_tasks: true }));
         },
         (e) => {
            console.error(e);
            setInitialFetchDone((prev) => (prev.routine_evening_tasks ? prev : { ...prev, routine_evening_tasks: true }));
            setError(e.message);
         },
      );
      const { path: tagsPath, field: tagsField } = getFirestorePathAndField('tags_list_tags', uid);
      const unsubTags = onSnapshot(
         doc(db, tagsPath),
         (snapshot) => {
            setTagsState((snapshot.data()?.[tagsField] as typeof tags | undefined) ?? []);
            setInitialFetchDone((prev) => (prev.tags_list_tags ? prev : { ...prev, tags_list_tags: true }));
         },
         (e) => {
            console.error(e);
            setInitialFetchDone((prev) => (prev.tags_list_tags ? prev : { ...prev, tags_list_tags: true }));
            setError(e.message);
         },
      );
      const { path: settingsPath, field: settingsField } = getFirestorePathAndField('settings_app_settings', uid);
      const unsubSettings = onSnapshot(
         doc(db, settingsPath),
         (snapshot) => {
            setSettingsState((snapshot.data()?.[settingsField] as typeof settings | undefined) ?? {});
            setInitialFetchDone((prev) => (prev.settings_app_settings ? prev : { ...prev, settings_app_settings: true }));
         },
         (e) => {
            console.error(e);
            setInitialFetchDone((prev) => (prev.settings_app_settings ? prev : { ...prev, settings_app_settings: true }));
            setError(e.message);
         },
      );
      return () => {
         unsubMorningRoutine();
         unsubEveningRoutine();
         unsubTags();
         unsubSettings();
      };
   }, [uid]);

   const createFSSetter = useCallback(
      <T_Val extends T_FirestoreContext[keyof T_FirestoreContext]>(path: keyof typeof FIRESTORE_PATHS_AND_FIELDS) =>
         (value: T_Val): void => {
            if (!uid) return;
            const { path: pathStr, field } = getFirestorePathAndField(path, uid);
            setDoc(doc(db, pathStr), { [field]: value }, { merge: true }).catch((e) => {
               setError(e instanceof Error ? e.message : `Error saving ${field}`);
               console.error(e);
            });
         },
      [uid],
   );

   const setMorningTasks = useMemo(() => createFSSetter<typeof morningTasks>('routine_morning_tasks'), [createFSSetter]);
   const setEveningTasks = useMemo(() => createFSSetter<typeof eveningTasks>('routine_evening_tasks'), [createFSSetter]);
   const setTags = useMemo(() => createFSSetter<typeof tags>('tags_list_tags'), [createFSSetter]);
   const setSettings = useMemo(() => createFSSetter<typeof settings>('settings_app_settings'), [createFSSetter]);

   const value: T_FirestoreContext = useMemo(
      () => ({
         morningTasks,
         eveningTasks,
         tags,
         settings,
         setMorningTasks,
         setEveningTasks,
         setTags,
         setSettings,
      }),
      [morningTasks, eveningTasks, tags, settings, setMorningTasks, setEveningTasks, setTags, setSettings],
   );
   return (
      <>
         {isInitialFetchLoading && <LinearProgress sx={{ position: 'absolute', top: 0, width: '100%' }} />}
         <Snackbar open={!!error} autoHideDuration={2000} onClose={() => setError('')}>
            <Alert severity="error" sx={{ width: '100%' }}>
               {error}
            </Alert>
         </Snackbar>
         <FirestoreContext value={value}>{children}</FirestoreContext>
      </>
   );
}
// This is needed so that all states reset in FirestoreContextProvider when user's uid changes (prevents data leakage)
export function FirestoreProvider({ children }: { children: ReactNode }): ReactNode {
   const { uid } = useAuthContext().user ?? {};
   return <FirestoreContextProvider key={uid ?? 'not-authenticated'}>{children}</FirestoreContextProvider>;
}
export const useFirestoreContext = (): T_FirestoreContext => useContext(FirestoreContext);
