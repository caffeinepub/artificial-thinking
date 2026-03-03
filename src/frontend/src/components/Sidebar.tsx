import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  Brain,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Plus,
  Trash2,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import type { Conversation } from "../backend.d";

interface SidebarProps {
  conversations: Conversation[];
  activeConversationId: bigint | null;
  onSelectConversation: (id: bigint) => void;
  onNewChat: () => void;
  onDeleteConversation: (id: bigint) => void;
  isLoadingConversations: boolean;
  isCreating: boolean;
}

function formatDate(timestamp: bigint): string {
  const ms = Number(timestamp) / 1_000_000; // nanoseconds to ms
  const date = new Date(ms);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function Sidebar({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewChat,
  onDeleteConversation,
  isLoadingConversations,
  isCreating,
}: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [hoveredId, setHoveredId] = useState<bigint | null>(null);

  return (
    <motion.aside
      animate={{ width: collapsed ? 64 : 280 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="relative flex flex-col flex-shrink-0 h-full overflow-hidden"
      style={{ background: "oklch(var(--sidebar))" }}
    >
      {/* Border right */}
      <div className="absolute inset-y-0 right-0 w-px bg-sidebar-border" />

      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-sidebar-border min-h-[68px]">
        <div className="relative flex-shrink-0">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.72 0.18 196), oklch(0.58 0.20 230))",
              boxShadow: "0 0 16px oklch(0.72 0.18 196 / 0.4)",
            }}
          >
            <Brain className="w-4 h-4 text-white" strokeWidth={2.2} />
          </div>
        </div>

        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.2 }}
              className="flex-1 min-w-0"
            >
              <h1
                className="text-sm font-bold leading-tight truncate"
                style={{
                  fontFamily: "Bricolage Grotesque, sans-serif",
                  letterSpacing: "-0.02em",
                  color: "oklch(0.95 0.01 260)",
                }}
              >
                Artificial
              </h1>
              <h2
                className="text-xs font-semibold uppercase tracking-widest leading-tight"
                style={{ color: "oklch(0.72 0.18 196)" }}
              >
                THINKING
              </h2>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Collapse toggle */}
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          className="flex-shrink-0 w-6 h-6 rounded-md flex items-center justify-center transition-colors hover:bg-sidebar-accent"
          style={{ color: "oklch(var(--muted-foreground))" }}
        >
          {collapsed ? (
            <ChevronRight className="w-3.5 h-3.5" />
          ) : (
            <ChevronLeft className="w-3.5 h-3.5" />
          )}
        </button>
      </div>

      {/* New Chat Button */}
      <div className={cn("px-3 py-3", collapsed && "px-2")}>
        <Button
          onClick={onNewChat}
          disabled={isCreating}
          data-ocid="sidebar.new_chat_button"
          className={cn(
            "w-full font-medium transition-all",
            collapsed ? "px-0 justify-center" : "justify-start gap-2",
          )}
          style={{
            background:
              "linear-gradient(135deg, oklch(0.72 0.18 196 / 0.15), oklch(0.58 0.20 230 / 0.1))",
            border: "1px solid oklch(0.72 0.18 196 / 0.3)",
            color: "oklch(0.80 0.12 196)",
          }}
        >
          <Plus className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span>New Chat</span>}
        </Button>
      </div>

      {/* Conversation List */}
      <ScrollArea className="flex-1 px-2">
        <div data-ocid="sidebar.conversation_list" className="space-y-0.5 pb-4">
          {/* Section label */}
          {!collapsed && (
            <p
              className="px-2 pt-2 pb-1.5 text-xs font-semibold uppercase tracking-widest"
              style={{ color: "oklch(var(--muted-foreground))" }}
            >
              Recent
            </p>
          )}

          {isLoadingConversations && (
            <div className="space-y-1 px-1">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-10 rounded-lg animate-pulse"
                  style={{ background: "oklch(var(--muted))" }}
                />
              ))}
            </div>
          )}

          {!isLoadingConversations &&
            conversations.length === 0 &&
            !collapsed && (
              <p
                className="px-2 py-3 text-xs text-center"
                style={{ color: "oklch(var(--muted-foreground))" }}
              >
                No conversations yet
              </p>
            )}

          {conversations.map((conv, index) => {
            const isActive = conv.id === activeConversationId;
            const isHovered = hoveredId === conv.id;

            return (
              <motion.div
                key={conv.id.toString()}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.04, duration: 0.25 }}
                data-ocid={`sidebar.conversation_item.${index + 1}`}
                className={cn(
                  "group relative flex items-center gap-2 rounded-lg cursor-pointer transition-all duration-150",
                  collapsed ? "px-0 py-2 justify-center mx-1" : "px-2 py-2",
                )}
                style={{
                  background: isActive
                    ? "oklch(0.72 0.18 196 / 0.12)"
                    : isHovered
                      ? "oklch(var(--muted))"
                      : "transparent",
                  border: isActive
                    ? "1px solid oklch(0.72 0.18 196 / 0.25)"
                    : "1px solid transparent",
                }}
                onClick={() => onSelectConversation(conv.id)}
                onMouseEnter={() => setHoveredId(conv.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <MessageSquare
                  className="w-4 h-4 flex-shrink-0"
                  style={{
                    color: isActive
                      ? "oklch(0.72 0.18 196)"
                      : "oklch(var(--muted-foreground))",
                  }}
                />

                {!collapsed && (
                  <>
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-sm font-medium truncate leading-tight"
                        style={{
                          color: isActive
                            ? "oklch(0.90 0.01 260)"
                            : "oklch(0.78 0.01 260)",
                        }}
                      >
                        {conv.title || "New Chat"}
                      </p>
                      <p
                        className="text-xs truncate"
                        style={{ color: "oklch(var(--muted-foreground))" }}
                      >
                        {formatDate(conv.createdAt)}
                      </p>
                    </div>

                    <AnimatePresence>
                      {(isHovered || isActive) && (
                        <motion.button
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          transition={{ duration: 0.15 }}
                          data-ocid={`sidebar.delete_button.${index + 1}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteConversation(conv.id);
                          }}
                          className="flex-shrink-0 w-6 h-6 rounded-md flex items-center justify-center transition-colors hover:bg-destructive/20"
                          style={{ color: "oklch(var(--muted-foreground))" }}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </motion.button>
                      )}
                    </AnimatePresence>
                  </>
                )}
              </motion.div>
            );
          })}
        </div>
      </ScrollArea>
    </motion.aside>
  );
}
