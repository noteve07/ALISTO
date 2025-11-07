import React, { useEffect, useRef, useState } from "react";

const AssistantIcon = ({ className = "h-9 w-9" }) => (
  <svg
    className={className}
    viewBox="0 0 200 200"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Yellow chatbot body */}
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
    {/* Head antenna */}
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
    {/* Left ear/side panel */}
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
    {/* Right ear/side panel */}
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
    {/* Left eye */}
    <circle
      cx="75"
      cy="100"
      r="10"
      fill="#60A5FA"
      stroke="#000"
      strokeWidth="3"
    />
    {/* Right eye */}
    <circle
      cx="125"
      cy="100"
      r="10"
      fill="#60A5FA"
      stroke="#000"
      strokeWidth="3"
    />
    {/* Smile */}
    <path
      d="M 80 125 Q 100 135 120 125"
      stroke="#000"
      strokeWidth="4"
      fill="none"
      strokeLinecap="round"
    />
    {/* Speech bubble tail */}
    <path
      d="M 70 150 L 60 170 L 80 155 Z"
      fill="#FDE047"
      stroke="#000"
      strokeWidth="3"
      strokeLinejoin="round"
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
          className="font-semibold text-slate-900"
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
        <ul key={`ul-${keyBase}`} className="list-disc pl-6 space-y-1">
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
      elements.push(<div key={`sp-${idx}`} className="h-2" />);
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

  return <div className="space-y-2">{elements}</div>;
};

