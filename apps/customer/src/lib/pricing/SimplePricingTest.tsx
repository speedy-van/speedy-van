'use client';

import { useState } from 'react';
import { computeQuote } from './engine';

export function SimplePricingTest() {
  const [result, setResult] = useState<any>(null);

  const testPricing = () => {
    try {
      const testInput = {
        distanceMiles: 25,
        items: [
          {
            id: 'sofa',
            canonicalName: 'Sofa',
            quantity: 1,
            volumeFactor: 1.5,
            requiresTwoPerson: true,
            isFragile: false,
            requiresDisassembly: false,
            basePriceHint: 45,
          },
          {
            id: 'dining_table',
            canonicalName: 'Dining Table',
            quantity: 1,
            volumeFactor: 1.4,
            requiresTwoPerson: true,
            isFragile: false,
            requiresDisassembly: true,
            basePriceHint: 38,
          },
        ],
        pickupFloors: 1,
        pickupHasLift: false,
        dropoffFloors: 1,
        dropoffHasLift: false,
        helpersCount: 2,
        extras: { ulez: false, vat: true },
      };

      const quote = computeQuote(testInput);
      console.log('Test result:', quote);
      setResult(quote);
    } catch (error) {
      console.error('Test error:', error);
      setResult({ error: error.message });
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">اختبار بسيط للتسعير</h2>

      <button
        onClick={testPricing}
        className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 mb-4"
      >
        اختبار التسعير
      </button>

      {result && (
        <div className="mt-4">
          <h3 className="font-semibold mb-2">النتيجة:</h3>
          {result.error ? (
            <div className="text-red-600">{result.error}</div>
          ) : (
            <div>
              <div className="text-2xl font-bold text-green-600 mb-2">
                £{result.breakdown.total}
              </div>
              <div className="text-sm text-gray-600">
                <div>السعر الأساسي: £{result.breakdown.distanceBase}</div>
                <div>العناصر: £{result.breakdown.totalVolumeFactor}</div>
                <div>الضريبة: £{result.breakdown.vat}</div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
