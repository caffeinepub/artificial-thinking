import {
  BookOpen,
  Brain,
  Code2,
  Globe,
  Lightbulb,
  Sparkles,
} from "lucide-react";
import { motion } from "motion/react";

const EXAMPLE_PROMPTS = [
  {
    icon: Code2,
    text: "Explain quantum computing in simple terms",
  },
  {
    icon: Globe,
    text: "What are the latest advances in renewable energy?",
  },
  {
    icon: BookOpen,
    text: "Write a short story about a time-traveling scientist",
  },
  {
    icon: Lightbulb,
    text: "How does the human brain form new memories?",
  },
  {
    icon: Sparkles,
    text: "What makes a great product design?",
  },
  {
    icon: Code2,
    text: "Help me write a Python function to sort a list",
  },
];

interface WelcomeScreenProps {
  onSelectPrompt: (prompt: string) => void;
}

export function WelcomeScreen({ onSelectPrompt }: WelcomeScreenProps) {
  return (
    <div
      data-ocid="chat.empty_state"
      className="flex-1 flex flex-col items-center justify-center px-6 py-12 overflow-y-auto"
    >
      {/* Logo + Brand */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex flex-col items-center mb-10"
      >
        <div className="relative mb-6">
          {/* Glow rings */}
          <div
            className="absolute inset-0 rounded-3xl"
            style={{
              background:
                "radial-gradient(circle, oklch(0.72 0.18 196 / 0.2) 0%, transparent 70%)",
              transform: "scale(2.5)",
            }}
          />
          <div
            className="relative w-20 h-20 rounded-3xl flex items-center justify-center"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.72 0.18 196 / 0.2), oklch(0.58 0.20 230 / 0.15))",
              border: "1px solid oklch(0.72 0.18 196 / 0.35)",
              boxShadow:
                "0 0 40px oklch(0.72 0.18 196 / 0.25), inset 0 1px 0 oklch(1 0 0 / 0.05)",
            }}
          >
            <Brain
              className="w-9 h-9"
              style={{ color: "oklch(0.78 0.16 196)" }}
              strokeWidth={1.8}
            />
          </div>
        </div>

        <h1
          className="text-4xl font-bold tracking-tight text-center mb-2"
          style={{
            fontFamily: "Bricolage Grotesque, sans-serif",
            letterSpacing: "-0.03em",
            color: "oklch(0.96 0.01 260)",
          }}
        >
          Artificial{" "}
          <span
            style={{
              background:
                "linear-gradient(135deg, oklch(0.78 0.18 196), oklch(0.65 0.22 220))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            THINKING
          </span>
        </h1>

        <p
          className="text-base text-center max-w-sm"
          style={{ color: "oklch(0.60 0.015 260)" }}
        >
          Ask me anything — I'm here to think alongside you.
        </p>
      </motion.div>

      {/* Example prompts grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 w-full max-w-3xl"
      >
        {EXAMPLE_PROMPTS.map((prompt, promptIndex) => {
          const Icon = prompt.icon;
          return (
            <motion.button
              key={prompt.text}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 + promptIndex * 0.07, duration: 0.3 }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelectPrompt(prompt.text)}
              className="group text-left p-4 rounded-xl transition-all duration-200"
              style={{
                background: "oklch(var(--card))",
                border: "1px solid oklch(var(--border))",
              }}
            >
              <div className="flex items-start gap-3">
                <div
                  className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center mt-0.5 transition-colors group-hover:bg-primary/15"
                  style={{
                    background: "oklch(0.72 0.18 196 / 0.08)",
                  }}
                >
                  <Icon
                    className="w-3.5 h-3.5 transition-colors group-hover:text-primary"
                    style={{ color: "oklch(0.65 0.14 196)" }}
                  />
                </div>
                <p
                  className="text-sm leading-snug flex-1"
                  style={{ color: "oklch(0.72 0.01 260)" }}
                >
                  {prompt.text}
                </p>
              </div>
            </motion.button>
          );
        })}
      </motion.div>
    </div>
  );
}
