import { useState, useCallback } from 'react';
import { chatbotService } from '../services/chatbot';

export const useChatbot = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'bot',
      message: 'How can I help you today? 🌍',
      timestamp: new Date(),
      type: 'greeting'
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const sendMessage = useCallback(async (message) => {
    if (!message.trim()) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      message: message.trim(),
      timestamp: new Date()
    };

    // Add user message immediately
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      // Process message with chatbot
      const response = await chatbotService.processMessage(message);
      
      const botMessage = {
        id: Date.now() + 1,
        role: 'bot',
        message: response.message,
        timestamp: new Date(),
        type: response.type,
        data: response.data,
        suggestions: response.suggestions
      };

      // Add bot response
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Chatbot error:', error);
      const errorMessage = {
        id: Date.now() + 1,
        role: 'bot',
        message: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
        type: 'error'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  }, []);

  const sendSuggestion = useCallback((suggestion) => {
    sendMessage(suggestion);
  }, [sendMessage]);

  const clearChat = useCallback(() => {
    setMessages([
      {
        id: 1,
        role: 'bot',
        message: 'How can I help you today? 🌍',
        timestamp: new Date(),
        type: 'greeting'
      }
    ]);
    chatbotService.clearHistory();
  }, []);

  return {
    messages,
    isTyping,
    inputValue,
    setInputValue,
    sendMessage,
    sendSuggestion,
    clearChat
  };
};
