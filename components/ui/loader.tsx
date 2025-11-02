import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const loaderVariants = cva(
  "inline-block animate-spin rounded-full border-solid border-t-transparent",
  {
    variants: {
      variant: {
        primary: "border-primary",
        secondary: "border-secondary",
        success: "border-success",
        destructive: "border-destructive",
        accent: "border-accent",
      },
      size: {
        sm: "h-4 w-4 border-2",
        md: "h-8 w-8 border-[3px]",
        lg: "h-12 w-12 border-4",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
)

export interface LoaderProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof loaderVariants> {}

const Loader = React.forwardRef<HTMLDivElement, LoaderProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(loaderVariants({ variant, size, className }))}
        {...props}
      />
    )
  }
)
Loader.displayName = "Loader"

// Page-level loading skeleton
export function PageLoader({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center space-y-4">
        <Loader size="lg" variant="primary" className="mx-auto" />
        <p className="text-muted-foreground text-sm">{message}</p>
      </div>
    </div>
  )
}

export { Loader }

