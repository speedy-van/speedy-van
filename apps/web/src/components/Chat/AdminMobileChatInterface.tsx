'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  SendIcon, 
  XIcon, 
  MinimizeIcon,
  MessageCircleIcon,
  UserIcon,
  ClockIcon,
  SearchIcon,
  FilterIcon,
  MoreVerticalIcon
} from 'lucide-react';
import { format } from 'date-fns';

interface ChatSession {
  id: string;
  customerName: string;
  customerEmail: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  status: 'active' | 'pending' | 'resolved';
  isOnline: boolean;
}

interface Message {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  timestamp: string;
  isOwn: boolean;
  status?: 'sent' | 'delivered' | 'read' | 'failed';
}

interface AdminMobileChatInterfaceProps {
  sessions: ChatSession[];
  currentSessionId?: string;
  messages: Message[];
  onSelectSession: (sessionId: string) => void;
  onSendMessage: (content: string) => Promise<void>;
  onCloseSession?: (sessionId: string) => void;
  onResolveSession?: (sessionId: string) => void;
  isLoading?: boolean;
  isTyping?: boolean;
  typingUsers?: string[];
}

export default function AdminMobileChatInterface({
  sessions,
  currentSessionId,
  messages,
  onSelectSession,
  onSendMessage,
  onCloseSession,
  onResolveSession,
  isLoading = false,
  isTyping = false,
  typingUsers = []
}: AdminMobileChatInterfaceProps) {
  const [view, setView] = useState<'sessions' | 'chat'>('sessions');
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const currentSession = sessions.find(s => s.id === currentSessionId);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-resize textarea
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewMessage(e.target.value);
    
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
      
      if (inputRef.current) {
        inputRef.current.style.height = 'auto';
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsSending(false);
    }
  };

  // Handle Enter key
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

  // Format date
  const formatDate = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
      
      if (diffInHours < 24) {
        return format(date, 'HH:mm');
      } else if (diffInHours < 48) {
        return 'Yesterday';
      } else {
        return format(date, 'MMM dd');
      }
    } catch {
      return '--';
    }
  };

  // Get user initials
  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Filter sessions
  const filteredSessions = sessions.filter(session =>
    session.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    session.customerEmail.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sessions list view
  if (view === 'sessions') {
    return (
      <div className="mobile-chat-container">
        {/* Header */}
        <div className="mobile-chat-header">
          <div className="mobile-chat-header-avatar">
            <UserIcon size={20} />
          </div>
          
          <div className="mobile-chat-header-info">
            <div className="mobile-chat-header-title">
              Customer Support
            </div>
            <div className="mobile-chat-header-subtitle">
              {sessions.length} active conversations
            </div>
          </div>
          
          <div className="mobile-chat-header-actions">
            <button 
              className="mobile-chat-header-button"
              onClick={() => setSearchTerm('')}
              aria-label="Clear search"
            >
              <FilterIcon size={20} />
            </button>
          </div>
        </div>

        {/* Search */}
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--mobile-chat-bg-tertiary)' }}>
          <div style={{ position: 'relative' }}>
            <SearchIcon 
              size={16} 
              style={{ 
                position: 'absolute', 
                left: '12px', 
                top: '50%', 
                transform: 'translateY(-50%)',
                color: 'var(--mobile-chat-text-muted)'
              }} 
            />
            <input
              type="text"
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 12px 12px 40px',
                background: 'var(--mobile-chat-bg-primary)',
                border: '1px solid var(--mobile-chat-bg-tertiary)',
                borderRadius: 'var(--mobile-chat-border-radius)',
                color: 'var(--mobile-chat-text-primary)',
                fontSize: '16px'
              }}
            />
          </div>
        </div>

        {/* Sessions list */}
        <div className="mobile-chat-messages">
          {filteredSessions.length === 0 ? (
            <div className="mobile-chat-empty">
              <div className="mobile-chat-empty-icon">
                <MessageCircleIcon size={48} />
              </div>
              <div className="mobile-chat-empty-text">
                No conversations found
              </div>
              <div className="mobile-chat-empty-subtext">
                {searchTerm ? 'Try a different search term' : 'No active conversations'}
              </div>
            </div>
          ) : (
            filteredSessions.map((session) => (
              <div
                key={session.id}
                onClick={() => {
                  onSelectSession(session.id);
                  setView('chat');
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '16px',
                  borderBottom: '1px solid var(--mobile-chat-bg-tertiary)',
                  cursor: 'pointer',
                  transition: 'var(--mobile-chat-transition)',
                  background: currentSessionId === session.id ? 'var(--mobile-chat-bg-tertiary)' : 'transparent'
                }}
              >
                <div style={{ position: 'relative' }}>
                  <div className="mobile-chat-header-avatar">
                    {getUserInitials(session.customerName)}
                  </div>
                  {session.isOnline && (
                    <div style={{
                      position: 'absolute',
                      bottom: '2px',
                      right: '2px',
                      width: '12px',
                      height: '12px',
                      background: 'var(--mobile-chat-success)',
                      border: '2px solid var(--mobile-chat-bg-primary)',
                      borderRadius: '50%'
                    }} />
                  )}
                </div>
                
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '4px'
                  }}>
                    <div style={{
                      color: 'var(--mobile-chat-text-primary)',
                      fontSize: '16px',
                      fontWeight: '600',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {session.customerName}
                    </div>
                    <div style={{
                      color: 'var(--mobile-chat-text-muted)',
                      fontSize: '12px',
                      whiteSpace: 'nowrap'
                    }}>
                      {formatDate(session.lastMessageTime)}
                    </div>
                  </div>
                  
                  <div style={{
                    color: 'var(--mobile-chat-text-secondary)',
                    fontSize: '14px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    marginBottom: '4px'
                  }}>
                    {session.lastMessage}
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div style={{
                      padding: '2px 8px',
                      background: session.status === 'active' ? 'var(--mobile-chat-primary)' : 
                                session.status === 'pending' ? 'var(--mobile-chat-warning)' : 'var(--mobile-chat-success)',
                      color: 'white',
                      fontSize: '10px',
                      borderRadius: '10px',
                      textTransform: 'uppercase'
                    }}>
                      {session.status}
                    </div>
                    
                    {session.unreadCount > 0 && (
                      <div style={{
                        background: 'var(--mobile-chat-error)',
                        color: 'white',
                        fontSize: '12px',
                        fontWeight: '600',
                        padding: '2px 6px',
                        borderRadius: '10px',
                        minWidth: '20px',
                        textAlign: 'center'
                      }}>
                        {session.unreadCount > 99 ? '99+' : session.unreadCount}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  // Chat view
  return (
    <div className="mobile-chat-container">
      {/* Header */}
      <div className="mobile-chat-header">
        <button 
          className="mobile-chat-header-button"
          onClick={() => setView('sessions')}
          aria-label="Back to sessions"
        >
          <XIcon size={20} />
        </button>
        
        <div className="mobile-chat-header-avatar">
          {currentSession ? getUserInitials(currentSession.customerName) : '--'}
        </div>
        
        <div className="mobile-chat-header-info">
          <div className="mobile-chat-header-title">
            {currentSession?.customerName || 'Customer'}
          </div>
          <div className="mobile-chat-header-subtitle">
            {currentSession?.customerEmail || 'customer@example.com'}
          </div>
        </div>
        
        <div className="mobile-chat-header-actions">
          <button 
            className="mobile-chat-header-button"
            onClick={() => onResolveSession?.(currentSessionId!)}
            aria-label="Resolve session"
          >
            <MoreVerticalIcon size={20} />
          </button>
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
            <div className="mobile-chat-empty-text">
              Start a conversation
            </div>
            <div className="mobile-chat-empty-subtext">
              Send a message to begin chatting
            </div>
          </div>
        ) : (
          messages.map((message) => (
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
                : `${typingUsers.length} people are typing`
              }
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
            maxHeight: '120px'
          }}
        />
      </div>
    </div>
  );
}
