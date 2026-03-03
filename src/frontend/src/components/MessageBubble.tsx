import { cn } from "@/lib/utils";
import { Brain, User } from "lucide-react";
import { motion } from "motion/react";
import type { Message } from "../backend.d";
import { Role } from "../backend.d";

interface MessageBubbleProps {
  message: Message;
  index: number;
}

function renderContent(content: string) {
  // Basic markdown-like rendering
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let lineIndex = 0;

  while (lineIndex < lines.length) {
    const line = lines[lineIndex];

    // Code block
    if (line.startsWith("```")) {
      const lang = line.slice(3).trim();
      const codeLines: string[] = [];
      lineIndex++;
      while (lineIndex < lines.length && !lines[lineIndex].startsWith("```")) {
        codeLines.push(lines[lineIndex]);
        lineIndex++;
      }
      elements.push(
        <pre key={`code-${lineIndex}`} className="my-3">
          {lang && (
            <div
              className="text-xs px-3 py-1.5 border-b"
              style={{
                color: "oklch(0.60 0.015 260)",
                borderColor: "oklch(0.24 0.012 260)",
              }}
            >
              {lang}
            </div>
          )}
          <code>{codeLines.join("\n")}</code>
        </pre>,
      );
      lineIndex++;
      continue;
    }

    // Headings
    if (line.startsWith("### ")) {
      elements.push(<h3 key={`h3-${lineIndex}`}>{line.slice(4)}</h3>);
      lineIndex++;
      continue;
    }
    if (line.startsWith("## ")) {
      elements.push(<h2 key={`h2-${lineIndex}`}>{line.slice(3)}</h2>);
      lineIndex++;
      continue;
    }
    if (line.startsWith("# ")) {
      elements.push(<h1 key={`h1-${lineIndex}`}>{line.slice(2)}</h1>);
      lineIndex++;
      continue;
    }

    // Bullet list
    if (line.startsWith("- ") || line.startsWith("* ")) {
      const listItems: string[] = [];
      while (
        lineIndex < lines.length &&
        (lines[lineIndex].startsWith("- ") || lines[lineIndex].startsWith("* "))
      ) {
        listItems.push(lines[lineIndex].slice(2));
        lineIndex++;
      }
      elements.push(
        <ul key={`ul-${lineIndex}`} className="my-2">
          {listItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>,
      );
      continue;
    }

    // Numbered list
    if (/^\d+\.\s/.test(line)) {
      const listItems: string[] = [];
      while (lineIndex < lines.length && /^\d+\.\s/.test(lines[lineIndex])) {
        listItems.push(lines[lineIndex].replace(/^\d+\.\s/, ""));
        lineIndex++;
      }
      elements.push(
        <ol key={`ol-${lineIndex}`} className="my-2 list-decimal">
          {listItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ol>,
      );
      continue;
    }

    // Empty line
    if (line.trim() === "") {
      lineIndex++;
      continue;
    }

    // Regular paragraph with inline code
    const parts = line.split(/(`[^`]+`)/g);
    elements.push(
      <p key={`p-${lineIndex}`}>
        {parts.map((part) => {
          if (part.startsWith("`") && part.endsWith("`")) {
            return (
              <code key={`code-inline-${lineIndex}-${part}`}>
                {part.slice(1, -1)}
              </code>
            );
          }
          // Bold
          const boldParts = part.split(/(\*\*[^*]+\*\*)/g);
          return boldParts.map((bp) => {
            if (bp.startsWith("**") && bp.endsWith("**")) {
              return (
                <strong key={`bold-${lineIndex}-${bp}`}>
                  {bp.slice(2, -2)}
                </strong>
              );
            }
            return bp;
          });
        })}
      </p>,
    );
    lineIndex++;
  }

  return elements;
}

export function MessageBubble({ message, index }: MessageBubbleProps) {
  const isUser = message.role === Role.user;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut", delay: index * 0.04 }}
      data-ocid={`chat.message.item.${index + 1}`}
      className={cn(
        "flex items-start gap-3 w-full",
        isUser ? "flex-row-reverse" : "flex-row",
      )}
    >
      {/* Avatar */}
      <div
        className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center mt-0.5"
        style={
          isUser
            ? {
                background: "oklch(0.22 0.025 260)",
                border: "1px solid oklch(0.30 0.018 260)",
              }
            : {
                background:
                  "linear-gradient(135deg, oklch(0.72 0.18 196 / 0.25), oklch(0.58 0.20 230 / 0.2))",
                border: "1px solid oklch(0.72 0.18 196 / 0.3)",
                boxShadow: "0 0 12px oklch(0.72 0.18 196 / 0.15)",
              }
        }
      >
        {isUser ? (
          <User
            className="w-4 h-4"
            style={{ color: "oklch(0.65 0.01 260)" }}
            strokeWidth={2}
          />
        ) : (
          <Brain
            className="w-4 h-4"
            style={{ color: "oklch(0.78 0.16 196)" }}
            strokeWidth={2}
          />
        )}
      </div>

      {/* Bubble */}
      <div
        className={cn(
          "max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
          isUser ? "rounded-tr-sm" : "rounded-tl-sm",
        )}
        style={
          isUser
            ? {
                background: "oklch(var(--msg-user-bg))",
                border: "1px solid oklch(0.28 0.025 196)",
                color: "oklch(0.92 0.008 260)",
              }
            : {
                background: "oklch(var(--card))",
                border: "1px solid oklch(var(--border))",
                color: "oklch(0.88 0.008 260)",
              }
        }
      >
        {isUser ? (
          <p className="whitespace-pre-wrap">{message.content}</p>
        ) : (
          <div className="message-content">
            {renderContent(message.content)}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── Typing Indicator ───────────────────────────────────────────────
export function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 12 }}
      transition={{ duration: 0.25 }}
      data-ocid="chat.loading_state"
      className="flex items-start gap-3"
    >
      <div
        className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.72 0.18 196 / 0.25), oklch(0.58 0.20 230 / 0.2))",
          border: "1px solid oklch(0.72 0.18 196 / 0.3)",
          boxShadow: "0 0 12px oklch(0.72 0.18 196 / 0.15)",
        }}
      >
        <Brain
          className="w-4 h-4"
          style={{ color: "oklch(0.78 0.16 196)" }}
          strokeWidth={2}
        />
      </div>
      <div
        className="flex items-center gap-1.5 px-4 py-3 rounded-2xl rounded-tl-sm"
        style={{
          background: "oklch(var(--card))",
          border: "1px solid oklch(var(--border))",
        }}
      >
        <span className="typing-dot" />
        <span className="typing-dot" />
        <span className="typing-dot" />
      </div>
    </motion.div>
  );
}
