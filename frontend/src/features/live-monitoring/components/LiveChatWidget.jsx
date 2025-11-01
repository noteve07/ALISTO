import React, { useMemo, useState } from "react";

const AssistantIcon = ({ className = "h-6 w-6" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12 2a7 7 0 0 0-7 7v2a4 4 0 0 0-3 4v2a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3v-2a4 4 0 0 0-3-4V9a7 7 0 0 0-7-7Zm-4 9a1 1 0 1 1 0-2 1 1 0 0 1 0 2Zm8 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z" />
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

const LiveChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const suggestions = useMemo(
    () => [
      "Show today's quakes",
      "What's the nearest active volcano?",
      "Risk level for Cebu",
    ],
    []
  );

  const messages = useMemo(
    () => [
      {
        id: "isa-greeting",
        author: "isa",
        content:
          "Hi! I am ISA, your seismic assistant. How can I help you today?",
      },
      {
        id: "sample-user",
        author: "user",
        content: "Hello ISA, show recent quakes near Quezon City.",
      },
    ],
    []
  );

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
  };

  const handleSuggestionSelect = (suggestion) => {
    setIsOpen(true);
    setInputValue(suggestion);
  };

  return (
    <div className="pointer-events-none absolute bottom-8 left-8 z-[9999] flex flex-col items-start gap-4">
      {isOpen && (
        <div className="pointer-events-auto w-[min(360px,calc(100vw-3rem))] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_30px_60px_-25px_rgba(15,23,42,0.25)]">
          <div className="flex items-center justify-between bg-orange-50 border-b border-orange-100 px-4 py-3 text-gray-800">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white border border-orange-100">
                <AssistantIcon className="h-5 w-5 text-[#D2691E]" />
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
                onClick={() => setIsOpen(false)}
              >
                <MessageIcon className="h-4 w-4" />
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

          <div className="flex max-h-80 flex-col gap-4 overflow-y-auto px-4 py-4 text-sm text-slate-600">
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
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#D2691E] text-white shadow-inner">
                    <AssistantIcon className="h-4 w-4" />
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

                {message.author !== "isa" && (
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-700 shadow-inner">
                    <AssistantIcon className="h-4 w-4" />
                  </div>
                )}
              </div>
            ))}

            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion) => (
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
              onSubmit={(event) => event.preventDefault()}
            >
              <input
                type="text"
                placeholder="Type your message..."
                value={inputValue}
                onChange={(event) => setInputValue(event.target.value)}
                className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600 placeholder:text-slate-400 focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-200"
              />
              <button
                type="submit"
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[#D2691E] text-white shadow-md transition hover:bg-[#B8591A]"
              >
                <SendIcon className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {!isOpen && (
        <button
          type="button"
          onClick={handleToggle}
          className="pointer-events-auto inline-flex items-center gap-3 rounded-full bg-[#D2691E] px-6 py-3 text-base font-semibold text-white shadow-[0_20px_35px_-18px_rgba(210,105,30,0.75)] transition hover:scale-105 hover:bg-[#B8591A] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-300"
        >
          <AssistantIcon className="h-6 w-6 text-white" />
          <span>Ask ISA</span>
        </button>
      )}
    </div>
  );
};

export default LiveChatWidget;
