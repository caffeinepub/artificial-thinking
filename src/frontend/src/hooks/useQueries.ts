import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Conversation, Message } from "../backend.d";
import { useActor } from "./useActor";

// ─── List Conversations ────────────────────────────────────────────
export function useListConversations() {
  const { actor, isFetching } = useActor();
  return useQuery<Conversation[]>({
    queryKey: ["conversations"],
    queryFn: async () => {
      if (!actor) return [];
      const list = await actor.listConversations();
      // Sort newest first
      return [...list].sort(
        (a, b) => Number(b.createdAt) - Number(a.createdAt),
      );
    },
    enabled: !!actor && !isFetching,
  });
}

// ─── Get Single Conversation ───────────────────────────────────────
export function useGetConversation(conversationId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Conversation | null>({
    queryKey: ["conversation", conversationId?.toString()],
    queryFn: async () => {
      if (!actor || conversationId === null) return null;
      return actor.getConversation(conversationId);
    },
    enabled: !!actor && !isFetching && conversationId !== null,
  });
}

// ─── Create Conversation ───────────────────────────────────────────
export function useCreateConversation() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (title: string) => {
      if (!actor) throw new Error("No actor");
      return actor.createConversation(title);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}

// ─── Delete Conversation ───────────────────────────────────────────
export function useDeleteConversation() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (conversationId: bigint) => {
      if (!actor) throw new Error("No actor");
      return actor.deleteConversation(conversationId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}

// ─── Send Message ──────────────────────────────────────────────────
export function useSendMessage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      conversationId,
      userMessage,
    }: {
      conversationId: bigint;
      userMessage: string;
    }): Promise<Message> => {
      if (!actor) throw new Error("No actor");
      return actor.sendMessage(conversationId, userMessage);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["conversation", variables.conversationId.toString()],
      });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}

// ─── Update Conversation Title ─────────────────────────────────────
export function useUpdateConversationTitle() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      conversationId,
      title,
    }: {
      conversationId: bigint;
      title: string;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.updateConversationTitle(conversationId, title);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}
