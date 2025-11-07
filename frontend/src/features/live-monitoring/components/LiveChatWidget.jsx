import React, { useMemo, useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AssistantIcon = () => (
  <svg
    className="h-12 w-12"
    viewBox="0 0 200 200"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect
      x="50"
      y="70"
      width="100"
      height="80"
      rx="15"
      fill="#FDE047"
      stroke="#000"
      strokeWidth="4"
    />
    <line
      x1="100"
      y1="40"
      x2="100"
      y2="70"
      stroke="#000"
      strokeWidth="4"
      strokeLinecap="round"
    />
    <circle
      cx="100"
      cy="35"
      r="8"
      fill="#60A5FA"
      stroke="#000"
      strokeWidth="3"
    />
    <rect
      x="35"
      y="95"
      width="15"
      height="30"
      rx="7"
      fill="#6B7280"
      stroke="#000"
      strokeWidth="3"
    />
    <rect
      x="150"
      y="95"
      width="15"
      height="30"
      rx="7"
      fill="#6B7280"
      stroke="#000"
      strokeWidth="3"
    />
    <circle
      cx="75"
      cy="100"
      r="10"
      fill="#60A5FA"
      stroke="#000"
      strokeWidth="3"
    />
    <circle
      cx="125"
      cy="100"
      r="10"
      fill="#60A5FA"
      stroke="#000"
      strokeWidth="3"
    />
    <path
      d="M 80 125 Q 100 135 120 125"
      stroke="#000"
      strokeWidth="4"
      fill="none"
      strokeLinecap="round"
    />
    <path
      d="M 70 150 L 60 170 L 80 155 Z"
      fill="#FDE047"
      stroke="#000"
      strokeWidth="3"
      strokeLinejoin="round"
    />
  </svg>
);

const SendIcon = ({ className = "h-4 w-4" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="m4 4 16 8-16 8 3-8-3-8Z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const MessageIcon = ({ className = "h-4 w-4" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M21 11a7 7 0 0 1-7 7H7l-4 4V11a7 7 0 1 1 14 0Z"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="9.5" cy="11" r="1" fill="currentColor" />
    <circle cx="12.5" cy="11" r="1" fill="currentColor" />
    <circle cx="15.5" cy="11" r="1" fill="currentColor" />
  </svg>
);

const CloseIcon = ({ className = "h-3.5 w-3.5" }) => (
  <svg
    className={className}
    viewBox="0 0 14 14"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M1 1l12 12M13 1 1 13"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>
);

// Component to render formatted message with markdown-like styling
const FormattedMessage = ({ content }) => {
  const lines = content.split("\n");

  // helper to render inline bold within a line
  const renderInline = (line, keyPrefix) => {
    const parts = [];
    let lastIndex = 0;
    const boldRegex = /\*\*(.*?)\*\*/g;
    let match;
    while ((match = boldRegex.exec(line)) !== null) {
      if (match.index > lastIndex) {
        parts.push(
          <span key={`${keyPrefix}-text-${lastIndex}`}>
            {line.substring(lastIndex, match.index)}
          </span>
        );
      }
      parts.push(
        <strong
          key={`${keyPrefix}-bold-${match.index}`}
          className="font-semibold text-slate-700"
        >
          {match[1]}
        </strong>
      );
      lastIndex = match.index + match[0].length;
    }
    if (lastIndex < line.length) {
      parts.push(
        <span key={`${keyPrefix}-text-${lastIndex}`}>
          {line.substring(lastIndex)}
        </span>
      );
    }
    return parts.length > 0 ? parts : line;
  };

  const elements = [];
  let listBuffer = [];

  const flushList = (keyBase) => {
    if (listBuffer.length) {
      elements.push(
        <ul key={`ul-${keyBase}`} className="list-disc pl-4 space-y-1">
          {listBuffer.map((item, i) => (
            <li key={`li-${keyBase}-${i}`} className="leading-relaxed">
              {renderInline(item, `li-${keyBase}-${i}`)}
            </li>
          ))}
        </ul>
      );
      listBuffer = [];
    }
  };

  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    if (!trimmed) {
      // empty line: flush any list and add spacing
      flushList(idx);
      elements.push(<div key={`sp-${idx}`} className="h-1" />);
      return;
    }

    const bulletMatch = trimmed.match(/^[-*]\s+(.+)/);
    if (bulletMatch) {
      // accumulate list items
      listBuffer.push(bulletMatch[1]);
      return;
    }

    // non-list line: flush list and render paragraph
    flushList(idx);
    elements.push(
      <p key={`p-${idx}`} className="leading-relaxed">
        {renderInline(line, `p-${idx}`)}
      </p>
    );
  });

  // flush if content ended with a list
  flushList("end");

  return <div className="space-y-1">{elements}</div>;
};

