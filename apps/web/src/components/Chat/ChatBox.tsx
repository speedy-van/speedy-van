'use client';
import { useEffect, useRef, useState } from "react";
import Pusher from "pusher-js";
import { Input, Button } from "@chakra-ui/react";

export default function ChatBox({ bookingId }: { bookingId: string }) {
  const [msgs, setMsgs] = useState<any[]>([]);
  const [txt, setTxt] = useState("");
  const pRef = useRef<any>(null);
  const [loading, setLoading] = useState(true);
  const [typing, setTyping] = useState(false);

  // حفظ الرسائل في localStorage
  const saveMessagesToStorage = (messages: any[]) => {
    try {
      localStorage.setItem(`chat_${bookingId}`, JSON.stringify({
        messages,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error('Error saving messages to localStorage:', error);
    }
  };

  // تحميل الرسائل من localStorage
  const loadMessagesFromStorage = () => {
    try {
      const stored = localStorage.getItem(`chat_${bookingId}`);
      if (stored) {
        const data = JSON.parse(stored);
        // تحقق من أن البيانات حديثة (أقل من 24 ساعة)
        if (Date.now() - data.timestamp < 24 * 60 * 60 * 1000) {
          return data.messages;
        } else {
          // حذف البيانات القديمة
          localStorage.removeItem(`chat_${bookingId}`);
        }
      }
    } catch (error) {
      console.error('Error loading messages from localStorage:', error);
    }
    return [];
  };

  // تنظيف localStorage القديم
  const cleanupOldStorage = () => {
    try {
      const keys = Object.keys(localStorage);
      const chatKeys = keys.filter(key => key.startsWith('chat_'));
      
      chatKeys.forEach(key => {
        try {
          const stored = localStorage.getItem(key);
          if (stored) {
            const data = JSON.parse(stored);
            // حذف البيانات الأقدم من 24 ساعة
            if (Date.now() - data.timestamp > 24 * 60 * 60 * 1000) {
              localStorage.removeItem(key);
            }
          }
        } catch (error) {
          // حذف البيانات التالفة
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Error cleaning up localStorage:', error);
    }
  };

  async function load() {
    cleanupOldStorage(); // تنظيف localStorage القديم
    
    // تحميل الرسائل المحفوظة أولاً
    const cachedMessages = loadMessagesFromStorage();
    if (cachedMessages.length > 0) {
      setMsgs(cachedMessages);
      setLoading(false);
    }

    try {
      const r = await fetch(`/api/chat/${bookingId}`);
      if (r.ok) {
        const serverMessages = await r.json();
        setMsgs(serverMessages);
        saveMessagesToStorage(serverMessages);
      }
    } catch (error) {
      console.error('Error loading messages from server:', error);
    }

    // إعداد Pusher
    try {
      const p = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, { 
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER! 
      });
      const ch = p.subscribe(`booking-${bookingId}`);
      
      ch.bind("chat:new", (m: any) => {
        setMsgs(prev => {
          const newMessages = [...prev, m];
          saveMessagesToStorage(newMessages);
          return newMessages;
        });
      });
      
      ch.bind("chat:typing", () => { 
        setTyping(true); 
        setTimeout(()=>setTyping(false), 800); 
      });
      
      pRef.current = p;
    } catch (error) {
      console.error('Error setting up Pusher:', error);
    }
    
    setLoading(false);
  }

  async function send() {
    if (!txt.trim()) return;
    
    const tempMessage = {
      id: `temp_${Date.now()}`,
      content: txt,
      senderId: 'user',
      timestamp: new Date().toISOString(),
      isPending: true
    };

    // إضافة الرسالة مؤقتاً
    setMsgs(prev => {
      const newMessages = [...prev, tempMessage];
      saveMessagesToStorage(newMessages);
      return newMessages;
    });

    const messageToSend = txt;
    setTxt("");

    try {
      const r = await fetch(`/api/chat/${bookingId}`, { 
        method: "POST", 
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content: messageToSend }) 
      });
      
      if (r.ok) {
        const savedMessage = await r.json();
        // استبدال الرسالة المؤقتة بالرسالة المحفوظة
        setMsgs(prev => {
          const updatedMessages = prev.map(msg => 
            msg.id === tempMessage.id ? savedMessage : msg
          );
          saveMessagesToStorage(updatedMessages);
          return updatedMessages;
        });
      } else {
        // إزالة الرسالة المؤقتة في حالة الخطأ
        setMsgs(prev => {
          const filteredMessages = prev.filter(msg => msg.id !== tempMessage.id);
          saveMessagesToStorage(filteredMessages);
          return filteredMessages;
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // إزالة الرسالة المؤقتة في حالة الخطأ
      setMsgs(prev => {
        const filteredMessages = prev.filter(msg => msg.id !== tempMessage.id);
        saveMessagesToStorage(filteredMessages);
        return filteredMessages;
      });
    }
  }

  useEffect(() => { 
    load(); 
    return () => pRef.current?.unsubscribe(); 
  }, [bookingId]);

  return (
    <div style={{border:"1px solid #ddd", padding:12, borderRadius:8}}>
      <div style={{maxHeight:240, overflow:"auto", marginBottom:8}}>
        {loading && Array.from({ length: 4 }).map((_, i) => (
          <div key={`sk-${i}`} className="shimmer" style={{ height: 16, width: i % 2 ? '70%' : '55%', margin: '8px 0' }} />
        ))}
        {!loading && msgs.map(m => (
          <div key={m.id} style={{
            margin:"6px 0", 
            transform: 'translateY(8px)', 
            animation: 'fade-rise var(--dur-120) var(--ease-enter) forwards',
            opacity: m.isPending ? 0.7 : 1
          }}>
            <code>{m.senderId.slice(0,6)}</code>: {m.content}
            {m.isPending && <span style={{color: '#666', fontSize: '12px', marginLeft: '8px'}}>(جاري الإرسال...)</span>}
          </div>
        ))}
        {!loading && typing && (
          <div aria-live="polite" style={{ display: 'inline-flex', gap: 4, alignItems: 'center', color: '#64748b' }}>
            <span>typing</span>
            <span aria-hidden="true" style={{ display: 'inline-flex', gap: 2 }}>
              <span style={{ width: 4, height: 4, borderRadius: 999, background: '#cbd5e1', animation: 'dot 600ms ease-in-out infinite' }} />
              <span style={{ width: 4, height: 4, borderRadius: 999, background: '#cbd5e1', animation: 'dot 600ms ease-in-out 150ms infinite' }} />
              <span style={{ width: 4, height: 4, borderRadius: 999, background: '#cbd5e1', animation: 'dot 600ms ease-in-out 300ms infinite' }} />
            </span>
          </div>
        )}
      </div>
      <div style={{display:"flex", gap:8}}>
        <Input value={txt} onChange={e=>setTxt(e.target.value)} placeholder="Type a message" suppressHydrationWarning />
        <Button onClick={send} disabled={!txt.trim()} variant="primary" size="sm">Send</Button>
      </div>
      <style>{`@keyframes dot { 0%, 80%, 100% { transform: translateY(0); opacity: .4 } 40% { transform: translateY(-4px); opacity: 1 } }`}</style>
    </div>
  );
}


