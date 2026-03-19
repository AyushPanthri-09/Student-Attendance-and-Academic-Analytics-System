import React from 'react';
import { useRef } from 'react';

/**
 * OptimizedButton - Prevents accidental double-clicks and rapid clicks
 * Automatically adds loading states and visual feedback
 */
const OptimizedButton = React.forwardRef((
  {
    onClick,
    disabled = false,
    loading = false,
    debounceDelay = 300,
    children,
    className = '',
    ...props
  },
  ref
) => {
  const isProcessingRef = useRef(false);

  const handleClick = async (e) => {
    e?.preventDefault?.();

    // Prevent if already processing or disabled
    if (isProcessingRef.current || disabled || loading) {
      return;
    }

    isProcessingRef.current = true;

    try {
      // Execute the callback
      if (onClick) {
        await Promise.resolve(onClick(e));
      }
    } catch (error) {
      console.error('Button click error:', error);
    } finally {
      // Reset after delay
      setTimeout(() => {
        isProcessingRef.current = false;
      }, debounceDelay);
    }
  };

  return (
    <button
      ref={ref}
      onClick={handleClick}
      disabled={disabled || loading || isProcessingRef.current}
      className={`
        transition-all duration-200
        disabled:opacity-60 disabled:cursor-not-allowed
        active:scale-95
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full inline-block mr-2" />
      ) : null}
      {children}
    </button>
  );
});

OptimizedButton.displayName = 'OptimizedButton';

export default OptimizedButton;
