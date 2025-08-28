// src/lib/pricing/integration-example.tsx
// -----------------------------------------------------------------------------
// Example React component showing how to integrate the pricing engine
// into a booking form. This demonstrates real-world usage patterns.
// -----------------------------------------------------------------------------

'use client';

import { useState, useEffect } from 'react';
import { computeQuote, type PricingInputs, type PricingResponse } from './engine';

interface PricingFormProps {
  onQuoteUpdate?: (quote: PricingResponse) => void;
}

export function PricingForm({ onQuoteUpdate }: PricingFormProps) {
  const [formData, setFormData] = useState<PricingInputs>({
    distanceMiles: 25,
    items: [
      { id: 'sofa', canonicalName: 'Sofa', quantity: 1, volumeFactor: 1.5, requiresTwoPerson: true, isFragile: false, requiresDisassembly: false, basePriceHint: 45 },
      { id: 'dining_table', canonicalName: 'Dining Table', quantity: 1, volumeFactor: 1.4, requiresTwoPerson: true, isFragile: false, requiresDisassembly: true, basePriceHint: 38 },
    ],
    pickupFloors: 1,
    pickupHasLift: false,
    dropoffFloors: 1,
    dropoffHasLift: false,
    helpersCount: 2,
    extras: { ulez: false, vat: true },
  });

  const [quote, setQuote] = useState<PricingResponse | null>(null);
  const [loading, setLoading] = useState(false);

  // Compute quote when form data changes
  useEffect(() => {
    const calculateQuote = async () => {
      try {
        const result = await computeQuote(formData);
        setQuote(result);
        onQuoteUpdate?.(result);
      } catch (error) {
        console.error('Pricing calculation error:', error);
      }
    };
    
    calculateQuote();
  }, [formData, onQuoteUpdate]);

  // API-based quote (alternative approach)
  const fetchQuoteFromAPI = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/pricing/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const result = await response.json();
      setQuote(result);
      onQuoteUpdate?.(result);
    } catch (error) {
      console.error('API quote error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateItem = (index: number, field: 'id' | 'quantity', value: string | number) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData({ ...formData, items: newItems });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { id: 'box', canonicalName: 'Box', quantity: 1, volumeFactor: 0.2, requiresTwoPerson: false, isFragile: false, requiresDisassembly: false, basePriceHint: 4 }],
    });
  };

  const removeItem = (index: number) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  return (
    <div className="pricing-form max-w-2xl mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">Get Your Quote</h2>

      {/* Distance */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">
          Distance (miles)
        </label>
        <input
          type="number"
          min="0"
          value={formData.distanceMiles}
          onChange={(e) => setFormData({ ...formData, distanceMiles: Number(e.target.value) })}
          className="w-full p-2 border rounded"
        />
      </div>

      {/* Items */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Items</label>
        {formData.items.map((item, index) => (
          <div key={index} className="flex gap-2 mb-2">
            <select
              value={item.id}
              onChange={(e) => updateItem(index, 'id', e.target.value)}
              className="flex-1 p-2 border rounded"
            >
              <option value="sofa">Sofa</option>
              <option value="bed">Bed</option>
              <option value="dining_table">Dining Table</option>
              <option value="coffee_table">Coffee Table</option>
              <option value="chair">Chair</option>
              <option value="box">Small Box</option>
              <option value="medium-box">Medium Box</option>
              <option value="large-box">Large Box</option>
            </select>
            <input
              type="number"
              min="1"
              value={item.quantity}
              onChange={(e) => updateItem(index, 'quantity', Number(e.target.value))}
              className="w-20 p-2 border rounded"
            />
            <button
              onClick={() => removeItem(index)}
              className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Remove
            </button>
          </div>
        ))}
        <button
          onClick={addItem}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Add Item
        </button>
      </div>

      {/* Workers */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">
          Total Workers (including driver)
        </label>
        <input
          type="number"
          min="1"
          value={formData.helpersCount}
          onChange={(e) => setFormData({ ...formData, helpersCount: Number(e.target.value) })}
          className="w-full p-2 border rounded"
        />
      </div>

      {/* Options */}
      <div className="mb-4 space-y-2">

        <label className="flex items-center">
          <input
            type="checkbox"
            checked={formData.extras.vat}
            onChange={(e) => setFormData({ ...formData, extras: { ...formData.extras, vat: e.target.checked } })}
            className="mr-2"
          />
          VAT Registered Business
        </label>
      </div>

      {/* Quote Display */}
      {quote && (
        <div className="mt-6 p-4 bg-gray-50 rounded">
          <h3 className="text-lg font-semibold mb-2">Your Quote</h3>
          <div className="text-3xl font-bold text-green-600 mb-4">
            £{quote.breakdown.total}
          </div>
          
          <div className="text-sm space-y-1">
            <div className="flex justify-between">
              <span>Base Rate:</span>
                              <span>£{quote.breakdown.distanceBase}</span>
            </div>
            <div className="flex justify-between">
                              <span>Distance ({formData.distanceMiles} miles):</span>
                              <span>£{quote.breakdown.distanceBase}</span>
            </div>
            <div className="flex justify-between">
              <span>Items:</span>
                              <span>£{quote.breakdown.totalVolumeFactor}</span>
            </div>
            <div className="flex justify-between">
              <span>Extra Workers:</span>
                              <span>£{quote.breakdown.helpersCost}</span>
            </div>
            {quote.breakdown.vat > 0 && (
              <div className="flex justify-between">
                <span>VAT:</span>
                <span>£{quote.breakdown.vat}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* API Test Button */}
      <div className="mt-4">
        <button
          onClick={fetchQuoteFromAPI}
          disabled={loading}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Test API Quote'}
        </button>
      </div>
    </div>
  );
}

// Usage example:
// <PricingForm onQuoteUpdate={(quote) => console.log('New quote:', quote)} />
