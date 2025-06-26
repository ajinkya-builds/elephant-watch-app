import { ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

/**
 * Android-style Material Design button component
 * 
 * This component implements Material Design 3 button styles using Tailwind CSS
 * Supports various button variants: filled, outlined, text, elevated, tonal
 */
export interface AndroidButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Button variants following Material Design 3 style guide
   * - filled: Primary action button with solid background color
   * - outlined: Secondary action button with outline
   * - text: Low-emphasis button with no background or outline
   * - elevated: Primary button with slight elevation/shadow
   * - tonal: Medium-emphasis button with a lighter background color
   */
  variant?: 'filled' | 'outlined' | 'text' | 'elevated' | 'tonal'
  
  /**
   * Optional leading icon component or element
   */
  leadingIcon?: React.ReactNode
  
  /**
   * Optional trailing icon component or element
   */
  trailingIcon?: React.ReactNode
  
  /**
   * Whether the button should span the full width of its container
   */
  fullWidth?: boolean
  
  /**
   * Whether the button should be displayed with loading state
   */
  loading?: boolean
  
  /**
   * For text-only buttons, add extra padding for better touch target
   */
  padded?: boolean
}

const AndroidButton = forwardRef<HTMLButtonElement, AndroidButtonProps>(
  ({ 
    className, 
    variant = 'filled', 
    children, 
    leadingIcon,
    trailingIcon,
    fullWidth = false,
    loading = false,
    padded = false,
    disabled,
    ...props 
  }, ref) => {
    // Define styles for different variants using modern minimalist Material Design 3 tokens
    const variantStyles = {
      filled: [
        'bg-blue-500',
        'text-white',
        'hover:bg-blue-600',
        'active:bg-blue-700',
        'shadow-sm',
        'hover:shadow-md',
        'hover:-translate-y-0.5',
        'active:translate-y-0',
        'disabled:bg-gray-200 disabled:text-gray-500'
      ].join(' '),
      outlined: [
        'border-2 border-blue-500',
        'text-blue-500',
        'hover:bg-blue-50',
        'active:bg-blue-100',
        'hover:-translate-y-0.5',
        'active:translate-y-0',
        'disabled:border-gray-300 disabled:text-gray-400'
      ].join(' '),
      text: [
        'text-blue-500',
        'hover:bg-blue-50',
        'active:bg-blue-100',
        'disabled:text-gray-400'
      ].join(' '),
      elevated: [
        'bg-white',
        'text-blue-500',
        'shadow-md',
        'hover:shadow-lg',
        'active:shadow-sm',
        'hover:-translate-y-0.5',
        'active:translate-y-0',
        'hover:bg-gray-50',
        'active:bg-gray-100',
        'disabled:bg-gray-100 disabled:text-gray-400 disabled:shadow-none'
      ].join(' '),
      tonal: [
        'bg-teal-100',
        'text-teal-800',
        'hover:bg-teal-200',
        'active:bg-teal-300',
        'hover:-translate-y-0.5',
        'active:translate-y-0',
        'disabled:bg-gray-100 disabled:text-gray-400'
      ].join(' '),
    }

    return (
      <button
        className={cn(
          // Base styles for all buttons - updated for modern minimalist design
          'inline-flex items-center justify-center rounded-md font-medium',
          'transition-all duration-200 ease-in-out',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/70',
          'disabled:opacity-50 disabled:pointer-events-none',
          'relative overflow-hidden',
          
          // Size and padding based on type
          variant === 'text' && !padded ? 'px-3 py-1.5' : 'px-6 py-2',
          
          // Apply variant styling
          variantStyles[variant],
          
          // State layer for hover/active states - subtle animations for better feedback
          'after:absolute after:inset-0 after:bg-current after:opacity-0',
          'hover:after:opacity-[0.05] active:after:opacity-[0.1]',
          'focus-visible:after:opacity-[0.1]',
          'disabled:after:opacity-0',
          'hover:scale-[1.02] active:scale-[0.98]',
          
          // Full width option
          fullWidth && 'w-full',
          
          // Custom classname
          className
        )}
        disabled={disabled || loading}
        ref={ref}
        {...props}
      >
        {/* Loading spinner */}
        {loading && (
          <svg 
            className="animate-spin -ml-1 mr-2 h-4 w-4" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24"
          >
            <circle 
              className="opacity-25" 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="4"
            />
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        
        {/* Leading icon */}
        {leadingIcon && !loading && (
          <span className="mr-2 -ml-1">{leadingIcon}</span>
        )}
        
        {/* Button text */}
        <span>{children}</span>
        
        {/* Trailing icon */}
        {trailingIcon && (
          <span className="ml-2 -mr-1">{trailingIcon}</span>
        )}
      </button>
    )
  }
)

AndroidButton.displayName = 'AndroidButton'

export { AndroidButton }
