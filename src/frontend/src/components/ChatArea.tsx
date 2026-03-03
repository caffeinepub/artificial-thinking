import { AnimatePresence } from "motion/react";
import { useEffect, useRef } from "react";
import type { Message } from "../backend.d";
import { ChatInput } from "./ChatInput";
import { MessageBubble, TypingIndicator } from "./MessageBubble";
import { WelcomeScreen } from "./WelcomeScreen";

interface ChatAreaProps {
  messages: Message[];
  isLoading: boolean;
  isConversationSelected: boolean;
  inputValue: string;
  onInputChange: (value: string) => void;
  onSend: () => void;
  onSelectPrompt: (prompt: string) => void;
  conversationTitle?: string;
}

export function ChatArea({
  messages,
  isLoading,
  isConversationSelected,
  inputValue,
  onInputChange,
  onSend,
  onSelectPrompt,
}: ChatAreaProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  });

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto">
        {!isConversationSelected ? (
          <WelcomeScreen onSelectPrompt={onSelectPrompt} />
        ) : (
          <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
            <AnimatePresence initial={false}>
              {messages.map((message, index) => (
                <MessageBubble
                  key={message.id.toString()}
                  message={message}
                  index={index}
                />
              ))}

              {isLoading && <TypingIndicator key="typing" />}
            </AnimatePresence>

            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <ChatInput
        value={inputValue}
        onChange={onInputChange}
        onSend={onSend}
        isLoading={isLoading}
        disabled={false}
        placeholder={
          isConversationSelected
            ? "Continue the conversation..."
            : "Ask me anything..."
        }
      />
    </div>
  );
}
