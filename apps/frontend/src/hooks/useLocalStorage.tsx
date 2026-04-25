import { useState, useEffect } from 'react';

export type SetValue<T> = (value: T) => void;
type UseLocalStorage<T> = [T, SetValue<T>];

export default function useLocalStorage<T>(key: string, initialValue: T): UseLocalStorage<T> {
   const [storedValue, setStoredValue] = useState<T>(() => {
      try {
         const item = window.localStorage.getItem(key);
         return item ? JSON.parse(item) : initialValue;
      } catch (error) {
         console.error('Error retrieving data from local storage:', error);
         return initialValue;
      }
   });

   const setValue: SetValue<T> = (value) => {
      try {
         window.localStorage.setItem(key, JSON.stringify(value));
         window.dispatchEvent(
            new StorageEvent('storage', {
               key,
               newValue: JSON.stringify(value),
               storageArea: window.localStorage,
            }),
         );
      } catch (error) {
         console.error('Error storing data in local storage:', error);
      }
   };

   useEffect(() => {
      const handleStorageChange = (event: StorageEvent): void => {
         if (event.storageArea === window.localStorage && event.key === key && event.newValue) {
            try {
               setStoredValue(JSON.parse(event.newValue));
            } catch (error) {
               console.error('Error parsing local storage event value:', error);
            }
         }
      };

      window.addEventListener('storage', handleStorageChange);
      return () => {
         window.removeEventListener('storage', handleStorageChange);
      };
   }, [key]);

   return [storedValue, setValue];
}
