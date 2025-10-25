import { Spinner } from "@/components/ui/spinner";

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({
  message = "Loading plants...",
}: LoadingStateProps) {
  return (
    <div className="flex flex-col justify-center items-center h-[70vh] text-muted-foreground">
      <Spinner className="w-8 h-8 mb-4" />
      <p className="text-sm">{message}</p>
    </div>
  );
}
