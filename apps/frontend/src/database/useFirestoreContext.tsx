import type { T_Settings, T_Tag, T_Task } from '@repo/types/app.types';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { FIRESTORE_PATHS_AND_FIELDS } from '@repo/utils/firestore.helper';
import { getFirestorePathAndField } from '@repo/utils/firestore.helper';

import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { Alert, LinearProgress, Snackbar } from '@mui/material';
import { useAuthContext } from '../auth/useAuthContext';
import { db } from '../firebase/config';

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
   const isInitialFetchLoading = useMemo(() => !!uid && !Object.values(initialFetchDone).every(Boolean), [initialFetchDone, uid]);

   // useEffect for getting Firestore data via snapshot listeners
   useEffect(() => {
      if (!uid) return;

      const createOnSnapshot = <T_Val,>(path: keyof typeof FIRESTORE_PATHS_AND_FIELDS, setState: (val: T_Val) => void, fallbackValue: T_Val) => {
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
      };

      const unsubscribers = [
         createOnSnapshot<typeof morningTasks>('routine_morning_tasks', setMorningTasksState, []),
         createOnSnapshot<typeof eveningTasks>('routine_evening_tasks', setEveningTasksState, []),
         createOnSnapshot<typeof tags>('tags_list_tags', setTagsState, []),
         createOnSnapshot<typeof settings>('settings_app_settings', setSettingsState, {}),
      ];

      return () => unsubscribers.forEach((unsub) => unsub());
   }, [uid]);

   // functions for setting Firestore data via setDoc
   const createDocSetter = useCallback(
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
   const setMorningTasks = useMemo(() => createDocSetter<typeof morningTasks>('routine_morning_tasks'), [createDocSetter]);
   const setEveningTasks = useMemo(() => createDocSetter<typeof eveningTasks>('routine_evening_tasks'), [createDocSetter]);
   const setTags = useMemo(() => createDocSetter<typeof tags>('tags_list_tags'), [createDocSetter]);
   const setSettings = useMemo(() => createDocSetter<typeof settings>('settings_app_settings'), [createDocSetter]);

   // memoize context values to prevent unnecessary re-renders
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

export function FirestoreProvider({ children }: { children: ReactNode }): ReactNode {
   const { uid } = useAuthContext().user ?? {};
   // set the key to uid to ensure context resets when user signs out / new user signs in
   return <FirestoreContextProvider key={uid ?? 'not-authenticated'}>{children}</FirestoreContextProvider>;
}

export const useFirestoreContext = (): T_FirestoreContext => useContext(FirestoreContext);
