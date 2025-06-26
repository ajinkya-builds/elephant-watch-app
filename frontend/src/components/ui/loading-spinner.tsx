import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

interface LoadingSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg" | "xl"
  text?: string
  fullScreen?: boolean
}

export function LoadingSpinner({
  className,
  size = "md",
  text,
  fullScreen = false,
  ...props
}: LoadingSpinnerProps) {
  const sizeMap = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-10 w-10",
    xl: "h-16 w-16",
  }

  const textSizeMap = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
    xl: "text-xl",
  }

  const content = (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2",
        className
      )}
      {...props}
    >
      <Loader2
        className={cn(
          "animate-spin text-blue-500 drop-shadow-sm",
          sizeMap[size]
        )}
      />
      {text && (
        <p className={cn("text-gray-600 font-medium", textSizeMap[size])}>
          {text}
        </p>
      )}
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        {content}
      </div>
    )
  }

  return content
}
