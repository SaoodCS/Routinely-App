import { useLayoutEffect, useRef, useState, type RefObject } from 'react';

interface T_HideOnScrollReturn {
   ref: RefObject<HTMLDivElement | null>;
   hideOnScrollElHeight: number;
}

export default function useHideOnScroll(
   scrollElRef: RefObject<HTMLDivElement | null>,
   hide: 'up' | 'down' = 'up',
   enabled: boolean = true,
): T_HideOnScrollReturn {
   const ref = useRef<HTMLDivElement | null>(null);
   const [hideOnScrollElHeight, setHideOnScrollElHeight] = useState(0);

   useLayoutEffect(() => {
      if (!scrollElRef.current || !ref.current) return;
      const scrollEl = scrollElRef.current;
      const element = ref.current;
      const style = element.style;
      const hideMultiplier = hide === 'up' ? -1.2 : 1.2;
      let height = element.offsetHeight;
      let hiddenOffset = 0;
      let isDragging = false;
      let shouldSnapAfterScroll = false;
      let snapTimeout: number | undefined;
      const updateHeight = (): void => {
         height = element.offsetHeight;
         setHideOnScrollElHeight(height);
      };
      const resizeObserver = new ResizeObserver(updateHeight);
      const getScrollTop = (): number => Math.min(Math.max(0, scrollEl.scrollHeight - scrollEl.clientHeight), Math.max(0, scrollEl.scrollTop));
      let previousScrollTop = getScrollTop();
      function handleDragStart(): void {
         isDragging = true;
         shouldSnapAfterScroll = false;
         window.clearTimeout(snapTimeout);
      }

      function setHiddenOffset(offset: number): void {
         const nextHiddenOffset = Math.min(height, Math.max(0, offset));
         if (nextHiddenOffset === hiddenOffset) return;
         hiddenOffset = nextHiddenOffset;
         style.transition = isDragging || shouldSnapAfterScroll ? 'none' : 'transform 300ms ease-out';
         style.transform = `translate3d(0, ${hiddenOffset * hideMultiplier}px, 0)`;
      }

      function snapAfterScrollEnd(): void {
         window.clearTimeout(snapTimeout);
         snapTimeout = window.setTimeout(() => {
            shouldSnapAfterScroll = false;
            setHiddenOffset(hiddenOffset <= height / 2 ? 0 : height);
         }, 100);
      }

      function handleDragEnd(): void {
         if (!isDragging) return;
         isDragging = false;
         shouldSnapAfterScroll = true;
         snapAfterScrollEnd();
      }

      function handleMouseDown(event: MouseEvent): void {
         const scrollbarWidth = scrollEl.offsetWidth - scrollEl.clientWidth;
         if (event.button === 0 && scrollbarWidth > 0 && event.clientX >= scrollEl.getBoundingClientRect().right - scrollbarWidth) handleDragStart();
      }

      function toggleVisibility(): void {
         const currentScrollTop = getScrollTop();
         const scrollDelta = currentScrollTop - previousScrollTop;
         if (!scrollDelta) return;
         setHiddenOffset(isDragging || shouldSnapAfterScroll ? hiddenOffset + scrollDelta : scrollDelta > 0 ? height : 0);
         if (shouldSnapAfterScroll) snapAfterScrollEnd();
         previousScrollTop = currentScrollTop;
      }

      scrollEl.addEventListener('scroll', toggleVisibility, { passive: true });
      scrollEl.addEventListener('mousedown', handleMouseDown);
      scrollEl.addEventListener('touchstart', handleDragStart, { passive: true });
      resizeObserver.observe(element);
      updateHeight();
      window.addEventListener('mouseup', handleDragEnd);
      window.addEventListener('touchcancel', handleDragEnd);
      window.addEventListener('touchend', handleDragEnd);
      return () => {
         scrollEl.removeEventListener('scroll', toggleVisibility);
         scrollEl.removeEventListener('mousedown', handleMouseDown);
         scrollEl.removeEventListener('touchstart', handleDragStart);
         window.clearTimeout(snapTimeout);
         resizeObserver.disconnect();
         window.removeEventListener('mouseup', handleDragEnd);
         window.removeEventListener('touchcancel', handleDragEnd);
         window.removeEventListener('touchend', handleDragEnd);
      };
   }, [hide, scrollElRef, enabled]);

   return { ref, hideOnScrollElHeight };
}
