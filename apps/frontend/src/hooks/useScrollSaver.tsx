import { useCallback, useEffect, useRef } from 'react';
import type { CSSProperties, RefObject } from 'react';

interface IUseScrollSaverReturned {
   ref: RefObject<HTMLDivElement | null>;
   handleOnScroll: () => void;
   scrollToTop: (smooth?: boolean) => void;
   scrollSaverStyle: CSSProperties;
}

const scrollSaverStyle: CSSProperties = { overflow: 'scroll' };
const disabledScrollSaverStyle: CSSProperties = {};
const disabledRef: RefObject<HTMLDivElement | null> = { current: null };

export default function useScrollSaver(storageId: string, enabled: boolean = true): IUseScrollSaverReturned {
   const ref = useRef<HTMLDivElement>(null);

   useEffect(() => {
      if (!enabled) return;
      const scrollPos = sessionStorage.getItem(`${storageId}.scrollPos`);
      const savedScrollTop = scrollPos ? Number.parseInt(scrollPos, 10) : 0;
      if (!Number.isNaN(savedScrollTop) && ref.current) ref.current.scrollTop = savedScrollTop;
   }, [enabled, storageId]);

   const handleOnScroll = useCallback((): void => {
      if (!enabled || !ref.current) return;
      sessionStorage.setItem(`${storageId}.scrollPos`, ref.current.scrollTop.toString());
   }, [enabled, storageId]);

   const scrollToTop = useCallback(
      (smooth?: boolean): void => {
         if (!enabled) return;
         sessionStorage.setItem(`${storageId}.scrollPos`, '0');
         if (ref.current) {
            if (smooth) ref.current.scrollTo({ top: 0, behavior: 'smooth' });
            else ref.current.scrollTop = 0;
         }
      },
      [enabled, storageId],
   );

   return {
      ref: enabled ? ref : disabledRef,
      handleOnScroll: enabled ? handleOnScroll : (): void => {},
      scrollToTop: enabled ? scrollToTop : (): void => {},
      scrollSaverStyle: enabled ? scrollSaverStyle : disabledScrollSaverStyle,
   };
}
