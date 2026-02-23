import { cn } from "@/lib/utils/cn";

interface LoadingSpinnerProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  label?: string;
  fullScreen?: boolean;
}

const sizeClasses = {
  sm: "h-6 w-6",
  md: "h-8 w-8",
  lg: "h-10 w-10",
};

export function LoadingSpinner({
  className,
  size = "md",
  label = "Ladowanie...",
  fullScreen = false,
}: LoadingSpinnerProps) {
  const spinner = (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <div
        className={cn(
          "animate-spin rounded-full border-4 border-primary border-t-transparent",
          sizeClasses[size]
        )}
      />
      {label && (
        <span className="text-sm text-muted-foreground">{label}</span>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="flex h-screen items-center justify-center">
        {spinner}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-12">{spinner}</div>
  );
}
