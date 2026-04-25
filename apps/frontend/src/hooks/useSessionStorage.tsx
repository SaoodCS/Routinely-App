import { useEffect, useState } from 'react';

export type SetValue<T> = (value: T) => void;
type UseSessionStorage<T> = [T, SetValue<T>];

export default function useSessionStorage<T>(key: string, initialValue: T): UseSessionStorage<T> {
   const [storedValue, setStoredValue] = useState<T>(() => {
      try {
         const item = window.sessionStorage.getItem(key);
         return item ? JSON.parse(item) : initialValue;
      } catch (error) {
         console.error('Error retrieving data from session storage:', error);
         return initialValue;
      }
   });

   const setValue: SetValue<T> = (value) => {
      try {
         window.sessionStorage.setItem(key, JSON.stringify(value));
         window.dispatchEvent(
            new StorageEvent('storage', {
               key,
               newValue: JSON.stringify(value),
               storageArea: window.sessionStorage,
            }),
         );
      } catch (error) {
         console.error('Error storing data in session storage:', error);
      }
   };

   useEffect(() => {
      function handleChange(event: StorageEvent): void {
         if (event.storageArea === window.sessionStorage && event.key === key && event.newValue) {
            try {
               setStoredValue(JSON.parse(event.newValue));
            } catch (error) {
               console.error('Error parsing session storage event value:', error);
            }
         }
      }
      window.addEventListener('storage', handleChange);
      return () => window.removeEventListener('storage', handleChange);
   }, [key]);

   return [storedValue, setValue];
}
