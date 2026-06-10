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
      let hasRestoredScrollPosition = Number.isNaN(savedScrollTop);
      let mutationObserver: MutationObserver | undefined;

      function restoreScrollPosition(): void {
         if (hasRestoredScrollPosition) return;
         scrollElement.scrollTop = savedScrollTop;
         if (scrollElement.scrollTop !== savedScrollTop) return;
         hasRestoredScrollPosition = true;
         mutationObserver?.disconnect();
      }

      function saveScrollPosition(): void {
         sessionStorage.setItem(storageKey, scrollElement.scrollTop.toString());
         hasRestoredScrollPosition = true;
         mutationObserver?.disconnect();
      }

      restoreScrollPosition();
      if (!hasRestoredScrollPosition) {
         mutationObserver = new MutationObserver(restoreScrollPosition);
         mutationObserver.observe(scrollElement, { childList: true, subtree: true });
      }
      scrollElement.addEventListener('scrollend', saveScrollPosition);
      return () => {
         scrollElement.removeEventListener('scrollend', saveScrollPosition);
         mutationObserver?.disconnect();
         if (hasRestoredScrollPosition) saveScrollPosition();
      };
   }, [enabled, storageKey]);

   return { ref };
}
