import React from 'react'
import ChatMessage from './ChatMessage'

const ChatThread = ({ messages }) => {
  return (
    <div className="flex flex-col gap-3">
      {messages.map((message) => (
        <ChatMessage key={message.id} role={message.role}>
          {message.content}
        </ChatMessage>
      ))}
    </div>
  )
}

export default ChatThread


