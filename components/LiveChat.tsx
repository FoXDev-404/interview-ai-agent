"use client";

import { useState, useEffect, useRef } from "react";
import { X, Send, UserRound } from "lucide-react";

interface Message {
  id: string;
  text: string;
  sender: "user" | "assistant";
  timestamp: Date;
}

interface LiveChatProps {
  isOpen: boolean;
  onClose: () => void;
}

type AgentProfile = {
  name: string;
  avatar: string;
};

const AGENT_PROFILES: AgentProfile[] = [
  { name: "Agent John", avatar: "/avatars/agent-maya.png" },
  { name: "Agent Maya", avatar: "/avatars/agent-maya.png" },
  { name: "Agent Alex", avatar: "/avatars/agent-maya.png" },
];

function ProfileAvatar({
  src,
  alt,
  size,
  fallback,
}: {
  src: string;
  alt: string;
  size: string;
  fallback: string;
}) {
  const [imgError, setImgError] = useState(false);

  return (
    <div
      className={`relative overflow-hidden rounded-full bg-muted ${size}`}
    >
      {!imgError ? (
        <img
          src={src}
          alt={alt}
          className="h-full w-full object-cover"
          onError={() => setImgError(true)}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-cyan-500 to-blue-600 text-xs font-semibold text-white">
          {fallback}
        </div>
      )}
    </div>
  );
}

