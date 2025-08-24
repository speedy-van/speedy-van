'use client';

import { useState } from 'react';
import AddressAutocomplete from '../../components/AddressAutocomplete';

export default function TestAutocompletePage() {
  const [selectedAddress, setSelectedAddress] = useState<any>(null);

  const handleSelect = (selection: any) => {
    console.log('Selected:', selection);
    setSelectedAddress(selection);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Test Address Autocomplete</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <label>Address:</label>
        <AddressAutocomplete
          value=""
          onChange={() => {}}
          onSelect={handleSelect}
          placeholder="Type an address..."
          country="GB"
        />
      </div>

      {selectedAddress && (
        <div style={{ 
          padding: '15px', 
          border: '1px solid #ccc', 
          borderRadius: '5px',
          backgroundColor: '#f9f9f9'
        }}>
          <h3>Selected Address:</h3>
          <pre>{JSON.stringify(selectedAddress, null, 2)}</pre>
        </div>
      )}

      <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
        <p><strong>Instructions:</strong></p>
        <ol>
          <li>Type an address in the input field above</li>
          <li>Wait for suggestions to appear</li>
          <li>Click on a suggestion</li>
          <li>Check the selected address below</li>
          <li>Open browser console (F12) to see debug logs</li>
        </ol>
      </div>
    </div>
  );
}
