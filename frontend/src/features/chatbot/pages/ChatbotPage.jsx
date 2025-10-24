import React, { useState } from 'react'

const ChatbotPage = () => {
  const [messages, setMessages] = useState([
    { id: 1, type: 'bot', content: 'Hello! I\'m your ALISTO AI Assistant. How can I help you today?', timestamp: '10:30 AM' },
    { id: 2, type: 'user', content: 'What\'s the current seismic activity in Metro Manila?', timestamp: '10:31 AM' },
    { id: 3, type: 'bot', content: 'Based on recent data, Metro Manila is currently experiencing low seismic activity. The last recorded earthquake was a magnitude 2.1 event 3 days ago. Would you like me to provide more details or set up monitoring alerts?', timestamp: '10:31 AM' }
  ])
  const [inputMessage, setInputMessage] = useState('')

  const quickActions = [
    { text: 'Current earthquake status', icon: '🌍' },
    { text: 'Volcanic activity updates', icon: '🌋' },
    { text: 'Risk assessment summary', icon: '⚠️' },
    { text: 'Generate status report', icon: '📊' },
    { text: 'Station health check', icon: '🔧' },
    { text: 'Alert settings', icon: '🔔' }
  ]

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (!inputMessage.trim()) return

    const newMessage = {
      id: messages.length + 1,
      type: 'user',
      content: inputMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    setMessages(prev => [...prev, newMessage])
    setInputMessage('')

    // Simulate bot response
    setTimeout(() => {
      const botResponse = {
        id: messages.length + 2,
        type: 'bot',
        content: 'I\'m processing your request. This is a demo response - in the full version, I would provide real-time data and insights.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
      setMessages(prev => [...prev, botResponse])
    }, 1000)
  }

  const handleQuickAction = (action) => {
    setInputMessage(action)
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b border-gray-200 bg-white">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">ALISTO AI Assistant</h2>
            <p className="text-sm text-gray-600">Get help with disaster monitoring and analysis</p>
          </div>
          <div className="ml-auto flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="text-sm text-gray-600">Online</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-6 bg-gray-50 border-b border-gray-200">
        <p className="text-sm font-medium text-gray-700 mb-3">Quick Actions:</p>
        <div className="flex flex-wrap gap-2">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={() => handleQuickAction(action.text)}
              className="flex items-center space-x-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm hover:bg-gray-50 transition-colors"
            >
              <span>{action.icon}</span>
              <span className="text-gray-700">{action.text}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-auto p-6 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-3/4 ${message.type === 'user' ? 'order-1' : 'order-2'}`}>
              {message.type === 'bot' && (
                <div className="flex items-center space-x-2 mb-1">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <span className="text-xs text-gray-500">AI Assistant</span>
                </div>
              )}
              <div className={`rounded-lg px-4 py-3 ${
                message.type === 'user' 
                  ? 'bg-primary text-white ml-auto' 
                  : 'bg-white border border-gray-200 text-gray-900'
              }`}>
                <p className="text-sm">{message.content}</p>
                <p className={`text-xs mt-2 ${
                  message.type === 'user' ? 'text-primary-100' : 'text-gray-500'
                }`}>
                  {message.timestamp}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Message Input */}
      <div className="p-6 bg-white border-t border-gray-200">
        <form onSubmit={handleSendMessage} className="flex space-x-3">
          <div className="flex-1">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask about seismic activity, risk assessments, or system status..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={!inputMessage.trim()}
            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </form>
        <p className="text-xs text-gray-500 mt-2">
          AI responses are based on real-time monitoring data and may include safety recommendations.
        </p>
      </div>
    </div>
  )
}

export default ChatbotPage