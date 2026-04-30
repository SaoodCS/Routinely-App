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
      let isHidden = false;
      toggleElement.style.transition = 'transform 160ms ease';
      toggleElement.style.willChange = 'transform';

      function toggleVisibility(): void {
         const currentScrollTop = scrollElement.scrollTop;
         const nextIsHidden = currentScrollTop > previousScrollTop;
         previousScrollTop = currentScrollTop;
         if (nextIsHidden === isHidden) return;
         isHidden = nextIsHidden;
         toggleElement.style.transform = isHidden ? 'translate3d(0, -100%, 0)' : 'translate3d(0, 0, 0)';
      }
      scrollElement.addEventListener('scroll', toggleVisibility);
      return () => scrollElement.removeEventListener('scroll', toggleVisibility);
   }, [scrollElRef]);

   return { ref };
}
