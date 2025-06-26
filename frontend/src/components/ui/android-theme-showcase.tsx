import React from 'react';
import { useAndroidTheme } from '@/theme/AndroidThemeProvider';
import { AndroidCard } from './android-card';
import { AndroidButton } from './android-button';
import { AndroidInput } from './android-input';
import { cn } from '@/lib/utils';

/**
 * AndroidThemeShowcase component
 * 
 * A visual showcase of all the theme elements in the Android design system
 * Useful for design review and testing
 */
export function AndroidThemeShowcase() {
  const { theme } = useAndroidTheme();
  
  return (
    <div className="p-4 space-y-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-light mb-6">Elephant Watch UI Theme</h1>
      
      {/* Color Palette */}
      <section>
        <h2 className="text-xl font-medium mb-4">Color Palette</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <ColorSwatch name="Primary" color={theme.colors.primary} textColor={theme.colors.onPrimary} />
          <ColorSwatch name="Primary Container" color={theme.colors.primaryContainer} textColor={theme.colors.onPrimaryContainer} />
          <ColorSwatch name="Secondary" color={theme.colors.secondary} textColor={theme.colors.onSecondary} />
          <ColorSwatch name="Secondary Container" color={theme.colors.secondaryContainer} textColor={theme.colors.onSecondaryContainer} />
          <ColorSwatch name="Tertiary" color={theme.colors.tertiary} textColor={theme.colors.onTertiary} />
          <ColorSwatch name="Tertiary Container" color={theme.colors.tertiaryContainer} textColor={theme.colors.onTertiaryContainer} />
          <ColorSwatch name="Error" color={theme.colors.error} textColor={theme.colors.onError} />
          <ColorSwatch name="Error Container" color={theme.colors.errorContainer} textColor={theme.colors.onErrorContainer} />
        </div>
      </section>
      
      {/* Typography */}
      <section>
        <h2 className="text-xl font-medium mb-4">Typography</h2>
        <div className="space-y-4 bg-white dark:bg-gray-800 p-6 rounded-xl">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center">
            <p className={cn(theme.typography.displayLarge, "mb-2 md:mb-0")}>Display Large</p>
            <code className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 dark:text-gray-400 p-1 rounded">{theme.typography.displayLarge}</code>
          </div>
          <div className="flex flex-col md:flex-row md:justify-between md:items-center">
            <p className={cn(theme.typography.displayMedium, "mb-2 md:mb-0")}>Display Medium</p>
            <code className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 dark:text-gray-400 p-1 rounded">{theme.typography.displayMedium}</code>
          </div>
          <div className="flex flex-col md:flex-row md:justify-between md:items-center">
            <p className={cn(theme.typography.displaySmall, "mb-2 md:mb-0")}>Display Small</p>
            <code className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 dark:text-gray-400 p-1 rounded">{theme.typography.displaySmall}</code>
          </div>
          <div className="flex flex-col md:flex-row md:justify-between md:items-center">
            <p className={cn(theme.typography.headlineLarge, "mb-2 md:mb-0")}>Headline Large</p>
            <code className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 dark:text-gray-400 p-1 rounded">{theme.typography.headlineLarge}</code>
          </div>
          <div className="flex flex-col md:flex-row md:justify-between md:items-center">
            <p className={cn(theme.typography.headlineMedium, "mb-2 md:mb-0")}>Headline Medium</p>
            <code className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 dark:text-gray-400 p-1 rounded">{theme.typography.headlineMedium}</code>
          </div>
          <div className="flex flex-col md:flex-row md:justify-between md:items-center">
            <p className={cn(theme.typography.headlineSmall, "mb-2 md:mb-0")}>Headline Small</p>
            <code className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 dark:text-gray-400 p-1 rounded">{theme.typography.headlineSmall}</code>
          </div>
          <div className="flex flex-col md:flex-row md:justify-between md:items-center">
            <p className={cn(theme.typography.titleLarge, "mb-2 md:mb-0")}>Title Large</p>
            <code className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 dark:text-gray-400 p-1 rounded">{theme.typography.titleLarge}</code>
          </div>
          <div className="flex flex-col md:flex-row md:justify-between md:items-center">
            <p className={cn(theme.typography.titleMedium, "mb-2 md:mb-0")}>Title Medium</p>
            <code className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 dark:text-gray-400 p-1 rounded">{theme.typography.titleMedium}</code>
          </div>
          <div className="flex flex-col md:flex-row md:justify-between md:items-center">
            <p className={cn(theme.typography.titleSmall, "mb-2 md:mb-0")}>Title Small</p>
            <code className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 dark:text-gray-400 p-1 rounded">{theme.typography.titleSmall}</code>
          </div>
          <div className="flex flex-col md:flex-row md:justify-between md:items-center">
            <p className={cn(theme.typography.bodyLarge, "mb-2 md:mb-0")}>Body Large</p>
            <code className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 dark:text-gray-400 p-1 rounded">{theme.typography.bodyLarge}</code>
          </div>
          <div className="flex flex-col md:flex-row md:justify-between md:items-center">
            <p className={cn(theme.typography.bodyMedium, "mb-2 md:mb-0")}>Body Medium</p>
            <code className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 dark:text-gray-400 p-1 rounded">{theme.typography.bodyMedium}</code>
          </div>
          <div className="flex flex-col md:flex-row md:justify-between md:items-center">
            <p className={cn(theme.typography.bodySmall, "mb-2 md:mb-0")}>Body Small</p>
            <code className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 dark:text-gray-400 p-1 rounded">{theme.typography.bodySmall}</code>
          </div>
          <div className="flex flex-col md:flex-row md:justify-between md:items-center">
            <p className={cn(theme.typography.labelLarge, "mb-2 md:mb-0")}>Label Large</p>
            <code className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 dark:text-gray-400 p-1 rounded">{theme.typography.labelLarge}</code>
          </div>
          <div className="flex flex-col md:flex-row md:justify-between md:items-center">
            <p className={cn(theme.typography.labelMedium, "mb-2 md:mb-0")}>Label Medium</p>
            <code className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 dark:text-gray-400 p-1 rounded">{theme.typography.labelMedium}</code>
          </div>
          <div className="flex flex-col md:flex-row md:justify-between md:items-center">
            <p className={cn(theme.typography.labelSmall, "mb-2 md:mb-0")}>Label Small</p>
            <code className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 dark:text-gray-400 p-1 rounded">{theme.typography.labelSmall}</code>
          </div>
        </div>
      </section>
      
      {/* Shape */}
      <section>
        <h2 className="text-xl font-medium mb-4">Shape</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <ShapeDemo name="Small" shape={theme.shape.cornerSmall} />
          <ShapeDemo name="Medium" shape={theme.shape.cornerMedium} />
          <ShapeDemo name="Large" shape={theme.shape.cornerLarge} />
          <ShapeDemo name="Extra Large" shape={theme.shape.cornerExtraLarge} />
        </div>
      </section>
      
      {/* Spacing */}
      <section>
        <h2 className="text-xl font-medium mb-4">Spacing</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <SpacingDemo name="XS" value={theme.spacing.xs} />
          <SpacingDemo name="SM" value={theme.spacing.sm} />
          <SpacingDemo name="MD" value={theme.spacing.md} />
          <SpacingDemo name="LG" value={theme.spacing.lg} />
          <SpacingDemo name="XL" value={theme.spacing.xl} />
          <SpacingDemo name="XXL" value={theme.spacing.xxl} />
        </div>
      </section>
      
      {/* Component Examples */}
      <section>
        <h2 className="text-xl font-medium mb-4">Component Examples</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <AndroidCard variant="elevated">
            <div className="p-4">
              <h3 className={cn(theme.typography.titleMedium, "mb-2")}>Elevated Card</h3>
              <p className={cn(theme.typography.bodyMedium)}>This is an elevated card with modern styling.</p>
              <div className="mt-4">
                <AndroidButton>Card Action</AndroidButton>
              </div>
            </div>
          </AndroidCard>
          
          <AndroidCard variant="filled">
            <div className="p-4">
              <h3 className={cn(theme.typography.titleMedium, "mb-2")}>Filled Card</h3>
              <p className={cn(theme.typography.bodyMedium)}>This is a filled card with modern styling.</p>
              <div className="mt-4">
                <AndroidButton variant="outlined">Card Action</AndroidButton>
              </div>
            </div>
          </AndroidCard>
          
          <AndroidCard variant="outlined">
            <div className="p-4">
              <h3 className={cn(theme.typography.titleMedium, "mb-2")}>Outlined Card</h3>
              <p className={cn(theme.typography.bodyMedium)}>This is an outlined card with modern styling.</p>
              <div className="mt-4">
                <AndroidButton variant="text">Card Action</AndroidButton>
              </div>
            </div>
          </AndroidCard>
        </div>
        
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 bg-white dark:bg-gray-800 rounded-xl">
            <h3 className={cn(theme.typography.titleMedium, "mb-4")}>Buttons</h3>
            <div className="flex flex-wrap gap-2">
              <AndroidButton>Filled</AndroidButton>
              <AndroidButton variant="outlined">Outlined</AndroidButton>
              <AndroidButton variant="text">Text</AndroidButton>
              <AndroidButton variant="elevated">Elevated</AndroidButton>
              <AndroidButton variant="tonal">Tonal</AndroidButton>
            </div>
          </div>
          
          <div className="p-4 bg-white dark:bg-gray-800 rounded-xl">
            <h3 className={cn(theme.typography.titleMedium, "mb-4")}>Inputs</h3>
            <div className="space-y-4">
              <AndroidInput 
                placeholder="Placeholder text"
                label="Outlined Input"
              />
              <AndroidInput 
                placeholder="Placeholder text"
                label="Filled Input"
                variant="filled"
              />
              <AndroidInput 
                placeholder="Placeholder text"
                label="Input with helper text"
                helperText="This is some helper text"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// Helper components for theme showcase
function ColorSwatch({ name, color, textColor }: { name: string, color: string, textColor: string }) {
  return (
    <div className="flex flex-col">
      <div 
        className="h-20 rounded-lg flex items-center justify-center mb-2"
        style={{ backgroundColor: color, color: textColor }}
      >
        <span className="font-medium text-sm">{color}</span>
      </div>
      <span className="text-xs text-gray-600 dark:text-gray-400">{name}</span>
    </div>
  );
}

function ShapeDemo({ name, shape }: { name: string, shape: string }) {
  return (
    <div className="flex flex-col items-center">
      <div 
        className={cn("h-20 w-full bg-blue-500 flex items-center justify-center mb-2", shape)}
      >
        <span className="text-white font-medium">{shape}</span>
      </div>
      <span className="text-xs text-gray-600 dark:text-gray-400">{name}</span>
    </div>
  );
}

function SpacingDemo({ name, value }: { name: string, value: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-full flex justify-center mb-2">
        <div className="bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700">
          <div
            className="bg-blue-500" 
            style={{ height: value, width: value }}
          ></div>
        </div>
      </div>
      <span className="text-xs font-medium">{name}</span>
      <span className="text-xs text-gray-600 dark:text-gray-400">{value}</span>
    </div>
  );
}
