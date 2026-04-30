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
      function toggleVisibility(): void {
         const currentScrollTop = scrollElement.scrollTop;
         toggleElement.style.transform = currentScrollTop > previousScrollTop ? 'translateY(-100%)' : 'translateY(0)';
         previousScrollTop = currentScrollTop;
      }
      scrollElement.addEventListener('scroll', toggleVisibility);
      return () => scrollElement.removeEventListener('scroll', toggleVisibility);
   }, [scrollElRef]);

   return { ref };
}
