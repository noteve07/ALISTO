import React from 'react'

const AssistantIcon = () => (
  <svg
    className="h-10 w-10 text-white"
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12 2a7 7 0 0 0-7 7v2a4 4 0 0 0-3 4v2a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3v-2a4 4 0 0 0-3-4V9a7 7 0 0 0-7-7Zm-4 9a1 1 0 1 1 0-2 1 1 0 0 1 0 2Zm8 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z" />
  </svg>
)

const ChatHero = () => {
  return (
    <div className="grid place-items-center gap-4 px-6 py-8 text-center sm:px-10 sm:py-10">
      <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 via-orange-400 to-orange-500 shadow-[0_20px_50px_-20px_rgba(249,115,22,0.65)]">
        <AssistantIcon />
        <span className="absolute bottom-2 right-2 inline-flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 border-white bg-emerald-400" />
      </div>

      <div className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">Hi! I'm ISA</h1>
        <p className="mx-auto max-w-2xl text-sm text-slate-500 sm:text-base">
          Welcome to ALISTO's Intelligent Seismic Assistant. I can help with real-time earthquakes,
          volcano advisories, and risk levels across the Philippines.
        </p>
      </div>

      <p className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-slate-100 px-4 py-2 text-xs font-medium text-slate-600 sm:text-sm">
        Try asking me about: today&apos;s quakes, nearest active volcano, or provincial risk.
      </p>
    </div>
  )
}

export default ChatHero


