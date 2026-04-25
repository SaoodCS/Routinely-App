import { useCallback, useRef } from 'react';
import type { RefCallback } from 'react';

interface T_UseScrollSaverReturned {
   ref: RefCallback<HTMLDivElement>;
}

export default function useScrollSaver(storageId: string, enabled: boolean = true): T_UseScrollSaverReturned {
   const elementRef = useRef<HTMLDivElement | null>(null);
   const storageKey = `${storageId}.scrollPos`;

   const saveScrollPosition = useCallback((): void => {
      if (!elementRef.current) return;
      sessionStorage.setItem(storageKey, elementRef.current.scrollTop.toString());
   }, [storageKey]);

   const detachElement = useCallback((): void => {
      if (!elementRef.current) return;
      elementRef.current.removeEventListener('scroll', saveScrollPosition);
      elementRef.current = null;
   }, [saveScrollPosition]);

   const ref = useCallback<RefCallback<HTMLDivElement>>(
      (element) => {
         detachElement();
         if (!enabled || !element) return;
         const scrollPos = sessionStorage.getItem(storageKey);
         const savedScrollTop = scrollPos ? Number.parseInt(scrollPos, 10) : 0;
         elementRef.current = element;
         if (!Number.isNaN(savedScrollTop)) element.scrollTop = savedScrollTop;
         element.addEventListener('scroll', saveScrollPosition);
      },
      [detachElement, enabled, saveScrollPosition, storageKey],
   );

   return { ref };
}
