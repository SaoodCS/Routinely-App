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
      const toggleElement = ref.current;
      if (!scrollEl || !toggleElement) return;
      const scrollElement: HTMLDivElement = scrollEl;
      const element: HTMLDivElement = toggleElement;
      const height = element.offsetHeight;
      let previousScrollTop = scrollElement.scrollTop;
      let hiddenOffset = 0;
      let snapTimeout: number | null = null;

      function setHiddenOffset(offset: number, shouldAnimate: boolean): void {
         const nextHiddenOffset = Math.min(height, Math.max(0, offset));
         if (nextHiddenOffset === hiddenOffset && !shouldAnimate) return;
         hiddenOffset = nextHiddenOffset;
         const translateY = hideDirection === 'up' ? -hiddenOffset : hiddenOffset;
         element.style.transition = shouldAnimate ? 'transform 160ms ease, opacity 160ms ease' : 'none';
         element.style.transform = `translate3d(0, ${translateY}px, 0)`;
         element.style.opacity = height ? `${1 - hiddenOffset / height}` : '1';
      }

      function toggleVisibility(): void {
         const currentScrollTop = scrollElement.scrollTop;
         const scrollDelta = currentScrollTop - previousScrollTop;
         if (scrollDelta === 0) return;
         setHiddenOffset(hiddenOffset + scrollDelta, false);
         previousScrollTop = currentScrollTop;
         if (snapTimeout) window.clearTimeout(snapTimeout);
         snapTimeout = window.setTimeout(() => {
            setHiddenOffset(scrollDelta < 0 || hiddenOffset < height / 2 ? 0 : height, true);
         }, 120);
      }
      scrollElement.addEventListener('scroll', toggleVisibility, { passive: true });
      return () => {
         if (snapTimeout) window.clearTimeout(snapTimeout);
         scrollElement.removeEventListener('scroll', toggleVisibility);
      };
   }, [hideDirection, scrollElRef]);

   return { ref };
}
