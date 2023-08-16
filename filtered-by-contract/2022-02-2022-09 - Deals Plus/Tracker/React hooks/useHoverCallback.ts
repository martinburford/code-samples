// NPM imports
import { useCallback, useRef, useState } from "react";

// Hook
export const useHoverCallback = () => {
  // Hooks (callbacks)
  // Wrap in useCallback so we can use in dependencies below
  const handleMouseOver = useCallback(() => setValue(true), []);
  const handleMouseOut = useCallback(() => setValue(false), []);

  // Hooks (refs)
  const [value, setValue] = useState(false);
  const ref = useRef(); // Keep track of the last node passed to callbackRef so its event listeners can be removed
  
  // Use a callback ref instead of useEffect so that event listeners
  // get changed in the case that the returned ref gets added to
  // a different element later. With useEffect, changes to ref.current
  // wouldn't cause a rerender and thus the effect would run again
  const callbackRef = useCallback(
    node => {
      if (ref.current) {
        (ref.current as EventTarget).removeEventListener("mouseover", handleMouseOver);
        (ref.current as EventTarget).removeEventListener("mouseout", handleMouseOut);
      }

      ref.current = node;

      if (ref.current) {
        (ref.current as EventTarget).addEventListener("mouseover", handleMouseOver);
        (ref.current as EventTarget).addEventListener("mouseout", handleMouseOut);
      }
    },
    [handleMouseOver, handleMouseOut]
  );

  return [callbackRef, value];
}