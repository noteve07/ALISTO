import React from 'react'

const variants = {
  assistant: 'self-start rounded-2xl border border-orange-200 bg-amber-50 px-4 py-3 text-sm text-orange-900 shadow-[0_10px_30px_-24px_rgba(249,115,22,0.8)]',
  user: 'self-end rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900 shadow-[0_10px_30px_-24px_rgba(37,99,235,0.8)]'
}

const alignments = {
  assistant: 'items-start justify-start',
  user: 'items-end justify-end'
}

const ChatMessage = ({ role = 'assistant', children }) => {
  return (
    <div className={`flex w-full ${alignments[role] ?? alignments.assistant}`}>
      <div className={variants[role] ?? variants.assistant}>{children}</div>
    </div>
  )
}

export default ChatMessage


