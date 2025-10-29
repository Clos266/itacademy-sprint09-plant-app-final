import { RealtimeChat } from "@/components/RealtimeChat";
import { useRealtimeChat } from "@/hooks/use-realtime-chat";

interface SwapChatProps {
  swapId: number;
  userId: string;
  username: string;
}

export function SwapChat({ swapId, userId, username }: SwapChatProps) {
  const { messages, sendMessage } = useRealtimeChat({
    roomName: `swap-${swapId}`,
    username,
    userId,
    swapId,
  });

  return (
    <RealtimeChat
      roomName={`swap-${swapId}`}
      username={username}
      userId={userId}
      swapId={swapId}
      messages={messages}
      onMessage={(newMessages) => {
        const last = newMessages.at(-1);
        if (last?.content) sendMessage(last.content);
      }}
    />
  );
}
