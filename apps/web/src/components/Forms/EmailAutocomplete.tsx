'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';

type Props = {
  id?: string;
  placeholder?: string;
  defaultValue?: string;
  className?: string;
};

const COMMON_DOMAINS = [
  'gmail.com',
  'outlook.com',
  'hotmail.com',
  'icloud.com',
  'yahoo.com',
  'live.com',
  'proton.me',
  'aol.com',
  'msn.com',
  'me.com',
];

export default function EmailAutocomplete({ id = 'pi_email', placeholder = 'you@example.com', defaultValue = '', className }: Props) {
  const [value, setValue] = useState<string>(defaultValue);
  const [open, setOpen] = useState<boolean>(false);
  const [activeIdx, setActiveIdx] = useState<number>(0);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  const { local, domainPart } = useMemo(() => {
    const at = value.indexOf('@');
    if (at === -1) return { local: value, domainPart: '' };
    return { local: value.slice(0, at), domainPart: value.slice(at + 1) };
  }, [value]);

  const suggestions = useMemo(() => {
    if (!local) return [] as string[];
    const list = COMMON_DOMAINS.filter(d => !domainPart || d.startsWith(domainPart.toLowerCase()))
      .slice(0, 6)
      .map(d => `${local}@${d}`);
    return list;
  }, [local, domainPart]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  useEffect(() => {
    // Sync value to a mirror input with provided id for external code reads
    const el = document.getElementById(id) as HTMLInputElement | null;
    if (el) el.value = value;
  }, [id, value]);

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open && (e.key === 'ArrowDown' || e.key === 'Tab')) {
      if (suggestions.length) setOpen(true);
    }
    if (!open || !suggestions.length) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx(i => Math.min(i + 1, suggestions.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIdx(i => Math.max(i - 1, 0)); }
    else if (e.key === 'Enter' || e.key === 'Tab' || e.key === 'ArrowRight') {
      e.preventDefault();
      setValue(suggestions[activeIdx]);
      setOpen(false);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  }

  const showDropdown = open && suggestions.length > 0 && !!local;

  return (
    <div ref={wrapRef} style={{ position: 'relative' }}>
      {/* Hidden mirror input for external code that queries by id */}
      <input id={id} type="hidden" value={value} readOnly />
      <input
        type="email"
        autoComplete="email"
        spellCheck={false}
        placeholder={placeholder}
        value={value}
        onChange={(e)=>{ setValue(e.target.value); setOpen(true); setActiveIdx(0); }}
        onFocus={()=>{ if (suggestions.length) setOpen(true); }}
        onKeyDown={onKeyDown}
        className={className}
        style={{ width:'100%', border:'1px solid #e5e7eb', borderRadius:8, padding:10, outline:'none', fontSize:14, background:'#fff' }}
      />
      {showDropdown && (
        <div style={{ position:'absolute', left:0, right:0, top:'100%', zIndex:10, background:'#fff', border:'1px solid #e5e7eb', borderTop:'none', borderRadius:'0 0 8px 8px', boxShadow:'0 8px 16px rgba(0,0,0,0.06)' }}>
          {suggestions.map((s, i) => (
            <div
              key={s}
              onMouseDown={(e)=>{ e.preventDefault(); setValue(s); setOpen(false); }}
              onMouseEnter={()=> setActiveIdx(i)}
              style={{ padding:'8px 10px', cursor:'pointer', background: i===activeIdx ? '#F3F4F6' : '#fff' }}
            >
              {s}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


