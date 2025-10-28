import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { ReactNode } from "react";

interface ModalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  onConfirm?: () => Promise<void> | void;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  loadingText?: string;
  showFooter?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
}

const sizeClasses = {
  sm: "sm:max-w-sm",
  md: "sm:max-w-md",
  lg: "sm:max-w-lg",
  xl: "sm:max-w-2xl",
};

export function ModalDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  onConfirm,
  confirmLabel = "Save",
  cancelLabel = "Cancel",
  loading = false,
  loadingText = "Saving...",
  showFooter = true,
  size = "lg",
}: ModalDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!loading) onOpenChange(nextOpen);
      }}
    >
      <DialogContent
        className={sizeClasses[size]}
        aria-busy={loading}
        aria-describedby={loading ? "modal-loading-region" : undefined}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <div className="py-4">{children}</div>

        {showFooter && (
          <DialogFooter className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              {cancelLabel}
            </Button>

            {onConfirm && (
              <Button
                onClick={onConfirm}
                disabled={loading}
                className="min-w-[90px] flex items-center justify-center gap-2"
                id={loading ? "modal-loading-region" : undefined}
              >
                {loading && <Spinner className="w-4 h-4 mr-2" />}
                {loading ? loadingText : confirmLabel}
              </Button>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
