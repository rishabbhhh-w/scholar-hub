"use client";

import React, { useState, useRef, useEffect } from "react";
import { Bot, Send, Sparkles, X, ChevronUp, User, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Message {
  id: string;
  sender: "user" | "scholarAi";
  text: string;
  time: string;
  chips?: string[];
  actionLink?: {
    label: string;
    href: string;
  };
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: "msg-1",
    sender: "scholarAi",
    text: "Johar! I'm Scholar AI, your scholarship companion. I've analyzed your profile. How can I guide you today?",
    time: "Just now",
    chips: [
      "Am I eligible for National ST Fellowship?",
      "Why does my Income Certificate need attention?",
      "How to link Aadhaar with Bank for DBT?",
      "Show all Ph.D. scholarships"
    ],
  }
];

export function SarthiChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = (textToSend?: string) => {
    const query = textToSend || inputValue;
    if (!query.trim()) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      sender: "user",
      text: query,
      time: "Just now",
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) setInputValue("");
    setIsTyping(true);

    // AI response simulation with realistic domain answers
    setTimeout(() => {
      let botReply = "";
      let actionLink = undefined;
      const lower = query.toLowerCase();

      if (lower.includes("fellowship") || lower.includes("st fellowship") || lower.includes("national")) {
        botReply = "Yes! You are a 96% match for the National Fellowship for ST Students (Ministry of Tribal Affairs). Since your family annual income is ₹1.8 LPA (under the ₹6.0 LPA ceiling) and you have secured admission in Ph.D., you fulfill all mandatory guidelines. Note that the deadline is 28 September!";
        actionLink = { label: "View National ST Fellowship", href: "/scholarships" };
      } else if (lower.includes("income") || lower.includes("attention") || lower.includes("document")) {
        botReply = "Your Income Certificate was flagged because the uploaded copy is for FY 2024-25. Central and State scholarships require an income certificate issued on or after April 1, 2026 by an officer not below the rank of Tehsildar or Circle Officer. You can upload the updated one in My Documents.";
        actionLink = { label: "Go to My Documents Vault", href: "/documents" };
      } else if (lower.includes("dbt") || lower.includes("bank") || lower.includes("aadhaar")) {
        botReply = "Direct Benefit Transfer (DBT) requires your Bank Account to be mapped with NPCI (National Payments Corporation of India). Good news: Your State Bank of India account (ending **9412) is already seeded with your Aadhaar and verified active for DBT credits!";
      } else if (lower.includes("ph.d") || lower.includes("phd")) {
        botReply = "You have 3 top Ph.D. scholarships available: 1) National Fellowship for ST Students (₹37,000/mo), 2) DST INSPIRE Fellowship (₹37,000/mo), and 3) National Overseas Scholarship for ST (up to ₹45 Lakhs for abroad studies). Would you like help drafting an application?";
        actionLink = { label: "Explore Recommendations", href: "/recommendations" };
      } else {
        botReply = `I understand you are asking about "${query}". I've cross-referenced Ministry of Tribal Affairs guidelines and National Scholarship Portal records. Your profile is in excellent standing. You can apply directly or track your pending verifications.`;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now() + 1}`,
          sender: "scholarAi",
          text: botReply,
          time: "Just now",
          actionLink,
        },
      ]);
      setIsTyping(false);
    }, 850);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <div className="flex h-[540px] w-[360px] sm:w-[400px] flex-col rounded-3xl border border-stone-200/90 bg-white shadow-2xl transition-all dark:border-[#193c30] dark:bg-[#0c1c16] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-stone-100 bg-[#064e3b] p-4 text-white dark:bg-[#0f281e]">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-300">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold flex items-center gap-1.5">
                  Ask Scholar AI
                  <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                </h4>
                <p className="text-[11px] text-emerald-200/80">Personal Scholarship Advisor</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-full p-1.5 text-white/80 hover:bg-white/10 transition-colors"
              aria-label="Close assistant"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-stone-50/50 dark:bg-[#081510]">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2.5 ${m.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                {m.sender === "scholarAi" && (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold dark:bg-emerald-950 dark:text-emerald-300">
                    <Bot className="h-4 w-4" />
                  </div>
                )}
                <div
                  className={`max-w-[82%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed ${
                    m.sender === "user"
                      ? "bg-[#064e3b] text-white rounded-br-none dark:bg-emerald-600"
                      : "bg-white text-stone-800 shadow-sm border border-stone-200/70 rounded-bl-none dark:bg-[#0f231c] dark:border-[#193c30] dark:text-stone-200"
                  }`}
                >
                  <p>{m.text}</p>
                  {m.actionLink && (
                    <div className="mt-2.5 pt-2 border-t border-stone-100 dark:border-[#193c30]">
                      <a
                        href={m.actionLink.href}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800 dark:text-emerald-400"
                      >
                        {m.actionLink.label}
                        <ArrowRight className="h-3 w-3" />
                      </a>
                    </div>
                  )}
                  {m.chips && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {m.chips.map((chip, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSendMessage(chip)}
                          className="rounded-full bg-stone-100 px-2.5 py-1 text-[11px] font-medium text-stone-700 hover:bg-emerald-100 hover:text-emerald-800 dark:bg-[#153226] dark:text-stone-300 dark:hover:bg-emerald-900/60 transition-colors"
                        >
                          {chip}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex items-center gap-2 text-xs text-stone-400 pl-9">
                <span className="animate-pulse font-medium text-emerald-600">Scholar AI is typing</span>
                <span className="flex gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-bounce" />
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-bounce [animation-delay:0.2s]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-bounce [animation-delay:0.4s]" />
                </span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Box */}
          <div className="p-3 border-t border-stone-100 bg-white dark:border-[#193c30] dark:bg-[#0c1c16]">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask about schemes, eligibility, documents..."
                className="flex-1 rounded-xl border border-stone-200 bg-stone-50 px-3.5 py-2 text-xs text-stone-900 placeholder:text-stone-400 focus:border-[#064e3b] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#064e3b] dark:border-[#193c30] dark:bg-[#10251d] dark:text-stone-100 dark:placeholder:text-stone-500"
              />
              <button
                type="submit"
                disabled={!inputValue.trim()}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#064e3b] text-white hover:bg-[#053d2e] disabled:opacity-40 transition-colors dark:bg-emerald-600"
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      ) : (
        /* Floating Button matching Reference Image 1 "Ask Scholar AI" card style */
        <button
          onClick={() => setIsOpen(true)}
          className="group flex items-center gap-3 rounded-2xl border border-stone-200/90 bg-white px-4 py-3 shadow-xl transition-all duration-200 hover:-translate-y-1 hover:border-emerald-600/40 hover:shadow-2xl dark:border-[#193c30] dark:bg-[#0f231c]"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 group-hover:bg-[#064e3b] group-hover:text-white transition-colors dark:bg-emerald-950 dark:text-emerald-300">
            <Bot className="h-5 w-5" />
          </div>
          <div className="text-left">
            <p className="text-xs font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
              Ask Scholar AI
              <Sparkles className="h-3 w-3 text-amber-500 fill-amber-500" />
            </p>
            <p className="text-[11px] text-stone-500 dark:text-stone-400">Personal guidance</p>
          </div>
        </button>
      )}
    </div>
  );
}
