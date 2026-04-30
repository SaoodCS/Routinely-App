import { useLayoutEffect, useRef, type RefObject } from 'react';

interface T_ToggleVisibilityOnScrollReturn {
   ref: RefObject<HTMLDivElement | null>;
}

export default function useToggleVisibilityOnScroll(
   scrollElRef: RefObject<HTMLDivElement | null>,
   hideDirection: 'up' | 'down' = 'up',
): T_ToggleVisibilityOnScrollReturn {
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
      let lastScrollDelta = 0;

      function setHiddenOffset(offset: number, shouldAnimate: boolean): void {
         const height = toggleElement.offsetHeight;
         hiddenOffset = Math.min(height, Math.max(0, offset));
         const translateY = hideDirection === 'up' ? -hiddenOffset : hiddenOffset;
         toggleElement.style.transition = shouldAnimate ? 'transform 160ms ease, opacity 160ms ease' : 'none';
         toggleElement.style.transform = `translate3d(0, ${translateY}px, 0)`;
         toggleElement.style.opacity = height ? `${1 - hiddenOffset / height}` : '1';
      }

      function toggleVisibility(): void {
         const currentScrollTop = scrollElement.scrollTop;
         lastScrollDelta = currentScrollTop - previousScrollTop;
         if (lastScrollDelta === 0) return;
         setHiddenOffset(hiddenOffset + lastScrollDelta, false);
         previousScrollTop = currentScrollTop;
         if (snapTimeout) window.clearTimeout(snapTimeout);
         snapTimeout = window.setTimeout(() => {
            const height = toggleElement.offsetHeight;
            setHiddenOffset(lastScrollDelta < 0 || hiddenOffset < height / 2 ? 0 : height, true);
         }, 120);
      }
      scrollElement.addEventListener('scroll', toggleVisibility);
      return () => {
         if (snapTimeout) window.clearTimeout(snapTimeout);
         scrollElement.removeEventListener('scroll', toggleVisibility);
      };
   }, [hideDirection, scrollElRef]);

   return { ref };
}