export default function LiveChat({ isOpen, onClose }: LiveChatProps) {
  const [activeAgent, setActiveAgent] = useState<AgentProfile>(
    AGENT_PROFILES[0],
  );
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hello, welcome to AI MockPrep Support. I am your intelligent assistant and can help with interviews, resume tools, account issues, and technical troubleshooting. How can I assist you today?",
      sender: "assistant",
      timestamp: new Date(),
    },
  ]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickActions = [
    "How do I start my first mock interview?",
    "Help me improve my resume score",
    "I cannot sign in to my account",
    "My microphone is not working",
    "Where can I view interview feedback?",
    "Explain your plans and pricing",
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const randomAgent =
      AGENT_PROFILES[Math.floor(Math.random() * AGENT_PROFILES.length)];
    setActiveAgent(randomAgent);

    setIsConnecting(true);
    const timer = setTimeout(() => {
      setIsConnecting(false);
    }, 1800);

    return () => clearTimeout(timer);
  }, [isOpen]);

  const buildApiHistory = (currentMessages: Message[]) =>
    currentMessages.slice(-10).map((message) => ({
      role: message.sender === "user" ? "user" : "assistant",
      content: message.text,
    }));

  const requestAssistantReply = async (
    userText: string,
    history: Message[],
  ) => {
    setErrorText(null);
    setIsTyping(true);

    try {
      const response = await fetch("/api/support/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userText,
          history: buildApiHistory(history),
        }),
      });

      if (!response.ok) {
        throw new Error("Support service unavailable");
      }

      const data = (await response.json()) as { reply?: string };
      const replyText =
        data.reply?.trim() ||
        "I can help with that. Could you share a bit more detail so I can guide you precisely?";

      const assistantMessage: Message = {
        id: `${Date.now()}-assistant`,
        text: replyText,
        sender: "assistant",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      const fallbackText =
        "I am having trouble connecting right now. Please try again in a moment, or email localghost678@gmail.com for urgent help.";
      setErrorText("Temporary connection issue. Retrying may help.");
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-assistant-fallback`,
          text: fallbackText,
          sender: "assistant",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickAction = async (action: string) => {
    setShowQuickActions(false);

    const userMessage: Message = {
      id: `${Date.now()}-user`,
      text: action,
      sender: "user",
      timestamp: new Date(),
    };

    const nextHistory = [...messages, userMessage];
    setMessages(nextHistory);
    await requestAssistantReply(action, nextHistory);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || isTyping || isConnecting) return;

    setShowQuickActions(false);

    const userMessage: Message = {
      id: `${Date.now()}-user`,
      text: newMessage.trim(),
      sender: "user",
      timestamp: new Date(),
    };

    const nextHistory = [...messages, userMessage];
    setMessages(nextHistory);
    const currentMessage = newMessage.trim();
    setNewMessage("");
    await requestAssistantReply(currentMessage, nextHistory);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-[20rem] sm:w-[21.5rem] rounded-2xl border border-border/50 bg-card/95 shadow-2xl backdrop-blur-md">
      <div className="rounded-t-2xl border-b border-border/30 bg-gradient-to-r from-cyan-600 via-blue-600 to-sky-500 px-3 py-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="rounded-full border border-white/40">
              <ProfileAvatar
                src={activeAgent.avatar}
                alt={activeAgent.name}
                size="h-8 w-8"
                fallback={activeAgent.name.slice(0, 1)}
              />
            </div>
            <div className="leading-tight">
              <p className="text-[11px] font-medium uppercase tracking-wide text-cyan-100">
                AI MockPrep Chat Support
              </p>
              <p className="text-sm font-semibold text-white">
                {activeAgent.name}
              </p>
              <p className="flex items-center gap-1.5 text-[11px] text-cyan-100">
                <span
                  className={`h-1.5 w-1.5 rounded-full ${isConnecting ? "animate-pulse bg-amber-300" : "bg-emerald-300"}`}
                />
                {isConnecting ? "Connecting..." : "Online"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-white transition-colors hover:bg-white/15"
            aria-label="Close chat"
            title="Close chat"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="h-[18.5rem] overflow-y-auto bg-background px-4 py-4 space-y-3">
        {isConnecting && (
          <div className="rounded-lg border border-amber-400/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-500">
            We are connecting you to {activeAgent.name}. You can start typing
            now, and your message will be sent as soon as the chat is ready.
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`flex max-w-[86%] items-start gap-2 ${message.sender === "user" ? "flex-row-reverse" : "flex-row"}`}
            >
              {message.sender === "user" ? (
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 ring-2 ring-violet-300/40">
                  <UserRound className="h-3.5 w-3.5 text-white" />
                </div>
              ) : (
                <div className="rounded-full border border-emerald-300/50 ring-2 ring-emerald-400/20">
                  <ProfileAvatar
                    src={activeAgent.avatar}
                    alt={activeAgent.name}
                    size="h-7 w-7"
                    fallback={activeAgent.name.slice(0, 1)}
                  />
                </div>
              )}
              <div
                className={`rounded-2xl px-3 py-2.5 ${message.sender === "user" ? "bg-sky-500 text-white shadow-md shadow-sky-500/20" : "border border-border bg-muted text-foreground"}`}
              >
                <p className="whitespace-pre-line text-sm leading-relaxed">
                  {message.text}
                </p>
                <p className="mt-1 text-[10px] opacity-75">
                  {message.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          </div>
        ))}

        {errorText && (
          <div className="rounded-md border border-amber-500/40 bg-amber-500/10 px-2 py-1 text-xs text-amber-500">
            {errorText}
          </div>
        )}

        {showQuickActions && messages.length === 1 && (
          <div className="mt-3 flex flex-col gap-2">
            <p className="px-2 text-xs text-foreground/50">Quick prompts</p>
            <div className="grid grid-cols-1 gap-1">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => void handleQuickAction(action)}
                  className="rounded-xl border border-border bg-muted px-3 py-2 text-left text-xs text-foreground transition-colors hover:border-cyan-400/60 hover:bg-accent"
                >
                  {action}
                </button>
              ))}
            </div>
          </div>
        )}

        {isTyping && (
          <div className="flex justify-start">
            <div className="flex items-start gap-2">
              <div className="rounded-full border border-emerald-300/50 ring-2 ring-emerald-400/20">
                <ProfileAvatar
                  src={activeAgent.avatar}
                  alt={activeAgent.name}
                  size="h-7 w-7"
                  fallback={activeAgent.name.slice(0, 1)}
                />
              </div>
              <div className="rounded-2xl border border-border bg-muted p-3 text-foreground">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="rounded-b-2xl border-t border-border bg-card/90 p-3">
        <div className="flex items-end gap-2">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void sendMessage();
              }
            }}
            placeholder={
              isConnecting
                ? `Connecting to ${activeAgent.name}...`
                : `Message ${activeAgent.name}...`
            }
            rows={2}
            disabled={isConnecting}
            className="min-h-[44px] flex-1 resize-none rounded-xl border border-border bg-input px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:cursor-not-allowed disabled:opacity-60"
          />
          <button
            type="button"
            onClick={() => void sendMessage()}
            disabled={!newMessage.trim() || isTyping || isConnecting}
            className="rounded-xl bg-cyan-500 p-2.5 text-slate-950 transition-colors hover:bg-cyan-400 disabled:bg-muted disabled:text-foreground/40"
            aria-label="Send message"
            title="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
