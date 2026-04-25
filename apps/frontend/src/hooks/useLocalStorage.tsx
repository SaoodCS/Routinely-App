import { useCallback, useEffect, useState } from 'react';

export type SetValue<T> = (value: T) => void;
type UseLocalStorage<T> = [T, SetValue<T>];

export default function useLocalStorage<T>(key: string, initialValue: T): UseLocalStorage<T> {
   const [storedValue, setStoredValue] = useState<T>(() => {
      try {
         const item = window.localStorage.getItem(key);
         if (!item) return initialValue;
         return JSON.parse(item) as T;
      } catch (error) {
         console.error('Error retrieving data from local storage:', error);
         return initialValue;
      }
   });

   const setValue: SetValue<T> = useCallback(
      (value) => {
         try {
            const newValue = JSON.stringify(value);
            window.localStorage.setItem(key, newValue);
            window.dispatchEvent(new StorageEvent('storage', { key, newValue, storageArea: window.localStorage }));
         } catch (error) {
            console.error('Error storing data in local storage:', error);
         }
      },
      [key],
   );

   useEffect(() => {
      const handleStorageChange = (event: StorageEvent): void => {
         if (event.storageArea === window.localStorage && event.key === key && event.newValue) {
            try {
               setStoredValue(JSON.parse(event.newValue) as T);
            } catch (error) {
               console.error('Error parsing local storage event value:', error);
            }
         }
      };
      window.addEventListener('storage', handleStorageChange);
      return () => window.removeEventListener('storage', handleStorageChange);
   }, [key]);

   return [storedValue, setValue];
}
