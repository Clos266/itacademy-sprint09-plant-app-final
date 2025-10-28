import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SwapChat } from "@/components/swaps/SwapChat";
import { showError, showSuccess } from "@/services/toastService";
import { Separator } from "@/components/ui/separator";
import { useState, useMemo, useCallback } from "react";
import { Spinner } from "@/components/ui/spinner";
import type { Database } from "@/types/supabase";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  markSwapAsCompletedByUser,
  declineSwapProposal,
} from "@/services/swapCrudService";
import { ModalDialog } from "@/components/modals/ModalDialog";

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
  const avatarClass = "w-10 h-10 rounded-full object-cover mb-1";
  const plantImageClass = "object-cover w-full h-full";
  const plantContainerClass =
    "mx-auto w-20 h-20 sm:w-20 sm:h-20 rounded-lg overflow-hidden border shadow-sm";
  const userCardClass = "text-center";
  const usernameClass = "text-sm font-medium";
  const plantNameClass = "mt-2 font-medium text-sm";

  const [loadingAction, setLoadingAction] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);

  const swapInfo = useMemo(() => {
    if (!swap) return null;
    return {
      isReceiver: swap.receiver_id === userId,
      isAccepted: swap.status === "accepted",
      isPending: swap.status === "pending",
      isCompleted: swap.status === "completed",
      canReject: swap.status !== "completed",
    };
  }, [swap?.receiver_id, swap?.status, userId]);

  const handleRejectSwap = useCallback(() => {
    setShowRejectDialog(true);
  }, []);

  const handleConfirmReject = useCallback(async () => {
    if (!swap) return;

    try {
      setLoadingAction(true);
      setShowRejectDialog(false);

      await declineSwapProposal({
        swapId: swap.id,
        senderPlantId: swap.senderPlant?.id,
        receiverPlantId: swap.receiverPlant?.id,
      });
      onStatusChange?.();
      onOpenChange(false);
    } catch (err) {
      console.error(err);
      showError("Failed to reject swap");
    } finally {
      setLoadingAction(false);
    }
  }, [swap?.id, onStatusChange, onOpenChange]);

  const handleMarkAsCompleted = useCallback(async () => {
    if (!swap) return;

    try {
      setLoadingAction(true);
      await markSwapAsCompletedByUser(swap.id, userId);
      showSuccess("Swap marked as completed");
      onStatusChange?.();
      onOpenChange(false);
    } catch (err) {
      console.error("Error marking swap as completed:", err);
      showError("Failed to update completion status");
    } finally {
      setLoadingAction(false);
    }
  }, [swap?.id, userId, onStatusChange, onOpenChange]);

  const customFooter = swap && swapInfo && (
    <div className="flex justify-end gap-2">
      {swapInfo.isAccepted && (
        <Button
          disabled={loadingAction}
          onClick={handleMarkAsCompleted}
          variant="secondary"
        >
          {loadingAction ? <Spinner className="w-4 h-4" /> : "Complete Swap"}
        </Button>
      )}
      {swapInfo.canReject && (
        <Button
          disabled={loadingAction}
          variant="destructive"
          onClick={handleRejectSwap}
        >
          {loadingAction ? <Spinner className="w-4 h-4" /> : "Reject Swap"}
        </Button>
      )}
    </div>
  );

  return (
    <>
      <ModalDialog
        open={open}
        onOpenChange={onOpenChange}
        title="Swap Details"
        description="View details and manage this swap between plants"
        showFooter={false}
        size="xl"
      >
        <ScrollArea className="max-h-[70vh]">
          {swap && (
            <div className="flex justify-center mb-4">
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
            </div>
          )}

          {!swap ? (
            <div className="flex flex-col justify-center items-center py-8 text-center">
              <Spinner className="w-8 h-8 mb-4" />
              <p className="text-muted-foreground">Loading swap details...</p>
            </div>
          ) : (
            <>
              {/* TODO: Extract SwapParticipants component - contains both sender and receiver cards */}
              <div className="grid grid-cols-2 gap-6 mt-4">
                {/* TODO: Extract UserPlantCard component - reusable user avatar + plant image card */}
                <div className={userCardClass}>
                  <div className="flex flex-col items-center mb-2">
                    <img
                      src={swap.sender?.avatar_url || "/avatar-placeholder.png"}
                      alt={`${
                        swap.sender?.username || "Unknown user"
                      }'s avatar`}
                      loading="lazy"
                      className={avatarClass}
                    />
                    <span className={usernameClass}>
                      @{swap.sender?.username || "Unknown"}
                    </span>
                    <div className={plantContainerClass}>
                      <img
                        src={
                          swap.senderPlant?.image_url || "/imagenotfound.jpeg"
                        }
                        alt={`${swap.senderPlant?.nombre_comun || "Plant"} - ${
                          swap.sender?.username || "Unknown user"
                        }`}
                        loading="lazy"
                        className={plantImageClass}
                      />
                    </div>
                  </div>
                  <p className={plantNameClass}>
                    {swap.senderPlant?.nombre_comun || "Unknown Plant"}
                  </p>
                </div>

                {/* TODO: Extract UserPlantCard component - duplicate structure, perfect for extraction */}
                <div className={userCardClass}>
                  <div className="flex flex-col items-center mb-2">
                    <img
                      src={
                        swap.receiver?.avatar_url || "/avatar-placeholder.png"
                      }
                      alt={`${
                        swap.receiver?.username || "Unknown user"
                      }'s avatar`}
                      loading="lazy"
                      className={avatarClass}
                    />
                    <span className={usernameClass}>
                      @{swap.receiver?.username || "Unknown"}
                    </span>
                  </div>
                  <div className={plantContainerClass}>
                    <img
                      src={
                        swap.receiverPlant?.image_url || "/imagenotfound.jpeg"
                      }
                      alt={`${swap.receiverPlant?.nombre_comun || "Plant"} - ${
                        swap.receiver?.username || "Unknown user"
                      }`}
                      loading="lazy"
                      className={plantImageClass}
                    />
                  </div>
                  <p className={plantNameClass}>
                    {swap.receiverPlant?.nombre_comun || "Unknown Plant"}
                  </p>
                </div>
              </div>

              <Separator className="my-4" />

              {/* TODO: Extract ChatSection component when chat features expand */}
              {swapInfo?.isAccepted && (
                <div className="mt-6">
                  <h4 className="font-semibold mb-2">Chat</h4>
                  <SwapChat
                    swapId={swap.id}
                    userId={userId}
                    username={username}
                  />
                </div>
              )}
            </>
          )}
        </ScrollArea>

        {/* Custom footer */}
        {customFooter}
      </ModalDialog>

      {/* Confirmation dialog for reject action */}
      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Swap</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reject this swap? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmReject}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Reject Swap
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
