import { toast } from "sonner";

export function showSuccess(msg: string) {
  toast.success(msg);
}

export function showError(msg: string) {
  toast.error(msg);
}

export function showInfo(msg: string) {
  toast.info(msg);
}

export function showWarning(msg: string) {
  toast.warning(msg);
}
