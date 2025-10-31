import React, { useEffect, useRef, useState } from "react";

const AssistantIcon = ({ className = "h-9 w-9" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12 2a7 7 0 0 0-7 7v2a4 4 0 0 0-3 4v2a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3v-2a4 4 0 0 0-3-4V9a7 7 0 0 0-7-7Zm-4 9a1 1 0 1 1 0-2 1 1 0 0 1 0 2Zm8 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z" />
  </svg>
);

// Component to render formatted message with markdown-like styling
const FormattedMessage = ({ content }) => {
  const lines = content.split('\n');

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
        <strong key={`${keyPrefix}-bold-${match.index}`} className="font-semibold text-slate-900">
          {match[1]}
        </strong>
      );
      lastIndex = match.index + match[0].length;
    }
    if (lastIndex < line.length) {
      parts.push(
        <span key={`${keyPrefix}-text-${lastIndex}`}>{line.substring(lastIndex)}</span>
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
  flushList('end');

  return <div className="space-y-2">{elements}</div>;
};

const ChatbotPage = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [typingMessage, setTypingMessage] = useState(""); // For typing animation
  const messagesEndRef = useRef(null);
  const typingIntervalRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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
    if (!inputValue.trim()) return;

    const userMessage = {
      id: Date.now(),
      author: "user",
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => {
      if (!prev.length) {
        const greetingMessage = {
          id: Date.now() - 1,
          author: "isa",
          content:
            "Hello! I'm ISA, your seismic assistant. Ask about recent earthquakes, risk levels, or volcano advisories.",
          timestamp: new Date(),
        };
        return [greetingMessage, userMessage];
      }
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
      }, 1); // 10ms per character (fast)
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
      handleSend();
    }
  };

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-b from-white via-slate-50 to-slate-100 shadow-xl">
      <div className="flex-1 overflow-y-auto px-6 py-8 sm:px-10 sm:py-10">
        {!messages.length && !isTyping ? (
          <div className="flex h-full flex-col items-center justify-center gap-8 text-center">
            <div className="relative">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-amber-200 via-orange-300 to-orange-400 shadow-[0_25px_50px_-20px_rgba(249,115,22,0.45)]">
                <AssistantIcon className="h-12 w-12 text-slate-900" />
              </div>
              <span className="absolute -bottom-1.5 -right-1.5 inline-flex h-6 w-6 items-center justify-center rounded-full border-4 border-white bg-emerald-400" />
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl font-semibold tracking-tight text-slate-900">
                Hi! I'm ISA
              </h1>
              <p className="mx-auto max-w-2xl text-lg text-slate-600">
                Welcome to ALISTO&apos;s Intelligent Seismic Assistant. I can
                help you explore live quake data, volcano advisories, and risk
                levels across the Philippines.
              </p>
              <div className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white/70 px-5 py-4 text-sm text-slate-500 shadow-sm">
                Try asking me about: recent quakes near your city, active
                volcano alert levels, or province risk status.
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
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
                  <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-200 to-orange-300 shadow-inner">
                    <AssistantIcon className="h-6 w-6 text-slate-900" />
                  </div>
                )}

                <div
                  className={
                    message.author === "isa"
                      ? "max-w-[70%] rounded-3xl rounded-tl-xl border border-orange-100 bg-orange-50 px-6 py-4 text-sm text-slate-700 shadow-sm"
                      : "max-w-[70%] rounded-3xl rounded-tr-xl border border-slate-200 bg-white px-6 py-4 text-sm text-slate-800 shadow-lg"
                  }
                >
                  {message.author === "isa" ? (
                    <FormattedMessage content={message.content} />
                  ) : (
                    <p className="leading-relaxed">{message.content}</p>
                  )}
                  <span className="mt-3 block text-xs font-medium text-slate-400">
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>

                {message.author !== "isa" && (
                  <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-slate-300 text-slate-700 shadow-inner">
                    <svg
                      className="h-6 w-6"
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
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-amber-200 to-orange-300 shadow-inner">
                  <AssistantIcon className="h-6 w-6 text-slate-900" />
                </div>
                {typingMessage ? (
                  <div className="max-w-[70%] rounded-3xl rounded-tl-xl border border-orange-100 bg-orange-50 px-6 py-4 text-sm text-slate-700 shadow-sm">
                    <FormattedMessage content={typingMessage} />
                  </div>
                ) : (
                  <div className="flex items-center gap-1 rounded-3xl rounded-tl-xl border border-orange-100 bg-orange-50 px-6 py-3">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-orange-300" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-orange-300 [animation-delay:120ms]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-orange-300 [animation-delay:240ms]" />
                  </div>
                )}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <div className="border-t border-slate-200 bg-white px-6 py-5 shadow-inner sm:px-10">
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
              className="w-full min-h-[64px] resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 pr-24 text-sm text-slate-700 placeholder:text-slate-400 focus:border-orange-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-200"
            />
            <span className="pointer-events-none absolute bottom-3 right-4 text-[11px] text-slate-300">
              Press Enter to send
            </span>
          </div>
          <button
            type="submit"
            disabled={!inputValue.trim()}
            className="inline-flex h-12 items-center justify-center rounded-2xl bg-gradient-to-r from-orange-400 to-orange-500 px-6 text-sm font-semibold text-white shadow-lg shadow-orange-400/30 transition hover:from-orange-500 hover:to-orange-600 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatbotPage;
