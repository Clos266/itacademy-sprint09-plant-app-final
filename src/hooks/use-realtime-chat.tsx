"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/services/supabaseClient";

export interface ChatMessage {
  id: string;
  content: string;
  user: {
    name: string;
  };
  createdAt: string;
}

interface UseRealtimeChatProps {
  roomName: string;
  username: string;
  userId: string;
  swapId: number;
}

const EVENT_MESSAGE_TYPE = "message";

export function useRealtimeChat({
  roomName,
  username,
  userId,
  swapId,
}: UseRealtimeChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [channel, setChannel] = useState<any>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!swapId) return;

      const { data, error } = await supabase
        .from("swap_messages")
        .select(
          `
          id,
          message,
          created_at,
          sender_id,
          profiles!swap_messages_sender_id_fkey1(username)
        `
        )
        .eq("swap_id", swapId)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("❌ Error fetching chat history:", error);
        return;
      }

      const formatted = (data as any[]).map((m) => ({
        id: m.id.toString(),
        content: m.message,
        user: {
          name:
            (Array.isArray(m.profiles)
              ? m.profiles[0]?.username
              : m.profiles?.username) || "Unknown",
        },
        createdAt: m.created_at,
      }));

      setMessages(formatted);
    };

    fetchHistory();
  }, [swapId]);

  useEffect(() => {
    const newChannel = supabase.channel(roomName);

    newChannel
      .on("broadcast", { event: EVENT_MESSAGE_TYPE }, (payload) => {
        const newMsg = payload.payload as ChatMessage;
        setMessages((prev) => [...prev, newMsg]);
      })
      .subscribe((status) => {
        setIsConnected(status === "SUBSCRIBED");
      });

    setChannel(newChannel);

    return () => {
      supabase.removeChannel(newChannel);
    };
  }, [roomName]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!channel || !isConnected) return;

      const message: ChatMessage = {
        id: crypto.randomUUID(),
        content,
        user: {
          name: username,
        },
        createdAt: new Date().toISOString(),
      };

      setMessages((current) => [...current, message]);

      const { error } = await supabase.from("swap_messages").insert({
        swap_id: swapId,
        sender_id: userId,
        message: content,
      });

      if (error) {
        console.error("❌ Error saving message:", error);
      }

      await channel.send({
        type: "broadcast",
        event: "message",
        payload: message,
      });
    },
    [channel, isConnected, username, supabase, swapId, userId]
  );

  return { messages, sendMessage, isConnected };
}
