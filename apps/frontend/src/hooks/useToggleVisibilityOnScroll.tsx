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
      const scrollEl = scrollElRef.current;
      const element = ref.current;
      const height = element.offsetHeight;
      if (!height) return;
      const style = element.style;
      const hideMultiplier = hideDirection === 'up' ? -1 : 1;
      let hiddenOffset = 0;
      let isDragging = false;
      const getScrollTop = (): number => Math.min(Math.max(0, scrollEl.scrollHeight - scrollEl.clientHeight), Math.max(0, scrollEl.scrollTop));
      let previousScrollTop = getScrollTop();
      function handleDragStart(): void {
         isDragging = true;
      }

      function setHiddenOffset(offset: number): void {
         const nextHiddenOffset = Math.min(height, Math.max(0, offset));
         if (nextHiddenOffset === hiddenOffset) return;
         hiddenOffset = nextHiddenOffset;
         style.transition = isDragging ? 'none' : 'transform 160ms ease, opacity 160ms ease';
         style.transform = `translate3d(0, ${hiddenOffset * hideMultiplier}px, 0)`;
         style.opacity = `${1 - hiddenOffset / height}`;
      }

      function handleDragEnd(): void {
         if (!isDragging) return;
         isDragging = false;
         setHiddenOffset(hiddenOffset <= height / 2 ? 0 : height);
      }

      function handleMouseDown(event: MouseEvent): void {
         const scrollbarWidth = scrollEl.offsetWidth - scrollEl.clientWidth;
         if (event.button === 0 && scrollbarWidth > 0 && event.clientX >= scrollEl.getBoundingClientRect().right - scrollbarWidth) handleDragStart();
      }

      function toggleVisibility(): void {
         const currentScrollTop = getScrollTop();
         const scrollDelta = currentScrollTop - previousScrollTop;
         if (!scrollDelta) return;
         setHiddenOffset(isDragging ? hiddenOffset + scrollDelta : scrollDelta > 0 ? height : 0);
         previousScrollTop = currentScrollTop;
      }

      scrollEl.addEventListener('scroll', toggleVisibility, { passive: true });
      scrollEl.addEventListener('mousedown', handleMouseDown);
      scrollEl.addEventListener('touchstart', handleDragStart, { passive: true });
      window.addEventListener('mouseup', handleDragEnd);
      window.addEventListener('touchcancel', handleDragEnd);
      window.addEventListener('touchend', handleDragEnd);
      return () => {
         scrollEl.removeEventListener('scroll', toggleVisibility);
         scrollEl.removeEventListener('mousedown', handleMouseDown);
         scrollEl.removeEventListener('touchstart', handleDragStart);
         window.removeEventListener('mouseup', handleDragEnd);
         window.removeEventListener('touchcancel', handleDragEnd);
         window.removeEventListener('touchend', handleDragEnd);
      };
   }, [hideDirection, scrollElRef]);

   return { ref };
}
