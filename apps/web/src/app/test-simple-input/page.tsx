'use client';

import { useState } from 'react';

export default function TestSimpleInputPage() {
  const [inputValue, setInputValue] = useState('');
  const [log, setLog] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLog(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    addLog(`onChange: "${value}"`);
    setInputValue(value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    addLog(`onKeyDown: ${e.key} (${e.keyCode})`);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    addLog(`onPaste: "${e.clipboardData.getData('text')}"`);
  };

  const handleClick = () => {
    addLog('onClick: Input clicked');
  };

  const handleFocus = () => {
    addLog('onFocus: Input focused');
  };

  const handleBlur = () => {
    addLog('onBlur: Input lost focus');
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Test Simple Input Field</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
          Test Input Field:
        </label>
        <input
          type="text"
          value={inputValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          onClick={handleClick}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder="Type here or paste text..."
          style={{
            width: '100%',
            padding: '12px',
            fontSize: '16px',
            border: '2px solid #ccc',
            borderRadius: '5px',
            backgroundColor: '#fff'
          }}
        />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Current Value:</h3>
        <div style={{ 
          padding: '10px', 
          backgroundColor: '#f0f0f0', 
          borderRadius: '5px',
          fontFamily: 'monospace'
        }}>
          "{inputValue}"
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Event Log:</h3>
        <div style={{ 
          maxHeight: '300px', 
          overflowY: 'auto', 
          padding: '10px', 
          backgroundColor: '#f9f9f9', 
          border: '1px solid #ddd',
          borderRadius: '5px',
          fontFamily: 'monospace',
          fontSize: '12px'
        }}>
          {log.length === 0 ? (
            <div style={{ color: '#999', fontStyle: 'italic' }}>
              No events logged yet. Start typing or interacting with the input field.
            </div>
          ) : (
            log.map((entry, index) => (
              <div key={index} style={{ marginBottom: '2px' }}>
                {entry}
              </div>
            ))
          )}
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Test Buttons:</h3>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button 
            onClick={() => setInputValue('Test Value')}
            style={{ padding: '8px 16px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}
          >
            Set "Test Value"
          </button>
          <button 
            onClick={() => setInputValue('')}
            style={{ padding: '8px 16px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px' }}
          >
            Clear Input
          </button>
          <button 
            onClick={() => setLog([])}
            style={{ padding: '8px 16px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px' }}
          >
            Clear Log
          </button>
        </div>
      </div>

      <div style={{ fontSize: '14px', color: '#666' }}>
        <p><strong>Instructions:</strong></p>
        <ol>
          <li>Click on the input field above</li>
          <li>Try typing some text</li>
          <li>Try pasting text (Ctrl+V)</li>
          <li>Use the test buttons to set/clear values</li>
          <li>Watch the event log below</li>
          <li>If input doesn't work, check browser console (F12) for errors</li>
        </ol>
      </div>
    </div>
  );
}
