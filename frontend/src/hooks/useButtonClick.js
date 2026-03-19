// Custom hook for debounced clicks - prevents rapid multiple clicks
import { useCallback, useRef } from 'react';

export const useButtonClick = (callback, delay = 300) => {
  const isProcessingRef = useRef(false);
  const timeoutRef = useRef(null);

  return useCallback(async (...args) => {
    // Prevent if already processing
    if (isProcessingRef.current) {
      console.warn('Button click ignored - operation in progress');
      return;
    }

    isProcessingRef.current = true;

    try {
      // Call the callback
      await callback(...args);
    } catch (error) {
      console.error('Button click error:', error);
    } finally {
      // Add delay before allowing next click
      timeoutRef.current = setTimeout(() => {
        isProcessingRef.current = false;
      }, delay);
    }
  }, [callback, delay]);
};

// Optimized with immediate visual feedback
export const useOptimizedClick = (callback, delay = 300) => {
  const isProcessingRef = useRef(false);

  return useCallback((...args) => {
    // Prevent if already processing
    if (isProcessingRef.current) {
      return;
    }

    isProcessingRef.current = true;

    // Provide immediate feedback
    callback(...args).finally(() => {
      // Reset after delay
      setTimeout(() => {
        isProcessingRef.current = false;
      }, delay);
    });
  }, [callback, delay]);
};

// Throttle hook - ensures click handlers don't run too frequently
export const useThrottledClick = (callback, delay = 500) => {
  const lastCallRef = useRef(0);

  return useCallback((...args) => {
    const now = Date.now();
    if (now - lastCallRef.current >= delay) {
      lastCallRef.current = now;
      callback(...args);
    }
  }, [callback, delay]);
};

// Single/Double click handler
export const useClickHandler = (onSingle, onDouble, delay = 300) => {
  const clickCountRef = useRef(0);
  const timeoutRef = useRef(null);

  return useCallback(() => {
    clickCountRef.current += 1;

    if (clickCountRef.current === 1) {
      timeoutRef.current = setTimeout(() => {
        if (clickCountRef.current === 1) {
          onSingle();
        } else if (clickCountRef.current >= 2) {
          onDouble();
        }
        clickCountRef.current = 0;
      }, delay);
    }
  }, [onSingle, onDouble, delay]);
};
