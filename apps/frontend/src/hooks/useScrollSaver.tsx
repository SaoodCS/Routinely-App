import { useCallback, useRef } from 'react';
import type { RefCallback } from 'react';

interface IUseScrollSaverReturned {
   ref: RefCallback<HTMLDivElement>;
   scrollToTop: (smooth?: boolean) => void;
}

export default function useScrollSaver(storageId: string, enabled: boolean = true): IUseScrollSaverReturned {
   const elementRef = useRef<HTMLDivElement | null>(null);
   const previousOverflowRef = useRef<string>('');
   const storageKey = `${storageId}.scrollPos`;

   const saveScrollPosition = useCallback((): void => {
      if (!elementRef.current) return;
      sessionStorage.setItem(storageKey, elementRef.current.scrollTop.toString());
   }, [storageKey]);

   const detachElement = useCallback((): void => {
      if (!elementRef.current) return;
      elementRef.current.removeEventListener('scroll', saveScrollPosition);
      elementRef.current.style.overflow = previousOverflowRef.current;
      elementRef.current = null;
   }, [saveScrollPosition]);

   const ref = useCallback<RefCallback<HTMLDivElement>>(
      (element) => {
         detachElement();
         if (!enabled || !element) return;
         const scrollPos = sessionStorage.getItem(storageKey);
         const savedScrollTop = scrollPos ? Number.parseInt(scrollPos, 10) : 0;
         previousOverflowRef.current = element.style.overflow;
         elementRef.current = element;
         element.style.overflow = 'scroll';
         if (!Number.isNaN(savedScrollTop)) element.scrollTop = savedScrollTop;
         element.addEventListener('scroll', saveScrollPosition);
      },
      [detachElement, enabled, saveScrollPosition, storageKey],
   );

   const scrollToTop = useCallback(
      (smooth?: boolean): void => {
         if (!enabled) return;
         sessionStorage.setItem(storageKey, '0');
         if (!elementRef.current) return;
         if (smooth) elementRef.current.scrollTo({ top: 0, behavior: 'smooth' });
         else elementRef.current.scrollTop = 0;
      },
      [enabled, storageKey],
   );

   return { ref, scrollToTop };
}
