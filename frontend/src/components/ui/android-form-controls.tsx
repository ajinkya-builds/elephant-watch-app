import { InputHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

/**
 * AndroidCheckbox component
 * 
 * A Material Design 3 checkbox component
 */
export interface AndroidCheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  /**
   * Label text 
   */
  label?: string
  
  /**
   * Optional helper text
   */
  helperText?: string
  
  /**
   * Error message
   */
  errorMessage?: string
  
  /**
   * Whether the checkbox is in an error state
   */
  error?: boolean
}

export const AndroidCheckbox = forwardRef<HTMLInputElement, AndroidCheckboxProps>(
  ({ className, label, helperText, errorMessage, error = false, id, ...props }, ref) => {
    const checkboxId = id || `android-checkbox-${Math.random().toString(36).substring(2, 9)}`
    
    return (
      <div className={cn('flex flex-col', className)}>
        <div className="flex items-center">
          <div className="relative flex items-center">
            {/* Hidden real checkbox for accessibility */}
            <input
              type="checkbox"
              ref={ref}
              id={checkboxId}
              className="peer sr-only"
              {...props}
            />
            
            {/* Custom checkbox styling */}
            <label
              htmlFor={checkboxId}
              className={cn(
                // Base appearance
                'flex h-5 w-5 items-center justify-center rounded-sm border transition-colors',
                
                // Focus ring
                'peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-blue-500',
                
                // Different states
                props.disabled
                  ? 'border-gray-200 bg-gray-100'
                  : error
                    ? 'border-red-500 peer-checked:border-red-500 peer-checked:bg-red-500'
                    : 'border-gray-300 peer-checked:border-blue-500 peer-checked:bg-blue-500'
              )}
            >
              {/* Checkmark icon */}
              <svg
                className={cn(
                  'h-3.5 w-3.5 text-white',
                  'opacity-0 transition-opacity peer-checked:opacity-100'
                )}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </label>
          </div>
          
          {/* Label */}
          {label && (
            <label
              htmlFor={checkboxId}
              className={cn(
                'ml-2 text-sm font-medium',
                props.disabled ? 'text-gray-400' : 'text-gray-700',
                error && 'text-red-500'
              )}
            >
              {label}
            </label>
          )}
        </div>
        
        {/* Helper text or error message */}
        {(helperText || errorMessage) && (
          <div className={cn(
            'mt-1 text-xs',
            error ? 'text-red-500' : 'text-gray-500'
          )}>
            {error ? errorMessage : helperText}
          </div>
        )}
      </div>
    )
  }
)

AndroidCheckbox.displayName = 'AndroidCheckbox'

/**
 * AndroidRadio component
 * 
 * A Material Design 3 radio button component
 */
export interface AndroidRadioProps extends InputHTMLAttributes<HTMLInputElement> {
  /**
   * Label text
   */
  label?: string
  
  /**
   * Optional helper text
   */
  helperText?: string
  
  /**
   * Error message
   */
  errorMessage?: string
  
  /**
   * Whether the radio is in an error state
   */
  error?: boolean
}

export const AndroidRadio = forwardRef<HTMLInputElement, AndroidRadioProps>(
  ({ className, label, helperText, errorMessage, error = false, id, ...props }, ref) => {
    const radioId = id || `android-radio-${Math.random().toString(36).substring(2, 9)}`
    
    return (
      <div className={cn('flex flex-col', className)}>
        <div className="flex items-center">
          <div className="relative flex items-center">
            {/* Hidden real radio for accessibility */}
            <input
              type="radio"
              ref={ref}
              id={radioId}
              className="peer sr-only"
              {...props}
            />
            
            {/* Custom radio styling */}
            <label
              htmlFor={radioId}
              className={cn(
                // Base appearance
                'flex h-5 w-5 items-center justify-center rounded-full border transition-colors',
                
                // Focus ring
                'peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-blue-500',
                
                // Different states
                props.disabled
                  ? 'border-gray-200 bg-gray-100'
                  : error
                    ? 'border-red-500'
                    : 'border-gray-300'
              )}
            >
              {/* Inner dot */}
              <span
                className={cn(
                  'h-2.5 w-2.5 rounded-full',
                  'scale-0 transition-transform peer-checked:scale-100',
                  props.disabled
                    ? 'bg-gray-400'
                    : error
                      ? 'bg-red-500'
                      : 'bg-blue-500'
                )}
              />
            </label>
          </div>
          
          {/* Label */}
          {label && (
            <label
              htmlFor={radioId}
              className={cn(
                'ml-2 text-sm font-medium',
                props.disabled ? 'text-gray-400' : 'text-gray-700',
                error && 'text-red-500'
              )}
            >
              {label}
            </label>
          )}
        </div>
        
        {/* Helper text or error message */}
        {(helperText || errorMessage) && (
          <div className={cn(
            'mt-1 text-xs',
            error ? 'text-red-500' : 'text-gray-500'
          )}>
            {error ? errorMessage : helperText}
          </div>
        )}
      </div>
    )
  }
)

AndroidRadio.displayName = 'AndroidRadio'

/**
 * AndroidSwitch component
 * 
 * A Material Design 3 switch component
 */
export interface AndroidSwitchProps extends InputHTMLAttributes<HTMLInputElement> {
  /**
   * Label text
   */
  label?: string
  
  /**
   * Optional helper text
   */
  helperText?: string
  
  /**
   * Error message
   */
  errorMessage?: string
  
  /**
   * Whether the switch is in an error state
   */
  error?: boolean
}

export const AndroidSwitch = forwardRef<HTMLInputElement, AndroidSwitchProps>(
  ({ className, label, helperText, errorMessage, error = false, id, ...props }, ref) => {
    const switchId = id || `android-switch-${Math.random().toString(36).substring(2, 9)}`
    
    return (
      <div className={cn('flex flex-col', className)}>
        <div className="flex items-center">
          <div className="relative flex items-center">
            {/* Hidden real checkbox for accessibility */}
            <input
              type="checkbox"
              ref={ref}
              id={switchId}
              className="peer sr-only"
              {...props}
            />
            
            {/* Custom switch styling */}
            <label
              htmlFor={switchId}
              className={cn(
                // Track
                'block h-6 w-11 rounded-full transition-colors',
                'peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-blue-500',
                
                // Track colors
                props.disabled
                  ? 'bg-gray-200'
                  : error
                    ? 'bg-red-100 peer-checked:bg-red-500'
                    : 'bg-gray-200 peer-checked:bg-blue-500'
              )}
            >
              {/* Thumb/knob */}
              <span
                className={cn(
                  // Thumb styling
                  'block h-5 w-5 translate-x-0.5 rounded-full bg-white shadow transition-transform',
                  'peer-checked:translate-x-[22px]',
                  props.disabled && 'opacity-60'
                )}
              />
            </label>
          </div>
          
          {/* Label */}
          {label && (
            <label
              htmlFor={switchId}
              className={cn(
                'ml-3 text-sm font-medium',
                props.disabled ? 'text-gray-400' : 'text-gray-700',
                error && 'text-red-500'
              )}
            >
              {label}
            </label>
          )}
        </div>
        
        {/* Helper text or error message */}
        {(helperText || errorMessage) && (
          <div className={cn(
            'mt-1 text-xs',
            error ? 'text-red-500' : 'text-gray-500'
          )}>
            {error ? errorMessage : helperText}
          </div>
        )}
      </div>
    )
  }
)

AndroidSwitch.displayName = 'AndroidSwitch'
