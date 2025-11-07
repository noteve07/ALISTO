"""Conversation history management for chatbot"""
from datetime import datetime, timedelta
from typing import Dict, List, Optional
from dataclasses import dataclass
from collections import deque
import threading


@dataclass
class ConversationMessage:
    user_message: str
    bot_response: str
    timestamp: datetime


class ConversationHistory:
    def __init__(self, max_messages: int = 5, timeout_minutes: int = 2):
        self.max_messages = max_messages
        self.timeout_minutes = timeout_minutes
        # Dictionary to store conversation history per user_id
        # Each user has a deque of ConversationMessage objects
        self._conversations: Dict[str, deque] = {}
        self._lock = threading.RLock()  # Thread-safe access
    
    def add_message(self, user_id: str, user_message: str, bot_response: str):
        """Add a new message to user's conversation history"""
        if not user_id:
            user_id = "anonymous"  # Default for users without ID
            
        with self._lock:
            # Initialize conversation for new users
            if user_id not in self._conversations:
                self._conversations[user_id] = deque(maxlen=self.max_messages)
            
            # Clean up old messages first
            self._cleanup_old_messages(user_id)
            
            # Add new message
            message = ConversationMessage(
                user_message=user_message,
                bot_response=bot_response,
                timestamp=datetime.now()
            )
            
            self._conversations[user_id].append(message)
    
    def get_history(self, user_id: str) -> str:
        """Get formatted conversation history for a user"""
        if not user_id:
            user_id = "anonymous"
            
        with self._lock:
            if user_id not in self._conversations:
                return ""
            
            # Clean up old messages first
            self._cleanup_old_messages(user_id)
            
            # Get conversation history
            history_messages = list(self._conversations[user_id])
            
            if not history_messages:
                return ""
            
            # Format history as conversation
            formatted_history = []
            for msg in history_messages:
                formatted_history.append(f"USER: {msg.user_message}")
                formatted_history.append(f"ASSISTANT: {msg.bot_response}")
            
            return "\n".join(formatted_history)
    
    def clear_history(self, user_id: str):
        """Clear conversation history for a specific user"""
        if not user_id:
            user_id = "anonymous"
            
        with self._lock:
            if user_id in self._conversations:
                self._conversations[user_id].clear()
    
    def clear_all_histories(self):
        """Clear all conversation histories"""
        with self._lock:
            self._conversations.clear()
    
    def _cleanup_old_messages(self, user_id: str):
        """Remove messages older than timeout_minutes"""
        if user_id not in self._conversations:
            return
        
        cutoff_time = datetime.now() - timedelta(minutes=self.timeout_minutes)
        conversation = self._conversations[user_id]
        
        # Remove old messages from the front of the deque
        while conversation and conversation[0].timestamp < cutoff_time:
            conversation.popleft()
    
    def cleanup_all_old_messages(self):
        """Clean up old messages for all users (can be called periodically)"""
        with self._lock:
            for user_id in list(self._conversations.keys()):
                self._cleanup_old_messages(user_id)
                # Remove empty conversations
                if not self._conversations[user_id]:
                    del self._conversations[user_id]
    
    def get_stats(self) -> Dict[str, int]:
        """Get statistics about current conversations"""
        with self._lock:
            return {
                "total_users": len(self._conversations),
                "total_messages": sum(len(conv) for conv in self._conversations.values())
            }


# Global instance
conversation_history = ConversationHistory()