import { RefObject, useEffect, useState, useRef } from 'react';

interface UseIntersectionObserverOptions {
  threshold?: number | number[];
  root?: Element | null;
  rootMargin?: string;
  freezeOnceVisible?: boolean;
  onIntersect?: (entry: IntersectionObserverEntry) => void;
}

interface UseIntersectionObserverResult {
  ref: RefObject<Element>;
  isVisible: boolean;
  ratio: number;
}

type IntersectionObserverEntryWithIsVisible = IntersectionObserverEntry & {
  isVisible?: boolean;
};

interface UseIntersectionObserverProps {
  threshold?: number;
  root?: Element | null;
  rootMargin?: string;
}

/**
 * A custom hook that tracks the visibility of an element using the Intersection Observer API.
 * 
 * @param ref - A ref object pointing to the element to observe
 * @param options - Configuration options for the Intersection Observer
 * @returns The IntersectionObserverEntry if the element is intersecting, or null
 * 
 * @example
 * // Basic usage
 * const ref = useRef(null);
 * const entry = useIntersectionObserver(ref, { threshold: 0.1 });
 * const isVisible = !!entry?.isIntersecting;
 * 
 * @example
 * // Lazy load an image when it comes into view
 * const imgRef = useRef(null);
 * const entry = useIntersectionObserver(imgRef, { threshold: 0.1 });
 * const isVisible = !!entry?.isIntersecting;
 * 
 * return (
 *   <div ref={imgRef}>
 *     {isVisible ? (
 *       <img src="path/to/image.jpg" alt="Lazy loaded" />
 *     ) : (
 *       <div className="h-64 w-full bg-gray-200 animate-pulse" />
 *     )}
 *   </div>
 * );
 */
export function useIntersectionObserver(
  options: UseIntersectionObserverOptions = {}
): UseIntersectionObserverResult {
  const { threshold = 0, root = null, rootMargin = '0px', freezeOnceVisible = false, onIntersect } = options;
  const [isVisible, setIsVisible] = useState(false);
  const [ratio, setRatio] = useState(0);
  const ref = useRef<Element>(null);
  const frozen = useRef(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (freezeOnceVisible && entry.isIntersecting) {
          frozen.current = true;
        }

        if (!frozen.current) {
          setIsVisible(entry.isIntersecting);
          setRatio(entry.intersectionRatio);
          onIntersect?.(entry);
        }
      },
      {
        threshold,
        root,
        rootMargin
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold, root, rootMargin, freezeOnceVisible, onIntersect]);

  return { ref, isVisible, ratio };
}

/**
 * A custom hook that tracks if an element is currently visible in the viewport.
 * 
 * @param ref - A ref object pointing to the element to observe
 * @param options - Configuration options for the Intersection Observer
 * @returns A boolean indicating if the element is visible
 * 
 * @example
 * const ref = useRef(null);
 * const isVisible = useIsVisible(ref, { threshold: 0.1 });
 * 
 * return (
 *   <div ref={ref}>
 *     {isVisible ? 'Visible!' : 'Not visible'}
 *   </div>
 * );
 */
export function useIsVisible(
  ref: RefObject<Element>,
  options: Omit<UseIntersectionObserverOptions, 'freezeOnceVisible' | 'onIntersect'> = {}
): boolean {
  const [isVisible, setIsVisible] = useState(false);
  
  useIntersectionObserver({
    ...options,
    freezeOnceVisible: true,
    onIntersect: (entry) => setIsVisible(entry.isIntersecting)
  });
  
  return isVisible;
}

/**
 * A custom hook that returns the current visibility ratio of an element.
 * 
 * @param ref - A ref object pointing to the element to observe
 * @param options - Configuration options for the Intersection Observer
 * @returns A number between 0 and 1 representing the visibility ratio
 * 
 * @example
 * const ref = useRef(null);
 * const visibility = useVisibilityRatio(ref, { threshold: Array(11).fill(0).map((_, i) => i * 0.1) });
 * 
 * return (
 *   <div ref={ref}>
 *     {Math.round(visibility * 100)}% visible
 *   </div>
 * );
 */
export function useVisibilityRatio(
  ref: RefObject<Element>,
  options: Omit<UseIntersectionObserverOptions, 'threshold'> & { threshold?: number[] } = {}
): number {
  const [ratio, setRatio] = useState(0);
  
  useIntersectionObserver({
    ...options,
    threshold: options.threshold || Array(101).fill(0).map((_, i) => i * 0.01),
    onIntersect: (entry) => setRatio(entry.intersectionRatio)
  });
  
  return ratio;
}

/**
 * A custom hook that triggers a callback when an element becomes visible.
 * 
 * @param ref - A ref object pointing to the element to observe
 * @param onVisible - Callback function to execute when the element becomes visible
 * @param options - Configuration options for the Intersection Observer
 * 
 * @example
 * const ref = useRef(null);
 * 
 * useOnVisible(ref, () => {
 *   console.log('Element is now visible!');
 * }, { threshold: 0.5 });
 * 
 * return <div ref={ref}>Scroll to see me</div>;
 */
export function useOnVisible(
  ref: RefObject<Element>,
  callback: () => void,
  options: Omit<UseIntersectionObserverOptions, 'freezeOnceVisible' | 'onIntersect'> = {}
): void {
  const callbackRef = useRef(callback);
  
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);
  
  useIntersectionObserver({
    ...options,
    freezeOnceVisible: true,
    onIntersect: (entry) => {
      if (entry.isIntersecting) {
        callbackRef.current();
      }
    }
  });
}

export function useIntersectionRatio(
  options: Omit<UseIntersectionObserverOptions, 'freezeOnceVisible' | 'onIntersect'> = {}
): number {
  const [ratio, setRatio] = useState(0);
  
  useIntersectionObserver({
    ...options,
    threshold: options.threshold || Array(101).fill(0).map((_, i) => i * 0.01),
    onIntersect: (entry) => setRatio(entry.intersectionRatio)
  });
  
  return ratio;
}
