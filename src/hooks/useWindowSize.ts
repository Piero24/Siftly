/**
 * useWindowSize — Reactive window dimensions hook.
 *
 * Returns the current viewport width and a set of responsive breakpoint
 * booleans that update on resize.
 */
import { useEffect, useState } from 'react';

interface WindowSize {
  width: number;
  isMobile: boolean; // < 768px
}

export function useWindowSize(): WindowSize {
  const [width, setWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    width,
    isMobile: width < 768,
  };
}
