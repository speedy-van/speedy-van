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

  async function load() {
    const r = await fetch(`/api/chat/${bookingId}`);
    setMsgs(await r.json());
    const p = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, { cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER! });
    const ch = p.subscribe(`booking-${bookingId}`);
    ch.bind("chat:new", (m: any) => setMsgs(prev => [...prev, m]));
    ch.bind("chat:typing", () => { setTyping(true); setTimeout(()=>setTyping(false), 800); });
    pRef.current = p;
    setLoading(false);
  }

  async function send() {
    const r = await fetch(`/api/chat/${bookingId}`, { method: "POST", body: JSON.stringify({ content: txt }) });
    if (r.ok) setTxt("");
  }

  useEffect(() => { load(); return () => pRef.current?.unsubscribe(); }, [bookingId]);

  return (
    <div style={{border:"1px solid #ddd", padding:12, borderRadius:8}}>
      <div style={{maxHeight:240, overflow:"auto", marginBottom:8}}>
        {loading && Array.from({ length: 4 }).map((_, i) => (
          <div key={`sk-${i}`} className="shimmer" style={{ height: 16, width: i % 2 ? '70%' : '55%', margin: '8px 0' }} />
        ))}
        {!loading && msgs.map(m => (
          <div key={m.id} style={{margin:"6px 0", transform: 'translateY(8px)', opacity: 0, animation: 'fade-rise var(--dur-120) var(--ease-enter) forwards'}}>
            <code>{m.senderId.slice(0,6)}</code>: {m.content}
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
        <Input value={txt} onChange={e=>setTxt(e.target.value)} placeholder="Type a message" />
        <Button onClick={send} disabled={!txt.trim()} variant="primary" size="sm">Send</Button>
      </div>
      <style>{`@keyframes dot { 0%, 80%, 100% { transform: translateY(0); opacity: .4 } 40% { transform: translateY(-4px); opacity: 1 } }`}</style>
    </div>
  );
}