const ChatbotPage = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [typingMessage, setTypingMessage] = useState(""); // For typing animation
  const messagesContainerRef = useRef(null);
  const typingIntervalRef = useRef(null);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const shouldSmoothScroll = !isTyping;

    if (typeof container.scrollTo === "function") {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: shouldSmoothScroll ? "smooth" : "auto",
      });
    } else {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages, isTyping, typingMessage]);

  // Cleanup typing animation on unmount
  useEffect(() => {
    return () => {
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
      }
    };
  }, []);

  const handleSend = async () => {
    if (!inputValue.trim() || isTyping) return;

    const userMessage = {
      id: Date.now(),
      author: "user",
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => {
      // Always add the user message to existing messages
      return [...prev, userMessage];
    });

    setInputValue("");
    setIsTyping(true);

    // Function to call your FastAPI endpoint
    const sendToChatbot = async (message) => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/v1/chat/send`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: message,
            user_id: "prototype-user",
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to get response from chatbot");
        }

        const data = await response.json();
        return data.response; // Return raw text with \n and **bold**
      } catch (error) {
        console.error("Chatbot API error:", error);
        return "Sorry, I'm having trouble connecting to the earthquake data right now. Please try again later.";
      }
    };

    // Typing animation function
    const animateTyping = (fullText, messageId) => {
      let currentIndex = 0;
      setTypingMessage(""); // Reset typing message

      typingIntervalRef.current = setInterval(() => {
        if (currentIndex < fullText.length) {
          // Use substring to avoid dropped characters with batched updates
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
      }, 0); // 10ms per character (fast)
    };

    try {
      // Call your FastAPI endpoint
      const botResponse = await sendToChatbot(userMessage.content);

      // Start typing animation
      animateTyping(botResponse, Date.now() + 1);
    } catch (error) {
      // Fallback response if API fails
      console.error("Chatbot API error:", error);
      const errorMessage = {
        id: Date.now() + 1,
        author: "isa",
        content:
          "I'm currently experiencing technical difficulties. Please try again in a moment.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      setIsTyping(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      // Don't allow sending when ISA is typing
      if (!isTyping) {
        handleSend();
      }
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-3xl border border-slate-200 bg-linear-to-b from-white via-slate-50 to-slate-100 shadow-xl">
      <div
        ref={messagesContainerRef}
        className={`flex-1 min-h-0 overflow-y-auto px-6 py-8 sm:px-10 sm:py-10 ${
          messages.length === 0 ? "flex items-center justify-center" : ""
        }`}
      >
        {/* Welcome Section */}
        <div className={`text-center ${messages.length > 0 ? "mb-8" : ""}`}>
          <div className="relative mb-6">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-linear-to-br from-amber-200 via-orange-300 to-orange-400 shadow-lg">
              <AssistantIcon className="h-16 w-16" />
            </div>
            <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 translate-y-1/2 inline-flex h-5 w-5 items-center justify-center rounded-full border-3 border-white bg-emerald-400" />
          </div>
          <div className="space-y-3">
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 font-sans">
              Hi! I'm ISA
            </h1>
            <p className="mx-auto max-w-2xl text-base leading-relaxed text-slate-600 font-sans">
              Welcome to ALISTO&apos;s Intelligent Seismic Assistant. I can help
              you explore live quake data, volcano advisories, and risk levels
              across the Philippines.
            </p>
            <div className="mx-auto max-w-xl rounded-xl border border-slate-200 bg-white/80 px-5 py-3 text-sm text-slate-500 shadow-sm backdrop-blur-sm font-sans">
              Try asking me about: recent quakes near your city, active volcano
              alert levels, or province risk status.
            </div>
          </div>
        </div>

        {/* Messages Section */}
        {messages.length > 0 && (
          <div className="space-y-6 pt-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={
                  message.author === "isa"
                    ? "flex items-start gap-4"
                    : "flex items-start justify-end gap-4"
                }
              >
                {message.author === "isa" && (
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-amber-200 to-orange-300 shadow-inner">
                    <AssistantIcon className="h-9 w-9" />
                  </div>
                )}

                <div
                  className={
                    message.author === "isa"
                      ? "max-w-[75%] rounded-3xl rounded-tl-xl border border-orange-100 bg-orange-50 px-6 py-4 text-base text-slate-700 shadow-sm font-sans"
                      : "max-w-[75%] rounded-3xl rounded-tr-xl border border-slate-200 bg-white px-6 py-4 text-base text-slate-800 shadow-lg font-sans"
                  }
                >
                  {message.author === "isa" ? (
                    <FormattedMessage content={message.content} />
                  ) : (
                    <p className="leading-relaxed">{message.content}</p>
                  )}
                  <span className="mt-3 block text-xs font-medium text-slate-400 font-sans">
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>

                {message.author !== "isa" && (
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-300 text-slate-700 shadow-inner">
                    <svg
                      className="h-7 w-7"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 2c-3.33 0-10 1.67-10 5v2h20v-2c0-3.33-6.67-5-10-5Z"
                        fill="currentColor"
                      />
                    </svg>
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-linear-to-br from-amber-200 to-orange-300 shadow-inner">
                  <AssistantIcon className="h-9 w-9" />
                </div>
                {typingMessage ? (
                  <div className="max-w-[75%] rounded-3xl rounded-tl-xl border border-orange-100 bg-orange-50 px-6 py-4 text-base text-slate-700 shadow-sm font-sans">
                    <FormattedMessage content={typingMessage} />
                  </div>
                ) : (
                  <div className="flex items-center gap-1 rounded-3xl rounded-tl-xl border border-orange-100 bg-orange-50 px-6 py-4">
                    <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-orange-400" />
                    <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-orange-400 [animation-delay:120ms]" />
                    <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-orange-400 [animation-delay:240ms]" />
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="border-t border-slate-200 bg-white px-6 py-6 shadow-inner sm:px-10">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            handleSend();
          }}
          className="flex flex-col gap-4 sm:flex-row sm:items-end"
        >
          <div className="relative flex-1">
            <textarea
              value={inputValue}
              onChange={(event) => setInputValue(event.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              placeholder="Ask ISA about recent quakes, risk levels, or volcano advisories..."
              className="w-full min-h-12 resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 pr-32 text-sm text-slate-700 placeholder:text-slate-400 focus:border-orange-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-200 font-sans"
            />
            <span className="pointer-events-none absolute bottom-2.5 right-3 text-xs text-slate-300 font-medium font-sans">
              Press Enter to send
            </span>
          </div>
          <button
            type="submit"
            disabled={!inputValue.trim()}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-linear-to-r from-orange-400 to-orange-500 px-6 text-sm font-semibold text-white shadow-lg shadow-orange-400/30 transition-all duration-200 hover:from-orange-500 hover:to-orange-600 hover:shadow-xl hover:shadow-orange-400/40 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-200 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:shadow-lg font-sans -mt-top-4"
          >
            Send
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"
              />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatbotPage;
