import { useCallback, useEffect, useState } from 'react';

export type SetValue<T> = (value: T) => void;
type UseSessionStorage<T> = [T, SetValue<T>];

export default function useSessionStorage<T>(key: string, initialValue: T): UseSessionStorage<T> {
   const [storedValue, setStoredValue] = useState<T>(() => {
      try {
         const item = window.sessionStorage.getItem(key);
         if (!item) return initialValue;
         return JSON.parse(item) as T;
      } catch (error) {
         console.error('Error retrieving data from session storage:', error);
         return initialValue;
      }
   });

   const setValue: SetValue<T> = useCallback(
      (value) => {
         try {
            const newValue = JSON.stringify(value);
            window.sessionStorage.setItem(key, newValue);
            window.dispatchEvent(new StorageEvent('storage', { key, newValue, storageArea: window.sessionStorage }));
         } catch (error) {
            console.error('Error storing data in session storage:', error);
         }
      },
      [key],
   );

   useEffect(() => {
      function handleStorageChange(event: StorageEvent): void {
         if (event.storageArea === window.sessionStorage && event.key === key && event.newValue) {
            try {
               setStoredValue(JSON.parse(event.newValue) as T);
            } catch (error) {
               console.error('Error parsing session storage event value:', error);
            }
         }
      }
      window.addEventListener('storage', handleStorageChange);
      return () => window.removeEventListener('storage', handleStorageChange);
   }, [key]);

   return [storedValue, setValue];
}
