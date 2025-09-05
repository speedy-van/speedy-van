'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import Pusher from 'pusher-js';

interface Message {
  id: string;
  content: string;
  type: 'text' | 'image' | 'file' | 'location' | 'system';
  status: 'sent' | 'delivered' | 'read' | 'failed';
  createdAt: string;
  sender: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  metadata?: any;
}

interface ChatParticipant {
  id: string;
  userId?: string;
  guestName?: string;
  guestEmail?: string;
  role: string;
  lastReadAt?: string;
  isTyping: boolean;
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

interface ChatSession {
  id: string;
  type: string;
  title?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  participants: ChatParticipant[];
  messages: Message[];
  booking?: {
    id: string;
    reference: string;
    customerName: string;
    status: string;
  };
}

interface UseChatOptions {
  sessionId?: string;
  autoConnect?: boolean;
}

export function useChat(options: UseChatOptions = {}) {
  const { data: session } = useSession();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(
    null
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const pusherRef = useRef<Pusher | null>(null);
  const channelRef = useRef<any>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const currentUserId = (session?.user as any)?.id;

  // Load all chat sessions
  const loadSessions = useCallback(async () => {
    if (!currentUserId) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/chat/sessions');
      if (response.ok) {
        const data = await response.json();
        setSessions(data);
      } else {
        throw new Error('Failed to load sessions');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sessions');
    } finally {
      setIsLoading(false);
    }
  }, [currentUserId]);

  // Load messages for a specific session
  const loadMessages = useCallback(async (sessionId: string) => {
    if (!sessionId) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/chat/sessions/${sessionId}/messages`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      } else {
        throw new Error('Failed to load messages');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load messages');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Send a message
  const sendMessage = useCallback(
    async (sessionId: string, content: string, type: string = 'text') => {
      if (!sessionId || !content.trim() || isSending) return;

      setIsSending(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/chat/sessions/${sessionId}/messages`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              content: content.trim(),
              type,
            }),
          }
        );

        if (response.ok) {
          const messageData = await response.json();
          setMessages(prev => [...prev, messageData]);

          // Stop typing indicator
          await updateTypingStatus(sessionId, false);
        } else {
          throw new Error('Failed to send message');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to send message');
      } finally {
        setIsSending(false);
      }
    },
    [isSending]
  );

  // Update typing status
  const updateTypingStatus = useCallback(
    async (sessionId: string, isTyping: boolean) => {
      if (!sessionId) return;

      try {
        await fetch(`/api/chat/sessions/${sessionId}/typing`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ isTyping }),
        });
      } catch (err) {
        console.error('Error updating typing status:', err);
      }
    },
    []
  );

  // Handle typing with debounce
  const handleTyping = useCallback(
    (sessionId: string, isTyping: boolean) => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      updateTypingStatus(sessionId, isTyping);

      if (isTyping) {
        typingTimeoutRef.current = setTimeout(() => {
          updateTypingStatus(sessionId, false);
        }, 2000);
      }
    },
    [updateTypingStatus]
  );

  // Create a new chat session
  const createSession = useCallback(
    async (sessionData: {
      type: string;
      bookingId?: string;
      participantIds?: string[];
      guestInfo?: { name: string; email: string };
      title?: string;
    }) => {
      if (!currentUserId) return null;

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/chat/sessions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(sessionData),
        });

        if (response.ok) {
          const newSession = await response.json();
          setSessions(prev => [newSession, ...prev]);
          return newSession;
        } else {
          throw new Error('Failed to create session');
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to create session'
        );
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [currentUserId]
  );

  // Close a chat session
  const closeSession = useCallback(
    async (sessionId: string) => {
      if (!sessionId) return;

      try {
        const response = await fetch(`/api/chat/sessions/${sessionId}/close`, {
          method: 'PUT',
        });

        if (response.ok) {
          setSessions(prev =>
            prev.map(session =>
              session.id === sessionId
                ? { ...session, isActive: false }
                : session
            )
          );

          if (currentSession?.id === sessionId) {
            setCurrentSession(prev =>
              prev ? { ...prev, isActive: false } : null
            );
          }
        } else {
          throw new Error('Failed to close session');
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to close session'
        );
      }
    },
    [currentSession]
  );

  // Initialize Pusher connection
  const initializePusher = useCallback(
    (sessionId: string) => {
      if (!sessionId || pusherRef.current) return;

      try {
        // Check if Pusher credentials are available
        const pusherKey = process.env.NEXT_PUBLIC_PUSHER_KEY;
        const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

        if (!pusherKey || !pusherCluster) {
          console.warn(
            'Pusher credentials not found. Real-time features will be disabled.'
          );
          return;
        }

        const pusher = new Pusher(pusherKey, {
          cluster: pusherCluster,
          authEndpoint: '/api/pusher/auth',
        });

        const channel = pusher.subscribe(`chat-session-${sessionId}`);

        channel.bind('message:new', (message: Message) => {
          setMessages(prev => [...prev, message]);
        });

        channel.bind(
          'typing:update',
          (data: { userId: string; isTyping: boolean; userName: string }) => {
            if (data.userId !== currentUserId) {
              setTypingUsers(prev => {
                if (data.isTyping) {
                  return prev.includes(data.userId)
                    ? prev
                    : [...prev, data.userId];
                } else {
                  return prev.filter(id => id !== data.userId);
                }
              });
            }
          }
        );

        channel.bind('session:closed', () => {
          setSessions(prev =>
            prev.map(session =>
              session.id === sessionId
                ? { ...session, isActive: false }
                : session
            )
          );

          if (currentSession?.id === sessionId) {
            setCurrentSession(prev =>
              prev ? { ...prev, isActive: false } : null
            );
          }
        });

        pusherRef.current = pusher;
        channelRef.current = channel;
      } catch (err) {
        console.error('Error initializing Pusher:', err);
      }
    },
    [currentUserId, currentSession]
  );

  // Disconnect Pusher
  const disconnectPusher = useCallback(() => {
    if (pusherRef.current) {
      pusherRef.current.disconnect();
      pusherRef.current = null;
      channelRef.current = null;
    }
  }, []);

  // Select a session
  const selectSession = useCallback(
    (sessionId: string) => {
      const session = sessions.find(s => s.id === sessionId);
      if (session) {
        setCurrentSession(session);
        loadMessages(sessionId);
        initializePusher(sessionId);
      }
    },
    [sessions, loadMessages, initializePusher]
  );

  // Auto-connect to session if provided
  useEffect(() => {
    if (options.sessionId && options.autoConnect) {
      selectSession(options.sessionId);
    }
  }, [options.sessionId, options.autoConnect, selectSession]);

  // Load sessions on mount
  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnectPusher();
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [disconnectPusher]);

  return {
    // State
    sessions,
    currentSession,
    messages,
    isLoading,
    isSending,
    typingUsers,
    error,

    // Actions
    loadSessions,
    loadMessages,
    sendMessage,
    createSession,
    closeSession,
    selectSession,
    handleTyping,
    updateTypingStatus,

    // Utilities
    disconnectPusher,
    initializePusher,
  };
}
