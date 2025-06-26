import { HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

// Define interfaces
interface AndroidCardBaseProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Card variant based on Material Design 3
   * - elevated: Card with shadow elevation
   * - filled: Card with background color
   * - outlined: Card with outline border
   */
  variant?: 'elevated' | 'filled' | 'outlined'

  /**
   * Whether to apply padding to the card
   * @default true
   */
  padded?: boolean
  
  /**
   * Whether the card should have rounded corners
   * @default true
   */
  rounded?: boolean
  
  /**
   * Whether to make the card interactive (adds hover effects)
   * @default false
   */
  interactive?: boolean
}

/**
 * AndroidCardHeaderProps interface
 */
export interface AndroidCardHeaderProps extends HTMLAttributes<HTMLDivElement> {}

const AndroidCardHeader = forwardRef<HTMLDivElement, AndroidCardHeaderProps>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "flex flex-col gap-1 p-6 pb-2",
        "group-[.elevated]/elevated:px-6 group-[.elevated]/elevated:pt-6 group-[.elevated]/elevated:pb-2",
        "group-[.filled]/filled:px-6 group-[.filled]/filled:pt-6 group-[.filled]/filled:pb-2",
        "group-[.outlined]/outlined:px-6 group-[.outlined]/outlined:pt-6 group-[.outlined]/outlined:pb-2",
        className
      )}
      {...props}
    />
  )
})

AndroidCardHeader.displayName = 'AndroidCardHeader'

// Main Card Component
const AndroidCard = forwardRef<HTMLDivElement, AndroidCardBaseProps>(
  ({ className, variant = 'elevated', padded = true, rounded = true, interactive = false, ...props }, ref) => {
    // Define styling based on variant using our modern minimalist Material Design 3 tokens
    const variantStyles = {
      elevated: [
        'bg-white',
        'shadow-md',
        'hover:shadow-lg',
        'hover:-translate-y-0.5',
        'active:shadow-sm',
        'active:translate-y-0',
        'dark:bg-gray-800',
        'dark:shadow-gray-900/20',
        'dark:ring-1 dark:ring-gray-700/30',
        'transition-all duration-200 ease-in-out',
        'group/elevated'
      ],
      filled: [
        'bg-gray-50',
        'hover:bg-gray-100',
        'dark:bg-gray-800',
        'dark:hover:bg-gray-700',
        'transition-colors duration-200',
        'group/filled'
      ],
      outlined: [
        'border-2',
        'border-gray-200',
        'hover:border-blue-300',
        'dark:border-gray-700',
        'dark:hover:border-blue-700',
        'bg-white',
        'dark:bg-gray-900',
        'transition-colors duration-200',
        'group/outlined'
      ]
    }[variant];

    // Interactive state styles - enhanced for modern minimalist design
    const interactiveStyles = interactive ? [
      'relative overflow-hidden',
      'before:absolute before:inset-0 before:bg-current before:opacity-0',
      'hover:before:opacity-[0.04]',
      'active:before:opacity-[0.08]',
      'focus-visible:before:opacity-[0.08]',
      'transition-all duration-200 ease-in-out',
      'cursor-pointer',
      'hover:-translate-y-0.5',
      'active:translate-y-0',
      'focus-visible:outline-none',
      'focus-visible:ring-2 focus-visible:ring-blue-400/70'
    ] : [];

    // Padding styles based on variant - more generous spacing for modern look
    const paddingStyles = padded ? {
      elevated: 'p-5',
      filled: 'p-5',
      outlined: 'p-5'
    }[variant] : '';

    return (
      <div
        ref={ref}
        className={cn(
          // Base styles
          'overflow-hidden',
          'transition-all duration-200',
          'text-on-surface dark:text-on-surface-dark',
          
          // Variant styles
          variantStyles,
          
          // Padding
          paddingStyles,
          
          // Border radius
          rounded ? 'rounded-2xl' : 'rounded-none',
          
          // Interactive states
          interactive && interactiveStyles,
          
          // Custom classname
          className
        )}
        {...props}
      />
    )
  }
)

AndroidCard.displayName = 'AndroidCard'

// Card title component
interface AndroidCardTitleProps extends HTMLAttributes<HTMLHeadingElement> {}

const AndroidCardTitle = forwardRef<HTMLParagraphElement, AndroidCardTitleProps>(
  ({ className, ...props }, ref) => {
    return (
      <h3
        ref={ref}
        className={cn(
          "text-[1.5rem] font-medium leading-7 tracking-[0.00938em]",
          "text-on-surface dark:text-on-surface-dark",
          "group-[.elevated]/elevated:text-on-surface",
          "group-[.filled]/filled:text-on-surface",
          "group-[.outlined]/outlined:text-on-surface",
          className
        )}
        {...props}
      />
    )
  }
)

AndroidCardTitle.displayName = 'AndroidCardTitle'

// Card description component
interface AndroidCardDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {}

