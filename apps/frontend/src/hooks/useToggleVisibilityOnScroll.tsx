import { useLayoutEffect, useRef, type RefObject } from 'react';

interface T_ToggleVisibilityOnScrollReturn {
   ref: RefObject<HTMLDivElement | null>;
}

export default function useToggleVisibilityOnScroll(scrollElRef: RefObject<HTMLDivElement | null>): T_ToggleVisibilityOnScrollReturn {
   const ref = useRef<HTMLDivElement | null>(null);

   useLayoutEffect(() => {
      const scrollEl = scrollElRef.current;
      const element = ref.current;
      if (!scrollEl || !element) return;
      const scrollElement: HTMLDivElement = scrollEl;
      const toggleElement: HTMLDivElement = element;
      let previousScrollTop = scrollElement.scrollTop;
      let hiddenOffset = 0;
      let snapTimeout: number | null = null;

      function setHiddenOffset(offset: number, shouldAnimate: boolean): void {
         const height = toggleElement.offsetHeight;
         hiddenOffset = Math.min(height, Math.max(0, offset));
         toggleElement.style.transition = shouldAnimate ? 'transform 160ms ease' : 'none';
         toggleElement.style.transform = `translate3d(0, -${hiddenOffset}px, 0)`;
      }

      function toggleVisibility(): void {
         const currentScrollTop = scrollElement.scrollTop;
         setHiddenOffset(hiddenOffset + currentScrollTop - previousScrollTop, false);
         previousScrollTop = currentScrollTop;
         if (snapTimeout) window.clearTimeout(snapTimeout);
         snapTimeout = window.setTimeout(() => {
            const height = toggleElement.offsetHeight;
            setHiddenOffset(hiddenOffset >= height / 2 ? height : 0, true);
         }, 120);
      }
      scrollElement.addEventListener('scroll', toggleVisibility);
      return () => {
         if (snapTimeout) window.clearTimeout(snapTimeout);
         scrollElement.removeEventListener('scroll', toggleVisibility);
      };
   }, [scrollElRef]);

   return { ref };
}
