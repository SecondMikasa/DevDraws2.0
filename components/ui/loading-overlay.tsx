"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface LoadingOverlayProps {
  isVisible: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'card' | 'fullscreen';
  children?: React.ReactNode;
}

export function LoadingOverlay({
  isVisible,
  className,
  size = 'md',
  variant = 'default',
  children
}: LoadingOverlayProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  const variantClasses = {
    default: 'absolute inset-0 bg-white/80 backdrop-blur-sm',
    card: 'absolute inset-0 bg-white/90 backdrop-blur-sm rounded-lg',
    fullscreen: 'fixed inset-0 bg-white/95 backdrop-blur-md z-50'
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div
      className={cn(
        'flex items-center justify-center transition-all duration-300 ease-in-out',
        variantClasses[variant],
        'animate-in fade-in-0 duration-200',
        className
      )}
      role="status"
      aria-live="polite"
      aria-label="Loading content"
    >
      <div className="flex flex-col items-center gap-3">
        {/* Loading spinner */}
        <div className="relative">
          <div
            className={cn(
              'animate-spin rounded-full border-2 border-gray-200 border-t-blue-600',
              sizeClasses[size]
            )}
            aria-hidden="true"
          />
          
          {/* Alternative loading image if preferred */}
          {variant === 'fullscreen' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Image
                src="/loading.svg"
                width={size === 'lg' ? 64 : size === 'md' ? 48 : 32}
                height={size === 'lg' ? 64 : size === 'md' ? 48 : 32}
                alt=""
                className="animate-pulse duration-700"
                priority
                aria-hidden="true"
              />
            </div>
          )}
        </div>

        {/* Loading text for screen readers */}
        <span className="sr-only">Loading, please wait...</span>
        
        {/* Optional visible loading text */}
        {variant === 'fullscreen' && (
          <p className="text-sm text-gray-600 animate-pulse">
            Loading...
          </p>
        )}

        {/* Custom children content */}
        {children}
      </div>
    </div>
  );
}

// Specialized loading overlay for board cards
interface BoardCardLoadingOverlayProps {
  isVisible: boolean;
  className?: string;
}

export function BoardCardLoadingOverlay({
  isVisible,
  className
}: BoardCardLoadingOverlayProps) {
  return (
    <LoadingOverlay
      isVisible={isVisible}
      variant="card"
      size="md"
      className={cn(
        'transition-all duration-200 ease-out',
        'transform',
        isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0',
        className
      )}
    >
      <div className="text-xs text-gray-500 mt-2 animate-pulse">
        Opening board...
      </div>
    </LoadingOverlay>
  );
}

// Hook for managing loading overlay state with timeout
export function useLoadingOverlay(timeout: number = 10000) {
  const [isLoading, setIsLoading] = React.useState(false);
  const timeoutRef = React.useRef<NodeJS.Timeout>();

  const startLoading = React.useCallback(() => {
    setIsLoading(true);
    
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Set timeout to automatically stop loading
    timeoutRef.current = setTimeout(() => {
      setIsLoading(false);
    }, timeout);
  }, [timeout]);

  const stopLoading = React.useCallback(() => {
    setIsLoading(false);
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
    }
  }, []);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    isLoading,
    startLoading,
    stopLoading
  };
}