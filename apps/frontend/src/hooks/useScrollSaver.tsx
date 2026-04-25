import { useEffect, useRef } from 'react';

interface IUseScrollSaverReturned {
   ref: React.RefObject<HTMLDivElement>;
   handleOnScroll: () => void;
   scrollToTop: (smooth?: boolean) => void;
   scrollSaverStyle: React.CSSProperties;
}

export default function useScrollSaver(storageId: string, enabled: boolean = true): IUseScrollSaverReturned {
   const ref = useRef<HTMLDivElement>(null);

   useEffect(() => {
      if (ref) {
         const scrollPos = sessionStorage.getItem(`${storageId}.scrollPos`);
         if (scrollPos && ref.current) {
            ref.current.scrollTop = parseInt(scrollPos);
         }
      }
   }, [ref.current]);

   function handleOnScroll(): void {
      if (ref.current) {
         const scrollPos = ref.current.scrollTop;
         sessionStorage.setItem(`${storageId}.scrollPos`, scrollPos.toString());
      }
   }

   function scrollToTop(smooth?: boolean): void {
      sessionStorage.setItem(`${storageId}.scrollPos`, '0');
      if (ref.current) {
         if (smooth) {
            ref.current.scrollTo({
               top: 0,
               behavior: 'smooth',
            });
         } else {
            ref.current.scrollTop = 0;
         }
      }
   }

   const scrollSaverStyle = {
      overflow: 'scroll',
   };

   return {
      ref: enabled ? ref : { current: null },
      handleOnScroll: enabled ? handleOnScroll : () => {},
      scrollToTop: enabled ? scrollToTop : () => {},
      scrollSaverStyle: enabled ? scrollSaverStyle : {},
   };
}