const LiveChatWidget = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState([
    {
      id: "isa-greeting",
      author: "isa",
      content:
        "Hi! I am ISA, your seismic assistant. How can I help you today?",
      timestamp: new Date(),
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [typingMessage, setTypingMessage] = useState(""); // For typing animation
  const [hasUserSentMessage, setHasUserSentMessage] = useState(false); // Track if user has sent first message
  const typingIntervalRef = useRef(null);

  // Cleanup typing animation on unmount
  useEffect(() => {
    return () => {
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
      }
    };
  }, []);

  const suggestions = useMemo(
    () => [
      "Show today's quakes",
      "What's the nearest active volcano?",
      "Risk level for Cebu",
    ],
    []
  );

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
  };

  const handleSuggestionSelect = (suggestion) => {
    setInputValue(suggestion);
  };

  const handleSend = async () => {
    if (!inputValue.trim() || isTyping) return;

    const userMessage = {
      id: Date.now(),
      author: "user",
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    // Mark that user has sent their first message (to hide suggestions)
    if (!hasUserSentMessage) {
      setHasUserSentMessage(true);
    }

    // Typing animation function
    const animateTyping = (fullText, messageId) => {
      let currentIndex = 0;
      setTypingMessage(""); // Reset typing message

      typingIntervalRef.current = setInterval(() => {
        if (currentIndex < fullText.length) {
          setTypingMessage(fullText.slice(0, currentIndex + 1));
          currentIndex++;
        } else {
          // Typing complete, add to messages
          clearInterval(typingIntervalRef.current);
          const botMessage = {
            id: messageId,
            author: "isa",
            content: fullText,
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, botMessage]);
          setTypingMessage("");
          setIsTyping(false);
        }
      }, 10); // 10ms per character
    };

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/v1/chat/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage.content,
          user_id: "live-monitoring-user",
        }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();

      // Start typing animation
      animateTyping(data.response, Date.now() + 1);
    } catch (error) {
      console.error("Chat error:", error);
      const errorText =
        "I'm currently experiencing technical difficulties. Please try again in a moment.";
      animateTyping(errorText, Date.now() + 1);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      if (!isTyping) {
        handleSend();
      }
    }
  };

  return (
    <div className="pointer-events-none absolute bottom-8 left-3 z-9999 flex flex-col items-start gap-4">
      {isOpen && (
        <div className="pointer-events-auto w-[min(360px,calc(100vw-3rem))] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_20px_50px_-12px_rgba(0,0,0,0.25)] drop-shadow-lg">
          <div className="flex items-center justify-between bg-orange-50 border-b border-orange-100 px-4 py-3 text-gray-800">
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-linear-to-br from-amber-200 via-orange-300 to-orange-400 shadow-lg">
                  <AssistantIcon className="h-6 w-6" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 inline-flex h-3 w-3 items-center justify-center rounded-full border-2 border-white bg-emerald-400" />
              </div>
              <div className="leading-tight">
                <p className="text-sm font-semibold">ISA Live Assistant</p>
                <p className="text-[11px] font-medium text-gray-600">
                  Ready to help · PH seismic desk
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                className="inline-flex h-8 w-8 items-center justify-center rounded-full text-gray-600 transition hover:bg-white/60"
                title="Open full chatbot"
                onClick={() => navigate("/app/chatbot")}
              >
                <MessageIcon className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={handleToggle}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full text-gray-600 transition hover:bg-white/60"
              >
                <span className="sr-only">Close chat</span>
                <CloseIcon />
              </button>
            </div>
          </div>

          <div className="flex h-70 flex-col gap-4 overflow-y-auto px-4 py-4 text-sm text-slate-600">
            {messages.map((message) => (
              <div
                key={message.id}
                className={
                  message.author === "isa"
                    ? "flex items-start gap-2"
                    : "flex items-start justify-end gap-2"
                }
              >
                {message.author === "isa" && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-amber-200 via-orange-300 to-orange-400 shadow-inner">
                    <AssistantIcon className="h-5 w-5" />
                  </div>
                )}

                <div
                  className={
                    message.author === "isa"
                      ? "max-w-[70%] rounded-2xl rounded-tl-none border border-orange-100 bg-orange-50 px-4 py-3 text-xs text-slate-700 shadow-sm sm:text-sm"
                      : "max-w-[70%] rounded-2xl rounded-tr-none border border-slate-200 bg-white px-4 py-3 text-xs text-slate-800 shadow-lg sm:text-sm"
                  }
                >
                  {message.content}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex items-start gap-2">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-amber-200 via-orange-300 to-orange-400 shadow-inner">
                  <AssistantIcon className="h-5 w-5" />
                </div>
                {typingMessage ? (
                  <div className="max-w-[70%] rounded-2xl rounded-tl-none border border-orange-100 bg-orange-50 px-4 py-3 text-xs text-slate-700 shadow-sm sm:text-sm">
                    <FormattedMessage content={typingMessage} />
                  </div>
                ) : (
                  <div className="flex items-center gap-1 rounded-2xl rounded-tl-none border border-orange-100 bg-orange-50 px-4 py-3">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-orange-400" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-orange-400 [animation-delay:120ms]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-orange-400 [animation-delay:240ms]" />
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {!hasUserSentMessage &&
                suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => handleSuggestionSelect(suggestion)}
                    className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] font-medium text-slate-500 transition hover:border-[#D2691E] hover:bg-orange-50 hover:text-[#D2691E]"
                  >
                    {suggestion}
                  </button>
                ))}
            </div>
          </div>

          <div className="border-t border-slate-200 bg-slate-50 px-4 py-3">
            <form
              className="flex items-center gap-2"
              onSubmit={(event) => {
                event.preventDefault();
                handleSend();
              }}
            >
              <input
                type="text"
                placeholder={
                  isTyping ? "ISA is typing..." : "Type your message..."
                }
                value={inputValue}
                onChange={(event) => setInputValue(event.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isTyping}
                className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600 placeholder:text-slate-400 focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-200 disabled:opacity-60 disabled:bg-slate-100"
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isTyping}
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-linear-to-r from-orange-400 to-orange-500 text-white shadow-md transition hover:from-orange-500 hover:to-orange-600 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <SendIcon className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {!isOpen && (
        <div
          className="relative flex h-16 w-16 items-center justify-center rounded-full bg-linear-to-br from-amber-300 via-orange-400 to-orange-500 shadow-[0_20px_50px_-20px_rgba(249,115,22,0.65)] transition hover:scale-105 cursor-pointer pointer-events-auto"
          onClick={handleToggle}
          title="Ask ISA"
        >
          <AssistantIcon />
          <span className="absolute bottom-1.5 right-1.5 inline-flex h-3 w-3 items-center justify-center rounded-full border-2 border-white bg-emerald-400" />
        </div>
      )}
    </div>
  );
};

export default LiveChatWidget;
