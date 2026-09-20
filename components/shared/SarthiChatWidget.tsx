"use client";

import React, { useState, useRef, useEffect } from "react";
import { Bot, Send, Sparkles, X, ArrowRight } from "lucide-react";

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
      "Show all Ph.D. scholarships",
    ],
  },
];

export function SarthiChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Draggable position state
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const dragStartRef = useRef<{ startX: number; startY: number; initialX: number; initialY: number }>({
    startX: 0,
    startY: 0,
    initialX: 0,
    initialY: 0,
  });
  const hasMovedRef = useRef(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Pointer drag event handlers
  const handlePointerDown = (clientX: number, clientY: number) => {
    const buttonEl = buttonRef.current;
    if (!buttonEl) return;
    const rect = buttonEl.getBoundingClientRect();

    dragStartRef.current = {
      startX: clientX,
      startY: clientY,
      initialX: rect.left,
      initialY: rect.top,
    };
    hasMovedRef.current = false;
  };

  const handlePointerMove = (clientX: number, clientY: number) => {
    if (dragStartRef.current.startX === 0) return;
    const { startX, startY, initialX, initialY } = dragStartRef.current;
    const deltaX = clientX - startX;
    const deltaY = clientY - startY;

    if (Math.abs(deltaX) > 4 || Math.abs(deltaY) > 4) {
      hasMovedRef.current = true;
      setIsDragging(true);
    }

    if (hasMovedRef.current) {
      const newX = Math.max(12, Math.min(window.innerWidth - 64, initialX + deltaX));
      const newY = Math.max(12, Math.min(window.innerHeight - 64, initialY + deltaY));
      setPosition({ x: newX, y: newY });
    }
  };

  const handlePointerUp = () => {
    dragStartRef.current.startX = 0;
    setTimeout(() => {
      setIsDragging(false);
    }, 50);
  };

  // Global mouse & touch listeners while dragging
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      handlePointerMove(e.clientX, e.clientY);
    };
    const onMouseUp = () => {
      handlePointerUp();
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };
    const onTouchEnd = () => {
      handlePointerUp();
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, []);

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

  // Compute modal window location relative to button position
  const getModalStyle = () => {
    if (!position || typeof window === "undefined") return {};
    const modalWidth = Math.min(window.innerWidth - 24, 400);
    const modalHeight = 540;

    let left = position.x - modalWidth + 52;
    if (left < 12) left = 12;
    if (left + modalWidth > window.innerWidth - 12) left = window.innerWidth - modalWidth - 12;

    let top = position.y - modalHeight - 12;
    if (top < 12) top = position.y + 60;
    if (top + modalHeight > window.innerHeight - 12) top = window.innerHeight - modalHeight - 12;

    return { left: `${left}px`, top: `${top}px` };
  };

  return (
    <>
      {/* Small Square Draggable AI Bot Logo Button */}
      <div
        style={
          position
            ? { left: `${position.x}px`, top: `${position.y}px` }
            : undefined
        }
        className={`fixed z-50 ${!position ? "bottom-6 right-6" : ""}`}
      >
        <button
          ref={buttonRef}
          onClick={(e) => {
            if (hasMovedRef.current) {
              e.preventDefault();
              e.stopPropagation();
              return;
            }
            setIsOpen((prev) => !prev);
          }}
          onMouseDown={(e) => handlePointerDown(e.clientX, e.clientY)}
          onTouchStart={(e) => {
            if (e.touches.length > 0) {
              handlePointerDown(e.touches[0].clientX, e.touches[0].clientY);
            }
          }}
          className={`relative group flex h-13 w-13 items-center justify-center rounded-2xl bg-[#064e3b] text-white shadow-2xl transition-transform active:scale-95 border border-emerald-400/30 cursor-grab active:cursor-grabbing select-none dark:bg-emerald-600 dark:border-emerald-300/40 ${
            isDragging ? "scale-105 shadow-emerald-950/40" : "hover:scale-105"
          }`}
          title="Ask Scholar AI (Drag anywhere)"
          aria-label="Open Scholar AI Chatbot"
        >
          <Bot className="h-6 w-6 text-white" />
          <Sparkles className="h-3.5 w-3.5 text-amber-300 fill-amber-300 absolute -top-1 -right-1 drop-shadow-md animate-pulse" />
        </button>
      </div>

      {/* Chatbot Window */}
      {isOpen && (
        <div
          style={position ? getModalStyle() : undefined}
          className={`fixed z-50 flex h-[540px] w-[360px] sm:w-[400px] flex-col rounded-3xl border border-stone-200/90 bg-white shadow-2xl transition-all dark:border-[#193c30] dark:bg-[#0c1c16] overflow-hidden ${
            !position ? "bottom-24 right-6" : ""
          }`}
        >
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
      )}
    </>
  );
}