const AndroidCardDescription = forwardRef<HTMLParagraphElement, AndroidCardDescriptionProps>(
  ({ className, ...props }, ref) => {
    return (
      <p
        ref={ref}
        className={cn(
          "text-sm leading-5 tracking-[0.03125em]",
          "text-on-surface-variant dark:text-on-surface-variant-dark",
          "group-[.elevated]/elevated:text-on-surface-variant",
          "group-[.filled]/filled:text-on-surface-variant",
          "group-[.outlined]/outlined:text-on-surface-variant",
          className
        )}
        {...props}
      />
    )
  }
)

AndroidCardDescription.displayName = 'AndroidCardDescription'

// Card content container
interface AndroidCardContentProps extends HTMLAttributes<HTMLDivElement> {}

const AndroidCardContent = forwardRef<HTMLDivElement, AndroidCardContentProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "px-6 pb-6 pt-0 text-on-surface-variant dark:text-on-surface-variant-dark",
          "group-[.elevated]/elevated:px-6 group-[.elevated]/elevated:pb-6 group-[.elevated]/elevated:pt-0",
          "group-[.filled]/filled:px-6 group-[.filled]/filled:pb-6 group-[.filled]/filled:pt-0",
          "group-[.outlined]/outlined:px-6 group-[.outlined]/outlined:pb-6 group-[.outlined]/outlined:pt-0",
          className
        )}
        {...props}
      />
    )
  }
)

AndroidCardContent.displayName = 'AndroidCardContent'

// Card footer container - typically for actions
interface AndroidCardFooterProps extends HTMLAttributes<HTMLDivElement> {}

const AndroidCardFooter = forwardRef<HTMLDivElement, AndroidCardFooterProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center gap-2 p-6 pt-0",
          "group-[.elevated]/elevated:px-6 group-[.elevated]/elevated:pt-0 group-[.elevated]/elevated:pb-6",
          "group-[.filled]/filled:px-6 group-[.filled]/filled:pt-0 group-[.filled]/filled:pb-6",
          "group-[.outlined]/outlined:px-6 group-[.outlined]/outlined:pt-0 group-[.outlined]/outlined:pb-6",
          className
        )}
        {...props}
      />
    )
  }
)

AndroidCardFooter.displayName = 'AndroidCardFooter'

// Card image component
interface AndroidCardImageProps extends HTMLAttributes<HTMLDivElement> {
  src: string
  alt?: string
  position?: 'top' | 'bottom'
  aspectRatio?: '16:9' | '4:3' | '1:1' | 'auto'
}

const AndroidCardImage = forwardRef<HTMLDivElement, AndroidCardImageProps>(
  ({ className, src, alt = "", position = 'top', aspectRatio = '16:9', ...props }, ref) => {
    // Calculate aspect ratio class
    const aspectRatioClass = {
      '16:9': 'aspect-video',
      '4:3': 'aspect-[4/3]',
      '1:1': 'aspect-square',
      'auto': ''
    }[aspectRatio];

    // Position classes
    const positionClass = position === 'bottom' ? 'order-last' : '';
    
    // Container styles based on card variant
    const containerClass = cn(
      'w-full overflow-hidden',
      'group-[.elevated]/elevated:first:rounded-t-2xl group-[.elevated]/elevated:last:rounded-b-2xl',
      'group-[.filled]/filled:first:rounded-t-2xl group-[.filled]/filled:last:rounded-b-2xl',
      'group-[.outlined]/outlined:first:rounded-t-2xl group-[.outlined]/outlined:last:rounded-b-2xl',
      positionClass,
      className
    );

    // Image styles with transitions
    const imageClass = cn(
      'w-full h-full object-cover',
      'transition-transform duration-300 ease-in-out',
      'group-hover:scale-105',
      aspectRatioClass
    );

    return (
      <div 
        ref={ref}
        className={containerClass}
        {...props}
      >
        <img 
          src={src} 
          alt={alt}
          className={imageClass}
          loading="lazy"
        />
      </div>
    )
  }
);

// Assign display names
AndroidCard.displayName = 'AndroidCard';
AndroidCardHeader.displayName = 'AndroidCard.Header';
AndroidCardTitle.displayName = 'AndroidCard.Title';
AndroidCardDescription.displayName = 'AndroidCard.Description';
AndroidCardContent.displayName = 'AndroidCard.Content';
AndroidCardFooter.displayName = 'AndroidCard.Footer';
AndroidCardImage.displayName = 'AndroidCard.Image';

// Create the compound component
const AndroidCardWithSubcomponents = Object.assign(AndroidCard, {
  Header: AndroidCardHeader,
  Title: AndroidCardTitle,
  Description: AndroidCardDescription,
  Content: AndroidCardContent,
  Footer: AndroidCardFooter,
  Image: AndroidCardImage,
});

// Export the component and its types
export { AndroidCardWithSubcomponents as AndroidCard };
export type { AndroidCardBaseProps as AndroidCardProps, AndroidCardImageProps };
