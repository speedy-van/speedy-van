'use client';

import { useState, useEffect } from 'react';
import { computeQuote, type PricingInputs, type PricingResponse } from './engine';

export function PricingCalculator() {
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
  const [error, setError] = useState<string | null>(null);

  // Compute quote when form data changes
  useEffect(() => {
    const calculateQuote = async () => {
      try {
        setError(null);
        const result = await computeQuote(formData);
        console.log('Calculated quote:', result); // Debug log
        setQuote(result);
      } catch (error) {
        console.error('Pricing calculation error:', error);
        setError('Error calculating price');
      }
    };
    
    calculateQuote();
  }, [formData]);

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
    <div className="pricing-calculator max-w-2xl mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">حاسبة السعر - Speedy Van</h2>

      {/* Distance */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">
          المسافة (ميل)
        </label>
        <input
          type="number"
          min="0"
          value={formData.distanceMiles}
          onChange={(e) => setFormData({ ...formData, distanceMiles: Number(e.target.value) || 0 })}
          className="w-full p-2 border rounded"
        />
      </div>

      {/* Items */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">العناصر</label>
        {formData.items.map((item, index) => (
          <div key={index} className="flex gap-2 mb-2">
            <select
              value={item.id}
              onChange={(e) => updateItem(index, 'id', e.target.value)}
              className="flex-1 p-2 border rounded"
            >
              <option value="sofa">كنبة</option>
              <option value="bed">سرير</option>
              <option value="dining_table">طاولة طعام</option>
              <option value="coffee_table">طاولة قهوة</option>
              <option value="chair">كرسي</option>
              <option value="box">صندوق صغير</option>
              <option value="medium-box">صندوق متوسط</option>
              <option value="large-box">صندوق كبير</option>
            </select>
            <input
              type="number"
              min="1"
              value={item.quantity}
              onChange={(e) => updateItem(index, 'quantity', Number(e.target.value) || 1)}
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
          Number of Workers (including driver)
        </label>
        <input
          type="number"
          min="1"
          value={formData.helpersCount}
          onChange={(e) => setFormData({ ...formData, helpersCount: Number(e.target.value) || 1 })}
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
          VAT Registered Company
        </label>
      </div>

      {/* Quote Display */}
      {error && (
        <div className="mt-6 p-4 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      {quote && !error && (
        <div className="mt-6 p-4 bg-gray-50 rounded">
          <h3 className="text-lg font-semibold mb-2">Estimated Price</h3>
          <div className="text-3xl font-bold text-green-600 mb-4">
            £{quote.breakdown.total}
          </div>
          
          <div className="text-sm space-y-1">
            <div className="flex justify-between">
              <span>Base Price:</span>
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
              <span>Additional Workers:</span>
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

      {/* Debug Info */}
      <div className="mt-4 p-4 bg-gray-100 rounded text-xs">
        <h4 className="font-semibold mb-2">Debug Information:</h4>
        <pre className="whitespace-pre-wrap">
          {JSON.stringify({ formData, quote }, null, 2)}
        </pre>
      </div>
    </div>
  );
}
