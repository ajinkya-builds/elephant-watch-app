import { InputHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

/**
 * AndroidInput component
 * 
 * A Material Design 3 text input component with floating label
 */
export interface AndroidInputProps extends InputHTMLAttributes<HTMLInputElement> {
  /**
   * Label text for the input
   */
  label?: string
  
  /**
   * Leading icon element
   */
  leadingIcon?: React.ReactNode
  
  /**
   * Trailing icon element
   */
  trailingIcon?: React.ReactNode
  
  /**
   * Error message to display
   */
  errorMessage?: string
  
  /**
   * Helper text to display below the input
   */
  helperText?: string
  
  /**
   * Whether the input is in an error state
   */
  error?: boolean
  
  /**
   * Whether the input is in a focused state
   * Controlled externally for custom behavior
   */
  focused?: boolean
  
  /**
   * Variant of the input
   * - filled: Material filled input with background color
   * - outlined: Material outlined input with border
   */
  variant?: 'filled' | 'outlined'
}

const AndroidInput = forwardRef<HTMLInputElement, AndroidInputProps>(
  ({ 
    className,
    label,
    leadingIcon,
    trailingIcon,
    errorMessage,
    helperText,
    error = false,
    focused = false,
    variant = 'outlined',
    type = 'text',
    id, 
    ...props 
  }, ref) => {
    // Generate unique ID for input-label association
    const inputId = id || `android-input-${Math.random().toString(36).substring(2, 9)}`;
    
    // Check if the input has a value for floating label animation
    const hasValue = props.value !== undefined && props.value !== '';
    
    return (
      <div className="w-full">
        <div
          className={cn(
            'relative flex items-center transition-all',
            error ? 'text-red-600' : 'text-gray-900',
          )}
        >
          {/* Leading icon */}
          {leadingIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
              {leadingIcon}
            </div>
          )}
          
          {/* Input field */}
          <input
            id={inputId}
            type={type}
            ref={ref}
            className={cn(
              // Base styles - updated for modern minimalist design
              'w-full rounded-lg text-base transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-offset-0',
              'disabled:cursor-not-allowed disabled:opacity-50',
              
              // Variant styles - refined for modern look
              variant === 'outlined' 
                ? 'border-2 border-gray-200 bg-transparent px-4 py-3 focus:border-blue-400 focus:ring-blue-400/20 hover:border-gray-300' 
                : 'border-0 bg-gray-50 px-4 py-3 focus:bg-white focus:ring-blue-400/20 hover:bg-gray-100/80',
              
              // Error state - more consistent styling
              error && variant === 'outlined' && 'border-red-500 focus:border-red-500 focus:ring-red-500/20 hover:border-red-600',
              error && variant === 'filled' && 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
              
              // Icon padding
              leadingIcon && 'pl-10',
              trailingIcon && 'pr-10',
              
              // Label padding (for outlined variant)
              label && variant === 'outlined' && 'pt-4',
              
              // Custom class
              className
            )}
            placeholder={label ? ' ' : props.placeholder}
            {...props}
          />
          
          {/* Floating label */}
          {label && (
            <label
              htmlFor={inputId}
              className={cn(
                'pointer-events-none absolute left-4 whitespace-nowrap transition-all duration-200',
                
                // Position based on input state (has value or focused)
                (hasValue || focused || props.placeholder) 
                  ? 'top-2 text-xs font-medium' 
                  : 'top-1/2 -translate-y-1/2 text-base',
                
                // Icon adjustment
                leadingIcon && 'left-10',
                
                // Colors based on state - updated with refined blue palette
                error ? 'text-red-600' : 'text-gray-500',
                (hasValue || focused) && !error && 'text-blue-500 font-medium'
              )}
            >
              {label}
            </label>
          )}
          
          {/* Trailing icon */}
          {trailingIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
              {trailingIcon}
            </div>
          )}
        </div>
        
        {/* Helper text or error message */}
        {(helperText || errorMessage) && (
          <div 
            className={cn(
              'mt-2 text-xs font-medium', 
              error ? 'text-red-600' : 'text-gray-500/90'
            )}
          >
            {error ? errorMessage : helperText}
          </div>
        )}
      </div>
    )
  }
)

AndroidInput.displayName = 'AndroidInput'

export { AndroidInput }
