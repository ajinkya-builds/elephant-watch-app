import { RefObject, useEffect } from 'react';

type Event = MouseEvent | TouchEvent;

/**
 * A custom hook that triggers a callback when a click occurs outside of the specified element(s).
 * 
 * @param ref - A ref object or an array of ref objects representing the element(s) to detect clicks outside of.
 * @param handler - A callback function to be called when a click outside occurs.
 * @param enabled - A boolean to enable or disable the event listener.
 * 
 * @example
 * // Basic usage with a single ref
 * const ref = useRef<HTMLDivElement>(null);
 * useClickOutside(ref, () => {
 *   console.log('Clicked outside!');
 * });
 * 
 * @example
 * // Usage with multiple refs
 * const ref1 = useRef<HTMLDivElement>(null);
 * const ref2 = useRef<HTMLDivElement>(null);
 * useClickOutside([ref1, ref2], () => {
 *   console.log('Clicked outside both elements!');
 * });
 * 
 * @example
 * // Conditionally enable/disable the hook
 * const [isOpen, setIsOpen] = useState(false);
 * const ref = useRef<HTMLDivElement>(null);
 * useClickOutside(ref, () => setIsOpen(false), isOpen);
 */
export function useClickOutside<T extends HTMLElement = HTMLElement>(
  ref: RefObject<T> | RefObject<T>[],
  handler: (event: Event) => void,
  enabled: boolean = true
) {
  useEffect(() => {
    if (!enabled) return;

    const listener = (event: Event) => {
      // Get the target node from the event
      const target = event.target as Node;
      
      // Convert single ref to array for consistent handling
      const refs = Array.isArray(ref) ? ref : [ref];
      
      // Check if the click was outside all provided refs
      const isOutside = refs.every(r => {
        const element = r.current;
        return element && !element.contains(target);
      });

      if (isOutside) {
        handler(event);
      }
    };

    // Add event listeners
    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    // Clean up event listeners
    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler, enabled]);
}
