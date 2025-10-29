import React, { useEffect, useMemo, useRef, useState } from 'react'

const AssistantIcon = ({ className = 'h-9 w-9' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2a7 7 0 0 0-7 7v2a4 4 0 0 0-3 4v2a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3v-2a4 4 0 0 0-3-4V9a7 7 0 0 0-7-7Zm-4 9a1 1 0 1 1 0-2 1 1 0 0 1 0 2Zm8 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z" />
  </svg>
)

const ChatbotPage = () => {
  const [messages, setMessages] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)

  const sampleResponses = useMemo(
    () => [
      'Current PHIVOLCS feed shows mild activity. The strongest quake in the past hour measured M2.4 near Davao Gulf.',
      'Risk level for Cebu is currently LOW. No significant seismic swarms detected in the past 24 hours.',
      'Nearest active volcano is Taal Volcano, alert level remains at 1. No eruption indicators detected today.',
      'Latest quake: M3.1 – 24 km west of San Jose, Occidental Mindoro. Depth 12 km at 08:14 PM PHT.',
      'All PH sensors online. ISA will alert you if any quake above M4.5 is recorded nationally.'
    ],
    []
  )

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const handleSend = () => {
    if (!inputValue.trim()) return

    const userMessage = {
      id: Date.now(),
      author: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    }

    setMessages((prev) => {
      if (!prev.length) {
        const greetingMessage = {
          id: Date.now() - 1,
          author: 'isa',
          content:
            "Hello! I'm ISA, your seismic assistant. Ask about recent earthquakes, risk levels, or volcano advisories.",
          timestamp: new Date()
        }
        return [greetingMessage, userMessage]
      }
      return [...prev, userMessage]
    })

    setInputValue('')
    setIsTyping(true)

    setTimeout(() => {
      const response = sampleResponses[Math.floor(Math.random() * sampleResponses.length)]
      const botMessage = {
        id: Date.now() + 1,
        author: 'isa',
        content: response,
        timestamp: new Date()
      }
      setMessages((prev) => [...prev, botMessage])
      setIsTyping(false)
    }, 1200)
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      handleSend()
    }
  }

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
              <h1 className="text-4xl font-semibold tracking-tight text-slate-900">Hi! I'm ISA</h1>
              <p className="mx-auto max-w-2xl text-lg text-slate-600">
                Welcome to ALISTO&apos;s Intelligent Seismic Assistant. I can help you explore live quake data,
                volcano advisories, and risk levels across the Philippines.
              </p>
              <div className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white/70 px-5 py-4 text-sm text-slate-500 shadow-sm">
                Try asking me about: recent quakes near your city, active volcano alert levels, or province risk status.
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={
                  message.author === 'isa'
                    ? 'flex items-start gap-4'
                    : 'flex items-start justify-end gap-4'
                }
              >
                {message.author === 'isa' && (
                  <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-200 to-orange-300 shadow-inner">
                    <AssistantIcon className="h-6 w-6 text-slate-900" />
                  </div>
                )}

                <div
                  className={
                    message.author === 'isa'
                      ? 'max-w-[70%] rounded-3xl rounded-tl-xl border border-orange-100 bg-orange-50 px-6 py-4 text-sm text-slate-700 shadow-sm'
                      : 'max-w-[70%] rounded-3xl rounded-tr-xl border border-slate-200 bg-white px-6 py-4 text-sm text-slate-800 shadow-lg'
                  }
                >
                  <p className="leading-relaxed">{message.content}</p>
                  <span className="mt-3 block text-xs font-medium text-slate-400">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {message.author !== 'isa' && (
                  <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-slate-300 text-slate-700 shadow-inner">
                    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
                <div className="flex items-center gap-1 rounded-3xl rounded-tl-xl border border-orange-100 bg-orange-50 px-6 py-3">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-orange-300" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-orange-300 [animation-delay:120ms]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-orange-300 [animation-delay:240ms]" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <div className="border-t border-slate-200 bg-white px-6 py-5 shadow-inner sm:px-10">
        <form
          onSubmit={(event) => {
            event.preventDefault()
            handleSend()
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
  )
}

export default ChatbotPage