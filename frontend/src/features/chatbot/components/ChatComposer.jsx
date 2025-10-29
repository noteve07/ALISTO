import React from 'react'

const ChatComposer = ({
  placeholder = 'Ask ISA about seismic updates...',
  disabled,
  value,
  onChange
}) => {
  return (
    <form
      className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white/70 p-3 shadow-inner backdrop-blur-sm sm:flex-row sm:items-center"
      onSubmit={(event) => event.preventDefault()}
    >
      <input
        type="text"
        placeholder={placeholder}
        disabled={disabled}
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        className="h-11 flex-1 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 placeholder:text-slate-400 focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-200 disabled:cursor-not-allowed disabled:bg-slate-100"
      />
      <button
        type="submit"
        disabled={disabled}
        className="inline-flex h-11 items-center justify-center rounded-xl bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 px-6 text-sm font-semibold text-white shadow-lg shadow-orange-500/30 transition hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300 disabled:cursor-not-allowed disabled:opacity-60"
      >
        Send
      </button>
    </form>
  )
}

export default ChatComposer


