import { useLayoutEffect, useRef } from 'react';
import type { RefObject } from 'react';

interface T_UseScrollSaverReturned {
   ref: RefObject<HTMLDivElement | null>;
}

export default function useScrollSaver(storageId: string, enabled: boolean = true): T_UseScrollSaverReturned {
   const ref = useRef<HTMLDivElement | null>(null);
   const storageKey = `${storageId}.scrollPos`;

   useLayoutEffect(() => {
      const element = ref.current;
      if (!enabled || !element) return;
      const scrollElement: HTMLDivElement = element;
      const scrollPos = sessionStorage.getItem(storageKey);
      const savedScrollTop = scrollPos ? Number.parseInt(scrollPos, 10) : 0;
      if (!Number.isNaN(savedScrollTop)) scrollElement.scrollTop = savedScrollTop;
      function handleScroll(): void {
         sessionStorage.setItem(storageKey, scrollElement.scrollTop.toString());
      }
      scrollElement.addEventListener('scroll', handleScroll);
      return () => scrollElement.removeEventListener('scroll', handleScroll);
   }, [enabled, storageKey]);

   return { ref };
}
