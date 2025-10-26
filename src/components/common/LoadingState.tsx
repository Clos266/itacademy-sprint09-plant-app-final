import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

interface LoadingStateProps {
  size?: "sm" | "md" | "lg";
  message?: string;
  className?: string;
}

const sizeClasses = {
  sm: "w-4 h-4",
  md: "w-6 h-6",
  lg: "w-8 h-8",
};

export function LoadingState({
  size = "md",
  message,
  className,
}: LoadingStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center", className)}>
      <Spinner className={sizeClasses[size]} />
      {message && <p className="text-muted-foreground mt-2">{message}</p>}
    </div>
  );
}
