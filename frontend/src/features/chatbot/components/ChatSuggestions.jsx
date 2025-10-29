import React from 'react'

const ChatSuggestions = ({ suggestions, onSelect }) => {
  if (!suggestions?.length) return null

  return (
    <div className="flex flex-wrap gap-2">
      {suggestions.map((suggestion) => (
        <button
          key={suggestion}
          type="button"
          onClick={() => onSelect?.(suggestion)}
          className="inline-flex items-center rounded-full border border-slate-200 bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-orange-200 hover:bg-amber-50 hover:text-orange-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/60"
        >
          {suggestion}
        </button>
      ))}
    </div>
  )
}

export default ChatSuggestions


