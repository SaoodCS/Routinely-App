import { Alert, Snackbar } from '@mui/material';
import type { AppTypes } from '@repo/types/index';
import type { Unsubscribe } from 'firebase/auth';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { AppUtils } from '@repo/utils/index';
import { useAuthContext } from '../authentication/useAuthContext';
import SpinnerLoader from '../components/SpinnerLoader';
import { db } from '../firebase/config';

type T_FirestoreContext = {
   morningTasks: AppTypes.Task[];
   eveningTasks: AppTypes.Task[];
   tags: AppTypes.Tag[];
   shoppingList: AppTypes.ShoppingItem[];
   settings: AppTypes.Settings;
   setMorningTasksDb: (value: T_FirestoreContext['morningTasks']) => void;
   setEveningTasksDb: (value: T_FirestoreContext['eveningTasks']) => void;
   setTagsDb: (value: T_FirestoreContext['tags']) => void;
   setShoppingListDb: (value: T_FirestoreContext['shoppingList']) => void;
   setSettingsDb: (value: T_FirestoreContext['settings']) => void;
};

const FirestoreContext = createContext<T_FirestoreContext>({
   morningTasks: [],
   eveningTasks: [],
   tags: [],
   shoppingList: [],
   settings: {},
   setMorningTasksDb: () => {},
   setEveningTasksDb: () => {},
   setTagsDb: () => {},
   setShoppingListDb: () => {},
   setSettingsDb: () => {},
});

function FirestoreContextProvider({ children }: { children: ReactNode }): ReactNode {
   const { uid } = useAuthContext().user ?? {};
   const [morningTasks, setMorningTasksDbState] = useState<T_FirestoreContext['morningTasks']>([]);
   const [eveningTasks, setEveningTasksDbState] = useState<T_FirestoreContext['eveningTasks']>([]);
   const [tags, setTagsDbState] = useState<T_FirestoreContext['tags']>([]);
   const [shoppingList, setShoppingListDbState] = useState<T_FirestoreContext['shoppingList']>([]);
   const [settings, setSettingsDbState] = useState<T_FirestoreContext['settings']>({});
   const [error, setError] = useState<string | undefined>(undefined);
   const [initialFetchDone, setInitialFetchDone] = useState<Record<AppTypes.FirestorePathField, boolean>>({
      routine_morning_tasks: false,
      routine_evening_tasks: false,
      tags_list_tags: false,
      shoppingList_list_shopping: false,
      settings_app_settings: false,
   });
   const isInitialFetchLoading = useMemo(() => !!uid && !Object.values(initialFetchDone).every(Boolean), [initialFetchDone, uid]);

   // useEffect for getting Firestore data via snapshot listeners
   useEffect(() => {
      if (!uid) return;

      const createOnSnapshot = <T_Val,>(path: AppTypes.FirestorePathField, setState: (val: T_Val) => void, fallbackValue: T_Val): Unsubscribe => {
         const { path: pathStr, field } = AppUtils.getFirestorePathAndField(path, uid);
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
         createOnSnapshot<typeof morningTasks>('routine_morning_tasks', setMorningTasksDbState, []),
         createOnSnapshot<typeof eveningTasks>('routine_evening_tasks', setEveningTasksDbState, []),
         createOnSnapshot<typeof tags>('tags_list_tags', setTagsDbState, []),
         createOnSnapshot<typeof shoppingList>('shoppingList_list_shopping', setShoppingListDbState, []),
         createOnSnapshot<typeof settings>('settings_app_settings', setSettingsDbState, {}),
      ];

      return () => unsubscribers.forEach((unsub) => unsub());
   }, [uid]);

   // functions for setting Firestore data via setDoc
   const createDocSetter = useCallback(
      <T_Val extends T_FirestoreContext[keyof T_FirestoreContext]>(pathField: AppTypes.FirestorePathField) => {
         return (value: T_Val): void => {
            if (!uid) return;
            const { path, field } = AppUtils.getFirestorePathAndField(pathField, uid);
            setDoc(doc(db, path), { [field]: value }, { merge: true }).catch((e) =>
               setError(e instanceof Error ? e.message : `Error saving ${field}`),
            );
         };
      },
      [uid],
   );
   const setMorningTasksDb = useMemo(() => createDocSetter<typeof morningTasks>('routine_morning_tasks'), [createDocSetter]);
   const setEveningTasksDb = useMemo(() => createDocSetter<typeof eveningTasks>('routine_evening_tasks'), [createDocSetter]);
   const setTagsDb = useMemo(() => createDocSetter<typeof tags>('tags_list_tags'), [createDocSetter]);
   const setShoppingListDb = useMemo(() => createDocSetter<typeof shoppingList>('shoppingList_list_shopping'), [createDocSetter]);
   const setSettingsDb = useMemo(() => createDocSetter<typeof settings>('settings_app_settings'), [createDocSetter]);

   // memoize context values to prevent unnecessary re-renders
   const value: T_FirestoreContext = useMemo(
      () => ({
         morningTasks,
         eveningTasks,
         tags,
         shoppingList,
         settings,
         setMorningTasksDb,
         setEveningTasksDb,
         setTagsDb,
         setShoppingListDb,
         setSettingsDb,
      }),
      [morningTasks, eveningTasks, tags, shoppingList, settings, setMorningTasksDb, setEveningTasksDb, setTagsDb, setShoppingListDb, setSettingsDb],
   );

   return (
      <>
         {isInitialFetchLoading && <SpinnerLoader fullPage sx={{ position: 'absolute', top: 0, width: '100%' }} />}
         <Snackbar open={!!error} autoHideDuration={2000} onClose={() => setError('')}>
            <Alert severity="error">{error}</Alert>
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
