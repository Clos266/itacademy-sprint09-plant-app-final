import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SwapChat } from "@/components/swaps/SwapChat";
import { showError, showSuccess } from "@/services/toastService";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import type { Database } from "@/types/supabase";
import { ScrollArea } from "@/components/ui/scroll-area";
import { updateSwapStatusWithAvailability } from "@/services/swapCrudService";

type Swap = Database["public"]["Tables"]["swaps"]["Row"];
type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type Plant = Database["public"]["Tables"]["plants"]["Row"];

interface FullSwap extends Swap {
  sender?: Profile | null;
  receiver?: Profile | null;
  senderPlant?: Plant | null;
  receiverPlant?: Plant | null;
}

interface SwapInfoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  swap: FullSwap | null;
  userId: string;
  username: string;
  onStatusChange?: () => void;
}

export function SwapInfoModal({
  open,
  onOpenChange,
  swap,
  userId,
  username,
  onStatusChange,
}: SwapInfoModalProps) {
  const [loadingAction, setLoadingAction] = useState(false);

  if (!swap) return null;

  const isReceiver = swap.receiver_id === userId;
  const isAccepted = swap.status === "accepted";
  const isPending = swap.status === "pending";

  const handleUpdateStatus = async (status: "accepted" | "rejected") => {
    try {
      setLoadingAction(true);

      await updateSwapStatusWithAvailability(
        swap.id,
        status,
        swap.senderPlant?.id,
        swap.receiverPlant?.id
      );

      showSuccess(`Swap ${status} successfully`);
      onStatusChange?.();
      onOpenChange(false);
    } catch (err) {
      console.error(err);
      showError("Failed to update swap status");
    } finally {
      setLoadingAction(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-xl w-[90%] sm:w-[600px] max-h-[90vh] overflow-y-auto mx-auto rounded-2xl border p-4"
        style={{ overflow: "visible" }}
      >
        <ScrollArea className="max-h-[85vh] p-4">
          <DialogHeader className="flex flex-col items-center">
            <DialogTitle>Swap Details</DialogTitle>
            <DialogDescription className="sr-only">
              Details and chat about the selected plant swap
            </DialogDescription>
            <Badge
              variant={
                swap.status === "accepted"
                  ? "default"
                  : swap.status === "rejected"
                  ? "destructive"
                  : "secondary"
              }
            >
              {swap.status.charAt(0).toUpperCase() + swap.status.slice(1)}
            </Badge>
          </DialogHeader>

          {/* 🌿 Plantas y usuarios en columnas */}
          <div className="grid grid-cols-2 gap-6 mt-4">
            {/* Sender */}
            <div className="text-center">
              <div className="flex flex-col items-center mb-2">
                <img
                  src={swap.sender?.avatar_url || "/avatar-placeholder.png"}
                  alt={swap.sender?.username || "User"}
                  className="w-10 h-10 rounded-full object-cover mb-1"
                />
                <span className="text-sm font-medium">
                  @{swap.sender?.username || "Unknown"}
                </span>
                <div className="mx-auto w-20 h-20 sm:w-20 sm:h-20 rounded-lg overflow-hidden border shadow-sm">
                  <img
                    src={swap.senderPlant?.image_url || "/imagenotfound.jpeg"}
                    alt={swap.senderPlant?.nombre_comun || "Plant"}
                    className="object-cover w-full h-full"
                  />
                </div>
              </div>
              <p className="mt-2 font-medium text-sm">
                {swap.senderPlant?.nombre_comun}
              </p>
            </div>

            {/* Receiver */}
            <div className="text-center">
              <div className="flex flex-col items-center mb-2">
                <img
                  src={swap.receiver?.avatar_url || "/avatar-placeholder.png"}
                  alt={swap.receiver?.username || "User"}
                  className="w-10 h-10 rounded-full object-cover mb-1"
                />
                <span className="text-sm font-medium">
                  @{swap.receiver?.username || "Unknown"}
                </span>
              </div>
              <div className="mx-auto w-20 h-20 sm:w-20 sm:h-20 rounded-lg overflow-hidden border shadow-sm">
                <img
                  src={swap.receiverPlant?.image_url || "/imagenotfound.jpeg"}
                  alt={swap.receiverPlant?.nombre_comun || "Plant"}
                  className="object-cover w-full h-full"
                />
              </div>
              <p className="mt-2 font-medium text-sm">
                {swap.receiverPlant?.nombre_comun}
              </p>
            </div>
          </div>

          <Separator className="my-4" />

          {/* 🧭 Acciones */}
          {isReceiver && isPending && (
            <DialogFooter className="mt-4">
              <Button
                disabled={loadingAction}
                onClick={() => handleUpdateStatus("accepted")}
              >
                {loadingAction ? (
                  <Spinner className="w-4 h-4" />
                ) : (
                  "Accept Swap"
                )}
              </Button>
              <Button
                disabled={loadingAction}
                variant="destructive"
                onClick={() => handleUpdateStatus("rejected")}
              >
                Reject
              </Button>
            </DialogFooter>
          )}

          {/* 💬 Chat */}
          {isAccepted && (
            <div className="mt-6">
              <h4 className="font-semibold mb-2">Chat</h4>
              <SwapChat swapId={swap.id} userId={userId} username={username} />
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
