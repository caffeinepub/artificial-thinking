import { Toaster } from "@/components/ui/sonner";
import { Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import type { Message } from "./backend.d";
import { ChatArea } from "./components/ChatArea";
import { Sidebar } from "./components/Sidebar";
import {
  useCreateConversation,
  useDeleteConversation,
  useGetConversation,
  useListConversations,
  useSendMessage,
  useUpdateConversationTitle,
} from "./hooks/useQueries";

export default function App() {
  const [activeConversationId, setActiveConversationId] = useState<
    bigint | null
  >(null);
  const [inputValue, setInputValue] = useState("");
  const [optimisticMessages, setOptimisticMessages] = useState<Message[]>([]);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isFirstMessage, setIsFirstMessage] = useState(false);

  // ─── Queries ───────────────────────────────────────────────────────
  const { data: conversations = [], isLoading: isLoadingConversations } =
    useListConversations();

  const { data: activeConversation } = useGetConversation(activeConversationId);

  // ─── Mutations ─────────────────────────────────────────────────────
  const createConversationMutation = useCreateConversation();
  const deleteConversationMutation = useDeleteConversation();
  const sendMessageMutation = useSendMessage();
  const updateTitleMutation = useUpdateConversationTitle();

  const isLoading = sendMessageMutation.isPending;

  // Combine real messages with any optimistic ones
  const displayMessages: Message[] = activeConversation?.messages
    ? [
        ...activeConversation.messages,
        ...optimisticMessages.filter(
          (om) => !activeConversation.messages.some((m) => m.id === om.id),
        ),
      ]
    : optimisticMessages;

  // Sort by timestamp
  const sortedMessages = [...displayMessages].sort(
    (a, b) => Number(a.timestamp) - Number(b.timestamp),
  );

  // ─── Clear optimistic messages when real messages arrive ──────────
  useEffect(() => {
    if (activeConversation?.messages && optimisticMessages.length > 0) {
      // If the real messages now contain what we optimistically added, clear them
      const allOptimisticCovered = optimisticMessages.every((om) =>
        activeConversation.messages.some(
          (m) => m.content === om.content && m.role === om.role,
        ),
      );
      if (allOptimisticCovered) {
        setOptimisticMessages([]);
      }
    }
  }, [activeConversation?.messages, optimisticMessages]);

  // ─── Handlers ─────────────────────────────────────────────────────
  const handleNewChat = useCallback(async () => {
    try {
      const newId = await createConversationMutation.mutateAsync("New Chat");
      setActiveConversationId(newId);
      setOptimisticMessages([]);
      setIsFirstMessage(true);
      setIsMobileSidebarOpen(false);
    } catch {
      toast.error("Failed to create a new conversation");
    }
  }, [createConversationMutation]);

  const handleSelectConversation = useCallback((id: bigint) => {
    setActiveConversationId(id);
    setOptimisticMessages([]);
    setIsFirstMessage(false);
    setIsMobileSidebarOpen(false);
  }, []);

  const handleDeleteConversation = useCallback(
    async (id: bigint) => {
      try {
        await deleteConversationMutation.mutateAsync(id);
        if (activeConversationId === id) {
          setActiveConversationId(null);
          setOptimisticMessages([]);
        }
        toast.success("Conversation deleted");
      } catch {
        toast.error("Failed to delete conversation");
      }
    },
    [deleteConversationMutation, activeConversationId],
  );

  const handleSend = useCallback(async () => {
    const text = inputValue.trim();
    if (!text || isLoading) return;

    // If no conversation is active, create one first
    let convId = activeConversationId;
    if (!convId) {
      try {
        convId = await createConversationMutation.mutateAsync("New Chat");
        setActiveConversationId(convId);
        setIsFirstMessage(true);
      } catch {
        toast.error("Failed to start a conversation");
        return;
      }
    }

    // Clear input immediately
    setInputValue("");

    // Optimistically add user message
    const tempUserMsg: Message = {
      id: BigInt(Date.now()),
      content: text,
      role: "user" as Message["role"],
      timestamp: BigInt(Date.now() * 1_000_000),
    };
    setOptimisticMessages((prev) => [...prev, tempUserMsg]);

    try {
      // Send message — response includes the AI reply
      const aiMessage = await sendMessageMutation.mutateAsync({
        conversationId: convId,
        userMessage: text,
      });

      // Add AI response optimistically (will be replaced by real data)
      setOptimisticMessages((prev) => [
        ...prev.filter((m) => m.id !== tempUserMsg.id),
        aiMessage,
      ]);

      // Update title after first message
      if (isFirstMessage || sortedMessages.length === 0) {
        const titleSnippet =
          text.length > 50 ? `${text.slice(0, 47)}...` : text;
        await updateTitleMutation.mutateAsync({
          conversationId: convId,
          title: titleSnippet,
        });
        setIsFirstMessage(false);
      }
    } catch {
      // Remove the optimistic user message on failure
      setOptimisticMessages((prev) =>
        prev.filter((m) => m.id !== tempUserMsg.id),
      );
      toast.error("Failed to send message. Please try again.");
    }
  }, [
    inputValue,
    isLoading,
    activeConversationId,
    createConversationMutation,
    sendMessageMutation,
    updateTitleMutation,
    isFirstMessage,
    sortedMessages.length,
  ]);

  const handleWelcomePrompt = useCallback((prompt: string) => {
    setInputValue(prompt);
  }, []);

  return (
    <div
      className="flex h-screen w-full overflow-hidden"
      style={{ background: "oklch(var(--background))" }}
    >
      {/* ── Desktop Sidebar ────────────────────────────────────────── */}
      <div className="hidden md:flex h-full">
        <Sidebar
          conversations={conversations}
          activeConversationId={activeConversationId}
          onSelectConversation={handleSelectConversation}
          onNewChat={handleNewChat}
          onDeleteConversation={handleDeleteConversation}
          isLoadingConversations={isLoadingConversations}
          isCreating={createConversationMutation.isPending}
        />
      </div>

      {/* ── Mobile Sidebar Overlay ──────────────────────────────────── */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 md:hidden"
              style={{ background: "oklch(0 0 0 / 0.6)" }}
              onClick={() => setIsMobileSidebarOpen(false)}
            />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="fixed inset-y-0 left-0 z-50 md:hidden h-full"
              style={{ width: 280 }}
            >
              <Sidebar
                conversations={conversations}
                activeConversationId={activeConversationId}
                onSelectConversation={handleSelectConversation}
                onNewChat={handleNewChat}
                onDeleteConversation={handleDeleteConversation}
                isLoadingConversations={isLoadingConversations}
                isCreating={createConversationMutation.isPending}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Main Content ───────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Mobile header */}
        <div
          className="md:hidden flex items-center gap-3 px-4 py-3 border-b"
          style={{ borderColor: "oklch(var(--border))" }}
        >
          <button
            type="button"
            onClick={() => setIsMobileSidebarOpen(true)}
            className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors hover:bg-accent"
            style={{ color: "oklch(0.70 0.01 260)" }}
          >
            {isMobileSidebarOpen ? (
              <X className="w-4 h-4" />
            ) : (
              <Menu className="w-4 h-4" />
            )}
          </button>
          <span
            className="text-sm font-semibold"
            style={{
              fontFamily: "Bricolage Grotesque, sans-serif",
              color: "oklch(0.90 0.01 260)",
            }}
          >
            Artificial{" "}
            <span style={{ color: "oklch(0.72 0.18 196)" }}>THINKING</span>
          </span>
        </div>

        {/* Chat area */}
        <ChatArea
          messages={sortedMessages}
          isLoading={isLoading}
          isConversationSelected={activeConversationId !== null}
          inputValue={inputValue}
          onInputChange={setInputValue}
          onSend={handleSend}
          onSelectPrompt={handleWelcomePrompt}
          conversationTitle={activeConversation?.title}
        />
      </div>

      {/* Toast notifications */}
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: "oklch(var(--card))",
            border: "1px solid oklch(var(--border))",
            color: "oklch(var(--foreground))",
          },
        }}
      />
    </div>
  );
}
