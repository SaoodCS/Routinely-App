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
      let isDragging = false;

      function setHiddenOffset(offset: number, shouldAnimate: boolean): void {
         const nextHiddenOffset = Math.min(height, Math.max(0, offset));
         if (nextHiddenOffset === hiddenOffset) return;
         hiddenOffset = nextHiddenOffset;
         const translateY = hideDirection === 'up' ? -hiddenOffset : hiddenOffset;
         element.style.transition = shouldAnimate ? 'transform 160ms ease, opacity 160ms ease' : 'none';
         element.style.transform = `translate3d(0, ${translateY}px, 0)`;
         element.style.opacity = height ? `${1 - hiddenOffset / height}` : '1';
      }

      function snapVisibility(): void {
         setHiddenOffset(height - hiddenOffset >= height / 2 ? 0 : height, true);
      }

      function handlePointerUp(): void {
         if (!isDragging) return;
         isDragging = false;
         snapVisibility();
      }

      function handlePointerDown(event: PointerEvent): void {
         const scrollbarWidth = scrollElement.offsetWidth - scrollElement.clientWidth;
         const isScrollbarClick = scrollbarWidth > 0 && event.clientX >= scrollElement.getBoundingClientRect().right - scrollbarWidth;
         isDragging = event.pointerType !== 'mouse' || (event.button === 0 && isScrollbarClick);
      }

      function toggleVisibility(): void {
         const currentScrollTop = scrollElement.scrollTop;
         const scrollDelta = currentScrollTop - previousScrollTop;
         if (scrollDelta === 0) return;
         setHiddenOffset(isDragging ? hiddenOffset + scrollDelta : scrollDelta > 0 ? height : 0, !isDragging);
         previousScrollTop = currentScrollTop;
      }

      scrollElement.addEventListener('scroll', toggleVisibility, { passive: true });
      scrollElement.addEventListener('pointerdown', handlePointerDown, { passive: true });
      window.addEventListener('pointercancel', handlePointerUp);
      window.addEventListener('pointerup', handlePointerUp);
      return () => {
         scrollElement.removeEventListener('scroll', toggleVisibility);
         scrollElement.removeEventListener('pointerdown', handlePointerDown);
         window.removeEventListener('pointercancel', handlePointerUp);
         window.removeEventListener('pointerup', handlePointerUp);
      };
   }, [hideDirection, scrollElRef]);

   return { ref };
}
