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
      if (!scrollElRef.current || !ref.current) return;
      const scrollElement = scrollElRef.current;
      const element = ref.current;
      const height = element.offsetHeight;
      if (height === 0) return;
      const style = element.style;
      const hideMultiplier = hideDirection === 'up' ? -1 : 1;
      let hiddenOffset = 0;
      let isDragging = false;

      function getScrollTop(): number {
         const maxScrollTop = Math.max(0, scrollElement.scrollHeight - scrollElement.clientHeight);
         return Math.min(maxScrollTop, Math.max(0, scrollElement.scrollTop));
      }

      let previousScrollTop = getScrollTop();

      function setHiddenOffset(offset: number, shouldAnimate: boolean): void {
         const nextHiddenOffset = Math.min(height, Math.max(0, offset));
         if (nextHiddenOffset === hiddenOffset) return;
         hiddenOffset = nextHiddenOffset;
         style.transition = shouldAnimate ? 'transform 160ms ease, opacity 160ms ease' : 'none';
         style.transform = `translate3d(0, ${hiddenOffset * hideMultiplier}px, 0)`;
         style.opacity = `${1 - hiddenOffset / height}`;
      }

      function handleDragStart(): void {
         isDragging = true;
      }

      function handleDragEnd(): void {
         if (!isDragging) return;
         isDragging = false;
         setHiddenOffset(hiddenOffset <= height / 2 ? 0 : height, true);
      }

      function handleMouseDown(event: MouseEvent): void {
         const scrollbarWidth = scrollElement.offsetWidth - scrollElement.clientWidth;
         if (event.button === 0 && scrollbarWidth > 0 && event.clientX >= scrollElement.getBoundingClientRect().right - scrollbarWidth) {
            handleDragStart();
         }
      }

      function toggleVisibility(): void {
         const currentScrollTop = getScrollTop();
         const scrollDelta = currentScrollTop - previousScrollTop;
         if (scrollDelta === 0) return;
         setHiddenOffset(isDragging ? hiddenOffset + scrollDelta : scrollDelta > 0 ? height : 0, !isDragging);
         previousScrollTop = currentScrollTop;
      }

      scrollElement.addEventListener('scroll', toggleVisibility, { passive: true });
      scrollElement.addEventListener('mousedown', handleMouseDown);
      scrollElement.addEventListener('touchstart', handleDragStart, { passive: true });
      window.addEventListener('mouseup', handleDragEnd);
      window.addEventListener('touchcancel', handleDragEnd);
      window.addEventListener('touchend', handleDragEnd);
      return () => {
         scrollElement.removeEventListener('scroll', toggleVisibility);
         scrollElement.removeEventListener('mousedown', handleMouseDown);
         scrollElement.removeEventListener('touchstart', handleDragStart);
         window.removeEventListener('mouseup', handleDragEnd);
         window.removeEventListener('touchcancel', handleDragEnd);
         window.removeEventListener('touchend', handleDragEnd);
      };
   }, [hideDirection, scrollElRef]);

   return { ref };
}
