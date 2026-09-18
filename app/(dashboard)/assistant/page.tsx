"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Bot,
  Send,
  Sparkles,
  ArrowRight,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import { useUserProfile } from "@/lib/hooks/useUserProfile";
import { Button } from "@/components/ui/button";

interface ChatMessage {
  id: string;
  sender: "user" | "scholarAi";
  text: string;
  time: string;
  chips?: string[];
  isError?: boolean;
  retryQuery?: string;
  actionCard?: {
    title: string;
    schemeId: string;
    amount: string;
    url: string;
  };
}

export default function AssistantPage() {
  const profile = useUserProfile();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!profile.loading && messages.length === 0) {
      setMessages([
        {
          id: "1",
          sender: "scholarAi",
          text: `Johar ${profile.fullName || "Scholar"}! I am Scholar AI, your intelligent scholarship advisor. I have loaded your profile context (${profile.category || "General"} Category, ${profile.state || "State"} Domicile). How can I assist your scholarship search or application today?`,
          time: "Just now",
          chips: [
            "Check my eligibility for National ST Fellowship",
            "Why is my Income Certificate flagged?",
            "How do I link Aadhaar with Bank for DBT?",
            "Show Post-Matric scholarships for my state",
          ],
        },
      ]);
    }
  }, [profile.loading]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async (userText?: string) => {
    const text = userText || input;
    if (!text.trim() || loading) return;

    // Filter out previous error message if retry was triggered
    const updatedMessages = messages.filter((m) => !m.isError);

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      text,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages([...updatedMessages, userMsg]);
    if (!userText) setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...updatedMessages, userMsg].map((m) => ({
            role: m.sender === "scholarAi" ? "assistant" : "user",
            content: m.text,
          })),
          userProfile: {
            fullName: profile.fullName,
            category: profile.category,
            state: profile.state,
            institution: profile.institution,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Server returned status ${response.status}`);
      }

      const botReply =
        data.reply || "I am Scholar AI, analyzing government scholarship guidelines for your query.";

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: "scholarAi",
          text: botReply,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } catch (err: any) {
      console.error("Scholar AI error:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: "scholarAi",
          text: `Unable to fetch response from Scholar AI: ${
            err.message || "Network error"
          }. Please verify your connection or GEMINI_API_KEY environment variable.`,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          isError: true,
          retryQuery: text,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-140px)] flex-col rounded-3xl border border-stone-200/90 bg-white shadow-soft dark:border-[#193c30] dark:bg-[#0c1c16] overflow-hidden">
      {/* Assistant Header */}
      <div className="flex items-center justify-between border-b border-stone-100 bg-[#064e3b] p-5 text-white dark:bg-[#0f281e]">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-300">
            <Bot className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold">Scholar AI Assistant</h3>
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <p className="text-xs text-emerald-200/80">
              Powered by Google Gemini 1.5 Flash • Context: {profile.category || "ST"} | {profile.state || "Jharkhand"}
            </p>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() =>
            setMessages([
              {
                id: "1",
                sender: "scholarAi",
                text: `Chat reset. How can I assist your scholarship queries today, ${profile.fullName || "Scholar"}?`,
                time: "Just now",
                chips: ["Check ST Fellowship eligibility", "Why is income cert flagged?"],
              },
            ])
          }
          className="text-white/80 hover:text-white hover:bg-white/10 text-xs"
        >
          <RefreshCw className="h-3.5 w-3.5 mr-1" />
          Reset Chat
        </Button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-stone-50/50 dark:bg-[#081510]">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex gap-3.5 ${m.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            {m.sender === "scholarAi" && (
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl text-white text-xs font-bold ${
                  m.isError ? "bg-red-600 dark:bg-red-700" : "bg-[#064e3b] dark:bg-emerald-600"
                }`}
              >
                {m.isError ? <AlertTriangle className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
              </div>
            )}

            <div
              className={`max-w-2xl rounded-3xl p-5 text-xs sm:text-sm leading-relaxed ${
                m.sender === "user"
                  ? "bg-[#064e3b] text-white rounded-br-none dark:bg-emerald-600"
                  : m.isError
                  ? "bg-red-50 text-red-900 border border-red-200 rounded-bl-none dark:bg-red-950/40 dark:border-red-900/50 dark:text-red-200"
                  : "bg-white text-stone-800 shadow-soft border border-stone-200/80 rounded-bl-none dark:bg-[#0f231c] dark:border-[#193c30] dark:text-stone-100"
              }`}
            >
              <div className="whitespace-pre-line">{m.text}</div>

              {m.isError && m.retryQuery && (
                <div className="mt-4 pt-3 border-t border-red-200/60 dark:border-red-900/40 flex items-center justify-between">
                  <span className="text-xs text-red-600 dark:text-red-300 font-medium">
                    Connection failed
                  </span>
                  <Button
                    size="sm"
                    onClick={() => handleSend(m.retryQuery)}
                    className="bg-red-600 text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 text-xs gap-1.5 h-8 px-3 rounded-xl shadow-sm"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    Retry Query
                  </Button>
                </div>
              )}

              {m.actionCard && (
                <div className="mt-4 rounded-2xl border border-stone-200 bg-stone-50 p-3.5 dark:border-[#193c30] dark:bg-[#132820] flex items-center justify-between gap-3">
                  <div>
                    <h5 className="font-bold text-xs text-stone-900 dark:text-white">
                      {m.actionCard.title}
                    </h5>
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold">
                      {m.actionCard.amount}
                    </p>
                  </div>
                  <a href={m.actionCard.url}>
                    <Button size="sm" className="bg-[#064e3b] text-white text-xs dark:bg-emerald-600">
                      Open
                      <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  </a>
                </div>
              )}

              {m.chips && (
                <div className="mt-4 flex flex-wrap gap-2 pt-2 border-t border-stone-100 dark:border-[#193c30]">
                  {m.chips.map((chip, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(chip)}
                      className="rounded-full bg-stone-100 px-3 py-1.5 text-xs font-semibold text-stone-700 hover:bg-emerald-100 hover:text-emerald-800 dark:bg-[#153226] dark:text-stone-300 dark:hover:bg-emerald-900/60 transition-colors"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {m.sender === "user" && (
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-[#dcfce7] text-[#166534] text-xs font-bold dark:bg-emerald-950 dark:text-emerald-300">
                {profile.initials || "SH"}
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-3 text-xs text-stone-500 pl-3 sm:pl-12">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#064e3b] text-white dark:bg-emerald-600">
              <Bot className="h-4 w-4 animate-spin" />
            </div>
            <div className="flex items-center gap-2 rounded-2xl bg-white p-3 border border-stone-200/80 shadow-soft dark:bg-[#0f231c] dark:border-[#193c30]">
              <span className="animate-pulse font-semibold text-emerald-700 dark:text-emerald-400">
                Scholar AI is analyzing guidelines & profile context...
              </span>
              <span className="flex gap-1 ml-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-bounce" />
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-bounce [animation-delay:0.2s]" />
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-bounce [animation-delay:0.4s]" />
              </span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="border-t border-stone-100 bg-white p-4 dark:border-[#193c30] dark:bg-[#0c1c16]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-3"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything about fellowship guidelines, SOP writing, income ceilings, DBT..."
            className="h-12 flex-1 rounded-2xl border border-stone-200 bg-stone-50 px-4 text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:border-[#064e3b] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#064e3b] dark:border-[#193c30] dark:bg-[#132820] dark:text-white"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#064e3b] text-white hover:bg-[#053d2e] disabled:opacity-40 transition-colors shadow-sm dark:bg-emerald-600"
            aria-label="Send query"
          >
            <Send className="h-5 w-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
