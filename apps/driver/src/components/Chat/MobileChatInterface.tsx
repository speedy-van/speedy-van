'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  SendIcon,
  XIcon,
  MinimizeIcon,
  MaximizeIcon,
  MessageCircleIcon,
  UserIcon,
  ClockIcon,
} from 'lucide-react';
import { format } from 'date-fns';

interface Message {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  timestamp: string;
  isOwn: boolean;
  status?: 'sent' | 'delivered' | 'read' | 'failed';
}

interface MobileChatInterfaceProps {
  sessionId: string;
  currentUserId: string;
  currentUserName: string;
  otherUserName: string;
  otherUserRole: string;
  onClose?: () => void;
  onMinimize?: () => void;
  isMinimized?: boolean;
  messages: Message[];
  onSendMessage: (content: string) => Promise<void>;
  isLoading?: boolean;
  isTyping?: boolean;
  typingUsers?: string[];
}

export default function MobileChatInterface({
  sessionId,
  currentUserId,
  currentUserName,
  otherUserName,
  otherUserRole,
  onClose,
  onMinimize,
  isMinimized = false,
  messages,
  onSendMessage,
  isLoading = false,
  isTyping = false,
  typingUsers = [],
}: MobileChatInterfaceProps) {
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-resize textarea
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewMessage(e.target.value);

    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
  };

  // Handle send message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || isSending) return;

    setIsSending(true);
    try {
      await onSendMessage(newMessage.trim());
      setNewMessage('');

      // Reset textarea height
      if (inputRef.current) {
        inputRef.current.style.height = 'auto';
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsSending(false);
    }
  };

  // Handle Enter key (send on Enter, new line on Shift+Enter)
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Format timestamp
  const formatTime = (timestamp: string) => {
    try {
      return format(new Date(timestamp), 'HH:mm');
    } catch {
      return '--:--';
    }
  };

  // Get user initials for avatar
  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (isMinimized) {
    return (
      <div className="mobile-chat-toggle" onClick={onMinimize}>
        <MessageCircleIcon size={24} />
        {messages.length > 0 && (
          <div className="mobile-chat-badge">
            {messages.length > 99 ? '99+' : messages.length}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="mobile-chat-container">
      {/* Header */}
      <div className="mobile-chat-header">
        <div className="mobile-chat-header-avatar">
          {getUserInitials(otherUserName)}
        </div>

        <div className="mobile-chat-header-info">
          <div className="mobile-chat-header-title">{otherUserName}</div>
          <div className="mobile-chat-header-subtitle">{otherUserRole}</div>
        </div>

        <div className="mobile-chat-header-actions">
          {onMinimize && (
            <button
              className="mobile-chat-header-button"
              onClick={onMinimize}
              aria-label="Minimize chat"
            >
              <MinimizeIcon size={20} />
            </button>
          )}

          {onClose && (
            <button
              className="mobile-chat-header-button"
              onClick={onClose}
              aria-label="Close chat"
            >
              <XIcon size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="mobile-chat-messages">
        {isLoading ? (
          <div className="mobile-chat-loading">
            <ClockIcon size={24} />
            <span>Loading messages...</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="mobile-chat-empty">
            <div className="mobile-chat-empty-icon">
              <MessageCircleIcon size={48} />
            </div>
            <div className="mobile-chat-empty-text">Start a conversation</div>
            <div className="mobile-chat-empty-subtext">
              Send a message to begin chatting
            </div>
          </div>
        ) : (
          messages.map(message => (
            <div
              key={message.id}
              className={`mobile-chat-message ${message.isOwn ? 'own' : 'other'}`}
            >
              {!message.isOwn && (
                <div className="mobile-chat-message-sender">
                  {message.senderName}
                </div>
              )}

              <div className="mobile-chat-message-bubble">
                {message.content}
                <div className="mobile-chat-message-time">
                  {formatTime(message.timestamp)}
                </div>
              </div>
            </div>
          ))
        )}

        {/* Typing indicator */}
        {isTyping && typingUsers.length > 0 && (
          <div className="mobile-chat-typing">
            <span>
              {typingUsers.length === 1
                ? `${typingUsers[0]} is typing`
                : `${typingUsers.length} people are typing`}
            </span>
            <div className="mobile-chat-typing-dots">
              <div className="mobile-chat-typing-dot"></div>
              <div className="mobile-chat-typing-dot"></div>
              <div className="mobile-chat-typing-dot"></div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="mobile-chat-input-container">
        <textarea
          ref={inputRef}
          className="mobile-chat-input"
          value={newMessage}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          rows={1}
          disabled={isSending}
          style={{
            width: '100%',
            minWidth: '0',
            minHeight: '46px',
            maxHeight: '120px',
          }}
        />
      </div>
    </div>
  );
}
