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
   const [error, setError] = useState<string | undefined>(undefined);
   const [initialFetchDone, setInitialFetchDone] = useState<Record<keyof typeof FIRESTORE_PATHS_AND_FIELDS, boolean>>({
      routine_morning_tasks: false,
      routine_evening_tasks: false,
      tags_list_tags: false,
      settings_app_settings: false,
   });

   const createFSSetter = useCallback(
      <T_Val extends T_FirestoreContext[keyof T_FirestoreContext]>(pathField: keyof typeof FIRESTORE_PATHS_AND_FIELDS) => {
         return (value: T_Val): void => {
            if (!uid) return;
            const { path, field } = getFirestorePathAndField(pathField, uid);
            setDoc(doc(db, path), { [field]: value }, { merge: true }).catch((e) =>
               setError(e instanceof Error ? e.message : `Error saving ${field}`),
            );
         };
      },
      [uid],
   );

   const createFSSnapshot = useCallback(
      <T_Val,>(path: keyof typeof FIRESTORE_PATHS_AND_FIELDS, setState: (val: T_Val) => void, fallbackValue: T_Val, uid: string) => {
         const { path: pathStr, field } = getFirestorePathAndField(path, uid);
         return onSnapshot(
            doc(db, pathStr),
            (snapshot) => {
               setState((snapshot.data()?.[field] as T_Val | undefined) ?? fallbackValue);
               setInitialFetchDone((prev) => (prev[path] ? prev : { ...prev, [path]: true }));
            },
            (e) => {
               setInitialFetchDone((prev) => (prev[path] ? prev : { ...prev, [path]: true }));
               setError(e instanceof Error ? e.message : `Error fetching ${field}`);
            },
         );
      },
      [],
   );

   const isInitialFetchLoading = useMemo(() => !!uid && !Object.values(initialFetchDone).every(Boolean), [initialFetchDone, uid]);
   const setMorningTasks = useMemo(() => createFSSetter<typeof morningTasks>('routine_morning_tasks'), [createFSSetter]);
   const setEveningTasks = useMemo(() => createFSSetter<typeof eveningTasks>('routine_evening_tasks'), [createFSSetter]);
   const setTags = useMemo(() => createFSSetter<typeof tags>('tags_list_tags'), [createFSSetter]);
   const setSettings = useMemo(() => createFSSetter<typeof settings>('settings_app_settings'), [createFSSetter]);

   useEffect(() => {
      if (!uid) return;
      const unsubscribers = [
         createFSSnapshot<typeof morningTasks>('routine_morning_tasks', setMorningTasksState, [], uid),
         createFSSnapshot<typeof eveningTasks>('routine_evening_tasks', setEveningTasksState, [], uid),
         createFSSnapshot<typeof tags>('tags_list_tags', setTagsState, [], uid),
         createFSSnapshot<typeof settings>('settings_app_settings', setSettingsState, {}, uid),
      ];
      return () => unsubscribers.forEach((unsub) => unsub());
   }, [uid, createFSSnapshot]);

   const value: T_FirestoreContext = useMemo(
      () => ({ morningTasks, eveningTasks, tags, settings, setMorningTasks, setEveningTasks, setTags, setSettings }),
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
