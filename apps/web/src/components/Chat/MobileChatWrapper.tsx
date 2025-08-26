'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useMediaQuery } from '@chakra-ui/react';
import MobileChatInterface from './MobileChatInterface';
import CustomerChatWidget from './CustomerChatWidget';

interface Message {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  timestamp: string;
  isOwn: boolean;
  status?: 'sent' | 'delivered' | 'read' | 'failed';
}

interface MobileChatWrapperProps {
  customerId?: string;
  customerName?: string;
  customerEmail?: string;
  isGuest?: boolean;
  position?: 'bottom-right' | 'bottom-left' | 'center';
  debug?: boolean;
}

export default function MobileChatWrapper({
  customerId,
  customerName,
  customerEmail,
  isGuest = false,
  position = 'bottom-right',
  debug = false
}: MobileChatWrapperProps) {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  
  // Check if device is mobile
  const [isMobile] = useMediaQuery('(max-width: 768px)');
  
  // Use mobile interface on mobile devices, fallback to desktop widget
  const shouldUseMobileInterface = isMobile;

  // Mock data for demonstration - replace with actual API calls
  const mockMessages: Message[] = [
    {
      id: '1',
      content: 'Hello! How can I help you today?',
      senderId: 'admin',
      senderName: 'Support Team',
      timestamp: new Date(Date.now() - 60000).toISOString(),
      isOwn: false
    },
    {
      id: '2',
      content: 'I need help with my booking',
      senderId: 'customer',
      senderName: 'You',
      timestamp: new Date(Date.now() - 30000).toISOString(),
      isOwn: true
    }
  ];

  useEffect(() => {
    // Load initial messages
    setMessages(mockMessages);
  }, []);

  // Handle sending message
  const handleSendMessage = async (content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      content,
      senderId: session?.user?.id || 'guest',
      senderName: session?.user?.name || 'Guest',
      timestamp: new Date().toISOString(),
      isOwn: true,
      status: 'sent'
    };

    setMessages(prev => [...prev, newMessage]);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Simulate response
    const responseMessage: Message = {
      id: (Date.now() + 1).toString(),
      content: 'Thank you for your message. We\'ll get back to you soon!',
      senderId: 'admin',
      senderName: 'Support Team',
      timestamp: new Date().toISOString(),
      isOwn: false
    };

    setMessages(prev => [...prev, responseMessage]);
  };

  // Handle minimize/maximize
  const handleToggleMinimize = () => {
    if (isOpen) {
      setIsMinimized(!isMinimized);
    } else {
      setIsOpen(true);
      setIsMinimized(false);
    }
  };

  // Handle close
  const handleClose = () => {
    setIsOpen(false);
    setIsMinimized(false);
  };

  // If not mobile, use desktop widget
  if (!shouldUseMobileInterface) {
    return (
      <CustomerChatWidget
        customerId={customerId}
        customerName={customerName}
        customerEmail={customerEmail}
      />
    );
  }

  // Mobile interface
  return (
    <>
      {isOpen ? (
        <MobileChatInterface
          sessionId="mobile-session"
          currentUserId={session?.user?.id || 'guest'}
          currentUserName={session?.user?.name || 'Guest'}
          otherUserName={isGuest ? 'Support Team' : (customerName || 'Customer')}
          otherUserRole={isGuest ? 'Customer Support' : 'Customer'}
          onClose={handleClose}
          onMinimize={handleToggleMinimize}
          isMinimized={isMinimized}
          messages={messages}
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          isTyping={isTyping}
          typingUsers={typingUsers}
        />
      ) : (
        <div 
          className="mobile-chat-toggle" 
          onClick={handleToggleMinimize}
          style={{
            bottom: position.includes('bottom') ? '20px' : '50%',
            right: position.includes('right') ? '20px' : 'auto',
            left: position.includes('left') ? '20px' : 'auto',
            transform: position === 'center' ? 'translate(-50%, -50%)' : 'none'
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          {messages.length > 0 && (
            <div className="mobile-chat-badge">
              {messages.length > 99 ? '99+' : messages.length}
            </div>
          )}
        </div>
      )}
    </>
  );
}
