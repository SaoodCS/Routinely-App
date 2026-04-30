import { useRef, type RefCallback, type RefObject } from 'react';

interface T_ToggleVisibilityOnScrollReturn {
   ref: RefCallback<HTMLDivElement>;
}

export default function useToggleVisibilityOnScrollReturn(
   scrollElRef: RefObject<HTMLDivElement | null> | RefCallback<HTMLDivElement>,
): T_ToggleVisibilityOnScrollReturn {
   const elRef = useRef<HTMLDivElement | null>(null);

   return { ref };
}
