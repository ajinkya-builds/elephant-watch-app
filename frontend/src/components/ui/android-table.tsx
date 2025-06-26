import React from "react"
import { cn } from "@/lib/utils"
import { useAndroidTheme } from "@/theme/AndroidThemeProvider"
import { applyThemeClasses } from "@/theme/AndroidThemeUtils"

// Table root component
export interface AndroidTableProps extends React.HTMLAttributes<HTMLTableElement> {
  /**
   * Whether to make the table dense (smaller padding)
   */
  dense?: boolean
  /**
   * Whether to add dividers between rows
   */
  dividers?: boolean
}

const AndroidTable = React.forwardRef<HTMLTableElement, AndroidTableProps>(
  ({ className, dense = false, dividers = true, ...props }, ref) => {
    const { theme } = useAndroidTheme()
    
    return (
      <div className="w-full overflow-auto">
        <table
          ref={ref}
          className={cn(
            "w-full caption-bottom text-sm",
            applyThemeClasses(theme, "text-onSurface"),
            className
          )}
          {...props}
        />
      </div>
    )
  }
)
AndroidTable.displayName = "AndroidTable"

// Table header component
export interface AndroidTableHeaderProps extends React.HTMLAttributes<HTMLTableSectionElement> {}

const AndroidTableHeader = React.forwardRef<HTMLTableSectionElement, AndroidTableHeaderProps>(
  ({ className, ...props }, ref) => {
    const { theme } = useAndroidTheme()
    
    return (
      <thead
        ref={ref}
        className={cn(
          applyThemeClasses(theme, "bg-surfaceVariant text-onSurfaceVariant"),
          "[&_tr]:border-b",
          className
        )}
        {...props}
      />
    )
  }
)
AndroidTableHeader.displayName = "AndroidTableHeader"

// Table body component
export interface AndroidTableBodyProps extends React.HTMLAttributes<HTMLTableSectionElement> {}

const AndroidTableBody = React.forwardRef<HTMLTableSectionElement, AndroidTableBodyProps>(
  ({ className, ...props }, ref) => {
    return (
      <tbody
        ref={ref}
        className={cn("[&_tr:last-child]:border-0", className)}
        {...props}
      />
    )
  }
)
AndroidTableBody.displayName = "AndroidTableBody"

// Table row component
export interface AndroidTableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  /**
   * Whether the row is selected
   */
  selected?: boolean
}

const AndroidTableRow = React.forwardRef<HTMLTableRowElement, AndroidTableRowProps>(
  ({ className, selected = false, ...props }, ref) => {
    const { theme } = useAndroidTheme()
    
    return (
      <tr
        ref={ref}
        className={cn(
          "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
          selected && applyThemeClasses(theme, "bg-primaryContainer text-onPrimaryContainer"),
          !selected && "hover:bg-surfaceVariant/20",
          className
        )}
        {...props}
      />
    )
  }
)
AndroidTableRow.displayName = "AndroidTableRow"

// Table head (column header) component
export interface AndroidTableHeadProps extends React.ThHTMLAttributes<HTMLTableCellElement> {}

const AndroidTableHead = React.forwardRef<HTMLTableCellElement, AndroidTableHeadProps>(
  ({ className, ...props }, ref) => {
    const { theme } = useAndroidTheme()
    
    return (
      <th
        ref={ref}
        className={cn(
          "h-12 px-4 text-left align-middle font-medium",
          theme.typography.labelLarge,
          applyThemeClasses(theme, "text-onSurfaceVariant"),
          className
        )}
        {...props}
      />
    )
  }
)
AndroidTableHead.displayName = "AndroidTableHead"

// Table cell component
export interface AndroidTableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {}

const AndroidTableCell = React.forwardRef<HTMLTableCellElement, AndroidTableCellProps>(
  ({ className, ...props }, ref) => {
    return (
      <td
        ref={ref}
        className={cn("p-4 align-middle", className)}
        {...props}
      />
    )
  }
)
AndroidTableCell.displayName = "AndroidTableCell"

// Table caption component
export interface AndroidTableCaptionProps extends React.HTMLAttributes<HTMLTableCaptionElement> {}

const AndroidTableCaption = React.forwardRef<HTMLTableCaptionElement, AndroidTableCaptionProps>(
  ({ className, ...props }, ref) => {
    const { theme } = useAndroidTheme()
    
    return (
      <caption
        ref={ref}
        className={cn(
          "mt-4 text-sm",
          theme.typography.bodySmall,
          applyThemeClasses(theme, "text-onSurfaceVariant"),
          className
        )}
        {...props}
      />
    )
  }
)
AndroidTableCaption.displayName = "AndroidTableCaption"

// Create compound component
export {
  AndroidTable,
  AndroidTableHeader,
  AndroidTableBody,
  AndroidTableHead,
  AndroidTableRow,
  AndroidTableCell,
  AndroidTableCaption
}
