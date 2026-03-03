import { cn } from "@/lib/utils";
import { ArrowUp, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { type KeyboardEvent, useEffect, useRef } from "react";

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  isLoading: boolean;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({
  value,
  onChange,
  onSend,
  isLoading,
  disabled = false,
  placeholder = "Ask me anything...",
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  });

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading && !disabled && value.trim()) {
        onSend();
      }
    }
  };

  const canSend = value.trim().length > 0 && !isLoading && !disabled;

  return (
    <div
      className="sticky bottom-0 px-4 pb-4 pt-2"
      style={{
        background:
          "linear-gradient(to top, oklch(var(--background)) 80%, transparent)",
      }}
    >
      <div className="max-w-3xl mx-auto">
        <div
          className="relative flex items-end gap-3 rounded-2xl px-4 py-3 transition-all duration-200"
          style={{
            background: "oklch(var(--card))",
            border: "1px solid oklch(var(--border))",
            boxShadow: "0 4px 24px oklch(0 0 0 / 0.3)",
          }}
        >
          <textarea
            ref={textareaRef}
            data-ocid="chat.message_input"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={isLoading || disabled}
            rows={1}
            className={cn(
              "flex-1 resize-none bg-transparent outline-none text-sm leading-relaxed",
              "placeholder:text-muted-foreground disabled:opacity-50 disabled:cursor-not-allowed",
              "min-h-[24px] max-h-[200px]",
            )}
            style={{
              color: "oklch(0.90 0.01 260)",
              fontFamily: "Outfit, sans-serif",
            }}
          />

          <motion.button
            type="button"
            data-ocid="chat.send_button"
            onClick={onSend}
            disabled={!canSend}
            whileTap={canSend ? { scale: 0.92 } : undefined}
            whileHover={canSend ? { scale: 1.05 } : undefined}
            className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
            style={{
              background: canSend
                ? "linear-gradient(135deg, oklch(0.72 0.18 196), oklch(0.58 0.20 230))"
                : "oklch(var(--muted))",
              boxShadow: canSend
                ? "0 0 16px oklch(0.72 0.18 196 / 0.4)"
                : "none",
            }}
          >
            {isLoading ? (
              <Loader2
                className="w-3.5 h-3.5 animate-spin"
                style={{ color: "white" }}
              />
            ) : (
              <ArrowUp
                className="w-3.5 h-3.5"
                style={{ color: canSend ? "white" : "oklch(0.5 0.01 260)" }}
                strokeWidth={2.5}
              />
            )}
          </motion.button>
        </div>

        <p
          className="text-center text-xs mt-2"
          style={{ color: "oklch(0.40 0.01 260)" }}
        >
          Press{" "}
          <kbd
            className="px-1 py-0.5 rounded text-xs"
            style={{
              background: "oklch(0.20 0.01 260)",
              border: "1px solid oklch(0.28 0.01 260)",
            }}
          >
            Enter
          </kbd>{" "}
          to send ·{" "}
          <kbd
            className="px-1 py-0.5 rounded text-xs"
            style={{
              background: "oklch(0.20 0.01 260)",
              border: "1px solid oklch(0.28 0.01 260)",
            }}
          >
            Shift+Enter
          </kbd>{" "}
          for new line
        </p>
      </div>
    </div>
  );
}
