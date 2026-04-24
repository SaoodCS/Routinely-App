import Box, { type BoxProps } from '@mui/material/Box';
import { useLayoutEffect, useRef, type UIEvent } from 'react';

export default function ScrollRestoreWrapper(props: BoxProps & { storeKey: string }): React.JSX.Element {
   const { storeKey, onScroll, ...boxProps } = props;
   const boxRef = useRef<HTMLDivElement | null>(null);

   useLayoutEffect(() => {
      const box = boxRef.current;
      const storedPosition = window.sessionStorage.getItem(storeKey);
      if (box === null || storedPosition === null) return;
      const scrollPosition = JSON.parse(storedPosition) as { x: number; y: number };
      box.scrollTo(scrollPosition.x, scrollPosition.y);
   }, [storeKey]);

   function handleScroll(event: UIEvent<HTMLDivElement>): void {
      window.sessionStorage.setItem(storeKey, JSON.stringify({ x: event.currentTarget.scrollLeft, y: event.currentTarget.scrollTop }));
      onScroll?.(event);
   }

   return <Box {...boxProps} ref={boxRef} onScroll={handleScroll} />;
}
