'use client';

import { useState, useEffect } from 'react';
import { computeQuote, type PricingInputs, type PricingResult } from './engine';

export function PricingCalculator() {
  const [formData, setFormData] = useState<PricingInputs>({
    miles: 25,
    items: [
      { key: 'sofa', quantity: 1 },
      { key: 'dining_table', quantity: 1 },
    ],
    workersTotal: 2,

    vatRegistered: true,
  });

  const [quote, setQuote] = useState<PricingResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Compute quote when form data changes
  useEffect(() => {
    try {
      setError(null);
      const result = computeQuote(formData);
      console.log('Calculated quote:', result); // Debug log
      setQuote(result);
    } catch (error) {
      console.error('Pricing calculation error:', error);
      setError('Error calculating price');
    }
  }, [formData]);

  const updateItem = (index: number, field: 'key' | 'quantity', value: string | number) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData({ ...formData, items: newItems });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { key: 'box', quantity: 1 }],
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
          value={formData.miles}
          onChange={(e) => setFormData({ ...formData, miles: Number(e.target.value) || 0 })}
          className="w-full p-2 border rounded"
        />
      </div>

      {/* Items */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">العناصر</label>
        {formData.items.map((item, index) => (
          <div key={index} className="flex gap-2 mb-2">
            <select
              value={item.key}
              onChange={(e) => updateItem(index, 'key', e.target.value)}
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
              حذف
            </button>
          </div>
        ))}
        <button
          onClick={addItem}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          إضافة عنصر
        </button>
      </div>

      {/* Workers */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">
          عدد العمال (بما في ذلك السائق)
        </label>
        <input
          type="number"
          min="1"
          value={formData.workersTotal}
          onChange={(e) => setFormData({ ...formData, workersTotal: Number(e.target.value) || 1 })}
          className="w-full p-2 border rounded"
        />
      </div>

      {/* Options */}
      <div className="mb-4 space-y-2">

        <label className="flex items-center">
          <input
            type="checkbox"
            checked={formData.vatRegistered}
            onChange={(e) => setFormData({ ...formData, vatRegistered: e.target.checked })}
            className="mr-2"
          />
          شركة مسجلة للضريبة
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
          <h3 className="text-lg font-semibold mb-2">السعر المقدر</h3>
          <div className="text-3xl font-bold text-green-600 mb-4">
            £{quote.totalGBP}
          </div>
          
          <div className="text-sm space-y-1">
            <div className="flex justify-between">
              <span>السعر الأساسي:</span>
              <span>£{quote.breakdown.baseRate}</span>
            </div>
            <div className="flex justify-between">
              <span>المسافة ({formData.miles} ميل):</span>
              <span>£{quote.breakdown.distanceCost}</span>
            </div>
            <div className="flex justify-between">
              <span>العناصر:</span>
              <span>£{quote.breakdown.itemsCost}</span>
            </div>
            <div className="flex justify-between">
              <span>عمال إضافيون:</span>
              <span>£{quote.breakdown.workersCost}</span>
            </div>
            {quote.breakdown.vat > 0 && (
              <div className="flex justify-between">
                <span>الضريبة:</span>
                <span>£{quote.breakdown.vat}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Debug Info */}
      <div className="mt-4 p-4 bg-gray-100 rounded text-xs">
        <h4 className="font-semibold mb-2">معلومات التصحيح:</h4>
        <pre className="whitespace-pre-wrap">
          {JSON.stringify({ formData, quote }, null, 2)}
        </pre>
      </div>
    </div>
  );
}
